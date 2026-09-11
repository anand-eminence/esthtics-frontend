import { ApiErrorState } from "@/components/api-error";
import { PageHeader } from "@/components/page-header";
import { SettingsForm } from "./settings-form";
import { apiGet } from "@/lib/api";
import type { AdminUser, Settings } from "@/lib/types";

// A10 · Settings. The configurable values in one place, so Adam can change
// them himself without a developer.
export default async function SettingsPage() {
  const [settings, users] = await Promise.all([
    apiGet<{ settings: Settings }>("/api/admin/settings"),
    apiGet<{ users: AdminUser[] }>("/api/admin/users"),
  ]);

  if (!settings.ok) {
    return (
      <>
        <PageHeader title="Settings" />
        <div className="p-8">
          <ApiErrorState error={settings.error} status={settings.status} />
        </div>
      </>
    );
  }

  return (
    <SettingsForm
      settings={settings.data.settings}
      users={users.ok ? users.data.users : []}
    />
  );
}
