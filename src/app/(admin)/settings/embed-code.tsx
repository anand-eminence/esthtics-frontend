"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/form";
import { Card, CardTitle, Notice } from "@/components/ui";
import { API_BASE_URL } from "@/lib/config";

/**
 * Builds the snippet the admin pastes into a Circle post's Custom HTML block.
 *
 * The iframe is loaded from JavaScript rather than written into the markup so
 * the logged-in member's details can be read from Circle first and appended to
 * the URL — that is what lets the quiz greet her by name and keep her streak.
 */
function buildSnippet(quizUrl: string, apiBase: string) {
  return `<iframe
  id="tecQuizFrame"
  title="TEC Daily Quiz"
  style="width:100%;height:780px;border:0;border-radius:12px"
></iframe>
<script>
  (function () {
    var quizUrl = "${quizUrl}";
    var apiBase = "${apiBase}";
    var frame = document.getElementById("tecQuizFrame");
    var user = null;
    try { user = window.circleUser || null; } catch (e) { user = null; }

    var params = new URLSearchParams();
    if (user) {
      params.set("uid", user.publicUid || user.public_uid || user.email || "");
      params.set("email", user.email || "");
      params.set("name", user.name || "");
    }
    if (apiBase) params.set("apiBase", apiBase);

    frame.src = params.toString() ? quizUrl + "?" + params.toString() : quizUrl;
  })();
</script>`;
}

export function EmbedCode({ quizUrl }: { quizUrl: string }) {
  const [copied, setCopied] = useState(false);

  // The quiz is served by this same app at /quiz, so when nothing is saved yet
  // the panel's own origin is the right answer — locally that gives
  // http://localhost:4000/quiz. Read after mount so the server and client
  // markup match.
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const saved = quizUrl.trim();
  const effectiveUrl = saved || (origin ? `${origin}/quiz` : "");
  const snippet = buildSnippet(effectiveUrl, API_BASE_URL);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is blocked in some embedded browsers; the textarea below is
      // selectable so the code can still be copied by hand.
      setCopied(false);
    }
  }

  return (
    <Card>
      <CardTitle
        action={
          <Button type="button" variant="secondary" onClick={copy}>
            {copied ? "Copied" : "Copy code"}
          </Button>
        }
      >
        Circle embed code
      </CardTitle>

      <p className="mb-3 text-[13px] text-muted">
        In Circle, create or edit a post, add a <strong>Custom HTML</strong>{" "}
        block, and paste this in. It loads the quiz and passes Circle&rsquo;s
        logged-in member details through, so nobody has to sign in twice.
      </p>

      {!saved && origin ? (
        <Notice tone="warn">
          No <strong>Quiz embed URL</strong> is saved, so the snippet is using
          this panel&rsquo;s own address —{" "}
          <span className="font-mono">{effectiveUrl}</span>. Fine for testing
          locally; save the real URL above before handing this to Circle.
        </Notice>
      ) : null}

      <textarea
        readOnly
        rows={14}
        value={snippet}
        onFocus={(e) => e.currentTarget.select()}
        spellCheck={false}
        className="mt-3 w-full resize-y rounded-md border border-line bg-page px-3 py-2 font-mono text-[12px] leading-relaxed text-ink-soft"
      />

      <p className="mt-2 text-[12px] text-muted">
        The quiz talks to <span className="font-mono">{API_BASE_URL}</span>.
        That origin must list the Circle domain in its{" "}
        <span className="font-mono">QUIZ_ALLOWED_ORIGINS</span>.
      </p>
    </Card>
  );
}
