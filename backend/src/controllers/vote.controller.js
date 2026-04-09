import { prisma } from "../db/prisma.js";

async function voteCountsForRecommendation(recommendation_id) {
  const [upvotes, downvotes] = await Promise.all([
    prisma.vote.count({
      where: { recommendation_id, vote_type: "upvote" },
    }),
    prisma.vote.count({
      where: { recommendation_id, vote_type: "downvote" },
    }),
  ]);
  return { upvotes, downvotes };
}

export async function vote(req, res) {
  const { recId } = req.params;
  const { vote_type } = req.body;

  const rec = await prisma.recommendation.findUnique({
    where: { recommendation_id: recId },
  });
  if (!rec) {
    return res.status(404).json({ message: "Recommendation not found" });
  }

  const existing = await prisma.vote.findUnique({
    where: {
      user_id_recommendation_id: {
        user_id: req.user.user_id,
        recommendation_id: recId,
      },
    },
  });

  let action;
  let voteRow = null;

  if (!existing) {
    voteRow = await prisma.vote.create({
      data: {
        user_id: req.user.user_id,
        recommendation_id: recId,
        vote_type,
      },
    });
    action = "voted";
  } else if (existing.vote_type === vote_type) {
    await prisma.vote.delete({
      where: { vote_id: existing.vote_id },
    });
    action = "removed";
    voteRow = null;
  } else {
    voteRow = await prisma.vote.update({
      where: { vote_id: existing.vote_id },
      data: { vote_type },
    });
    action = "changed";
  }

  const counts = await voteCountsForRecommendation(recId);

  res.json({ action, vote: voteRow, counts });
}
