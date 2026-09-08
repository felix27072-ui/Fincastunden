import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "outline-warn";
};

const VARIANTS: Record<NonNullable<Props["variant"]>, string> = {
  primary: "bg-naranja text-white border border-transparent",
  outline: "bg-transparent text-crema border border-crema",
  "outline-warn": "bg-transparent text-naranja-dark border border-naranja-dark",
};

export default function Button({ variant = "primary", className = "", disabled, ...props }: Props) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`px-4 py-3 text-sm font-semibold ${
        disabled ? "border border-line bg-transparent text-muted" : VARIANTS[variant]
      } ${className}`}
    />
  );
}
