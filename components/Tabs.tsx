"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Tabs({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Hauptnavigation" className="mt-4 -mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
      <div className="flex min-w-max gap-2 sm:min-w-0">
        {items.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 shrink-0 items-center justify-center rounded-xl border px-4 py-2.5 text-center text-[13px] font-semibold transition-colors sm:min-w-0 sm:flex-1 ${
                active
                  ? "border-naranja bg-naranja text-white shadow-[0_3px_14px_rgba(224,124,36,0.18)]"
                  : "border-line bg-surface text-crema hover:border-muted hover:bg-line"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
