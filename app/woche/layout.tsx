import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import TopBar from "@/components/TopBar";

export default async function WocheLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentEmployee();
  if (!me) redirect("/auth/no-access");

  return (
    <div className="mx-auto w-full max-w-[620px] flex-1 pb-16">
      <TopBar name={me.name} role={me.role} />
      <div className="px-3">{children}</div>
    </div>
  );
}
