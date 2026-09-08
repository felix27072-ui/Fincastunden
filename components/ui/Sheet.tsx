"use client";

export default function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92%] w-full max-w-[620px] overflow-y-auto border-t-[3px] border-naranja bg-surface p-4 text-crema"
      >
        <div className="mb-3 text-[17px] font-bold">{title}</div>
        {children}
      </div>
    </div>
  );
}
