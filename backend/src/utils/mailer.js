import nodemailer from "nodemailer";

let transporterCache = null;

function getTransporter() {
  if (transporterCache) return transporterCache;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP config missing: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS");
  }

  transporterCache = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporterCache;
}

export async function sendOtpEmail({ to, otp }) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: "Your IIITM OTP Verification Code",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111;">
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px;">${otp}</p>
        <p>This OTP expires in <strong>5 minutes</strong>.</p>
      </div>
    `,
  });
}

export async function sendResetPasswordEmail({ to, token }) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const appUrl = process.env.APP_URL || "http://localhost:3001";
  const resetLink = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from,
    to,
    subject: "Reset your password",
    text: `Click to reset your password (valid 10 minutes): ${resetLink}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111;">
        <h2>Password Reset</h2>
        <p>Click the button below to reset your password.</p>
        <p><a href="${resetLink}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
        <p>This link expires in <strong>10 minutes</strong>.</p>
      </div>
    `,
  });
}
