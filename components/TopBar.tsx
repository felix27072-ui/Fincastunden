"use client";

import { useState } from "react";
import Image from "next/image";
import { signOut } from "@/app/(app)/actions";
import PasswordSheet from "@/components/PasswordSheet";
import type { Role } from "@/lib/database.types";

const ROLE_LABEL: Record<Role, string> = {
  chef: "Chef · alle Rechte",
  steuer: "Steuerberatung · nur lesen",
  mitarbeiter: "Mitarbeiter",
};

export default function TopBar({ name, role }: { name: string; role: Role }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <header className="rounded-b-2xl border-b border-white/10 bg-naranja px-4 pb-4 pt-[max(0.875rem,env(safe-area-inset-top))] shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="la Finca" width={48} height={48} className="shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold tracking-[0.18em] text-white/90">HORAS | STUNDEN</div>
          <div className="mt-1 truncate text-sm font-semibold text-white">{name}</div>
          <div className="truncate text-[11px] text-white/80">{ROLE_LABEL[role]}</div>
        </div>
      </div>
      <div className="mt-3 flex gap-2 pl-[60px]">
        <button
          type="button"
          onClick={() => setShowPassword(true)}
          className="min-h-10 flex-1 rounded-xl border border-white/30 bg-black/15 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-black/25"
        >
          Passwort ändern
        </button>
        <form action={signOut} className="flex-1">
          <button
            type="submit"
            className="min-h-10 w-full rounded-xl border border-white/30 bg-black/15 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-black/25"
          >
            Abmelden
          </button>
        </form>
      </div>
      {showPassword && <PasswordSheet onClose={() => setShowPassword(false)} />}
    </header>
  );
}
