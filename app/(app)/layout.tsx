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
    <div className="mx-auto w-full max-w-[620px] flex-1 pb-16">
      <TopBar name={me.name} role={me.role} />
      <div className="px-3">
        <Tabs
          items={[
            { href: "/woche", label: "Woche" },
            { href: "/meine", label: "Meine Schichten" },
            ...(me.role !== "mitarbeiter"
              ? [{ href: "/abrechnung", label: "Abrechnung" }]
              : []),
            ...(me.role === "chef" ? [{ href: "/team", label: "Team" }] : []),
          ]}
        />
        {reminder && (
          <div className="mt-3 border border-naranja-dark bg-surface p-3 text-sm text-crema">
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
