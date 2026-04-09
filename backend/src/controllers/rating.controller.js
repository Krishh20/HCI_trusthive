import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";

export async function addRating(req, res) {
  const { recId } = req.params;
  const { price_rating, quality_rating, safety_rating } = req.body;

  const rec = await prisma.recommendation.findUnique({
    where: { recommendation_id: recId },
  });
  if (!rec) {
    return res.status(404).json({ message: "Recommendation not found" });
  }

  try {
    const rating = await prisma.rating.create({
      data: {
        user_id: req.user.user_id,
        recommendation_id: recId,
        price_rating,
        quality_rating,
        safety_rating,
      },
    });
    return res.status(201).json({ rating });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return res.status(409).json({
        message: "You have already rated this recommendation",
      });
    }
    throw err;
  }
}

export async function updateRating(req, res) {
  const { id } = req.params;
  const { price_rating, quality_rating, safety_rating } = req.body;

  const existing = await prisma.rating.findUnique({
    where: { rating_id: id },
  });

  if (!existing) {
    return res.status(404).json({ message: "Rating not found" });
  }

  if (existing.user_id !== req.user.user_id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const rating = await prisma.rating.update({
    where: { rating_id: id },
    data: { price_rating, quality_rating, safety_rating },
  });

  res.json({ rating });
}

export async function deleteRating(req, res) {
  const { id } = req.params;

  const existing = await prisma.rating.findUnique({
    where: { rating_id: id },
  });

  if (!existing) {
    return res.status(404).json({ message: "Rating not found" });
  }

  if (existing.user_id !== req.user.user_id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await prisma.rating.delete({ where: { rating_id: id } });

  res.json({ message: "Rating deleted" });
}
