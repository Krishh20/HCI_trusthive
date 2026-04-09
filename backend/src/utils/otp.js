import crypto from "crypto";

const OTP_DIGITS = 6;
const OTP_TTL_MS = 5 * 60 * 1000;

function otpHashSecret() {
  return process.env.OTP_HASH_SECRET || process.env.JWT_SECRET || "change-me-in-production";
}

export function generateOtpCode() {
  const min = 10 ** (OTP_DIGITS - 1);
  const max = 10 ** OTP_DIGITS - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

export function hashOtp(otp) {
  return crypto
    .createHmac("sha256", otpHashSecret())
    .update(String(otp))
    .digest("hex");
}

export function otpExpiresAt() {
  return new Date(Date.now() + OTP_TTL_MS);
}

export function isOtpExpired(expiresAt) {
  return !expiresAt || new Date(expiresAt).getTime() <= Date.now();
}
