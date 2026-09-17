"use client";

import { useState, useTransition } from "react";
import Field, { inputClass } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { eur } from "@/lib/format";
import { createEmployee, setEmployeeActive, type EmployeeListItem } from "./actions";
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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EmployeeListItem | null>(null);

  function submit() {
    setError("");
    setSuccess("");
    const rateEuros = Number(rate.replace(",", "."));
    if (!name.trim() || !email.trim() || Number.isNaN(rateEuros)) {
      setError("Bitte Name, E-Mail und einen gültigen Stundensatz angeben.");
      return;
    }
    startTransition(async () => {
      try {
        await createEmployee({ name, email, role, rateEuros });
        setSuccess(`${name} wurde angelegt. Kann sich ab sofort einloggen.`);
        setName("");
        setEmail("");
        setRole("mitarbeiter");
        setRate("13.90");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Anlegen fehlgeschlagen.");
      }
    });
  }

  function toggleActive(emp: EmployeeListItem) {
    setTogglingId(emp.id);
    startTransition(async () => {
      try {
        await setEmployeeActive(emp.id, !emp.active);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Änderung fehlgeschlagen.");
      } finally {
        setTogglingId(null);
      }
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

        {error && <p className="mt-1 text-sm text-naranja-dark">{error}</p>}
        {success && <p className="mt-1 text-sm text-verde">{success}</p>}

        <Button onClick={submit} disabled={isPending} className="mt-2 w-full">
          {isPending ? "Wird angelegt …" : "Anlegen"}
        </Button>
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
                {emp.email} · {ROLE_LABEL[emp.role]}
                {emp.role !== "steuer" && ` · ${eur(emp.rate_cents / 100)}/h`}
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
