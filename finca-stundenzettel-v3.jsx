import React, { useState, useEffect, useMemo, useRef } from "react";

/* ---------- La Finca Tokens ---------- */
const LOGO = "data:image/png;base64,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";
const C = {
  carbon: "#1C1917",
  surface: "#262220",
  line: "#3B3532",
  crema: "#F6F1E8",
  muted: "#A19A90",
  naranja: "#E07C24",
  naranjaDark: "#B5561F",
  verde: "#8AA46B",
};
const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const NUM = { fontVariantNumeric: "tabular-nums" };
const KEY = "finca-stunden-v2";
const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

/* ---------- Helpers ---------- */
const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);

function hoursBetween(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let s = sh * 60 + sm;
  let e = eh * 60 + em;
  if (e <= s) e += 1440;
  return Math.round(((e - s) / 60) * 100) / 100;
}
const de = (n, d = 2) =>
  Number(n).toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });
const eur = (n) => de(n) + " €";
const hrs = (n) => de(n, n % 1 === 0 ? 0 : 2);
const d = (iso) => new Date(iso + "T12:00:00");
const dLabel = (iso) => d(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" });
const dShort = (iso) => d(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
const monthKey = (iso) => iso.slice(0, 7);
const monthLabel = (mk) =>
  new Date(mk + "-01T12:00:00").toLocaleDateString("de-DE", { month: "long", year: "numeric" });

function mondayOf(iso) {
  const dt = d(iso);
  dt.setDate(dt.getDate() - ((dt.getDay() + 6) % 7));
  return dt.toISOString().slice(0, 10);
}
function addDays(iso, n) {
  const dt = d(iso);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().slice(0, 10);
}
function isoWeek(iso) {
  const dt = d(iso);
  dt.setDate(dt.getDate() + 4 - ((dt.getDay() + 6) % 7 || 7) + 3);
  const first = new Date(dt.getFullYear(), 0, 4);
  return 1 + Math.round(((dt - first) / 86400000 - 3 + ((first.getDay() + 6) % 7)) / 7);
}
function weeksOfMonth(mk) {
  const first = mk + "-01";
  const last = new Date(d(first).getFullYear(), d(first).getMonth() + 1, 0).toISOString().slice(0, 10);
  const out = [];
  let m = mondayOf(first);
  while (m <= last) {
    out.push(m);
    m = addDays(m, 7);
  }
  return out;
}

/* ---------- Seed ---------- */
const seed = () => ({
  employees: [
    { id: "e1", name: "Felix Dörr", rate: 13.9, role: "mitarbeiter" },
    { id: "e2", name: "Maria L.", rate: 13.9, role: "mitarbeiter" },
    { id: "e3", name: "Tobias K.", rate: 14.5, role: "mitarbeiter" },
    { id: "chef", name: "Joe", rate: 0, role: "chef" },
    { id: "stb", name: "Steuerberatung", rate: 0, role: "steuer" },
  ],
  shifts: [
    { id: uid(), empId: "e1", date: "2026-09-04", start: "18:00", end: "23:00", note: "", paid: true, paidOn: "2026-09-05" },
    { id: uid(), empId: "e1", date: "2026-09-07", start: "18:00", end: "23:30", note: "", paid: false, paidOn: null },
    { id: uid(), empId: "e1", date: "2026-09-05", start: "17:30", end: "00:00", note: "", paid: false, paidOn: null },
    { id: uid(), empId: "e2", date: "2026-09-05", start: "17:30", end: "22:30", note: "", paid: false, paidOn: null },
    { id: uid(), empId: "e2", date: "2026-09-08", start: "18:00", end: "23:00", note: "", paid: false, paidOn: null },
    { id: uid(), empId: "e3", date: "2026-09-06", start: "18:00", end: "23:30", note: "Küche", paid: false, paidOn: null },
  ],
  payouts: [],
  log: [],
});

/* ---------- App ---------- */
export default function App() {
  const [data, setData] = useState(null);
  const [saveState, setSaveState] = useState("ok");
  const [meId, setMeId] = useState("e1");
  const [tab, setTab] = useState("woche");
  const [sheet, setSheet] = useState(null);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(KEY, true);
        const p = res ? JSON.parse(res.value) : null;
        if (p && p.employees) {
          p.employees = p.employees.map((e) => (e.role === "chef" ? { ...e, name: "Joe" } : e));
          return setData(p);
        }
        throw new Error("leer");
      } catch {
        const s = seed();
        setData(s);
        try { await window.storage.set(KEY, JSON.stringify(s), true); } catch { /* Prototyp läuft weiter */ }
      }
    })();
  }, []);

  if (!data) {
    return <div style={{ fontFamily: FONT, background: C.carbon, color: C.muted, padding: 32 }}>la Finca – Stunden werden geladen …</div>;
  }

  const me = data.employees.find((e) => e.id === meId);
  const seesMoneyOfAll = me.role !== "mitarbeiter";
  const canEdit = me.role !== "steuer";
  const rateOf = (id) => (data.employees.find((e) => e.id === id) || { rate: 0 }).rate;
  const amount = (s) => hoursBetween(s.start, s.end) * rateOf(s.empId);
  const nameOf = (id) => (data.employees.find((e) => e.id === id) || {}).name || "—";

  async function commit(next, entry) {
    const withLog = entry
      ? { ...next, log: [{ ts: new Date().toISOString(), who: me.name, ...entry }, ...next.log].slice(0, 400) }
      : next;
    setData(withLog);
    try {
      await window.storage.set(KEY, JSON.stringify(withLog), true);
      setSaveState("ok");
    } catch {
      setSaveState("nicht gespeichert");
    }
  }

  const saveShift = (shift, isNew) =>
    commit({ ...data, shifts: isNew ? [...data.shifts, shift] : data.shifts.map((s) => (s.id === shift.id ? shift : s)) }, {
      action: isNew ? "Schicht angelegt" : "Schicht geändert",
      detail: `${nameOf(shift.empId)} · ${dLabel(shift.date)} · ${shift.start}–${shift.end}`,
      shiftId: shift.id,
    });

  const deleteShift = (s) =>
    commit({ ...data, shifts: data.shifts.filter((x) => x.id !== s.id) }, {
      action: "Schicht gelöscht",
      detail: `${nameOf(s.empId)} · ${dLabel(s.date)} · ${s.start}–${s.end}`,
      shiftId: s.id,
    });

  function payout({ empId, shiftIds, signature }) {
    const rows = data.shifts.filter((s) => shiftIds.includes(s.id));
    const p = {
      id: uid(), empId, date: today(), shiftIds,
      total: rows.reduce((n, s) => n + amount(s), 0),
      hours: rows.reduce((n, s) => n + hoursBetween(s.start, s.end), 0),
      signature: signature || null, confirmedBy: me.name,
    };
    commit(
      {
        ...data,
        shifts: data.shifts.map((s) => (shiftIds.includes(s.id) ? { ...s, paid: true, paidOn: p.date } : s)),
        payouts: [p, ...data.payouts],
      },
      { action: "Auszahlung", detail: `${nameOf(empId)} · ${eur(p.total)} · ${rows.length} Schichten` }
    );
    setReceipt(p);
  }

  const ctx = { data, me, amount, nameOf, rateOf, canEdit, seesMoneyOfAll };

  return (
    <div style={{ fontFamily: FONT, background: C.carbon, color: C.crema, minHeight: "100%" }}>
      <style>{`
        .fc-sub { display: none; }
        @media (min-width: 480px) { .fc-sub { display: block; } }
        .fc-cell:active { background: rgba(224,124,36,0.18); }
        button:focus-visible, select:focus-visible, input:focus-visible { outline: 2px solid ${C.naranja}; outline-offset: 2px; }
      `}</style>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "0 0 64px" }}>
        <TopBar data={data} me={me} meId={meId} setMeId={setMeId} saveState={saveState} />
        <div style={{ padding: "0 12px" }}>
          <Tabs tab={tab} setTab={setTab} me={me} />
          {tab === "woche" && <WeekGrid {...ctx} onCell={(empId, date) => canEdit && setSheet({ kind: "day", empId, date })} />}
          {tab === "meine" && (
            <MyShifts {...ctx}
              onEdit={(s) => setSheet({ kind: "edit", shift: s })}
              onNew={() => setSheet({ kind: "day", empId: me.id, date: today() })}
              onPayout={(empId) => setSheet({ kind: "payout", empId })} />
          )}
          {tab === "abrechnung" && (
            <Billing {...ctx} onPayout={(empId) => setSheet({ kind: "payout", empId })} onReceipt={setReceipt} />
          )}
        </div>
      </div>

      {sheet?.kind === "day" && (
        <DaySheet {...ctx} empId={sheet.empId} date={sheet.date} onClose={() => setSheet(null)}
          onEdit={(s) => setSheet({ kind: "edit", shift: s })}
          onNew={() => setSheet({ kind: "edit", isNew: true, shift: { id: uid(), empId: sheet.empId, date: sheet.date, start: "18:00", end: "23:30", note: "", paid: false, paidOn: null } })} />
      )}
      {sheet?.kind === "edit" && (
        <ShiftSheet {...ctx} shift={sheet.shift} isNew={sheet.isNew} onClose={() => setSheet(null)}
          onSave={(s) => { saveShift(s, !!sheet.isNew); setSheet(null); }}
          onDelete={(s) => { deleteShift(s); setSheet(null); }} />
      )}
      {sheet?.kind === "payout" && (
        <PayoutSheet {...ctx} empId={sheet.empId} onClose={() => setSheet(null)}
          onConfirm={(p) => { payout(p); setSheet(null); }} />
      )}
      {receipt && <ReceiptView p={receipt} {...ctx} onClose={() => setReceipt(null)} />}
    </div>
  );
}

