export function apiUrl(path: string) {
  return path;
}

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4001"
).replace(/\/$/, "");
