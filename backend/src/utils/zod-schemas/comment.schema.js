import { z } from "zod";

export const createCommentSchema = z.object({
  comment_text: z.string().min(1).max(2000),
  is_anonymous: z.boolean().default(false),
});

export const updateCommentSchema = z.object({
  comment_text: z.string().min(1).max(2000),
});
