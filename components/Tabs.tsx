"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Tabs({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <div className="mt-3 flex gap-1.5">
      {items.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 border px-1 py-2.5 text-center text-[13px] font-semibold ${
              active ? "border-crema bg-crema text-carbon" : "border-line text-muted"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
