"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getApiBase } from "@/lib/config";
import { extractImageUrls } from "@/lib/recommendations";
import FilterRow from "@/components/FilterRow";

function IconLocation(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconShield(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3 20 7v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CategoryBadge({ category }) {
  return (
    <span
      className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-900 ring-1 ring-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
    >
      {category}
    </span>
  );
}

function SafetySegments({ rating, outOf = 5 }) {
  const safe = Math.max(0, Math.min(outOf, Number(rating) || 0));
  return (
    <div className="flex items-center gap-1" aria-label={`Safety rating: ${safe}/${outOf}`}>
      {Array.from({ length: outOf }).map((_, idx) => {
        const active = idx < safe;
        return (
          <span
            key={idx}
            className={[
              "h-2.5 w-3.5 rounded-sm ring-1",
              active
                ? "bg-zinc-900 ring-zinc-900 dark:bg-zinc-50 dark:ring-zinc-50"
                : "bg-zinc-100 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}

function Stars({ value, outOf = 5, size = "h-4 w-4", interactive = false, onChange }) {
  const v = Math.max(0, Math.min(outOf, Number(value) || 0));
  return (
    <div className="inline-flex items-center gap-1" role={interactive ? "radiogroup" : undefined}>
      {Array.from({ length: outOf }).map((_, i) => {
        const filled = i < v;
        const Star = (
          <svg viewBox="0 0 20 20" aria-hidden="true" className={size}>
            <path
              d="M10 1.8 12.6 7l5.7.8-4.1 4 1 5.7L10 14.8 4.8 17.5l1-5.7-4.1-4L7.4 7 10 1.8Z"
              fill={filled ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
        );

        if (!interactive) {
          return (
            <span
              key={i}
              className={filled ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-300 dark:text-zinc-700"}
            >
              {Star}
            </span>
          );
        }

        const next = i + 1;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange?.(next)}
            className={[
              "rounded-md p-0.5 transition",
              filled ? "text-amber-500" : "text-zinc-300 hover:text-amber-400 dark:text-zinc-700 dark:hover:text-amber-400",
            ].join(" ")}
            aria-label={`${next} star`}
          >
            {Star}
          </button>
        );
      })}
    </div>
  );
}

function RecommendationCardModern({ rec }) {
  return (
    <Link href={rec.href} className="block">
      <article className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-900/20 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
        {rec.imageUrl ? (
          <div className="mb-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <img src={rec.imageUrl} alt={rec.title} className="h-44 w-full object-cover" loading="lazy" />
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <CategoryBadge category={rec.category} />
          <time className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {rec.date}
          </time>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-zinc-950 group-hover:text-zinc-900 dark:text-zinc-50">
            {rec.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            {rec.description}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <IconLocation className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            <span>{rec.location || rec.priceRange}</span>
          </div>

          <div className="flex items-center gap-2">
            <Stars value={rec.overallStars} />
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {Number(rec.overallRating).toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {rec.ratingCount} ratings
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

const FILTER_OPTIONS = [
  "All",
  "Food",
  "Travel",
  "Hostel Services",
  "Study Spots",
  "Entertainment",
  "Shopping",
  "Health & Fitness",
  "Other",
];

const TYPE_TO_CATEGORY = {
  food: "Food",
  travel: "Travel",
  service: "Hostel Services",
  study_spot: "Study Spots",
  entertainment: "Entertainment",
  shopping: "Shopping",
  health_and_fitness: "Health & Fitness",
  other: "Other",
};

function typeToCategory(type) {
  return TYPE_TO_CATEGORY[type] ?? "Other";
}

function formatPriceRange(priceRange) {
  if (priceRange == null) return "Free";
  const tier = Number(priceRange);
  if (!Number.isFinite(tier) || tier <= 0) return "Free";
  if (tier <= 2) return "₹0–100";
  if (tier <= 4) return "₹100–500";
  return "₹500+";
}

function formatIsoDate(dateLike) {
  if (!dateLike) return "";
  try {
    return new Date(dateLike).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function computeOverallFromRatings(ratings) {
  const list = Array.isArray(ratings) ? ratings : [];
  const ratingCount = list.length;
  if (ratingCount === 0) {
    return { overallRating: 0, overallStars: 0, ratingCount: 0 };
  }

  const sum = list.reduce((acc, r) => {
    const p = Number(r.price_rating) || 0;
    const q = Number(r.quality_rating) || 0;
    const s = Number(r.safety_rating) || 0;
    return acc + (p + q + s) / 3;
  }, 0);

  const overallRating = Math.round((sum / ratingCount) * 10) / 10;
  const overallStars = Math.max(0, Math.min(5, Math.round(overallRating)));
  return { overallRating, overallStars, ratingCount };
}
function computeAverageMetric(ratings, key) {
  const list = Array.isArray(ratings) ? ratings : [];
  if (list.length === 0) return 0;
  const total = list.reduce((acc, r) => acc + (Number(r?.[key]) || 0), 0);
  return Math.round((total / list.length) * 10) / 10;
}

function checkQuality(r, level) {
  const l = level.toLowerCase();
  if (level === "all") return true;
  if (level === "high") return r.avgQuality >= 4;
  if (level === "moderate") return r.avgQuality >= 3;
  if (level === "low") return r.avgQuality >= 1;
  return true;
}

function checkSafety(r, level) {
  const l = level.toLowerCase();
  if (level === "all") return true;
  if (level === "high") return r.avgSafety >= 4;
  if (level === "moderate") return r.avgSafety >= 3;
  if (level === "low") return r.avgSafety >= 1;
  return true;
}

function checkPrice(r, level) {
  const l = level.toLowerCase();
  if (level === "all") return true;
  if (level === "high") return r.avgPrice >= 4;
  if (level === "moderate") return r.avgPrice >= 3;
  if (level === "low") return r.avgPrice >= 1;
  return true;
}

export default function Home() {
  const [category, setCategory] = useState("All");
  const [searchDraft, setSearchDraft] = useState("");
  const [priceLevel, setPriceLevel] = useState("all");
  const [qualityLevel, setQualityLevel] = useState("all");
  const [safetyLevel, setSafetyLevel] = useState("all");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const base = getApiBase();
        const trendingRes = await fetch(
          `${base}/api/v1/recommendations/trending`
        );
        const trendingJson = await trendingRes.json();
        const trending = Array.isArray(trendingJson?.data)
          ? trendingJson.data
          : [];

        const detailResults = await Promise.allSettled(
          trending.map(async (t) => {
            const id = t.recommendation_id;
            const res = await fetch(
              `${base}/api/v1/recommendations/${id}`
            );
            const json = await res.json();
            return json?.recommendation ?? null;
          })
        );

        const mapped = detailResults
          .filter((r) => r.status === "fulfilled" && r.value)
          .map((r) => {
            const rec = r.value;
            const categoryLabel = typeToCategory(rec.type);
            const { overallRating, overallStars, ratingCount } =
              computeOverallFromRatings(rec.ratings);
            const avgPrice = computeAverageMetric(rec.ratings, "price_rating");
            const avgQuality = computeAverageMetric(rec.ratings, "quality_rating");
            const avgSafety = computeAverageMetric(rec.ratings, "safety_rating");
            const rawPriceTier = Number(rec.price_range);
            const priceTier =
              Number.isFinite(rawPriceTier) && rawPriceTier > 0 ? rawPriceTier : 1;
            return {
              recommendationId: rec.recommendation_id,
              category: categoryLabel === "Other" ? "All" : categoryLabel,
              title: rec.title,
              description: rec.description,
              priceRange: formatPriceRange(rec.price_range),
              priceTier,
              avgPrice,
              avgQuality,
              avgSafety,
              location: rec.location ?? "",
              overallRating,
              overallStars,
              ratingCount,
              date: formatIsoDate(rec.created_at),
              imageUrl: extractImageUrls(rec)[0] ?? null,
              href: `/recommendations/${rec.recommendation_id}`,
            };
          });

        if (!cancelled) setCards(mapped);
      } catch (e) {
        if (!cancelled) setError(e?.message ?? "Failed to load recommendations");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    const shouldShow = searchDraft.trim() !== "" || category !== "All";
    setIsFilterVisible(shouldShow);
    if (!shouldShow) {
      setPriceLevel("all");
      setQualityLevel("all");
      setSafetyLevel("all");
    }
  }, [searchDraft, category]);

  const visible = useMemo(() => {
    const q = searchDraft.trim().toLowerCase();

    const filtered = cards.filter((r) => {
      const matchesCategory = category === "All" ? true : r.category === category;
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q);
      const matchesPrice = checkPrice(r, priceLevel);
      const matchesQuality = checkQuality(r, qualityLevel);
      const matchesSafety = checkSafety(r, safetyLevel);
      return (
        matchesCategory &&
        matchesSearch &&
        matchesPrice &&
        matchesQuality &&
        matchesSafety
      );
    });
    function sortByActiveFilter(list) {
      if (qualityLevel !== "all") {
        return [...list].sort((a, b) => b.avgQuality - a.avgQuality);
      }
      if (safetyLevel !== "all") {
        return [...list].sort((a, b) => b.avgSafety - a.avgSafety);
      }
      if (priceLevel !== "all") {
        return [...list].sort((a, b) => b.avgPrice - a.avgPrice);
      }
      return list;
    }
    return sortByActiveFilter(filtered);
  }, [cards, category, searchDraft, priceLevel, qualityLevel, safetyLevel]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-3xl">
              Campus Community Recommendations
            </h1>
            <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Discover trusted picks from your campus — curated by the community.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type="search"
                placeholder="Search recommendations…"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                className="h-12 w-full rounded-full border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-950 shadow-sm outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:ring-zinc-100/10"
              />
            </div>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {FILTER_OPTIONS.map((opt) => {
                const active = opt === category;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setCategory(opt)}
                    className={[
                      "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
                      active
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900",
                    ].join(" ")}
                    aria-pressed={active}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {isFilterVisible ? (
              <FilterRow
                priceLevel={priceLevel}
                qualityLevel={qualityLevel}
                safetyLevel={safetyLevel}
                onPriceChange={setPriceLevel}
                onQualityChange={setQualityLevel}
                onSafetyChange={setSafetyLevel}
              />
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-8">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
              />
            ))}
          </div>
        ) : error ? (
          <p className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            {error}
          </p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No recommendations match your filters.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {visible.map((rec) => (
              <RecommendationCardModern
                key={rec.recommendationId}
                rec={rec}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