/* ---------- Kopf ---------- */
function TopBar({ data, me, meId, setMeId, saveState }) {
  return (
    <div className="flex items-center justify-between" style={{ background: C.naranja, padding: "10px 12px", gap: 10 }}>
      <img src={LOGO} alt="la Finca" style={{ height: 46, width: 46, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.9)" }}>HORAS | STUNDEN</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
          {me.role === "chef" ? "Chef · alle Rechte" : me.role === "steuer" ? "Steuerberatung · nur lesen" : "Mitarbeiter"}
          {saveState !== "ok" && " · nicht gespeichert"}
        </div>
      </div>
      <select value={meId} onChange={(e) => setMeId(e.target.value)}
        style={{ background: "rgba(0,0,0,0.22)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", padding: "8px", fontSize: 13, fontFamily: FONT, maxWidth: 150 }}>
        {data.employees.map((e) => <option key={e.id} value={e.id} style={{ color: "#000" }}>{e.name}</option>)}
      </select>
    </div>
  );
}

function Tabs({ tab, setTab, me }) {
  const items = [["woche", "Woche"], ["meine", "Meine Schichten"]];
  if (me.role !== "mitarbeiter") items.push(["abrechnung", "Abrechnung"]);
  return (
    <div className="flex" style={{ gap: 6, margin: "12px 0 14px" }}>
      {items.map(([k, label]) => (
        <button key={k} onClick={() => setTab(k)} style={{
          flex: 1, padding: "10px 4px", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
          background: tab === k ? C.crema : "transparent", color: tab === k ? C.carbon : C.muted,
          border: `1px solid ${tab === k ? C.crema : C.line}`,
        }}>{label}</button>
      ))}
    </div>
  );
}

/* ---------- Wochenplan ---------- */
function WeekGrid({ data, me, amount, seesMoneyOfAll, onCell }) {
  const months = useMemo(() => {
    const set = new Set(data.shifts.map((s) => monthKey(s.date)));
    set.add(monthKey(today()));
    return [...set].sort().reverse();
  }, [data.shifts]);
  const [mk, setMk] = useState(monthKey(today()));
  const weeks = weeksOfMonth(months.includes(mk) ? mk : months[0]);
  const [wk, setWk] = useState(() => mondayOf(today()));
  const monday = weeks.includes(wk) ? wk : weeks[0];
  const days = DAYS.map((_, i) => addDays(monday, i));
  const staff = data.employees.filter((e) => e.role === "mitarbeiter");
  const cell = (empId, date) => data.shifts.filter((s) => s.empId === empId && s.date === date);
  const cols = "58px repeat(7, minmax(0, 1fr))";
  const weekShifts = data.shifts.filter((s) => days.includes(s.date));

  return (
    <>
      <select value={mk} onChange={(e) => { setMk(e.target.value); setWk(weeksOfMonth(e.target.value)[0]); }} style={inputStyle}>
        {months.map((m) => <option key={m} value={m} style={{ color: "#000" }}>{monthLabel(m)}</option>)}
      </select>

      <div className="flex" style={{ gap: 6, overflowX: "auto", padding: "10px 0 4px" }}>
        {weeks.map((m) => (
          <button key={m} onClick={() => setWk(m)} style={{
            flexShrink: 0, padding: "8px 11px", fontSize: 12, fontFamily: FONT, cursor: "pointer",
            background: m === monday ? C.naranja : "transparent",
            color: m === monday ? "#fff" : C.muted,
            border: `1px solid ${m === monday ? C.naranja : C.line}`,
          }}>KW {isoWeek(m)} · {dShort(m)}</button>
        ))}
      </div>

      <div style={{ marginTop: 12, border: `1px solid ${C.line}` }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, background: C.naranja }}>
          <div style={{ padding: "6px 6px", fontSize: 10, letterSpacing: "0.1em", color: "#fff", fontWeight: 700, alignSelf: "center" }}>NAME</div>
          {days.map((iso, i) => (
            <div key={iso} style={{ padding: "6px 2px", textAlign: "center", borderLeft: "1px solid rgba(255,255,255,0.25)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{DAYS[i]}</div>
              <div style={{ ...NUM, fontSize: 9, color: "rgba(255,255,255,0.85)" }}>{dShort(iso)}</div>
            </div>
          ))}
        </div>

        {staff.map((emp) => {
          const rowH = days.reduce((n, iso) => n + cell(emp.id, iso).reduce((m, s) => m + hoursBetween(s.start, s.end), 0), 0);
          return (
            <div key={emp.id} style={{
              display: "grid", gridTemplateColumns: cols, borderTop: `1px solid ${C.line}`,
              background: emp.id === me.id ? "rgba(224,124,36,0.09)" : "transparent",
            }}>
              <div style={{ padding: "8px 6px", alignSelf: "center", overflow: "hidden" }}>
                <div style={{ fontSize: 12, fontWeight: emp.id === me.id ? 700 : 500, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {emp.name.split(" ")[0]}
                </div>
                <div style={{ ...NUM, fontSize: 10, color: C.muted }}>{rowH ? hrs(rowH) + " h" : "—"}</div>
              </div>
              {days.map((iso) => {
                const list = cell(emp.id, iso);
                const h = list.reduce((n, s) => n + hoursBetween(s.start, s.end), 0);
                const open = list.some((s) => !s.paid);
                const editable = me.role === "chef" || emp.id === me.id;
                return (
                  <button key={iso} className="fc-cell" onClick={() => editable && onCell(emp.id, iso)} style={{
                    padding: "8px 1px", minHeight: 48, borderLeft: `1px solid ${C.line}`, border: "none",
                    borderLeftWidth: 1, borderLeftStyle: "solid", borderLeftColor: C.line,
                    background: "transparent", color: C.crema, fontFamily: FONT,
                    cursor: editable ? "pointer" : "default", textAlign: "center",
                  }}>
                    {h > 0 ? (
                      <>
                        <div style={{ ...NUM, fontSize: 15, fontWeight: 700, color: open ? C.naranja : C.verde }}>{hrs(h)}</div>
                        <div className="fc-sub" style={{ ...NUM, fontSize: 9, color: C.muted, lineHeight: 1.2 }}>
                          {list[0].start}–{list[list.length - 1].end}
                        </div>
                      </>
                    ) : (
                      <span style={{ color: editable ? C.line : "transparent", fontSize: 17 }}>+</span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between" style={{ ...NUM, marginTop: 10, fontSize: 13, color: C.muted }}>
        <span>KW {isoWeek(monday)} gesamt</span>
        <span style={{ color: C.crema, fontWeight: 700 }}>
          {hrs(weekShifts.reduce((n, s) => n + hoursBetween(s.start, s.end), 0))} h
          {seesMoneyOfAll && " · " + eur(weekShifts.reduce((n, s) => n + amount(s), 0))}
        </span>
      </div>
      <p style={{ fontSize: 12, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>
        Orange heißt offen, grün heißt ausbezahlt. Tippe auf einen Tag, um einzutragen.
      </p>
    </>
  );
}

/* ---------- Meine Schichten ---------- */
function MyShifts({ data, me, amount, onEdit, onNew, onPayout }) {
  if (me.role !== "mitarbeiter") {
    return <p style={{ color: C.muted, fontSize: 14 }}>Für dieses Konto sind keine eigenen Schichten hinterlegt. Nutze die Woche oder die Abrechnung.</p>;
  }
  const mine = data.shifts.filter((s) => s.empId === me.id).sort((a, b) => (a.date < b.date ? 1 : -1));
  const open = mine.filter((s) => !s.paid);
  const openSum = open.reduce((n, s) => n + amount(s), 0);

  return (
    <>
      <div style={{ background: C.surface, border: `1px solid ${C.line}`, padding: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.14em", color: C.muted }}>OFFEN | PENDIENTE</div>
        <div style={{ ...NUM, fontSize: 38, fontWeight: 700, letterSpacing: "-0.03em", color: C.naranja, lineHeight: 1.15, marginTop: 4 }}>{eur(openSum)}</div>
        <div style={{ ...NUM, fontSize: 13, color: C.muted }}>
          {hrs(open.reduce((n, s) => n + hoursBetween(s.start, s.end), 0))} h aus {open.length} Schichten · {eur(me.rate)} pro Stunde
        </div>
        <div className="flex" style={{ gap: 8, marginTop: 14 }}>
          <button onClick={onNew} style={{ ...btn(C.naranja, "#fff"), flex: 1 }}>Schicht eintragen</button>
          <button onClick={() => onPayout(me.id)} disabled={!open.length} style={btn("transparent", C.crema, true, !open.length)}>Auszahlen</button>
        </div>
      </div>
      <div style={{ marginTop: 20, borderTop: `1px solid ${C.line}` }}>
        {mine.map((s) => <ShiftRow key={s.id} s={s} amount={amount(s)} onClick={() => onEdit(s)} />)}
        {!mine.length && <p style={{ color: C.muted, fontSize: 14, paddingTop: 14 }}>Noch nichts eingetragen.</p>}
      </div>
    </>
  );
}

function ShiftRow({ s, amount, who, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between w-full text-left"
      style={{ borderBottom: `1px solid ${C.line}`, padding: "12px 2px", background: "none", border: "none", borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: C.line, color: C.crema, fontFamily: FONT, cursor: "pointer", gap: 10 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15 }}>
          <span style={NUM}>{dLabel(s.date)}</span>{who && <span style={{ color: C.muted }}> · {who}</span>}
        </div>
        <div style={{ ...NUM, fontSize: 12, color: C.muted, marginTop: 2 }}>
          {s.start}–{s.end} · {hrs(hoursBetween(s.start, s.end))} h{s.note ? ` · ${s.note}` : ""}
          {s.paid && s.paidOn ? ` · ausbezahlt ${dLabel(s.paidOn)}` : ""}
        </div>
      </div>
      <div className="flex items-center" style={{ gap: 8, flexShrink: 0 }}>
        <span style={{ ...NUM, fontSize: 15, fontWeight: 700 }}>{eur(amount)}</span>
        <span style={{ width: 9, height: 9, borderRadius: 5, background: s.paid ? C.verde : C.naranja }} />
      </div>
    </button>
  );
}

/* ---------- Abrechnung ---------- */
function Billing({ data, me, amount, nameOf, onPayout, onReceipt }) {
  const months = useMemo(() => {
    const set = new Set(data.shifts.map((s) => monthKey(s.date)));
    set.add(monthKey(today()));
    return [...set].sort().reverse();
  }, [data.shifts]);
  const [mk, setMk] = useState(months[0]);
  const [showLog, setShowLog] = useState(false);
  const month = data.shifts.filter((s) => monthKey(s.date) === mk).sort((a, b) => (a.date < b.date ? 1 : -1));
  const staff = data.employees.filter((e) => e.role === "mitarbeiter");

  function exportCSV() {
    const head = ["Mitarbeiter", "Datum", "Wochentag", "Beginn", "Ende", "Stunden", "Stundensatz", "Betrag", "Status", "Ausbezahlt am", "Notiz"];
    const rows = month.map((s) => {
      const e = data.employees.find((x) => x.id === s.empId) || { name: "", rate: 0 };
      return [e.name, dLabel(s.date), DAYS[(d(s.date).getDay() + 6) % 7], s.start, s.end,
        de(hoursBetween(s.start, s.end)), de(e.rate), de(amount(s)),
        s.paid ? "ausbezahlt" : "offen", s.paidOn ? dLabel(s.paidOn) : "", s.note || ""];
    });
    download(`Stunden_LaFinca_${mk}.csv`, "\uFEFF" + [head, ...rows].map((r) => r.join(";")).join("\r\n"), "text/csv;charset=utf-8;");
  }

  return (
    <>
      <select value={mk} onChange={(e) => setMk(e.target.value)} style={inputStyle}>
        {months.map((m) => <option key={m} value={m} style={{ color: "#000" }}>{monthLabel(m)}</option>)}
      </select>

      <div style={{ background: C.surface, border: `1px solid ${C.line}`, padding: 14, marginTop: 12 }}>
        {staff.map((e) => {
          const rows = month.filter((s) => s.empId === e.id);
          const openSum = data.shifts.filter((s) => s.empId === e.id && !s.paid).reduce((n, s) => n + amount(s), 0);
          return (
            <div key={e.id} className="flex items-center justify-between" style={{ borderBottom: `1px solid ${C.line}`, padding: "10px 0", gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15 }}>{e.name}</div>
                <div style={{ ...NUM, fontSize: 12, color: C.muted }}>
                  {hrs(rows.reduce((n, s) => n + hoursBetween(s.start, s.end), 0))} h · {eur(rows.reduce((n, s) => n + amount(s), 0))}
                  {openSum > 0 && <span style={{ color: C.naranja }}> · offen {eur(openSum)}</span>}
                </div>
              </div>
              {me.role === "chef" && (
                <button onClick={() => onPayout(e.id)} disabled={!openSum} style={btn("transparent", C.crema, true, !openSum, 12)}>Auszahlen</button>
              )}
            </div>
          );
        })}
        <div className="flex justify-between" style={{ marginTop: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Monat gesamt</span>
          <span style={{ ...NUM, fontSize: 20, fontWeight: 700 }}>{eur(month.reduce((n, s) => n + amount(s), 0))}</span>
        </div>
        <button onClick={exportCSV} style={{ ...btn(C.naranja, "#fff"), width: "100%", marginTop: 12 }}>Monat als CSV exportieren</button>
      </div>

      {data.payouts.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <SectionTitle>Auszahlungen | Pagos</SectionTitle>
          {data.payouts.map((p) => (
            <button key={p.id} onClick={() => onReceipt(p)} className="flex items-center justify-between w-full text-left"
              style={{ borderBottom: `1px solid ${C.line}`, padding: "11px 2px", background: "none", border: "none", borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: C.line, color: C.crema, fontFamily: FONT, cursor: "pointer" }}>
              <span style={{ fontSize: 14 }}>{nameOf(p.empId)} <span style={{ color: C.muted, fontSize: 12 }}>· {dLabel(p.date)}</span></span>
              <span style={{ ...NUM, fontWeight: 700 }}>{eur(p.total)}</span>
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <SectionTitle>Alle Schichten</SectionTitle>
        {month.map((s) => <ShiftRow key={s.id} s={s} who={nameOf(s.empId)} amount={amount(s)} onClick={() => {}} />)}
      </div>

      <button onClick={() => setShowLog(!showLog)} style={{ ...btn("transparent", C.muted, true, false, 12), width: "100%", marginTop: 18 }}>
        Änderungsprotokoll {showLog ? "ausblenden" : "anzeigen"} ({data.log.length})
      </button>
      {showLog && data.log.map((l, i) => (
        <div key={i} style={{ borderBottom: `1px solid ${C.line}`, padding: "7px 0", fontSize: 12, color: C.muted }}>
          <span style={{ color: C.crema }}>{l.action}</span> · {l.detail}
          <div style={{ ...NUM, fontSize: 11 }}>{new Date(l.ts).toLocaleString("de-DE")} · {l.who}</div>
        </div>
      ))}
    </>
  );
}
const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 11, letterSpacing: "0.14em", color: C.muted, marginBottom: 6 }}>{String(children).toUpperCase()}</div>
);

/* ---------- Sheets ---------- */
function DaySheet({ data, nameOf, amount, empId, date, onClose, onEdit, onNew }) {
  const list = data.shifts.filter((s) => s.empId === empId && s.date === date);
  return (
    <Sheet onClose={onClose} title={`${nameOf(empId)} · ${dLabel(date)}`}>
      {list.map((s) => <ShiftRow key={s.id} s={s} amount={amount(s)} onClick={() => onEdit(s)} />)}
      {!list.length && <p style={{ color: C.muted, fontSize: 14, padding: "6px 0 12px" }}>Für diesen Tag ist nichts eingetragen.</p>}
      <button onClick={onNew} style={{ ...btn(C.naranja, "#fff"), width: "100%", marginTop: 12 }}>Schicht hinzufügen</button>
    </Sheet>
  );
}

function ShiftSheet({ shift, isNew, data, rateOf, nameOf, onClose, onSave, onDelete }) {
  const [f, setF] = useState(shift);
  const h = hoursBetween(f.start, f.end);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const history = data.log.filter((l) => l.shiftId === f.id);

  return (
    <Sheet onClose={onClose} title={isNew ? "Neue Schicht" : "Schicht bearbeiten"}>
      <Field label="Datum"><input type="date" value={f.date} onChange={set("date")} style={inputStyle} /></Field>
      <div className="flex" style={{ gap: 10 }}>
        <Field label="Von"><input type="time" value={f.start} onChange={set("start")} style={inputStyle} /></Field>
        <Field label="Bis"><input type="time" value={f.end} onChange={set("end")} style={inputStyle} /></Field>
      </div>
      <Field label="Notiz (optional)"><input value={f.note} onChange={set("note")} placeholder="z. B. Küche, Theke" style={inputStyle} /></Field>

      <div style={{ background: C.carbon, border: `1px solid ${C.line}`, padding: 12 }}>
        <div style={{ ...NUM, fontSize: 22, fontWeight: 700 }}>{hrs(h)} h · {eur(h * rateOf(f.empId))}</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
          {nameOf(f.empId)} · {eur(rateOf(f.empId))} pro Stunde · über Mitternacht wird mitgezählt
        </div>
      </div>
      {f.paid && <div style={{ fontSize: 12, color: C.verde, marginTop: 10 }}>Am {dLabel(f.paidOn)} ausbezahlt. Änderungen werden protokolliert.</div>}

      <div className="flex" style={{ gap: 8, marginTop: 16 }}>
        <button onClick={() => onSave(f)} style={{ ...btn(C.naranja, "#fff"), flex: 1 }}>Speichern</button>
        <button onClick={onClose} style={btn("transparent", C.crema, true)}>Abbrechen</button>
      </div>
      {!isNew && (
        <button onClick={() => onDelete(f)} style={{ ...btn("transparent", C.naranjaDark, true), width: "100%", marginTop: 8 }}>Schicht löschen</button>
      )}
      {history.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <SectionTitle>Verlauf</SectionTitle>
          {history.map((l, i) => (
            <div key={i} style={{ ...NUM, fontSize: 11, color: C.muted, padding: "3px 0" }}>
              {new Date(l.ts).toLocaleString("de-DE")} · {l.action} · {l.who}
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}

function PayoutSheet({ data, amount, nameOf, empId, onClose, onConfirm }) {
  const open = data.shifts.filter((s) => s.empId === empId && !s.paid).sort((a, b) => (a.date < b.date ? 1 : -1));
  const [sel, setSel] = useState(open.map((s) => s.id));
  const [sign, setSign] = useState(true);
  const padRef = useRef(null);
  const total = open.filter((s) => sel.includes(s.id)).reduce((n, s) => n + amount(s), 0);
  const toggle = (id) => setSel(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);

  return (
    <Sheet onClose={onClose} title={`Auszahlen · ${nameOf(empId)}`}>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>
        Wähle die Schichten, die jetzt ausbezahlt werden. Der Rest bleibt offen stehen.
      </p>
      {open.map((s) => {
        const on = sel.includes(s.id);
        return (
          <button key={s.id} onClick={() => toggle(s.id)} className="flex items-center w-full text-left"
            style={{ borderBottom: `1px solid ${C.line}`, padding: "11px 2px", background: "none", border: "none", borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: C.line, color: C.crema, fontFamily: FONT, cursor: "pointer", gap: 10 }}>
            <span style={{ width: 22, height: 22, flexShrink: 0, border: `1.5px solid ${on ? C.naranja : C.line}`, background: on ? C.naranja : "transparent", color: "#fff", fontSize: 13, lineHeight: "20px", textAlign: "center" }}>{on ? "✓" : ""}</span>
            <span style={{ flex: 1, fontSize: 14, minWidth: 0 }}>
              <span style={NUM}>{dLabel(s.date)}</span>
              <span style={{ ...NUM, color: C.muted, fontSize: 12 }}> · {s.start}–{s.end} · {hrs(hoursBetween(s.start, s.end))} h</span>
            </span>
            <span style={{ ...NUM, fontWeight: 700 }}>{eur(amount(s))}</span>
          </button>
        );
      })}

      <div className="flex justify-between" style={{ marginTop: 14 }}>
        <span style={{ fontSize: 14 }}>Auszahlungsbetrag</span>
        <span style={{ ...NUM, fontSize: 22, fontWeight: 700, color: C.naranja }}>{eur(total)}</span>
      </div>

      <label className="flex items-center" style={{ gap: 8, marginTop: 14, fontSize: 13, color: C.muted }}>
        <input type="checkbox" checked={sign} onChange={(e) => setSign(e.target.checked)} />
        Unterschrift auf dem Gerät leisten
      </label>
      {sign && <SignaturePad ref={padRef} />}

      <button disabled={!sel.length}
        onClick={() => onConfirm({ empId, shiftIds: sel, signature: sign && padRef.current ? padRef.current.get() : null })}
        style={{ ...btn(C.naranja, "#fff", false, !sel.length), width: "100%", marginTop: 16 }}>
        {eur(total)} als ausbezahlt buchen
      </button>
    </Sheet>
  );
}

const SignaturePad = React.forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  React.useImperativeHandle(ref, () => ({ get: () => (empty ? null : canvasRef.current.toDataURL("image/png")) }));

  useEffect(() => {
    const cv = canvasRef.current;
    const r = cv.getBoundingClientRect();
    cv.width = r.width * 2;
    cv.height = r.height * 2;
    const ctx = cv.getContext("2d");
    ctx.scale(2, 2);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1C1917";
  }, []);

  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const start = (e) => {
    drawing.current = true;
    setEmpty(false);
    const ctx = canvasRef.current.getContext("2d");
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const end = () => { drawing.current = false; };
  const clear = () => {
    const cv = canvasRef.current;
    cv.getContext("2d").clearRect(0, 0, cv.width, cv.height);
    setEmpty(true);
  };

  return (
    <div style={{ marginTop: 8 }}>
      <canvas ref={canvasRef} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end}
        style={{ width: "100%", height: 120, background: "#fff", border: `1px solid ${C.line}`, touchAction: "none", display: "block" }} />
      <button onClick={clear} style={{ ...btn("transparent", C.muted, true, false, 11), marginTop: 6 }}>Unterschrift löschen</button>
    </div>
  );
});

/* ---------- Quittung ---------- */
function ReceiptView({ p, data, amount, nameOf, onClose }) {
  const rows = data.shifts.filter((s) => p.shiftIds.includes(s.id)).sort((a, b) => (a.date < b.date ? 1 : -1));

  function downloadReceipt() {
    const html = `<!doctype html><meta charset="utf-8"><title>Quittung ${nameOf(p.empId)} ${dLabel(p.date)}</title>
<style>body{font-family:Helvetica,Arial,sans-serif;color:#1C1917;max-width:640px;margin:36px auto;padding:0 24px}
.head{display:flex;align-items:center;gap:14px;margin-bottom:22px}
.tile{background:#E07C24;width:64px;height:64px;display:flex;align-items:center;justify-content:center}
h1{font-size:13px;text-decoration:underline;margin:0}
table{width:100%;border-collapse:collapse;margin:16px 0}td,th{border-bottom:1px solid #ccc;padding:7px 0;text-align:left;font-size:13px}
th{color:#666;font-weight:600}.r{text-align:right}.big{font-size:19px;font-weight:700}
.sig{margin-top:30px;border-top:1px solid #333;padding-top:6px;font-size:12px;color:#666;width:280px}</style>
<div class="head"><div class="tile"><img src="${LOGO}" style="width:56px;height:56px"></div>
<h1>Minijobber Restaurant la finca, Stadtstrasse 50, 79104 Freiburg</h1></div>
<p><b>Name</b> ${nameOf(p.empId)}<br><b>Ausbezahlt am</b> ${dLabel(p.date)}<br><b>Rentenbefreit</b> ______________________</p>
<table><tr><th>Datum</th><th>Stunden von bis</th><th class="r">Stunden</th><th class="r">Betrag</th></tr>
${rows.map((s) => `<tr><td>${dLabel(s.date)}</td><td>${s.start}–${s.end}</td><td class="r">${de(hoursBetween(s.start, s.end))}</td><td class="r">${eur(amount(s))}</td></tr>`).join("")}
<tr><td colspan="2"><b>Betrag in Euro ausbezahlt</b></td><td class="r"><b>${de(p.hours)}</b></td><td class="r big">${eur(p.total)}</td></tr></table>
${p.signature
  ? `<p style="margin-top:24px"><img src="${p.signature}" style="height:70px"></p><div class="sig">Erhalten von ${nameOf(p.empId)} · digital unterschrieben am ${dLabel(p.date)}</div>`
  : `<div class="sig">Erhalten von ${nameOf(p.empId)} — Unterschrift</div>`}
<p style="font-size:11px;color:#888;margin-top:24px">Digitaler Stundenzettel la Finca · gebucht von ${p.confirmedBy}</p>`;
    download(`Quittung_${nameOf(p.empId).split(" ")[0]}_${p.date}.html`, html, "text/html;charset=utf-8;");
  }

  return (
    <Sheet onClose={onClose} title="Quittung | Recibo">
      <div style={{ background: "#fff", color: "#1C1917", padding: 16 }}>
        <div className="flex items-center" style={{ gap: 10, marginBottom: 12 }}>
          <div style={{ background: C.naranja, width: 44, height: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={LOGO} alt="" style={{ width: 38, height: 38 }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, textDecoration: "underline" }}>
            Minijobber Restaurant la finca, Stadtstrasse 50, 79104 Freiburg
          </div>
        </div>
        <RLine k="Name" v={nameOf(p.empId)} />
        <RLine k="Ausbezahlt am" v={dLabel(p.date)} />
        <RLine k="Stunden" v={de(p.hours) + " h"} />
        <RLine k="Betrag" v={eur(p.total)} />
        <div style={{ marginTop: 10 }}>
          {rows.map((s) => (
            <div key={s.id} className="flex justify-between" style={{ ...NUM, fontSize: 12, color: "#555", padding: "3px 0" }}>
              <span>{dLabel(s.date)} · {s.start}–{s.end}</span><span>{eur(amount(s))}</span>
            </div>
          ))}
        </div>
        {p.signature
          ? <img alt="Unterschrift" src={p.signature} style={{ height: 60, marginTop: 14 }} />
          : <div style={{ marginTop: 26, borderTop: "1px solid #333", paddingTop: 5, fontSize: 11, color: "#666", width: 220 }}>Erhalten von — Unterschrift</div>}
      </div>
      <button onClick={downloadReceipt} style={{ ...btn(C.naranja, "#fff"), width: "100%", marginTop: 12 }}>Quittung herunterladen</button>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>Öffnet im Browser und lässt sich dort drucken oder als PDF sichern.</div>
      <button onClick={onClose} style={{ ...btn("transparent", C.crema, true), width: "100%", marginTop: 8 }}>Schließen</button>
    </Sheet>
  );
}
const RLine = ({ k, v }) => (
  <div className="flex justify-between" style={{ borderBottom: "1px solid #ddd", padding: "6px 0", fontSize: 14 }}>
    <span style={{ color: "#666" }}>{k}</span><span style={{ ...NUM, fontWeight: 700 }}>{v}</span>
  </div>
);

/* ---------- Bausteine ---------- */
function Sheet({ title, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.62)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ background: C.surface, color: C.crema, width: "100%", maxWidth: 620, padding: 16, maxHeight: "92%", overflowY: "auto", borderTop: `3px solid ${C.naranja}` }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>{title}</div>
        {children}
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label style={{ display: "block", flex: 1, marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{label}</div>
      {children}
    </label>
  );
}
function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
const inputStyle = {
  width: "100%", padding: "11px 12px", border: `1px solid ${C.line}`,
  background: C.carbon, color: C.crema, fontSize: 16, fontFamily: FONT, boxSizing: "border-box",
};
function btn(bg, fg, outline = false, disabled = false, size = 14) {
  return {
    padding: "12px 15px", fontSize: size, fontFamily: FONT, fontWeight: 600,
    background: disabled ? "transparent" : bg, color: disabled ? C.muted : fg,
    border: `1px solid ${disabled ? C.line : outline ? fg : "transparent"}`,
    cursor: disabled ? "default" : "pointer",
  };
}
