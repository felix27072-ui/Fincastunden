"use client";

import { useState, useTransition } from "react";
import Sheet from "@/components/ui/Sheet";
import Field, { inputClass } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { updateEmployee, type EmployeeListItem } from "./actions";
import type { Role } from "@/lib/database.types";

export default function EditEmployeeSheet({
  employee,
  onClose,
  onSaved,
}: {
  employee: EmployeeListItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(employee.name);
  const [email, setEmail] = useState(employee.email);
  const [role, setRole] = useState<Role>(employee.role);
  const [rate, setRate] = useState((employee.rate_cents / 100).toFixed(2));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function submit() {
    setError("");
    const rateEuros = Number(rate.replace(",", "."));
    if (!name.trim() || !email.trim() || Number.isNaN(rateEuros)) {
      setError("Bitte Name, E-Mail und einen gültigen Stundensatz angeben.");
      return;
    }
    startTransition(async () => {
      try {
        await updateEmployee({ id: employee.id, name, email, role, rateEuros });
        onSaved();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen.");
      }
    });
  }

  return (
    <Sheet title={`${employee.name} bearbeiten`} onClose={onClose}>
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
      {email !== employee.email && (
        <p className="-mt-2 mb-3 text-xs text-muted">
          Ändert auch die Anmeldeadresse — der bisherige Zugang funktioniert danach nicht mehr.
        </p>
      )}
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

      {error && <p className="mb-2 text-sm text-naranja-dark">{error}</p>}

      <div className="mt-2 flex gap-2">
        <Button onClick={submit} disabled={isPending} className="flex-1">
          {isPending ? "Wird gespeichert …" : "Speichern"}
        </Button>
        <Button variant="outline" onClick={onClose} disabled={isPending} type="button">
          Abbrechen
        </Button>
      </div>
    </Sheet>
  );
}
