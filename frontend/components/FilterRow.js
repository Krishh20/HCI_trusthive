"use client";

export default function FilterRow({
  priceLevel,
  qualityLevel,
  safetyLevel,
  onPriceChange,
  onQualityChange,
  onSafetyChange,
}) {
  const selectClass =
    "h-9 rounded-full border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-800 outline-none ring-zinc-900/10 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100";

  return (
    <div className="-mx-1 flex flex-wrap items-center gap-2 px-1 pb-1">
      <select
        aria-label="Filter by price"
        value={priceLevel}
        onChange={(e) => onPriceChange(e.target.value)}
        className={selectClass}
      >
        <option value="all">Price: All</option>
        <option value="low">Price: Low</option>
        <option value="moderate">Price: Moderate</option>
        <option value="high">Price: High</option>
      </select>

      <select
        aria-label="Filter by quality"
        value={qualityLevel}
        onChange={(e) => onQualityChange(e.target.value)}
        className={selectClass}
      >
        <option value="all">Quality: All</option>
        <option value="low">Quality: Low</option>
        <option value="moderate">Quality: Moderate</option>
        <option value="high">Quality: High</option>
      </select>

      <select
        aria-label="Filter by safety"
        value={safetyLevel}
        onChange={(e) => onSafetyChange(e.target.value)}
        className={selectClass}
      >
        <option value="all">Safety: All</option>
        <option value="low">Safety: Low</option>
        <option value="moderate">Safety: Moderate</option>
        <option value="high">Safety: High</option>
      </select>
    </div>
  );
}