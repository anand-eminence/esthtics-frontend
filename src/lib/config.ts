/**
 * The API origin the browser talks to. Must be NEXT_PUBLIC_ so it is inlined
 * into the client bundle — the browser calls the API directly rather than
 * going through this app.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4001"
).replace(/\/$/, "");

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}
