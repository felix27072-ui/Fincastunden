"use client";

import React, { useEffect, useRef, useState } from "react";

export type SignaturePadHandle = { get: () => string | null };

const SignaturePad = React.forwardRef<SignaturePadHandle>((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  React.useImperativeHandle(ref, () => ({
    get: () => (empty ? null : (canvasRef.current?.toDataURL("image/png") ?? null)),
  }));

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    cv.width = r.width * 2;
    cv.height = r.height * 2;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.scale(2, 2);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1C1917";
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    setEmpty(false);
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const end = () => {
    drawing.current = false;
  };
  const clear = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.getContext("2d")?.clearRect(0, 0, cv.width, cv.height);
    setEmpty(true);
  };

  return (
    <div className="mt-2">
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="block h-[120px] w-full touch-none border border-line bg-white"
      />
      <button
        type="button"
        onClick={clear}
        className="mt-1.5 border border-line px-2.5 py-1.5 text-[11px] text-muted"
      >
        Unterschrift löschen
      </button>
    </div>
  );
});
SignaturePad.displayName = "SignaturePad";

export default SignaturePad;
