"use client";
import { useState, useTransition } from "react";
import { finishPasswordChange } from "./actions";
export default function PasswordChangeForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  return <form onSubmit={e => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwörter stimmen nicht überein."); return; }
    startTransition(async () => {
      const result = await finishPasswordChange(password);
      if (result.error) setError(result.error);
      else window.location.replace("/woche");
    });
  }} className="flex flex-col gap-3">
    <label className="text-sm">Neues Passwort<input className="mt-1 w-full border border-line bg-carbon px-3 py-3" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} /></label>
    <label className="text-sm">Passwort wiederholen<input className="mt-1 w-full border border-line bg-carbon px-3 py-3" type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e => setConfirm(e.target.value)} /></label>
    {error && <p role="alert" className="text-sm text-naranja-dark">{error}</p>}
    <button disabled={pending} className="bg-naranja px-4 py-3 font-semibold text-white">{pending ? "Speichern …" : "Passwort speichern"}</button>
  </form>;
}
