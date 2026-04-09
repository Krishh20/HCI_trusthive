import Link from "next/link";
import { Suspense } from "react";
import { getApiBase } from "@/lib/config";
import RecommendationCard from "@/components/RecommendationCard";
import RecommendationFilters from "@/components/RecommendationFilters";

export const metadata = {
  title: "Browse",
};

function buildListUrl(searchParams) {
  const q = new URLSearchParams();
  const keys = [
    "page",
    "limit",
    "type",
    "price",
    "rating",
    "sort",
    "search",
  ];
  for (const key of keys) {
    const v = searchParams[key];
    if (v !== undefined && v !== null && String(v) !== "") {
      q.set(key, String(v));
    }
  }
  if (!q.has("limit")) q.set("limit", "12");
  if (!q.has("sort")) q.set("sort", "created_at");
  const qs = q.toString();
  return `${getApiBase()}/api/v1/recommendations${qs ? `?${qs}` : ""}`;
}

async function fetchList(searchParams) {
  const url = buildListUrl(searchParams);
  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) {
      return { data: [], pagination: { page: 1, totalPages: 0, total: 0 } };
    }
    return res.json();
  } catch {
    return { data: [], pagination: { page: 1, totalPages: 0, total: 0 } };
  }
}

function PaginationLink({ searchParams, page, children, disabled }) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (v !== undefined && v !== null && String(v) !== "") {
      q.set(k, String(v));
    }
  }
  q.set("page", String(page));
  const href = `/recommendations?${q.toString()}`;
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-lg px-3 py-1.5 text-sm text-zinc-400">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
    >
      {children}
    </Link>
  );
}

export default async function RecommendationsPage({ searchParams }) {
  const sp = await searchParams;
  const raw = {
    page: sp.page,
    limit: sp.limit,
    type: sp.type,
    price: sp.price,
    rating: sp.rating,
    sort: sp.sort,
    search: sp.search,
  };

  const { data, pagination } = await fetchList(raw);
  const page = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Recommendations
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Filter by type, price band, and rating. Data comes from your API at{" "}
        <code className="rounded bg-zinc-200 px-1 text-xs dark:bg-zinc-800">
          {getApiBase()}
        </code>
        .
      </p>

      <div className="mt-8">
        <Suspense
          fallback={
            <div className="h-28 animate-pulse rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80" />
          }
        >
          <RecommendationFilters />
        </Suspense>
      </div>

      {data.length === 0 ? (
        <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-400">
          No results. Try different filters or add posts via{" "}
          <Link href="/recommendations/new" className="underline">
            New post
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {data.map((rec) => (
            <li key={rec.recommendation_id}>
              <RecommendationCard rec={rec} />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2">
          <PaginationLink
            searchParams={raw}
            page={page - 1}
            disabled={page <= 1}
          >
            Previous
          </PaginationLink>
          <span className="px-2 text-sm text-zinc-600 dark:text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <PaginationLink
            searchParams={raw}
            page={page + 1}
            disabled={page >= totalPages}
          >
            Next
          </PaginationLink>
        </nav>
      )}
    </main>
  );
}
