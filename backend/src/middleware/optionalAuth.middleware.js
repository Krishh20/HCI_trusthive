import { verifyToken } from "../utils/jwt.js";

/**
 * Attaches req.user when a valid Bearer token is present; otherwise continues without user.
 */
export function optionalProtect(req, _res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    req.user = undefined;
    return next();
  }

  const token = header.slice(7).trim();
  if (!token) {
    req.user = undefined;
    return next();
  }

  try {
    req.user = verifyToken(token);
  } catch {
    req.user = undefined;
  }

  next();
}
