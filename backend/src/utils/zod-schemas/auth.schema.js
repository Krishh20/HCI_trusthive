import { z } from "zod";

const IIITM_EMAIL_REGEX =
  /^(img|imt|bcs|bms|bee|mtech|mba|phd)_[0-9]{7}@iiitm\.ac\.in$/;

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z
    .string()
    .regex(
      IIITM_EMAIL_REGEX,
      "Only IIITM Gwalior institutional emails are allowed"
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(64, "Password must be at most 64 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .regex(
      IIITM_EMAIL_REGEX,
      "Only IIITM Gwalior institutional emails are allowed"
    ),
  otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
});

export const forgotPasswordRequestSchema = z.object({
  email: z
    .string()
    .regex(
      IIITM_EMAIL_REGEX,
      "Only IIITM Gwalior institutional emails are allowed"
    ),
});

export const resetPasswordWithTokenSchema = z.object({
  token: z.string().min(20, "Invalid reset token"),
  new_password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(64, "Password must be at most 64 characters"),
});
