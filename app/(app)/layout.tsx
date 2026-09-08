import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import TopBar from "@/components/TopBar";
import Tabs from "@/components/Tabs";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentEmployee();
  if (!me) redirect("/auth/no-access");

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
          ]}
        />
        {children}
      </div>
    </div>
  );
}
