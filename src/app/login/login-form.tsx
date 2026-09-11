"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Field, Input } from "@/components/form";
import { api, toApiError } from "@/lib/client";

type LoginValues = { email: string; password: string };

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ defaultValues: { email: "", password: "" } });

  async function onSubmit(values: LoginValues) {
    setError(null);
    try {
      // Straight to the admin API. It replies with the session cookie, which
      // `withCredentials` on the axios instance tells the browser to store.
      await api.post("/api/admin/auth/login", values);
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(toApiError(err).message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="adam@esticonfidential.com"
          invalid={Boolean(errors.email)}
          {...register("email", {
            required: "Enter your email address",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "That does not look like an email" },
          })}
        />
      </Field>

      <Field label="Password" htmlFor="password" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          invalid={Boolean(errors.password)}
          {...register("password", { required: "Enter your password" })}
        />
      </Field>

      {error ? (
        <p role="alert" className="rounded-md bg-bad-bg px-3 py-2 text-[13px] text-bad-ink">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="w-full py-2.5">
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-[12px] text-muted">
        Forgot password? Ask administrator to reset it.
      </p>
    </form>
  );
}
