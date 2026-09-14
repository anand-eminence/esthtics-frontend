"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PageHeader } from "@/components/page-header";
import { Button, Field, Input, Select } from "@/components/form";
import { Card, CardTitle, Notice, Table, Td, Th } from "@/components/ui";
import { apiSend, toApiError } from "@/lib/client";
import { EmbedCode } from "./embed-code";
import type { AdminUser, Settings } from "@/lib/types";


const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "UTC",
];

const ROLE_LABEL: Record<AdminUser["role"], string> = {
  ADMINISTRATOR: "Administrator",
};

export function SettingsForm({
  settings,
  users,
}: {
  settings: Settings;
  users: AdminUser[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Settings>({ defaultValues: settings });

  const timezone = watch("timezone");

  async function onSubmit(values: Settings) {
    setMessage(null);
    setSaved(false);

    const { id, ...payload } = values;
    void id;

    try {
      await apiSend("/api/admin/settings", "PATCH", payload);
      setSaved(true);
      setMessage("Settings saved.");
      router.refresh();
    } catch (err) {
      const apiError = toApiError(err);
      for (const [name, msg] of Object.entries(apiError.fieldErrors ?? {})) {
        setError(name as keyof Settings, { type: "server", message: msg });
      }
      setMessage(apiError.message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <PageHeader
        title="Settings"
        action={
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <div className="grid gap-6 p-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {message ? (
            <Notice tone={saved ? "info" : "error"}>{message}</Notice>
          ) : null}

          <Card>
            <CardTitle>Quiz behaviour</CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Timezone"
                htmlFor="timezone"
                error={errors.timezone?.message}
              >
                <Select id="timezone" {...register("timezone")}>
                  {(TIMEZONES.includes(timezone)
                    ? TIMEZONES
                    : [timezone, ...TIMEZONES]
                  ).map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <label className="mt-4 flex items-center gap-2.5 text-[13.5px] text-ink-soft">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand-600"
                {...register("bonusEnabled")}
              />
              Offer the optional bonus question when one is scheduled
            </label>

            <p className="mt-4 text-[12.5px] text-muted">
              All streak and date logic runs on this timezone. Changing it
              affects how days are counted for every member.
            </p>
          </Card>

          <Card>
            <CardTitle>Links</CardTitle>
            <div className="space-y-4">
              <Field
                label="Join CTA link · 14 day trial"
                htmlFor="joinUrl"
                error={errors.joinUrl?.message}
              >
                <Input id="joinUrl" {...register("joinUrl")} />
              </Field>

              <Field
                label="Default go deeper link"
                htmlFor="defaultGoDeeperUrl"
                error={errors.defaultGoDeeperUrl?.message}
                hint="Used whenever a question leaves its own go deeper URL blank."
              >
                <Input
                  id="defaultGoDeeperUrl"
                  {...register("defaultGoDeeperUrl")}
                />
              </Field>

              <Field
                label="Quiz embed URL"
                htmlFor="quizEmbedUrl"
                error={errors.quizEmbedUrl?.message}
                hint="Where the member quiz is hosted. Save this, then copy the embed code below."
              >
                <Input
                  id="quizEmbedUrl"
                  placeholder="https://your-panel-domain/quiz"
                  {...register("quizEmbedUrl")}
                />
              </Field>
            </div>
          </Card>

          <EmbedCode quizUrl={settings.quizEmbedUrl} />
        </div>

        <Card>
          <CardTitle>Admin users</CardTitle>
          {users.length === 0 ? (
            <p className="text-[13px] text-muted">No admin users yet.</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Role</Th>
                  <Th align="right">Status</Th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <Td className="font-semibold text-ink">{u.name}</Td>
                    <Td>{ROLE_LABEL[u.role]}</Td>
                    <Td
                      align="right"
                      className="text-[12px] uppercase tracking-wide text-muted"
                    >
                      {u.status.toLowerCase()}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <p className="mt-5 text-[12.5px] text-muted">
            Everyone who can sign in is an administrator with full access.
          </p>
        </Card>
      </div>
    </form>
  );
}
