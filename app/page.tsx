"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function createShare() {
    setError("");
    setShareUrl("");
    setCopied(false);

    if (!text.trim()) {
      setError("Paste some text first.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Unable to create share.");
        return;
      }

      setShareUrl(
        `${window.location.origin}/s/${result.token}`
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!shareUrl) return;

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-10 sm:px-8 sm:py-16">
        <header className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Vanish
          </h1>
          <p className="mt-3 text-base text-zinc-500 sm:text-lg">
            Share text. Then forget.
          </p>
        </header>

        <section className="mt-10 flex-1 sm:mt-14">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
            <label
              htmlFor="text"
              className="mb-3 block text-sm font-medium text-zinc-700"
            >
              Your text
            </label>

            <textarea
              id="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={1_000_000}
              placeholder="Paste or type something to share..."
              className="min-h-64 w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-base leading-7 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-zinc-500">
                Expires in <span className="font-medium text-zinc-700">1 hour</span>
              </div>

              <button
                type="button"
                onClick={createShare}
                disabled={loading}
                className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Link"}
              </button>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            {shareUrl && (
              <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-700">
                  Your link is ready
                </p>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    readOnly
                    value={shareUrl}
                    className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 outline-none"
                  />

                  <button
                    type="button"
                    onClick={copyLink}
                    className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <p className="mt-3 text-xs text-zinc-500">
                  Anyone with this link can read the text until it expires.
                </p>
              </div>
            )}
          </div>
        </section>

        <footer className="pt-10 text-center text-xs text-zinc-400">
          Links expire after 1 hour and expired shares are deleted.
        </footer>
      </div>
    </main>
  );
}
