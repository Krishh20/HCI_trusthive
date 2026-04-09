import { prisma } from "../db/prisma.js";

export async function getProfile(req, res) {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { user_id: id },
    select: {
      user_id: true,
      name: true,
      email: true,
      created_at: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user });
}

export async function getActivity(req, res) {
  const { id } = req.params;

  if (id !== req.user.user_id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const [posts, comments, ratings, votes] = await Promise.all([
    prisma.recommendation.findMany({
      where: { created_by: id },
      orderBy: { created_at: "desc" },
      take: 20,
      select: {
        recommendation_id: true,
        title: true,
        type: true,
        created_at: true,
      },
    }),
    prisma.comment.findMany({
      where: { user_id: id, is_anonymous: false },
      orderBy: { created_at: "desc" },
      take: 20,
      include: {
        recommendation: {
          select: { recommendation_id: true, title: true },
        },
      },
    }),
    prisma.rating.findMany({
      where: { user_id: id },
      orderBy: { created_at: "desc" },
      take: 20,
      include: {
        recommendation: {
          select: { recommendation_id: true, title: true },
        },
      },
    }),
    prisma.vote.findMany({
      where: { user_id: id },
      orderBy: { created_at: "desc" },
      take: 20,
      include: {
        recommendation: {
          select: { recommendation_id: true, title: true },
        },
      },
    }),
  ]);

  res.json({
    posts,
    comments,
    ratings,
    votes,
  });
}
