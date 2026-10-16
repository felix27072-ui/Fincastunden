"use client";

import { useRouter } from "next/navigation";
import { monthLabel } from "@/lib/format";

export default function MonthSelect({
  months,
  value,
  basePath = "/woche",
}: {
  months: string[];
  value: string;
  basePath?: string;
}) {
  const router = useRouter();
  return (
    <div className="mt-4">
      <label htmlFor="month-select" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        Zeitraum
      </label>
      <select
        id="month-select"
        value={value}
        onChange={(e) => router.push(`${basePath}?month=${e.target.value}`)}
        className="min-h-12 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-crema transition-colors hover:border-muted"
      >
        {months.map((m) => (
          <option key={m} value={m} className="text-black">
            {monthLabel(m)}
          </option>
        ))}
      </select>
    </div>
  );
}
