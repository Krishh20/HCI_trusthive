import jwt from "jsonwebtoken";
import { jwtSecret, jwtExpiresIn } from "../config/index.js";

/**
 * @param {{ user_id: string, email: string, name: string }} payload
 */
export function signToken({ user_id, email, name }) {
  return jwt.sign({ email, name }, jwtSecret, {
    subject: user_id,
    expiresIn: jwtExpiresIn,
  });
}

/**
 * @param {string} token
 * @returns {{ user_id: string, email: string, name: string }}
 */
export function verifyToken(token) {
  const decoded = jwt.verify(token, jwtSecret);
  if (typeof decoded === "string" || !decoded.sub) {
    throw new jwt.JsonWebTokenError("Invalid token payload");
  }
  return {
    user_id: decoded.sub,
    email: decoded.email,
    name: decoded.name,
  };
}
