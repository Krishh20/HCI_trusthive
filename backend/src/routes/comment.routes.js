import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../utils/zod-schemas/comment.schema.js";
import * as commentController from "../controllers/comment.controller.js";

export const recommendationCommentsRouter = Router();

recommendationCommentsRouter.post(
  "/:recId/comments",
  protect,
  validate(createCommentSchema),
  commentController.addComment
);

export const commentsByIdRouter = Router();

commentsByIdRouter.patch(
  "/:id",
  protect,
  validate(updateCommentSchema),
  commentController.editComment
);

commentsByIdRouter.delete(
  "/:id",
  protect,
  commentController.deleteComment
);
