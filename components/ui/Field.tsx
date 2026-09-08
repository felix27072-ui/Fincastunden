export default function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-3 block flex-1">
      <div className="mb-1 text-xs text-muted">{label}</div>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full border border-line bg-carbon px-3 py-2.5 text-base text-crema outline-none focus-visible:border-naranja box-border";
