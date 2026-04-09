"use client";

import { useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { apiJson } from "@/lib/api";

function Stars({ value, outOf = 5, interactive = false, onChange }) {
  const v = Math.max(0, Math.min(outOf, Number(value) || 0));
  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: outOf }).map((_, i) => {
        const filled = i < v;
        const next = i + 1;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={interactive ? () => onChange?.(next) : undefined}
            className={[
              "rounded-md p-0.5",
              interactive ? "cursor-pointer" : "cursor-default",
              filled
                ? "text-zinc-900 dark:text-zinc-50"
                : "text-zinc-300 dark:text-zinc-700",
              interactive
                ? "hover:text-zinc-600 dark:hover:text-zinc-200"
                : "",
            ].join(" ")}
            aria-label={`${next} star`}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5">
              <path
                d="M10 1.8 12.6 7l5.7.8-4.1 4 1 5.7L10 14.8 4.8 17.5l1-5.7-4.1-4L7.4 7 10 1.8Z"
                fill={filled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

function DisplayStars({ value, outOf = 5 }) {
  const v = Math.max(0, Math.min(outOf, Number(value) || 0));
  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: outOf }).map((_, i) => {
        const fillPct = Math.max(0, Math.min(1, v - i));
        return (
          <span key={i} className="relative inline-block h-4 w-4 text-zinc-300 dark:text-zinc-700">
            <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
              <path d="M10 1.8 12.6 7l5.7.8-4.1 4 1 5.7L10 14.8 4.8 17.5l1-5.7-4.1-4L7.4 7 10 1.8Z" fill="currentColor" />
            </svg>
            <span className="absolute inset-0 overflow-hidden text-amber-500" style={{ width: `${fillPct * 100}%` }}>
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
                <path d="M10 1.8 12.6 7l5.7.8-4.1 4 1 5.7L10 14.8 4.8 17.5l1-5.7-4.1-4L7.4 7 10 1.8Z" fill="currentColor" />
              </svg>
            </span>
          </span>
        );
      })}
    </div>
  );
}

function CategoryBadge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-900 ring-1 ring-zinc-200 dark:bg-zinc-900/30 dark:text-zinc-100 dark:ring-zinc-700">
      {children}
    </span>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
        {value}
      </div>
    </div>
  );
}

function RatingRow({ label, value, outOf = 5 }) {
  const pct = Math.max(0, Math.min(100, (value / outOf) * 100));
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      <div className="h-2.5 flex-1 rounded-full bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="h-2.5 rounded-full bg-zinc-900 dark:bg-zinc-50" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-12 text-right text-sm font-semibold text-zinc-950 dark:text-zinc-50">{value}/{outOf}</span>
    </div>
  );
}

