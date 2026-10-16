import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "outline-warn";
};

const VARIANTS: Record<NonNullable<Props["variant"]>, string> = {
  primary: "bg-naranja text-white border border-naranja hover:bg-naranja-dark active:bg-naranja-dark",
  outline: "bg-surface text-crema border border-line hover:border-muted hover:bg-line",
  "outline-warn": "bg-transparent text-naranja border border-naranja-dark hover:bg-naranja/10",
};

export default function Button({ variant = "primary", className = "", disabled, ...props }: Props) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`min-h-11 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-150 active:scale-[0.99] disabled:cursor-not-allowed disabled:active:scale-100 ${
        disabled ? "border border-line bg-surface text-muted" : VARIANTS[variant]
      } ${className}`}
    />
  );
}
