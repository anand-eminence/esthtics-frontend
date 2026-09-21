import type { ReactNode } from "react";
import { ConfirmProvider } from "@/components/confirm";
import { Sidebar } from "@/components/sidebar";
import { requireUser } from "@/lib/session";

// The shell shared by A2–A10.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <ConfirmProvider>
      <div className="flex min-h-dvh">
        <Sidebar user={user} />
        <div className="flex min-w-0 flex-1 flex-col bg-page">{children}</div>
      </div>
    </ConfirmProvider>
  );
}
