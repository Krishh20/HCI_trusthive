import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { optionalProtect } from "../middleware/optionalAuth.middleware.js";
import {
  createRecommendationSchema,
  updateRecommendationSchema,
  listQuerySchema,
} from "../utils/zod-schemas/recommendation.schema.js";
import * as recommendationController from "../controllers/recommendation.controller.js";

const router = Router();

router.get(
  "/trending",
  recommendationController.getTrending
);

router.get(
  "/",
  optionalProtect,
  validate(listQuerySchema, "query"),
  recommendationController.getAll
);

router.post(
  "/",
  protect,
  validate(createRecommendationSchema),
  recommendationController.create
);

router.get(
  "/:id",
  optionalProtect,
  recommendationController.getOne
);

router.patch(
  "/:id",
  protect,
  validate(updateRecommendationSchema),
  recommendationController.update
);

router.delete(
  "/:id",
  protect,
  recommendationController.remove
);

export default router;
