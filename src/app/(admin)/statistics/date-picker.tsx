"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const DEBOUNCE_MS = 300;

export function ReportDatePicker({ current }: { current: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(current);

  useEffect(() => {
    setValue(current);
  }, [current]);

  useEffect(() => {
    if (value === current || !/^(19|20)\d{2}-\d{2}-\d{2}$/.test(value)) return;
    const id = setTimeout(() => {
      startTransition(() => {
        router.replace(`/statistics?date=${value}`, { scroll: false });
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [value, current, router]);

  return (
    <div className="flex items-center gap-2">
      {pending ? (
        <span
          className="flex items-center gap-1.5 text-[12px] text-muted"
          role="status"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="h-3.5 w-3.5 animate-spin"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="3"
            />
            <path
              d="M21 12a9 9 0 0 0-9-9"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          Loading…
        </span>
      ) : null}
      <label htmlFor="date" className="text-[13px] text-muted">
        Report date
      </label>
      <input
        id="date"
        type="date"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded-md border border-line bg-surface px-3 py-1.5 text-[13px] text-ink"
      />
    </div>
  );
}
