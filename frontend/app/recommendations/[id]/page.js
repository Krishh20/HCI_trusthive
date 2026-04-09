import Link from "next/link";
import RecommendationDetailsClient from "@/components/RecommendationDetailsClient";
import { getApiBase } from "@/lib/config";
import { extractImageUrls } from "@/lib/recommendations";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: "Recommendation",
    description: `Details for recommendation ${id}`,
  };
}

export default async function RecommendationPage({ params }) {
  const { id } = await params;

  const base = getApiBase();

  function typeToCategory(type) {
    const map = {
      food: "Food",
      travel: "Travel",
      service: "Hostel Services",
      study_spot: "Study Spots",
      entertainment: "Entertainment",
      shopping: "Shopping",
      health_and_fitness: "Health & Fitness",
    };
    return map[type] ?? "Other";
  }

function formatPriceRange(priceRange) {
  if (priceRange == null) return "Not specified";
  const tier = Number(priceRange);
  if (!Number.isFinite(tier) || tier <= 0) return "Not specified";
  return `${tier}`;
}

  function formatIsoDate(dateLike) {
    if (!dateLike) return "";
    try {
      return new Date(dateLike).toISOString().slice(0, 10);
    } catch {
      return "";
    }
  }

  const res = await fetch(`${base}/api/v1/recommendations/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <Link
          href="/"
          className="text-sm font-semibold text-blue-700 hover:underline dark:text-blue-300"
        >
          ← Back
        </Link>
        <p className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          Could not load this recommendation.
        </p>
      </main>
    );
  }

  const json = await res.json();
  const apiRec = json?.recommendation;

  const ratingList = Array.isArray(apiRec?.ratings) ? apiRec.ratings : [];
  const ratingCount = ratingList.length;

  const avgPrice = ratingCount
    ? Math.round(
        ratingList.reduce((acc, r) => acc + (Number(r.price_rating) || 0), 0) /
          ratingCount
      * 10) / 10
    : 0;
  const avgQuality = ratingCount
    ? Math.round(
        ratingList.reduce(
          (acc, r) => acc + (Number(r.quality_rating) || 0),
          0
        ) / ratingCount * 10
      ) / 10
    : 0;
  const avgSafety = ratingCount
    ? Math.round(
        ratingList.reduce(
          (acc, r) => acc + (Number(r.safety_rating) || 0),
          0
        ) / ratingCount * 10
      ) / 10
    : 0;

  const rec = {
    recommendationId: apiRec?.recommendation_id ?? id,
    createdBy: apiRec?.created_by ?? null,
    category: typeToCategory(apiRec?.type),
    title: apiRec?.title ?? "Recommendation",
    description: apiRec?.description ?? "",
    location: apiRec?.location ?? "",
    priceRange: formatPriceRange(apiRec?.price_range),
    bestTime: apiRec?.best_time_to_visit ?? "",
    safetyInfo: apiRec?.safety_description ?? "",
    ratings: { Price: avgPrice, Quality: avgQuality, Safety: avgSafety },
    overallRatingCount: ratingCount,
    comments: (apiRec?.comments ?? []).map((c) => ({
      id: c.comment_id,
      userId: c.user_id,
      name: c.author_name ?? "Anonymous",
      date: formatIsoDate(c.created_at),
      text: c.comment_text,
    })),
    imageUrls: extractImageUrls(apiRec),
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <Link
        href="/"
        className="text-sm font-semibold text-blue-700 hover:underline dark:text-blue-300"
      >
        ← Back
      </Link>

      <RecommendationDetailsClient rec={rec} />
    </main>
  );
}
