export const RECOMMENDATION_TYPES = [
  { value: "food", label: "Food" },
  { value: "travel", label: "Travel" },
  { value: "study_spot", label: "Study spot" },
  { value: "service", label: "Service" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "health_and_fitness", label: "Health & fitness" },
  { value: "other", label: "Other" },
];

export function typeLabel(value) {
  return RECOMMENDATION_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function extractImageUrls(rec) {
  if (!rec || typeof rec !== "object") return [];
  const candidates = [
    rec.image_urls,
    rec.images,
    rec.imageUrls,
    rec.image_url ? [rec.image_url] : null,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) {
      const urls = c.filter((u) => typeof u === "string" && /^https?:\/\//.test(u));
      if (urls.length > 0) return urls;
    }
  }
  return [];
}
