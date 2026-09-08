import Image from "next/image";
import { signOut } from "@/app/(app)/actions";
import type { Role } from "@/lib/database.types";

const ROLE_LABEL: Record<Role, string> = {
  chef: "Chef · alle Rechte",
  steuer: "Steuerberatung · nur lesen",
  mitarbeiter: "Mitarbeiter",
};

export default function TopBar({ name, role }: { name: string; role: Role }) {
  return (
    <div className="flex items-center gap-3 bg-naranja px-3 py-2.5">
      <Image src="/logo.png" alt="la Finca" width={46} height={46} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] tracking-[0.16em] text-white/90">HORAS | STUNDEN</div>
        <div className="truncate text-xs text-white/75">
          {name} · {ROLE_LABEL[role]}
        </div>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="shrink-0 border border-white/35 bg-black/20 px-3 py-2 text-xs font-medium text-white"
        >
          Abmelden
        </button>
      </form>
    </div>
  );
}
