"use client";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-lg font-semibold">Etwas ist schiefgelaufen</h1>
        <p className="mt-2 text-sm text-muted">
          Bitte nochmal versuchen. Falls es weiter nicht klappt, kurz Joe Bescheid geben.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-5 bg-naranja px-4 py-3 text-sm font-semibold text-white"
        >
          Nochmal versuchen
        </button>
      </div>
    </div>
  );
}
