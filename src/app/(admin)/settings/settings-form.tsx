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

// A working set for the community. The API accepts any IANA name.
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
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Settings>({ defaultValues: settings });

  const invites = useForm<{ name: string; email: string }>({
    defaultValues: { name: "", email: "" },
  });

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

  async function sendInvite(values: { name: string; email: string }) {
    setInviteMessage(null);
    try {
      await apiSend("/api/admin/users", "POST", values);
      invites.reset({ name: "", email: "" });
      setInviting(false);
      router.refresh();
    } catch (err) {
      const apiError = toApiError(err);
      for (const [name, msg] of Object.entries(apiError.fieldErrors ?? {})) {
        invites.setError(name as "name" | "email", {
          type: "server",
          message: msg,
        });
      }
      setInviteMessage(apiError.message);
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

              <Field
                label="Questions per day"
                htmlFor="questionsPerDay"
                error={errors.questionsPerDay?.message}
              >
                <Input
                  id="questionsPerDay"
                  type="number"
                  min={1}
                  max={10}
                  {...register("questionsPerDay", { valueAsNumber: true })}
                />
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
                label="Referral link · from Circle affiliates"
                htmlFor="referralUrl"
                error={errors.referralUrl?.message}
              >
                <Input
                  id="referralUrl"
                  placeholder="Paste once configured in Circle"
                  {...register("referralUrl")}
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

          {inviting ? (
            <div className="mt-4 space-y-3 rounded-md border border-line bg-page p-4">
              <Field
                label="Name"
                htmlFor="inviteName"
                error={invites.formState.errors.name?.message}
              >
                <Input
                  id="inviteName"
                  invalid={Boolean(invites.formState.errors.name)}
                  {...invites.register("name", { required: "Enter a name" })}
                />
              </Field>
              <Field
                label="Email"
                htmlFor="inviteEmail"
                error={invites.formState.errors.email?.message}
              >
                <Input
                  id="inviteEmail"
                  type="email"
                  invalid={Boolean(invites.formState.errors.email)}
                  {...invites.register("email", {
                    required: "Enter an email address",
                  })}
                />
              </Field>
              {inviteMessage ? (
                <Notice tone="error">{inviteMessage}</Notice>
              ) : null}
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={invites.handleSubmit(sendInvite)}
                  disabled={invites.formState.isSubmitting}
                >
                  Send invite
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setInviting(false)}
                >
                  Cancel
                </Button>
              </div>
              <p className="text-[12px] text-muted">
                Invite emails are not wired up yet, so the account is created
                without a password. An administrator has to set one before they
                can sign in.
              </p>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() => setInviting(true)}
            >
              Invite user
            </Button>
          )}

          <p className="mt-5 text-[12.5px] text-muted">
            Everyone who can sign in is an administrator with full access.
          </p>
        </Card>
      </div>
    </form>
  );
}
