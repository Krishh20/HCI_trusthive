import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/jwt.js";

export function protect(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Invalid authorization format. Expected: Bearer <token>",
    });
  }

  const token = header.slice(7).trim();
  if (!token) {
    return res.status(401).json({ message: "Bearer token missing" });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token has expired" });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid or malformed token" });
    }
    return res.status(401).json({ message: "Authentication failed" });
  }
}
