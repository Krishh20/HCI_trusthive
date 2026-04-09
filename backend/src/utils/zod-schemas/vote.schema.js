import { z } from "zod";

export const createVoteSchema = z.object({
  vote_type: z.enum(["upvote", "downvote"]),
});
