import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { getEmployees } from "./actions";
import TeamClient from "./TeamClient";

export default async function TeamPage() {
  const me = await getCurrentEmployee();
  if (!me) return null; // Layout leitet bereits um.
  if (me.role !== "chef") redirect("/woche");

  const employees = await getEmployees();
  return <TeamClient employees={employees} />;
}
