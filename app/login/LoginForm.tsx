"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "code" | "password";
type CodeStep = "email" | "code";
type Status = "idle" | "sending" | "error";

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
  if (message.toLowerCase().includes("token has expired") || message.toLowerCase().includes("invalid")) {
    return "Der Code ist falsch oder abgelaufen. Fordere einen neuen an.";
  }
  return `Anmeldung fehlgeschlagen: ${message}`;
}

export default function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<Mode>("code");
  const [codeStep, setCodeStep] = useState<CodeStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function switchMode(next: Mode) {
    setMode(next);
    setCodeStep("email");
    setStatus("idle");
    setErrorMsg("");
  }

  async function onRequestCode(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(friendlyError(error.message));
      return;
    }
    setStatus("idle");
    setCodeStep("code");
  }

  async function onVerifyCode(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });

    if (error) {
      setStatus("error");
      setErrorMsg(friendlyError(error.message));
      return;
    }
    window.location.assign(next);
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

  if (mode === "code" && codeStep === "code") {
    return (
      <div>
        <div className="border border-line bg-surface p-4 text-sm leading-relaxed">
          <p className="font-semibold text-crema">Code verschickt.</p>
          <p className="mt-1 text-muted">
            Wir haben einen 6-stelligen Code an <span className="text-crema">{email}</span>{" "}
            geschickt. Einfach hier eintragen, egal in welcher App du die Mail liest.
          </p>
        </div>

        <form onSubmit={onVerifyCode} className="mt-3 flex flex-col gap-3">
          <label className="block">
            <span className="mb-1 block text-xs text-muted">Code</span>
            <input
              type="text"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border border-line bg-carbon px-3 py-3 text-center text-2xl tracking-[0.3em] text-crema outline-none placeholder:text-muted focus-visible:border-naranja"
            />
          </label>

          {status === "error" && <p className="text-sm text-naranja-dark">{errorMsg}</p>}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full bg-naranja px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {status === "sending" ? "Wird geprüft …" : "Anmelden"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setCodeStep("email");
            setStatus("idle");
            setCode("");
            setErrorMsg("");
          }}
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
          onClick={() => switchMode("code")}
          className={`flex-1 border px-3 py-2 ${
            mode === "code" ? "border-naranja bg-naranja text-white" : "border-line text-muted"
          }`}
        >
          Code
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
        onSubmit={mode === "code" ? onRequestCode : onSubmitPassword}
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
            : mode === "code"
              ? "Code schicken"
              : "Anmelden"}
        </button>
      </form>

      {mode === "password" && (
        <p className="mt-2 text-xs text-muted">
          Noch kein Passwort? Einmal per Code einloggen und dort unter „Passwort&quot; eins
          festlegen.
        </p>
      )}
    </div>
  );
}
