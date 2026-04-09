import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import * as userController from "../controllers/user.controller.js";

const router = Router();

router.get("/:id/activity", protect, userController.getActivity);
router.get("/:id", userController.getProfile);

export default router;
