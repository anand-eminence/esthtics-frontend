import Link from "next/link";
import type { ReactNode } from "react";
import { queryString } from "@/lib/api";

export function Pagination({
  basePath,
  params,
  page,
  totalPages,
  total,
  perPage,
  unit = "row",
}: {
  basePath: string;
  params: Record<string, string | number | undefined | null>;
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  unit?: string;
}) {
  if (total === 0) return null;

  const first = (page - 1) * perPage + 1;
  const last = Math.min(total, page * perPage);

  const href = (p: number) =>
    `${basePath}${queryString({ ...params, page: p > 1 ? p : undefined })}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted">
      <span className="tabular-nums">
        Showing {first}–{last} of {total} {total === 1 ? unit : `${unit}s`}
      </span>

      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <Step href={href(page - 1)} disabled={page <= 1}>
            Previous
          </Step>
          <span className="px-1 tabular-nums">
            Page {page} of {totalPages}
          </span>
          <Step href={href(page + 1)} disabled={page >= totalPages}>
            Next
          </Step>
        </div>
      ) : null}
    </div>
  );
}

const STEP =
  "rounded-md border border-line px-3 py-1.5 text-[13px] font-semibold";

function Step({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <span className={`${STEP} cursor-not-allowed bg-page text-muted/60`}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={`${STEP} bg-surface text-ink hover:bg-page`}>
      {children}
    </Link>
  );
}
