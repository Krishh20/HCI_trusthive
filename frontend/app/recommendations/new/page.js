"use client";
import { uploadImage } from "@/utils/uploadImage";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api";
import { useSession } from "next-auth/react";

const TYPE_OPTIONS = [
  { value: "food", label: "Food" },
  { value: "travel", label: "Travel" },
  { value: "service", label: "Hostel Services" },
  { value: "study_spot", label: "Study Spots" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "health_and_fitness", label: "Health & Fitness" },
  { value: "other", label: "Other" },
];

export default function NewRecommendationPage() {
  const { data: session, status } = useSession();
const token = session?.accessToken;
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.replace("/login");
    }
  }, [status, session, router]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!token || pending) return;
    setError("");
    setPending(true);
    const fd = new FormData(e.target);
    const title = String(fd.get("title") ?? "").trim();
    const description = String(fd.get("description") ?? "").trim();
    const location = String(fd.get("location") ?? "").trim() || undefined;
    const type = String(fd.get("type") ?? "");
    const priceRangeRaw = String(fd.get("price_range") ?? "").trim();
    const parsedPriceRange = Number(priceRangeRaw);
    const price_range = Number.isInteger(parsedPriceRange) && parsedPriceRange > 0
      ? parsedPriceRange
      : undefined;
    const files = fd.getAll("images").filter((f) => f instanceof File && f.size > 0);
    const best_time_to_visit =
      String(fd.get("best_time_to_visit") ?? "").trim() || undefined;
    const safety_description =
      String(fd.get("safety_description") ?? "").trim() || undefined;

    try {
      const imageUrls = [];
      const accepted = files.filter(
        (file) => file.type.startsWith("image/") && file.size <= 3 * 1024 * 1024
      );
      setUploadingCount(accepted.length);
      for (const file of accepted) {
        const url = await uploadImage(file);
        imageUrls.push(url);
      }

      const body = {
        title,
        description,
        type,
        ...(location ? { location } : {}),
        ...(price_range !== undefined ? { price_range } : {}),
        ...(best_time_to_visit ? { best_time_to_visit } : {}),
        ...(safety_description ? { safety_description } : {}),
        ...(imageUrls.length ? { image_urls: imageUrls } : {}),
      };

      const data = await apiJson("/api/v1/recommendations", {
        method: "POST",
        token,
        body: JSON.stringify(body),
      });
      router.push(`/recommendations/${data.recommendation.recommendation_id}`);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingCount(0);
      setPending(false);
    }
  }

  if (status === "loading" || !session){
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-zinc-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Add Recommendation
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Share a place, service, or experience with the campus community
        </p>
      </header>

      <section className="mx-auto mt-8 max-w-2xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
            {error}
          </p>
        )}
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Title
          <input
            name="title"
            required
            minLength={3}
            maxLength={200}
            placeholder="e.g. Best Coffee Shop Near Campus"
            className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm outline-none ring-blue-600/20 placeholder:text-zinc-400 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description (min 10 characters)
          <textarea
            name="description"
            required
            minLength={10}
            maxLength={5000}
            rows={6}
            placeholder="Tell others what makes this special…"
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none ring-blue-600/20 placeholder:text-zinc-400 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Type
            <select
              name="type"
              required
              defaultValue=""
              className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm outline-none ring-blue-600/20 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            >
              <option value="" disabled>
                Select type
              </option>
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Price Range
            <input
              name="price_range"
              type="number"
              min={1}
              step={1}
              placeholder="e.g. 2"
              className="h-11 appearance-none rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm outline-none ring-blue-600/20 placeholder:text-zinc-400 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Location (optional)
          <input
            name="location"
            maxLength={255}
            placeholder="e.g. Near Main Gate, IIITM"
            className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm outline-none ring-blue-600/20 placeholder:text-zinc-400 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Pictures
          <input
            name="images"
            type="file"
            accept="image/*"
            multiple
            className="block w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm outline-none ring-blue-600/20 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:file:bg-blue-950/40 dark:file:text-blue-300"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Best Time to Visit
          <input
            name="best_time_to_visit"
            placeholder="e.g. Weekday mornings"
            className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm outline-none ring-blue-600/20 placeholder:text-zinc-400 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Safety Description
          <textarea
            name="safety_description"
            maxLength={1000}
            rows={3}
            placeholder="Any safety tips or info…"
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none ring-blue-600/20 placeholder:text-zinc-400 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
        >
          {pending
            ? uploadingCount > 0
              ? `Uploading ${uploadingCount} image(s)…`
              : "Submitting…"
            : "Submit Recommendation"}
        </button>
      </form>
      </section>
    </main>
  );
}