"use client";

export default function FilterRow({
  selectedPrice,
  selectedQuality,
  selectedSafety,
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
        value={selectedPrice}
        onChange={(e) => onPriceChange(e.target.value)}
        className={selectClass}
      >
        <option value="all">Price: All</option>
        <option value="budget">Price: ₹ (Budget)</option>
        <option value="mid">Price: ₹₹ (Mid)</option>
        <option value="premium">Price: ₹₹₹ (Premium)</option>
      </select>

      <select
        aria-label="Filter by quality"
        value={selectedQuality}
        onChange={(e) => onQualityChange(e.target.value)}
        className={selectClass}
      >
        <option value="all">Quality: All</option>
        <option value="3plus">Quality: 3+ ⭐</option>
        <option value="4plus">Quality: 4+ ⭐</option>
        <option value="5">Quality: 5 ⭐</option>
      </select>

      <select
        aria-label="Filter by safety"
        value={selectedSafety}
        onChange={(e) => onSafetyChange(e.target.value)}
        className={selectClass}
      >
        <option value="all">Safety: All</option>
        <option value="safe">Safety: Safe</option>
        <option value="moderate">Safety: Moderate</option>
        <option value="risky">Safety: Risky</option>
      </select>
    </div>
  );
}