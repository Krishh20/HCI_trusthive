import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import recommendationRouter from "./routes/recommendation.routes.js";
import {
  recommendationCommentsRouter,
  commentsByIdRouter,
} from "./routes/comment.routes.js";
import {
  recommendationRatingsRouter,
  ratingsByIdRouter,
} from "./routes/rating.routes.js";
import { recommendationVotesRouter } from "./routes/vote.routes.js";
import userRouter from "./routes/user.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/auth", authRouter);

app.use("/api/v1/recommendations", recommendationCommentsRouter);
app.use("/api/v1/recommendations", recommendationRatingsRouter);
app.use("/api/v1/recommendations", recommendationVotesRouter);
app.use("/api/v1/recommendations", recommendationRouter);

app.use("/api/v1/comments", commentsByIdRouter);
app.use("/api/v1/ratings", ratingsByIdRouter);
app.use("/api/v1/users", userRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

export default app;
