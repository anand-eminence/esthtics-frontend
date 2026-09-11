import type { ReactNode } from "react";

/** The white bar at the top of every admin screen. */
export function PageHeader({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-8 py-4">
      <h1 className="text-[17px] font-semibold text-ink">{title}</h1>
      <div className="flex items-center gap-4">
        {meta ? <span className="text-[13px] text-muted">{meta}</span> : null}
        {action}
      </div>
    </header>
  );
}
