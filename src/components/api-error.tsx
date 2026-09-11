import { Notice } from "./ui";

/** Shown when a screen's data call fails — most often because the backend is
 *  not running yet, or the database has no rows in it. */
export function ApiErrorState({ error, status }: { error: string; status: number }) {
  return (
    <Notice tone={status === 0 ? "warn" : "error"}>
      <strong className="font-semibold">Could not load this screen.</strong> {error}
    </Notice>
  );
}
