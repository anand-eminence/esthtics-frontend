import "server-only";
import axios from "axios";
import { apiBaseUrl, getToken } from "./session";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

/**
 * Server-side axios instance. Server components cannot rely on the browser
 * sending the cookie, so the token is attached as a bearer header per request.
 */
export const serverApi = axios.create({
  headers: { "Content-Type": "application/json" },
  // Never throw on a 4xx — apiGet turns it into a result the page can render.
  validateStatus: () => true,
});

/**
 * Server-side read against the admin API. Returns a result rather than throwing
 * so every screen can render its own empty/error state instead of a 500 page —
 * which matters while the database is still being filled in.
 */
export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  const token = await getToken();
  const baseURL = apiBaseUrl();

  try {
    const res = await serverApi.get<T | { error?: string }>(path, {
      baseURL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (res.status >= 400) {
      const body = res.data as { error?: string };
      return {
        ok: false,
        status: res.status,
        error: body?.error || `Request failed (${res.status})`,
      };
    }
    return { ok: true, data: res.data as T };
  } catch {
    return {
      ok: false,
      status: 0,
      error: `Could not reach the admin API at ${baseURL}. Is esthetics-backend running?`,
    };
  }
}

export function queryString(
  params: Record<string, string | number | undefined | null>,
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "")
      search.set(key, String(value));
  }
  const out = search.toString();
  return out ? `?${out}` : "";
}

const QUIZ_TIMEZONE_FALLBACK = "America/New_York";

function dateIn(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Today (YYYY-MM-DD) in the quiz's timezone from Settings — the quiz's day,
 * not the admin's — so the earliest date anything can still be scheduled for.
 */
export async function quizToday(): Promise<string> {
  const res = await apiGet<{ settings: { timezone: string } }>(
    "/api/admin/settings",
  );
  try {
    return dateIn((res.ok && res.data.settings.timezone) || QUIZ_TIMEZONE_FALLBACK);
  } catch {
    return dateIn(QUIZ_TIMEZONE_FALLBACK);
  }
}
