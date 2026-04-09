import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { createVoteSchema } from "../utils/zod-schemas/vote.schema.js";
import * as voteController from "../controllers/vote.controller.js";

export const recommendationVotesRouter = Router();

recommendationVotesRouter.post(
  "/:recId/votes",
  protect,
  validate(createVoteSchema),
  voteController.vote
);
