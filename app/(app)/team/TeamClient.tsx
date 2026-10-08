"use client";

import { useState, useTransition } from "react";
import Field, { inputClass } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { eur } from "@/lib/format";
import { createEmployee, inviteEmployee, setEmployeeActive, type EmployeeListItem } from "./actions";
import EditEmployeeSheet from "./EditEmployeeSheet";
import type { Role } from "@/lib/database.types";

const ROLE_LABEL: Record<Role, string> = {
  mitarbeiter: "Mitarbeiter",
  chef: "Chef",
  steuer: "Steuerberatung",
};

export default function TeamClient({ employees }: { employees: EmployeeListItem[] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("mitarbeiter");
  const [rate, setRate] = useState("13.90");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EmployeeListItem | null>(null);

  function submit(mode: "invite" | "direct") {
    setError("");
    setSuccess("");
    const rateEuros = Number(rate.replace(",", "."));
    if (!name.trim() || !email.trim() || Number.isNaN(rateEuros) || (mode === "direct" && !temporaryPassword)) {
      setError("Bitte Name, E-Mail, Stundensatz und ein vorläufiges Passwort  angeben.");
      return;
    }
    startTransition(async () => {
      const input = { name, email, role, rateEuros, temporaryPassword };
      const result =
        mode === "invite" ? await inviteEmployee(input) : await createEmployee(input);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(
        result.message ??
          (mode === "invite"
            ? `Einladung an ${email} wurde verschickt.`
            : `${name} wurde angelegt und kann sich ab sofort einloggen.`)
      );
      setName("");
      setEmail("");
      setRole("mitarbeiter");
      setRate("13.90");
      setTemporaryPassword("");
    });
  }

  function toggleActive(emp: EmployeeListItem) {
    setTogglingId(emp.id);
    startTransition(async () => {
      const result = await setEmployeeActive(emp.id, !emp.active);
      if (result.error) setError(result.error);
      setTogglingId(null);
    });
  }

  return (
    <>
      <div className="mt-3 border border-line bg-surface p-4">
        <div className="mb-3 text-[11px] tracking-[0.14em] text-muted">
          MITARBEITER ANLEGEN
        </div>
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="E-Mail-Adresse">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <div className="flex gap-2.5">
          <Field label="Rolle">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className={inputClass}
            >
              <option value="mitarbeiter">Mitarbeiter</option>
              <option value="chef">Chef</option>
              <option value="steuer">Steuerberatung</option>
            </select>
          </Field>
          <Field label="Stundensatz (€)">
            <input
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Vorläufiges Passwort">
          <input type="password" autoComplete="new-password" value={temporaryPassword} onChange={(e) => setTemporaryPassword(e.target.value)} className={inputClass} />
        </Field>
        {error && <p className="mt-1 text-sm text-naranja-dark">{error}</p>}
        {success && <p className="mt-1 text-sm text-verde">{success}</p>}

        <p className="mt-1 text-xs leading-relaxed text-muted">
          Standard: Vorläufiges Passwort vergeben und direkt anlegen. Die Person muss es beim ersten Login ändern.
        </p>
        <div className="mt-2 flex gap-2">
          <Button onClick={() => submit("invite")} disabled={isPending} className="flex-1">
            {isPending ? "Bitte warten …" : "Alternativ: Einladung senden"}
          </Button>
          <Button
            onClick={() => submit("direct")}
            disabled={isPending}
            className="flex-1"
          >
            Mit Passwort anlegen
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-1.5 text-[11px] tracking-[0.14em] text-muted">
          ALLE ({employees.length})
        </div>
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="flex items-center justify-between gap-2 border-b border-line py-2.5"
          >
            <button
              type="button"
              onClick={() => setEditing(emp)}
              className="min-w-0 flex-1 text-left"
            >
              <div className={`text-[15px] ${emp.active ? "" : "text-muted line-through"}`}>
                {emp.name}
              </div>
              <div className="truncate text-xs text-muted">
                {emp.email} · {ROLE_LABEL[emp.role]}{emp.password_change_pending ? " · Passwortwechsel ausstehend" : ""}
                {emp.role !== "steuer" && ` · ${eur(emp.rate_cents / 100)}/h`}
                {emp.role === "chef" && (emp.logs_hours ? " · erfasst Stunden" : " · keine eigenen Stunden")}
              </div>
            </button>
            <Button
              variant="outline"
              onClick={() => toggleActive(emp)}
              disabled={togglingId === emp.id}
              className="shrink-0 !px-3 !py-2 !text-xs"
            >
              {emp.active ? "Deaktivieren" : "Aktivieren"}
            </Button>
          </div>
        ))}
      </div>

      {editing && (
        <EditEmployeeSheet
          employee={editing}
          onClose={() => setEditing(null)}
          onSaved={() => setEditing(null)}
        />
      )}
    </>
  );
}
