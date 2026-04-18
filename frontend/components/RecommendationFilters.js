"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { RECOMMENDATION_TYPES } from "@/lib/recommendations";

export default function RecommendationFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === "" || value == null) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      next.delete("page");
      router.push(`/recommendations?${next.toString()}`);
    },
    [router, searchParams]
  );

  function applySearch(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const search = String(fd.get("search") ?? "").trim();
    setParam("search", search);
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <form
        onSubmit={applySearch}
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
      >
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Search title or description
          <input
            name="search"
            defaultValue={searchParams.get("search") ?? ""}
            maxLength={200}
            placeholder="e.g. mess, hospital, cafe"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Search
        </button>
      </form>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Type
          <select
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            value={searchParams.get("type") ?? ""}
            onChange={(e) => setParam("type", e.target.value)}
          >
            <option value="">All</option>
            {RECOMMENDATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Price
          <select
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            value={searchParams.get("price") ?? ""}
            onChange={(e) => setParam("price", e.target.value)}
          >
            <option value="">Any</option>
            <option value="low">Low</option>
            <option value="high">High</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Avg. rating
          <select
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            value={searchParams.get("rating") ?? ""}
            onChange={(e) => setParam("rating", e.target.value)}
          >
            <option value="">Any</option>
            <option value="high">High (4+)</option>
            <option value="mid">Mid</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Sort
          <select
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            value={searchParams.get("sort") ?? "created_at"}
            onChange={(e) => setParam("sort", e.target.value)}
          >
            <option value="created_at">Newest</option>
            <option value="rating">Rating</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
          </select>
        </label>
      </div>
    </div>
  );
}
