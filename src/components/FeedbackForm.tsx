"use client";

// Feedback form. There is no email backend (the product runs keyless with no
// third-party SDKs), so submitting opens the visitor's mail client
// pre-addressed to the ReelSeek inbox with a subject that identifies it as
// ReelSeek feedback. The address is assembled at runtime rather than sitting
// in the HTML to reduce scraping.

import { useState } from "react";

const USER = "eng_khalidsamir";
const DOMAIN = "yahoo.com";
const RECIPIENT = `${USER}@${DOMAIN}`;

const CATEGORIES = [
  "General feedback",
  "Bug report",
  "Feature request",
  "Incorrect streaming availability",
  "Something else"
] as const;

export function FeedbackForm() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>(
    "General feedback"
  );
  const [message, setMessage] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [opened, setOpened] = useState(false);

  const canSend = message.trim().length > 0;

  function send() {
    if (!canSend) return;
    const subject = `ReelSeek Feedback — ${category}`;
    const bodyLines = [
      message.trim(),
      "",
      fromEmail.trim() ? `Reply to: ${fromEmail.trim()}` : null,
      "— sent from reelseek.co/feedback"
    ].filter(Boolean);
    const href = `mailto:${RECIPIENT}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    window.location.href = href;
    setOpened(true);
  }

  return (
    <div className="space-y-5 max-w-xl">
      <div className="space-y-2">
        <label htmlFor="fb-category" className="block text-sm text-white/70">
          What is this about?
        </label>
        <select
          id="fb-category"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as (typeof CATEGORIES)[number])
          }
          className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="fb-message" className="block text-sm text-white/70">
          Your feedback
        </label>
        <textarea
          id="fb-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Tell us what's working, what's not, or what you'd like to see. For availability corrections, include the title, year, and your country."
          className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm resize-y focus:outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="fb-email" className="block text-sm text-white/70">
          Your email <span className="text-white/40">(optional, if you’d like a reply)</span>
        </label>
        <input
          id="fb-email"
          type="email"
          value={fromEmail}
          onChange={(e) => setFromEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
        />
      </div>

      <button
        type="button"
        onClick={send}
        disabled={!canSend}
        className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold bg-accent text-brand-primary hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Send feedback
      </button>

      {opened && (
        <p className="text-xs text-white/60">
          Your email app should have opened with the message ready to send. If
          it didn’t, email us directly at{" "}
          <button
            type="button"
            className="text-accent underline"
            onClick={() => {
              navigator.clipboard?.writeText(RECIPIENT).catch(() => {});
            }}
            title="Copy address"
          >
            {RECIPIENT}
          </button>
          .
        </p>
      )}
    </div>
  );
}
