import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordRequestSchema,
  resetPasswordWithTokenSchema,
} from "../utils/zod-schemas/auth.schema.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/verify-otp", validate(verifyOtpSchema), authController.verifyOtp);
router.post(
  "/forgot-password",
  validate(forgotPasswordRequestSchema),
  authController.requestPasswordResetOtp
);
router.post(
  "/reset-password",
  validate(resetPasswordWithTokenSchema),
  authController.resetPasswordWithToken
);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", protect, authController.getMe);

export default router;
