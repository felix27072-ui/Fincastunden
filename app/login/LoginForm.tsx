"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "link" | "password";
type Status = "idle" | "sending" | "sent" | "error";

function friendlyError(message: string): string {
  if (message.includes("Signups not allowed")) {
    return "Diese E-Mail-Adresse ist noch nicht als Mitarbeiter:in angelegt. Bitte wende dich an Joe.";
  }
  if (message.toLowerCase().includes("rate limit")) {
    return "Gerade wurden zu viele Anmeldemails verschickt (Supabase erlaubt davon nur wenige pro Stunde, solange kein eigener Mail-Versand eingerichtet ist). Bitte etwas später erneut versuchen.";
  }
  if (message.toLowerCase().includes("invalid login credentials")) {
    return "E-Mail oder Passwort ist falsch.";
  }
  return `Anmeldung fehlgeschlagen: ${message}`;
}

export default function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<Mode>("link");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function switchMode(next: Mode) {
    setMode(next);
    setStatus("idle");
    setErrorMsg("");
  }

  async function onSubmitLink(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const supabase = createClient();
    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", next);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectTo.toString(),
        shouldCreateUser: false,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(friendlyError(error.message));
      return;
    }
    setStatus("sent");
  }

  async function onSubmitPassword(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setStatus("error");
      setErrorMsg(friendlyError(error.message));
      return;
    }
    window.location.assign(next);
  }

  if (status === "sent") {
    return (
      <div className="border border-line bg-surface p-4 text-sm leading-relaxed">
        <p className="font-semibold text-crema">Link verschickt.</p>
        <p className="mt-1 text-muted">
          Wir haben einen Anmeldelink an <span className="text-crema">{email}</span> geschickt.
          E-Mails prüfen und antippen — danach bleibst du eingeloggt.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-3 text-xs text-muted underline underline-offset-2"
        >
          Andere E-Mail-Adresse verwenden
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => switchMode("link")}
          className={`flex-1 border px-3 py-2 ${
            mode === "link" ? "border-naranja bg-naranja text-white" : "border-line text-muted"
          }`}
        >
          Anmeldelink
        </button>
        <button
          type="button"
          onClick={() => switchMode("password")}
          className={`flex-1 border px-3 py-2 ${
            mode === "password" ? "border-naranja bg-naranja text-white" : "border-line text-muted"
          }`}
        >
          Passwort
        </button>
      </div>

      <form
        onSubmit={mode === "link" ? onSubmitLink : onSubmitPassword}
        className="flex flex-col gap-3"
      >
        <label className="block">
          <span className="mb-1 block text-xs text-muted">E-Mail-Adresse</span>
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="deine@email.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-line bg-carbon px-3 py-3 text-base text-crema outline-none placeholder:text-muted focus-visible:border-naranja"
          />
        </label>

        {mode === "password" && (
          <label className="block">
            <span className="mb-1 block text-xs text-muted">Passwort</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-line bg-carbon px-3 py-3 text-base text-crema outline-none placeholder:text-muted focus-visible:border-naranja"
            />
          </label>
        )}

        {status === "error" && <p className="text-sm text-naranja-dark">{errorMsg}</p>}

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full bg-naranja px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {status === "sending"
            ? "Wird geprüft …"
            : mode === "link"
              ? "Anmeldelink schicken"
              : "Anmelden"}
        </button>
      </form>

      {mode === "password" && (
        <p className="mt-2 text-xs text-muted">
          Noch kein Passwort? Einmal per Anmeldelink einloggen und dort unter „Passwort&quot; eins
          festlegen.
        </p>
      )}
    </div>
  );
}
