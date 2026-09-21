"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "./ui";
import { apiUrl } from "@/lib/config";
import type { AdminUser } from "@/lib/types";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/questions", label: "Question bank" },
  { href: "/schedule", label: "Schedule" },
  { href: "/featured", label: "Featured content" },
  { href: "/members", label: "Members" },
  { href: "/statistics", label: "Statistics" },
  { href: "/settings", label: "Settings" },
];

const ROLE_LABEL: Record<AdminUser["role"], string> = {
  ADMINISTRATOR: "Administrator",
};

export function Sidebar({ user }: { user: AdminUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    // The API owns the session cookie, so it is the one that clears it.
    await fetch(apiUrl("/api/admin/auth/logout"), {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 flex h-dvh w-[220px] shrink-0 flex-col overflow-y-auto bg-sidebar">
      <div className="px-6 py-6">
        <span className="text-[15px] font-semibold text-white">TEC Admin</span>
      </div>

      <nav className="flex flex-col gap-0.5 px-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-[13.5px] transition-colors",
                active
                  ? "bg-sidebar-active font-semibold text-white"
                  : "text-sidebar-ink hover:bg-sidebar-hover hover:text-white",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 px-6 py-5">
        <div className="text-[13px] font-medium text-white">{user.name}</div>
        <div className="text-[12px] text-sidebar-ink/70">
          {ROLE_LABEL[user.role]}
        </div>
        <button
          onClick={signOut}
          className="mt-3 text-[12px] text-sidebar-ink/70 underline-offset-2 hover:text-white hover:underline"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
