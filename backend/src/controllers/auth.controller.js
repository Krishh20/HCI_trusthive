import { prisma } from "../db/prisma.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { signToken } from "../utils/jwt.js";
import { generateOtpCode, hashOtp, otpExpiresAt, isOtpExpired } from "../utils/otp.js";
import { sendOtpEmail, sendResetPasswordEmail } from "../utils/mailer.js";
import crypto from "crypto";

const IIITM_EMAIL_REGEX =
  /^(img|imt|bcs|bms|bee|mtech|mba|phd)_[0-9]{7}@iiitm\.ac\.in$/;

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!IIITM_EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      message: "Only IIITM Gwalior institutional emails are allowed",
    });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await hashPassword(password);
  const otp = generateOtpCode();
  const otpHash = hashOtp(otp);
  const expiresAt = otpExpiresAt();

  await prisma.otpVerification.upsert({
    where: { email },
    create: {
      name,
      email,
      password_hash: passwordHash,
      otp_hash: otpHash,
      expires_at: expiresAt,
    },
    update: {
      name,
      password_hash: passwordHash,
      otp_hash: otpHash,
      expires_at: expiresAt,
    },
  });

  await sendOtpEmail({ to: email, otp });

  res.status(200).json({
    message: "OTP sent to email. Verify within 5 minutes.",
  });
}

export async function verifyOtp(req, res) {
  const { email, otp } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const pending = await prisma.otpVerification.findUnique({ where: { email } });
  if (!pending) {
    return res.status(400).json({ message: "No active OTP for this email" });
  }

  if (isOtpExpired(pending.expires_at)) {
    await prisma.otpVerification.delete({ where: { email } });
    return res.status(400).json({ message: "OTP expired. Please register again." });
  }

  const incomingHash = hashOtp(otp);
  if (incomingHash !== pending.otp_hash) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        password: pending.password_hash,
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        created_at: true,
      },
    });
    await tx.otpVerification.delete({ where: { email } });
    return created;
  });

  const token = signToken({
    user_id: user.user_id,
    email: user.email,
    name: user.name,
  });

  res.status(201).json({ user, token });
}

export async function requestPasswordResetOtp(req, res) {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { user_id: user.user_id } }),
    prisma.passwordResetToken.create({
      data: {
        user_id: user.user_id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
    }),
  ]);

  await sendResetPasswordEmail({ to: email, token });
  return res.status(200).json({ message: "Password reset link sent to email." });
}

export async function resetPasswordWithToken(req, res) {
  const { token, new_password } = req.body;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const reset = await prisma.passwordResetToken.findUnique({
    where: { token_hash: tokenHash },
    include: { user: true },
  });
  if (!reset) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }
  if (new Date(reset.expires_at).getTime() <= Date.now()) {
    await prisma.passwordResetToken.delete({ where: { token_hash: tokenHash } });
    return res.status(400).json({ message: "Reset token expired" });
  }
  if (!reset.user?.user_id) {
    await prisma.passwordResetToken.delete({ where: { token_hash: tokenHash } });
    return res.status(400).json({ message: "Invalid reset token" });
  }

  const newHash = await hashPassword(new_password);
  await prisma.$transaction([
    prisma.user.update({ where: { user_id: reset.user.user_id }, data: { password: newHash } }),
    prisma.passwordResetToken.delete({ where: { token_hash: tokenHash } }),
  ]);
  return res.status(200).json({ message: "Password reset successful" });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await comparePassword(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const safeUser = {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  };

  const token = signToken({
    user_id: user.user_id,
    email: user.email,
    name: user.name,
  });

  res.status(200).json({ user: safeUser, token });
}

export async function getMe(req, res) {
  const user = await prisma.user.findUnique({
    where: { user_id: req.user.user_id },
    select: {
      user_id: true,
      name: true,
      email: true,
      created_at: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ user });
}
