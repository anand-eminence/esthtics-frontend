import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

/**
 * Joins class names AND resolves Tailwind conflicts, so a `className` passed by
 * a caller reliably beats the component's own default. Plain string joining
 * does not do that — both classes survive and stylesheet order decides, which
 * silently ignored width overrides on the shared form controls.
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return twMerge(classes.filter(Boolean).join(" "));
}

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-line bg-surface",
        padded && "p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-[15px] font-semibold text-ink">{children}</h2>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-5",
        accent ? "border-brand-100 bg-brand-50" : "border-line bg-surface",
      )}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        {label}
      </div>
      <div className="mt-2 text-4xl font-semibold tabular-nums text-ink">
        {value}
      </div>
      {hint ? (
        <div className="mt-1.5 text-[13px] text-muted">{hint}</div>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-12 text-center">
      <p className="text-[15px] font-medium text-ink-soft">{title}</p>
      {hint ? <p className="mt-1.5 text-[13px] text-muted">{hint}</p> : null}
    </div>
  );
}

export function Notice({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "warn" | "error";
}) {
  const tones = {
    info: "border-l-brand-500 bg-brand-50/60 text-ink-soft",
    warn: "border-l-warn-ink bg-warn-bg/50 text-warn-ink",
    error: "border-l-bad-ink bg-bad-bg/50 text-bad-ink",
  } as const;
  return (
    <div
      className={cn(
        "rounded-r border-l-[3px] px-4 py-3 text-[13px]",
        tones[tone],
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

type BadgeTone = "ok" | "warn" | "bad" | "neutral" | "chip";

const BADGE_TONES: Record<BadgeTone, string> = {
  ok: "bg-ok-bg text-ok-ink",
  warn: "bg-warn-bg text-warn-ink",
  bad: "bg-bad-bg text-bad-ink",
  neutral: "bg-page text-ink-soft",
  chip: "bg-chip-bg text-chip-ink",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-[3px] text-[11px] font-semibold",
        BADGE_TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONE: Record<string, BadgeTone> = {
  PUBLISHED: "ok",
  LIVE: "ok",
  READY: "chip",
  DRAFT: "neutral",
  ARCHIVED: "neutral",
  BONUS: "warn",
};

export function StatusBadge({ status }: { status: string }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{label}</Badge>;
}

export function ThemeChip({ label }: { label: string }) {
  return <Badge tone="chip">{label}</Badge>;
}

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[14px]">{children}</table>
    </div>
  );
}

export function Th({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      className={cn(
        "border-b border-ink/15 px-3 pb-2.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-muted first:pl-0 last:pr-0",
        align === "right" && "text-right",
        align === "center" && "text-center",
        align === "left" && "text-left",
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  className,
}: {
  children: ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  return (
    <td
      className={cn(
        "border-b border-line px-3 py-3.5 align-middle text-ink-soft first:pl-0 last:pr-0",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </td>
  );
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export function Meter({
  pct,
  label,
  value,
}: {
  pct: number;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="text-ink-soft">{label}</span>
        <span className="tabular-nums text-muted">{value}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-page">
        <div
          className="h-full rounded-full bg-brand-600"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  );
}
