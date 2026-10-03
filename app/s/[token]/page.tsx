"use client";

import { useEffect, useState } from "react";

type ShareData = {
  text: string;
  expiresAt: string;
};

export default function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [data, setData] = useState<ShareData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [remaining, setRemaining] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadShare() {
      try {
        const { token } = await params;
        const response = await fetch(
          `/api/share?token=${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );
        const result = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          setError(result.error || "Unable to load share.");
          return;
        }

        setData(result);
      } catch {
        if (!cancelled) setError("Unable to load this share. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadShare();
    return () => {
      cancelled = true;
    };
  }, [params]);

  useEffect(() => {
    const share = data;
    if (!share) return;
    const expiresAt = share.expiresAt;

    function updateCountdown() {
      const difference = new Date(expiresAt).getTime() - Date.now();

      if (difference <= 0) {
        setRemaining("00:00:00");
        setError("This share has expired");
        setData(null);
        return;
      }

      const totalSeconds = Math.floor(difference / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setRemaining(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    }

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [data]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] p-6">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span className="size-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
          Loading secure share
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] p-6 text-zinc-950">
        <div className="mx-auto flex min-h-[90vh] w-full max-w-2xl items-center justify-center">
          <div className="w-full rounded-[28px] border border-zinc-200 bg-white p-8 text-center shadow-[0_24px_80px_-28px_rgba(0,0,0,0.18)] sm:p-12">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-zinc-100 text-xl">
              {error.includes("expired") ? "⏳" : "∅"}
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">
              {error.includes("expired") ? "This share has expired" : "Share unavailable"}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              {error.includes("expired")
                ? "The link is no longer accessible. Expired shares are removed automatically."
                : error}
            </p>
            <a
              href="/"
              className="mt-7 inline-flex rounded-xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Create a new share
            </a>
          </div>
        </div>
      </main>
    );
  }

  async function copyText() {
    const share = data;
    if (!share) return;
    try {
      await navigator.clipboard.writeText(share.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (!data) return null;

  return (
    <main className="min-h-screen bg-[#f7f7f5] p-5 text-zinc-950 sm:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-4xl flex-col sm:min-h-[calc(100vh-4rem)]">
        <header className="flex items-center justify-between">
          <a href="/" className="group inline-flex items-center gap-2" aria-label="Vanish home">
            <span className="grid size-9 place-items-center rounded-xl bg-zinc-950 text-sm font-semibold text-white shadow-sm transition group-hover:-translate-y-0.5">
              V
            </span>
            <span className="text-lg font-semibold tracking-tight">Vanish</span>
          </a>

          <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-500">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Temporary
          </div>
        </header>

        <section className="flex flex-1 flex-col justify-center py-10 sm:py-12">
          <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
                Shared text
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                This link stops working when the timer reaches zero.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-center shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">
                Expires in
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tracking-tight tabular-nums">
                {remaining}
              </p>
            </div>
          </div>

          <article className="min-h-[55vh] rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_80px_-28px_rgba(0,0,0,0.18)] sm:min-h-[60vh]">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 sm:px-7">
              <span className="text-xs text-zinc-400">Read-only shared text</span>
              <button type="button" onClick={copyText} className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50">{copied ? "Copied ✓" : "Copy text"}</button>
            </div>
            <div className="p-5 sm:p-7"><pre className="whitespace-pre-wrap break-words font-sans text-[15px] leading-7 text-zinc-800 sm:text-base">
              {data.text}
            </pre></div>
          </article>
        </section>

        <footer className="flex flex-col gap-1 border-t border-zinc-200/70 py-5 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <span>Vanish · Temporary text sharing</span>
          <span>Your share is automatically deleted after expiration.</span>
        </footer>
      </div>
    </main>
  );
}
