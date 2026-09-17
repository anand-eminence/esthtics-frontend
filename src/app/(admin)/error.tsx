"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { Button } from "@/components/form";
import { Notice } from "@/components/ui";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [retrying, startTransition] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  function retry() {
    // refresh() refetches the screen's data from the server; reset() then
    // re-renders it. Both are needed — reset() alone would reuse the failed data.
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <div className="p-8">
      <Notice tone="warn">
        <strong className="font-semibold">
          This screen didn&rsquo;t finish loading.
        </strong>{" "}
        The server may have been waking up — that can take up to a minute after
        a quiet spell. Try again in a moment.
      </Notice>
      <div className="mt-4 flex gap-2">
        <Button type="button" onClick={retry} disabled={retrying}>
          {retrying ? "Trying again…" : "Try again"}
        </Button>
        {/* A full reload also recovers when the app itself was redeployed
            while this tab was open. */}
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.location.reload()}
        >
          Reload page
        </Button>
      </div>
    </div>
  );
}
