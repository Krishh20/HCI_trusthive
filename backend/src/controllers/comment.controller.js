import { prisma } from "../db/prisma.js";

export async function addComment(req, res) {
  const { recId } = req.params;
  const { comment_text, is_anonymous } = req.body;

  const rec = await prisma.recommendation.findUnique({
    where: { recommendation_id: recId },
  });
  if (!rec) {
    return res.status(404).json({ message: "Recommendation not found" });
  }

  const comment = await prisma.comment.create({
    data: {
      user_id: req.user.user_id,
      recommendation_id: recId,
      comment_text,
      is_anonymous,
    },
    include: {
      user: { select: { user_id: true, name: true } },
    },
  });

  res.status(201).json({ comment });
}

export async function editComment(req, res) {
  const { id } = req.params;
  const { comment_text } = req.body;

  const existing = await prisma.comment.findUnique({
    where: { comment_id: id },
  });

  if (!existing) {
    return res.status(404).json({ message: "Comment not found" });
  }

  if (existing.user_id !== req.user.user_id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const comment = await prisma.comment.update({
    where: { comment_id: id },
    data: { comment_text },
    include: {
      user: { select: { user_id: true, name: true } },
    },
  });

  res.json({ comment });
}

export async function deleteComment(req, res) {
  const { id } = req.params;

  const existing = await prisma.comment.findUnique({
    where: { comment_id: id },
  });

  if (!existing) {
    return res.status(404).json({ message: "Comment not found" });
  }

  if (existing.user_id !== req.user.user_id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await prisma.comment.delete({ where: { comment_id: id } });

  res.json({ message: "Comment deleted" });
}
