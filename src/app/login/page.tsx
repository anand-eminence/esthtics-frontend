import { Suspense } from "react";
import { LoginForm } from "./login-form";

// A1 · Login. Admin only — members never see this, they only ever see the quiz
// inside Circle.
export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-page px-4">
      <div className="w-full max-w-[380px] rounded-lg border border-line bg-surface p-8">
        <h1 className="text-center text-[18px] font-semibold text-ink">
          TEC Admin
        </h1>
        <p className="mt-1 text-center text-[13px] text-muted">
          Sign in to manage the daily quiz
        </p>
        {/* LoginForm reads ?next= from the URL, so it needs a boundary to
            prerender this page. */}
        <Suspense fallback={<div className="mt-6 h-[232px]" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
