import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminUser } from "./types";

export const SESSION_COOKIE = "tec_admin_session";

export function apiBaseUrl() {
  return (process.env.API_BASE_URL || "http://localhost:4001").replace(
    /\/$/,
    "",
  );
}

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<AdminUser | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await axios.get<{ user: AdminUser }>("/api/admin/auth/me", {
      baseURL: apiBaseUrl(),
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    });
    if (res.status >= 400) return null;
    return res.data.user;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
