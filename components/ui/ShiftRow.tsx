import { dLabel, eur, hrs } from "@/lib/format";

export default function ShiftRow({
  date,
  start,
  end,
  hours,
  note,
  paid,
  paidOn,
  amountCents,
  who,
  onClick,
}: {
  date: string;
  start: string;
  end: string;
  hours: number;
  note?: string | null;
  paid: boolean;
  paidOn?: string | null;
  amountCents: number | null;
  who?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2.5 border-b border-line py-3 text-left text-crema"
    >
      <div className="min-w-0">
        <div className="text-[15px]">
          <span className="tabular-nums">{dLabel(date)}</span>
          {who && <span className="text-muted"> · {who}</span>}
        </div>
        <div className="mt-0.5 tabular-nums text-xs text-muted">
          {start}–{end} · {hrs(hours)} h{note ? ` · ${note}` : ""}
          {paid && paidOn ? ` · ausbezahlt ${dLabel(paidOn)}` : ""}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {amountCents != null && (
          <span className="tabular-nums text-[15px] font-bold">{eur(amountCents / 100)}</span>
        )}
        <span
          className="h-[9px] w-[9px] rounded-full"
          style={{ background: paid ? "var(--color-verde)" : "var(--color-naranja)" }}
        />
      </div>
    </button>
  );
}
