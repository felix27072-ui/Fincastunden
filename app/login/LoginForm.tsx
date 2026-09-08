"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "error";

export default function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: FormEvent) {
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
      setErrorMsg(
        error.message.includes("Signups not allowed")
          ? "Diese E-Mail-Adresse ist noch nicht als Mitarbeiter:in angelegt. Bitte wende dich an Joe."
          : "Der Link konnte nicht verschickt werden. Bitte versuch es gleich noch einmal."
      );
      return;
    }
    setStatus("sent");
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
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
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

      {status === "error" && <p className="text-sm text-naranja-dark">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-naranja px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {status === "sending" ? "Wird verschickt …" : "Anmeldelink schicken"}
      </button>
    </form>
  );
}
