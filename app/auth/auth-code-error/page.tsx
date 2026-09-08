import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-lg font-semibold">Link ungültig</h1>
        <p className="mt-2 text-sm text-muted">
          Der Anmeldelink ist abgelaufen oder wurde schon verwendet. Fordere einfach einen neuen
          an.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-block bg-naranja px-4 py-3 text-sm font-semibold text-white"
        >
          Zurück zur Anmeldung
        </Link>
      </div>
    </div>
  );
}
