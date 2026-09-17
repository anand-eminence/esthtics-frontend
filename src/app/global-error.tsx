"use client";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-dvh items-center justify-center bg-page px-4 font-sans antialiased">
        <div className="w-full max-w-[420px] rounded-lg border border-line bg-surface p-8 text-center">
          <h1 className="text-[17px] font-semibold text-ink">
            Esthetics Frontend didn&rsquo;t finish loading
          </h1>
          <p className="mt-2 text-[13px] text-muted">
            The server may have been waking up — that can take up to a minute
            after a quiet spell.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-md bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-700"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md border border-line px-4 py-2 text-[13px] font-semibold text-ink hover:bg-page"
            >
              Reload page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
