"use client";

import { useRouter } from "next/navigation";

export default function MonthSelect({
  months,
  value,
  monthLabel,
}: {
  months: string[];
  value: string;
  monthLabel: (mk: string) => string;
}) {
  const router = useRouter();
  return (
    <select
      value={value}
      onChange={(e) => router.push(`/woche?month=${e.target.value}`)}
      className="w-full border border-line bg-carbon px-3 py-2.5 text-sm text-crema"
    >
      {months.map((m) => (
        <option key={m} value={m} className="text-black">
          {monthLabel(m)}
        </option>
      ))}
    </select>
  );
}
