"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "./form";

export type ConfirmOptions = {
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" for anything that deletes, or hides something from members. */
  tone?: "danger" | "primary";
};

type Confirm = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Confirm | null>(null);

/**
 * Our own confirm dialog, in place of the browser's `confirm()`:
 * `if (!(await confirm({ title: "Delete this?" }))) return;`
 */
export function useConfirm(): Confirm {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm needs a <ConfirmProvider> above it");
  return confirm;
}

/**
 * Built on <dialog>, so the browser handles the modal parts: the page behind
 * is inert, Esc cancels, and focus goes back to whatever opened it.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const confirm = useCallback<Confirm>((options) => {
    // A second request replaces an open one, which counts as cancelled.
    resolver.current?.(false);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setRequest(options);
    });
  }, []);

  useEffect(() => {
    const el = dialog.current;
    if (!request || !el) return;
    if (!el.open) el.showModal();
    // Cancel first, so a stray Enter never deletes anything.
    el.querySelector<HTMLButtonElement>("[data-cancel]")?.focus();
  }, [request]);

  function finish(ok: boolean) {
    resolver.current?.(ok);
    resolver.current = null;
    dialog.current?.close();
    setRequest(null);
  }

  const tone = request?.tone ?? "danger";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request ? (
        <dialog
          ref={dialog}
          aria-labelledby="confirm-title"
          aria-describedby={request.message ? "confirm-message" : undefined}
          onCancel={(e) => {
            e.preventDefault();
            finish(false);
          }}
          // A click on the dialog element itself is a click on the backdrop;
          // the content box below covers the rest.
          onClick={(e) => {
            if (e.target === e.currentTarget) finish(false);
          }}
          className="m-auto w-[min(420px,calc(100vw-2rem))] rounded-lg border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-[rgba(26,29,33,0.45)]"
        >
          <div className="p-6">
            <h2 id="confirm-title" className="text-[16px] font-semibold text-ink">
              {request.title}
            </h2>
            {request.message ? (
              <p
                id="confirm-message"
                className="mt-2 text-[13.5px] leading-relaxed text-ink-soft"
              >
                {request.message}
              </p>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                data-cancel
                onClick={() => finish(false)}
              >
                {request.cancelLabel ?? "Cancel"}
              </Button>
              <Button
                type="button"
                variant={tone === "danger" ? "danger" : "primary"}
                onClick={() => finish(true)}
              >
                {request.confirmLabel ?? (tone === "danger" ? "Delete" : "Continue")}
              </Button>
            </div>
          </div>
        </dialog>
      ) : null}
    </ConfirmContext.Provider>
  );
}