export default function RecommendationDetailsClient({ rec }) {
  const { user, token } = useAuth();
  const router = useRouter();

  const [avgRatings, setAvgRatings] = useState({
    price: Number(rec.ratings.Price) || 0,
    quality: Number(rec.ratings.Quality) || 0,
    safety: Number(rec.ratings.Safety) || 0,
  });
  const [priceStars, setPriceStars] = useState( 0);
  const [qualityStars, setQualityStars] = useState(0);
  const [safetyStars, setSafetyStars] = useState(0);

  const [comments, setComments] = useState(rec.comments);
  const [commentText, setCommentText] = useState("");
  const [pendingComment, setPendingComment] = useState(false);
  const [pendingRating, setPendingRating] = useState(false);
  const [pendingPost, setPendingPost] = useState(false);
  const [error, setError] = useState("");
  const [ratingId, setRatingId] = useState(null);
  const [ratingCount, setRatingCount] = useState(rec.overallRatingCount ?? 0);
  const [recTitle, setRecTitle] = useState(rec.title);
  const [recDescription, setRecDescription] = useState(rec.description);
  const [recLocation, setRecLocation] = useState(rec.location || "");
  const [recBestTime, setRecBestTime] = useState(rec.bestTime || "");
  const [recSafety, setRecSafety] = useState(rec.safetyInfo || "");
  const [editingPost, setEditingPost] = useState(false);
  const titleInputRef = useRef(null);
  const [commentEditId, setCommentEditId] = useState(null);
  const [commentEditText, setCommentEditText] = useState("");

  async function syncRecommendation() {
    try {
      const json = await apiJson(`/api/v1/recommendations/${rec.recommendationId}`, {
        token,
      });
      const latest = json?.recommendation;
      if (!latest) return;
      setRecTitle(latest.title ?? "");
      setRecDescription(latest.description ?? "");
      setRecLocation(latest.location ?? "");
      setRecBestTime(latest.best_time_to_visit ?? "");
      setRecSafety(latest.safety_description ?? "");

      const ratings = Array.isArray(latest.ratings) ? latest.ratings : [];
      const commentsList = Array.isArray(latest.comments) ? latest.comments : [];
      const count = ratings.length;

      const avg = ratings.reduce(
        (acc, r) => {
          acc.price += Number(r.price_rating) || 0;
          acc.quality += Number(r.quality_rating) || 0;
          acc.safety += Number(r.safety_rating) || 0;
          return acc;
        },
        { price: 0, quality: 0, safety: 0 }
      );

      const avgPrice = count > 0 ? avg.price / count : 0;
      const avgQuality = count > 0 ? avg.quality / count : 0;
      const avgSafety = count > 0 ? avg.safety / count : 0;
      setAvgRatings({
        price: Math.round(avgPrice * 10) / 10,
        quality: Math.round(avgQuality * 10) / 10,
        safety: Math.round(avgSafety * 10) / 10,
      });

      setRatingCount(count);
      setComments(
        commentsList.map((c) => ({
          id: c.comment_id,
          userId: c.user_id,
          name: c.author_name ?? "Anonymous",
          date: c.created_at ? new Date(c.created_at).toISOString().slice(0, 10) : "",
          text: c.comment_text,
        }))
      );
      const myRating = ratings.find((r) => r.user_id === user?.user_id);
      setRatingId(myRating?.rating_id ?? null);
      if (myRating) {
        setPriceStars(Number(myRating.price_rating) || 0);
        setQualityStars(Number(myRating.quality_rating) || 0);
        setSafetyStars(Number(myRating.safety_rating) || 0);
      } else {
        setPriceStars( 0);
        setQualityStars(0);
        setSafetyStars(0);
      }
    } catch {
      // keep currently rendered data on sync failure
    }
  }

  useEffect(() => {
    if (!token) return;
    syncRecommendation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, rec.recommendationId, user?.user_id]);

  useEffect(() => {
    if (editingPost && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [editingPost]);

  const overall = useMemo(() => {
    const avg =
      (Number(avgRatings.price) + Number(avgRatings.quality) + Number(avgRatings.safety)) / 3;
    return Math.round(avg * 10) / 10;
  }, [avgRatings]);

  const overallRatingCount = Number(ratingCount ?? 0) || 0;
  const canEditPost = Boolean(user?.user_id && rec.createdBy === user.user_id);

  function formatDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  async function submitComment(e) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || !token || pendingComment) return;

    setPendingComment(true);
    setError("");
    try {
      await apiJson(`/api/v1/recommendations/${rec.recommendationId}/comments`, {
        method: "POST",
        token,
        body: JSON.stringify({ comment_text: text, is_anonymous: false }),
      });
      const now = new Date();
      const next = {
        id: `${Date.now()}`,
        name: user?.name ?? "You",
        date: formatDate(now),
        text,
      };
      setComments((prev) => [next, ...prev]);
      setCommentText("");
      await syncRecommendation();
    } catch (err) {
      setError(err.message || "Could not post comment");
    } finally {
      setPendingComment(false);
    }
  }

  async function editComment(commentId) {
    if (!token || !commentEditText.trim()) return;
    try {
      await apiJson(`/api/v1/comments/${commentId}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ comment_text: commentEditText.trim() }),
      });
      setCommentEditId(null);
      setCommentEditText("");
      await syncRecommendation();
    } catch (err) {
      setError(err.message || "Could not edit comment");
    }
  }

  async function deleteComment(commentId) {
    if (!token) return;
    try {
      await apiJson(`/api/v1/comments/${commentId}`, { method: "DELETE", token });
      await syncRecommendation();
    } catch (err) {
      setError(err.message || "Could not delete comment");
    }
  }

  async function submitRating(e) {
    e.preventDefault();
    if (!token || pendingRating) return;
    setPendingRating(true);
    setError("");
    try {
      const body = {
        price_rating: Number(priceStars),
        quality_rating: Number(qualityStars),
        safety_rating: Number(safetyStars),
      };
      if (ratingId) {
        await apiJson(`/api/v1/ratings/${ratingId}`, {
          method: "PATCH",
          token,
          body: JSON.stringify(body),
        });
      } else {
        const created = await apiJson(
          `/api/v1/recommendations/${rec.recommendationId}/ratings`,
          {
            method: "POST",
            token,
            body: JSON.stringify(body),
          }
        );
        setRatingId(created?.rating?.rating_id ?? null);
      }
      await syncRecommendation();
    } catch (err) {
      setError(err.message || "Could not submit rating");
    } finally {
      setPendingRating(false);
    }
  }

  async function savePostEdits() {
    if (!token || pendingPost) return;
    setPendingPost(true);
    try {
      await apiJson(`/api/v1/recommendations/${rec.recommendationId}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          title: recTitle,
          description: recDescription,
          location: recLocation || null,
          best_time_to_visit: recBestTime || null,
          safety_description: recSafety || null,
        }),
      });
      await syncRecommendation();
      setEditingPost(false);
    } catch (err) {
      setError(err.message || "Could not update post");
    } finally {
      setPendingPost(false);
    }
  }

  async function deletePost() {
    if (!token || pendingPost) return;
    setPendingPost(true);
    try {
      await apiJson(`/api/v1/recommendations/${rec.recommendationId}`, {
        method: "DELETE",
        token,
      });
      router.push("/recommendations");
      router.refresh();
    } catch (err) {
      setError(err.message || "Could not delete post");
      setPendingPost(false);
    }
  }

  return (
    <>
      <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CategoryBadge>{rec.category}</CategoryBadge>
            {editingPost ? (
              <input
                ref={titleInputRef}
                value={recTitle}
                onChange={(e) => setRecTitle(e.target.value)}
                className="mt-3 w-full rounded-xl border border-zinc-300 px-3 py-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              />
            ) : (
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                {recTitle}
              </h1>
            )}
            <div className="mt-3 inline-flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900/30">
              <span className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                {overall.toFixed(1)}
              </span>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                <DisplayStars value={overall} />
                <span className="text-zinc-600 dark:text-zinc-300">{overallRatingCount} Ratings</span>
              </span>
            </div>
          </div>
          {canEditPost ? (
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditingPost((v) => !v)} className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold dark:border-zinc-700">
                {editingPost ? "Cancel" : "Edit"}
              </button>
              {editingPost ? (
                <button type="button" onClick={savePostEdits} disabled={pendingPost} className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">
                  Save
                </button>
              ) : null}
              <button type="button" onClick={deletePost} disabled={pendingPost} className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-60">
                Delete
              </button>
            </div>
          ) : null}
        </div>

        {editingPost ? (
          <textarea
            value={recDescription}
            onChange={(e) => setRecDescription(e.target.value)}
            rows={4}
            className="mt-5 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium leading-7 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
          />
        ) : (
          <p className="mt-5 text-sm font-medium leading-7 text-zinc-700 dark:text-zinc-300">{recDescription}</p>
        )}

        {Array.isArray(rec.imageUrls) && rec.imageUrls.length > 0 ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {rec.imageUrls.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800"
              >
                <img
                  src={url}
                  alt={`${rec.title} ${idx + 1}`}
                  className="h-56 w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <InfoBox label="Location" value={editingPost ? <input value={recLocation} onChange={(e)=>setRecLocation(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950" /> : (recLocation || "Not specified")} />
          <InfoBox label="Price Range" value={rec.priceRange} />
          <InfoBox label="Best Time to Visit" value={editingPost ? <input value={recBestTime} onChange={(e)=>setRecBestTime(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950" /> : (recBestTime || "Not specified")} />
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
          Safety Info
        </h2>
        <p className="mt-3 text-sm font-medium leading-7 text-zinc-700 dark:text-zinc-300">
          {editingPost ? (
            <textarea
              value={recSafety}
              onChange={(e) => setRecSafety(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          ) : (
            recSafety || "No safety notes shared yet."
          )}
        </p>
      </section>

      <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
        {error ? (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
            {error}
          </p>
        ) : null}
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Ratings</h2>
        <div className="mt-5 grid gap-5">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Community average
            </h3>
            <div className="mt-4 grid gap-4">
              <RatingRow label="Price" value={avgRatings.price} />
              <RatingRow label="Quality" value={avgRatings.quality} />
              <RatingRow label="Safety" value={avgRatings.safety} />
            </div>
          </div>

          <form
            onSubmit={submitRating}
            className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Rate this recommendation
            </h3>
            <div className="mt-4 grid gap-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Price</span>
                <Stars value={priceStars} interactive onChange={setPriceStars} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Quality</span>
                <Stars value={qualityStars} interactive onChange={setQualityStars} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Safety</span>
                <Stars value={safetyStars} interactive onChange={setSafetyStars} />
              </div>
            </div>
            <button
              type="submit"
              disabled={!token || pendingRating}
              className="mt-5 rounded-2xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {pendingRating ? "Posting rating..." : "Post rating"}
            </button>
          </form>
        </div>

      </section>

      <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            Comments ({comments.length})
          </h2>
        </div>

        <form onSubmit={submitComment} className="mt-5 flex flex-col gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Write a comment
            </span>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your experience with others…"
              rows={3}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none ring-zinc-900/20 placeholder:text-zinc-400 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            />
          </label>

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={!commentText.trim() || !token || pendingComment}
              className="rounded-2xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {pendingComment ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>

        <div className="mt-5 grid gap-4">
          {comments.map((c) => (
            <div
              key={c.id ?? `${c.name}-${c.date}`}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {c.name}
                </div>
                <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {c.date}
                </div>
              </div>
              {commentEditId === c.id ? (
                <div className="mt-3">
                  <textarea
                    value={commentEditText}
                    onChange={(e) => setCommentEditText(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => editComment(c.id)} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white">Save</button>
                    <button type="button" onClick={() => setCommentEditId(null)} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm font-medium leading-7 text-zinc-700 dark:text-zinc-300">{c.text}</p>
              )}
              {user?.user_id && c.userId === user.user_id ? (
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => { setCommentEditId(c.id); setCommentEditText(c.text); }} className="text-xs font-semibold text-blue-700">Edit</button>
                  <button type="button" onClick={() => deleteComment(c.id)} className="text-xs font-semibold text-red-700">Delete</button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

