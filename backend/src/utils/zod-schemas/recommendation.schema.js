import { z } from "zod";

export const recommendationTypeEnum = z.enum([
  "food",
  "travel",
  "study_spot",
  "service",
  "entertainment",
  "shopping",
  "health_and_fitness",
  "other",
]);

/** Whole number > 0 (e.g. price tier / level on the site) */
const positivePriceInt = z
  .number()
  .int("Price must be a whole number")
  .positive("Price must be greater than zero");

const imageUrlArray = z.array(z.string().url()).max(10).optional();

export const createRecommendationSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  location: z.string().max(255).optional(),
  image_urls: imageUrlArray,
  image_url: z.string().url().optional(),
  type: recommendationTypeEnum,
  price_range: positivePriceInt.optional(),
  best_time_to_visit: z.string().max(255).optional(),
  safety_description: z.string().max(1000).optional(),
});

const updateFields = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  location: z.string().max(255).optional().nullable(),
  image_urls: z.array(z.string().url()).max(10).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  type: recommendationTypeEnum.optional(),
  price_range: positivePriceInt.nullable().optional(),
  best_time_to_visit: z.string().max(255).optional().nullable(),
  safety_description: z.string().max(1000).optional().nullable(),
});

export const updateRecommendationSchema = updateFields.refine(
  (data) =>
    Object.entries(data).some(
      ([, v]) => v !== undefined
    ),
  { message: "At least one field is required", path: ["_root"] }
);

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  type: recommendationTypeEnum.optional(),
  price: z.enum(["low", "high"]).optional(),
  rating: z.enum(["high", "mid", "low"]).optional(),
  sort: z
    .enum(["rating", "price_asc", "price_desc", "created_at"])
    .optional(),
  search: z.string().max(200).optional(),
});
