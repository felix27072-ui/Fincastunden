import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { getReminderBanner } from "@/lib/reminders";
import TopBar from "@/components/TopBar";
import Tabs from "@/components/Tabs";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentEmployee();
  if (!me) redirect("/auth/no-access");
  const reminder = await getReminderBanner(me.id, me.role);

  return (
    <div className="mx-auto w-full max-w-[680px] flex-1 pb-16 lg:max-w-[1120px]">
      <TopBar name={me.name} role={me.role} />
      <div className="px-4 sm:px-6">
        <Tabs
          items={[
            { href: "/woche", label: "Woche" },
            ...(me.role !== "chef" || me.logs_hours
              ? [{ href: "/meine", label: "Meine Schichten" }]
              : []),
            ...(me.role !== "mitarbeiter"
              ? [{ href: "/abrechnung", label: "Abrechnung" }]
              : []),
            ...(me.role === "chef" ? [{ href: "/team", label: "Team" }] : []),
          ]}
        />
        {reminder && (
          <div className="mt-4 rounded-xl border border-naranja-dark bg-surface p-4 text-sm leading-relaxed text-crema">
            {reminder}
          </div>
        )}
        {children}
        <a href="/datenschutz" className="mt-8 block text-center text-[11px] text-muted">
          Datenschutz
        </a>
      </div>
    </div>
  );
}
