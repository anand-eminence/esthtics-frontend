import Link from "next/link";
import type { ReactNode } from "react";

/** The white bar at the top of every admin screen. */
export function PageHeader({
  title,
  meta,
  action,
  back,
}: {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
  /** A link above the title, for screens reached from a list. */
  back?: { href: string; label: string };
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-8 py-4">
      <div className="min-w-0">
        {back ? (
          <Link
            href={back.href}
            className="mb-1 inline-flex items-center gap-1 text-[12.5px] font-medium text-muted hover:text-brand-600"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="h-3.5 w-3.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {back.label}
          </Link>
        ) : null}
        <h1 className="text-[17px] font-semibold text-ink">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {meta ? <span className="text-[13px] text-muted">{meta}</span> : null}
        {action}
      </div>
    </header>
  );
}
