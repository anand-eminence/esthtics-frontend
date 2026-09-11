"use client";

import type {
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes } from "react";
import { cn } from "./ui";

const CONTROL =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-[14px] text-ink placeholder:text-muted/70 disabled:bg-page disabled:text-muted";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.07em] text-muted"
      >
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-[12px] text-bad-ink">{error}</p> : null}
      {!error && hint ? (
        <p className="mt-1 text-[12px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({
  className,
  invalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(CONTROL, invalid && "border-bad-ink", className)}
      {...props}
    />
  );
}

export function Textarea({
  className,
  invalid,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(
        CONTROL,
        "min-h-20 resize-y",
        invalid && "border-bad-ink",
        className,
      )}
      {...props}
    />
  );
}

// Our own chevron. The browser default sits hard against the right edge and
// looks different on every platform.
const CHEVRON =
  "data:image/svg+xml;utf8," +
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' " +
  "stroke='%238a9099' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'>" +
  "<path d='M6 8.5l4 4 4-4'/></svg>";

export function Select({
  className,
  invalid,
  children,
  style,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      className={cn(
        CONTROL,
        "appearance-none pr-9",
        invalid && "border-bad-ink",
        className,
      )}
      style={{
        backgroundImage: `url("${CHEVRON}")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.7rem center",
        backgroundSize: "16px 16px",
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  );
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const variants = {
    primary:
      "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/50",
    secondary:
      "border border-line bg-surface text-ink hover:bg-page disabled:text-muted",
    ghost: "text-ink-soft hover:bg-page",
  } as const;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
