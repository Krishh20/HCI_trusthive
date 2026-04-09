import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  createRatingSchema,
  updateRatingSchema,
} from "../utils/zod-schemas/rating.schema.js";
import * as ratingController from "../controllers/rating.controller.js";

export const recommendationRatingsRouter = Router();

recommendationRatingsRouter.post(
  "/:recId/ratings",
  protect,
  validate(createRatingSchema),
  ratingController.addRating
);

export const ratingsByIdRouter = Router();

ratingsByIdRouter.patch(
  "/:id",
  protect,
  validate(updateRatingSchema),
  ratingController.updateRating
);

ratingsByIdRouter.delete(
  "/:id",
  protect,
  ratingController.deleteRating
);
