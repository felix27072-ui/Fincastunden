export default function DatenschutzPage() {
  return (
    <div className="mx-auto w-full max-w-[620px] px-4 py-10 text-sm text-crema">
      <h1 className="mb-4 text-lg font-semibold">Datenschutz</h1>
      <p className="mb-3 text-muted">
        Diese App dient ausschließlich der internen Arbeitszeit- und Lohnabrechnung für
        Mitarbeiter:innen von Restaurant la Finca, Freiburg.
      </p>
      <p className="mb-3 text-muted">
        Gespeichert werden Name, E-Mail-Adresse, Arbeitszeiten, Stundensatz, ausgezahlte
        Beträge sowie die digitale Unterschrift zur Bestätigung einer Auszahlung. Diese Daten
        werden benötigt, um Arbeitszeiten und Lohnzahlungen korrekt zu dokumentieren, und sind
        nur für Joe (Chef) und die Steuerberatung einsehbar.
      </p>
      <p className="mb-3 text-muted">
        Technisch gehostet wird die App bei Vercel, die Daten liegen bei Supabase. Es werden
        keine Daten an Werbe- oder Analyse-Dienste weitergegeben.
      </p>
      <p className="text-muted">
        Fragen dazu bitte direkt an Joe.
      </p>
    </div>
  );
}
