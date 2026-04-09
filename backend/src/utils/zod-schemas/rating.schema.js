import { z } from "zod";

const ratingField = z.number().int().min(1).max(5);

export const createRatingSchema = z.object({
  price_rating: ratingField,
  quality_rating: ratingField,
  safety_rating: ratingField,
});

export const updateRatingSchema = z.object({
  price_rating: ratingField,
  quality_rating: ratingField,
  safety_rating: ratingField,
});
