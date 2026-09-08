import Image from "next/image";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center bg-naranja">
            <Image src="/logo.png" alt="la Finca" width={52} height={52} />
          </div>
          <div className="text-[11px] tracking-[0.16em] text-muted">HORAS | STUNDEN</div>
          <h1 className="mt-1 text-lg font-semibold">Anmeldung</h1>
          <p className="mt-1 text-sm text-muted">
            Restaurant la Finca, Freiburg — Zugang nur für angelegte Mitarbeiter:innen.
          </p>
        </div>
        {error === "no-access" && (
          <div className="mb-4 border border-naranja-dark bg-surface p-3 text-sm text-crema">
            Für diese E-Mail-Adresse ist noch kein Zugang eingerichtet. Bitte wende dich an Joe.
          </div>
        )}
        <LoginForm next={next ?? "/woche"} />
      </div>
    </div>
  );
}
