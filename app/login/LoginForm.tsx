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

  async function onGoogleSignIn() {
    const supabase = createClient();
    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", next);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo.toString() },
    });
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

  const googleButton = (
    <button
      type="button"
      onClick={onGoogleSignIn}
      className="flex w-full items-center justify-center gap-2.5 border border-line bg-white px-4 py-3 text-sm font-semibold text-[#1C1917]"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"
        />
      </svg>
      Mit Google anmelden
    </button>
  );

  if (mode === "link" && status === "sent") {
    return (
      <div>
        {googleButton}
        <div className="mt-4 border border-line bg-surface p-4 text-sm leading-relaxed">
          <p className="font-semibold text-crema">Link verschickt.</p>
          <p className="mt-1 text-muted">
            Wir haben einen Anmeldelink an <span className="text-crema">{email}</span> geschickt.
            E-Mails prüfen und antippen — danach bleibst du eingeloggt. Falls du die Mail in der
            Gmail- oder Mail-App liest: Link lieber lange drücken und &quot;In Safari
            öffnen&quot; auswählen statt normal antippen.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-3 text-xs text-muted underline underline-offset-2"
          >
            Andere E-Mail-Adresse verwenden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {googleButton}

      <div className="my-3 flex items-center gap-2.5 text-[11px] text-muted">
        <div className="h-px flex-1 bg-line" />
        oder
        <div className="h-px flex-1 bg-line" />
      </div>

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
          Noch kein Passwort? Einmal per Google oder Anmeldelink einloggen und dort unter
          „Passwort&quot; eins festlegen.
        </p>
      )}
    </div>
  );
}
