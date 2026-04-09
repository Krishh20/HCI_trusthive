"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // ✅ NEW
import { apiJson } from "@/lib/api";
import { typeLabel } from "@/lib/recommendations";

function AvatarIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M20 21a8 8 0 0 0-16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CategoryPill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
      {children}
    </span>
  );
}

function ListCard({ children }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession(); // ✅ NEW
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState("");

  // ✅ FIXED REDIRECT LOGIC
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/login");
    }
  }, [session, status, router]);

  // ✅ Extract values from session
  const userId = session?.user?.id;
  const token = session?.accessToken;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!token || !userId) return;

      setError("");

      try {
        const [profileData, activityData] = await Promise.all([
          apiJson(`/api/v1/users/${userId}`, { token }), // ✅ added token
          apiJson(`/api/v1/users/${userId}/activity`, { token }),
        ]);

        if (!cancelled) {
          setProfile(profileData.user);
          setActivity(activityData);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load profile");
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [token, userId]);

  // ✅ FIXED LOADING STATE
  if (status === "loading" || !session) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <p className="text-zinc-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/50">
            <AvatarIcon className="h-8 w-8" />
          </div>

          <div className="flex-1">
            <div className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {profile?.name ?? session?.user?.name ?? "User"}
            </div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {profile?.email ?? session?.user?.email ?? "—"}
            </div>
            <div className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Joined{" "}
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "—"}
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <p className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          {error}
        </p>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          My Recommendations ({activity?.posts?.length ?? 0})
        </h2>

        <div className="mt-4 grid gap-4">
          {(activity?.posts?.length ?? 0) === 0 ? (
            <ListCard>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No recommendations yet.
              </p>
            </ListCard>
          ) : (
            activity.posts.map((post) => (
              <Link key={post.recommendation_id} href={`/recommendations/${post.recommendation_id}`}>
                <ListCard>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                        {post.title}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <CategoryPill>{typeLabel(post.type)}</CategoryPill>
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </ListCard>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          My Comments ({activity?.comments?.length ?? 0})
        </h2>

        <div className="mt-4 grid gap-4">
          {(activity?.comments?.length ?? 0) === 0 ? (
            <ListCard>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No comments yet.
              </p>
            </ListCard>
          ) : (
            activity.comments.map((comment) => (
              <Link key={comment.comment_id} href={`/recommendations/${comment.recommendation_id}`}>
                <ListCard>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    on {comment.recommendation?.title ?? "Recommendation"}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {comment.comment_text}
                  </p>
                </ListCard>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}