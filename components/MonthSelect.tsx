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
    <select
      value={value}
      onChange={(e) => router.push(`${basePath}?month=${e.target.value}`)}
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
