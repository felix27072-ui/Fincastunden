"use client";

import { useState } from "react";
import Sheet from "@/components/ui/Sheet";
import Button from "@/components/ui/Button";
import Field, { inputClass } from "@/components/ui/Field";
import { createClient } from "@/lib/supabase/client";

export default function PasswordSheet({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (password.length < 8) {
      setError("Mindestens 8 Zeichen.");
      return;
    }
    if (password !== confirm) {
      setError("Die beiden Passwörter stimmen nicht überein.");
      return;
    }
    setStatus("saving");
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setStatus("idle");
      setError(updateError.message);
      return;
    }
    setStatus("saved");
  }

  if (status === "saved") {
    return (
      <Sheet title="Passwort festlegen" onClose={onClose}>
        <p className="text-sm text-crema">
          Passwort gespeichert. Du kannst dich ab jetzt auf der Login-Seite auch mit E-Mail und
          Passwort anmelden, ohne Anmeldelink.
        </p>
        <Button onClick={onClose} className="mt-3 w-full">
          Schließen
        </Button>
      </Sheet>
    );
  }

  return (
    <Sheet title="Passwort festlegen" onClose={onClose}>
      <p className="mb-3 text-sm text-muted">
        Leg ein Passwort fest, dann musst du dich künftig nicht mehr per Mail-Link anmelden.
      </p>
      <Field label="Neues Passwort">
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Passwort wiederholen">
        <input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
        />
      </Field>
      {error && <p className="mb-2 text-sm text-naranja-dark">{error}</p>}
      <div className="mt-2 flex gap-2">
        <Button onClick={submit} disabled={status === "saving"} className="flex-1">
          {status === "saving" ? "Wird gespeichert …" : "Speichern"}
        </Button>
        <Button variant="outline" onClick={onClose} type="button">
          Abbrechen
        </Button>
      </div>
    </Sheet>
  );
}
