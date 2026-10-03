"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { encryptText } from "@/lib/client-crypto";
import { EXPIRY_OPTIONS, type ExpiryValue } from "@/lib/expiry";
import { MAX_PLAINTEXT_BYTES } from "@/lib/limits";
import { utf8ByteLength } from "@/lib/text";

export default function Home() {
  const [text, setText] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiresIn, setExpiresIn] = useState<ExpiryValue>("1h");
  const [deleteAfterFirstView, setDeleteAfterFirstView] = useState(false);

  const copyLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the link. Please copy it manually.");
    }
  }, [shareUrl]);

  useEffect(() => {
    if (!shareUrl) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        void copyLink();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [copyLink, shareUrl]);

  async function createShare() {
    setError("");
    setShareUrl("");
    setCopied(false);

    if (!text.trim()) {
      setError("Paste some text first.");
      return;
    }

    if (utf8ByteLength(text) > MAX_PLAINTEXT_BYTES) {
      setError("Text is limited to 100 KB.");
      return;
    }

    setLoading(true);

    try {
      const encrypted = await encryptText(text);
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
          expiresIn,
          deleteAfterFirstView,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Unable to create share.");
        return;
      }

      setShareUrl(
        `${window.location.origin}/s/${result.token}#${encrypted.key}`
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setText("");
    setShareUrl("");
    setError("");
    setCopied(false);
  }

  const textBytes = utf8ByteLength(text);
  const isNearLimit = textBytes > MAX_PLAINTEXT_BYTES * 0.9;
  const selectedExpiry = EXPIRY_OPTIONS.find((option) => option.value === expiresIn);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f5] text-zinc-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white to-transparent" />
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6 sm:px-8 sm:py-9">
        <header className="flex items-center justify-between">
          <button type="button" onClick={reset} className="group inline-flex items-center gap-2" aria-label="Start a new Vanish share">
            <span className="grid size-9 place-items-center rounded-xl bg-zinc-950 text-sm font-semibold text-white shadow-sm transition group-hover:-translate-y-0.5">V</span>
            <span className="text-lg font-semibold tracking-tight">Vanish</span>
          </button>
          <div className="hidden items-center gap-2 text-xs text-zinc-500 sm:flex"><span className="size-1.5 rounded-full bg-emerald-500" />Private by design</div>
        </header>
        <section className="flex flex-1 items-center justify-center py-14 sm:py-20">
          <div className="w-full max-w-3xl">
            <div className="mb-8 text-center">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-zinc-400">Temporary text sharing</p>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">Share text.<br /><span className="text-zinc-400">Then forget.</span></h1>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-zinc-500 sm:text-base">No account. Encrypt in your browser. Choose when the link expires.</p>
            </div>
            <div className="rounded-[28px] border border-zinc-200/80 bg-white/90 p-3 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.2)] backdrop-blur sm:p-4">
              <div className="rounded-[22px] border border-zinc-200 bg-zinc-50/80 p-3 sm:p-4">
                <div className="flex items-center justify-between px-1 pb-2">
                  <label htmlFor="text" className="text-sm font-medium text-zinc-700">Your text</label>
                  <span className={`text-xs tabular-nums ${isNearLimit ? "text-amber-600" : "text-zinc-400"}`}>{textBytes.toLocaleString()} / {MAX_PLAINTEXT_BYTES.toLocaleString()} bytes</span>
                </div>
                <textarea id="text" value={text} onChange={(event) => { setText(event.target.value); setError(""); }} placeholder="Paste or type something to share..." spellCheck className="min-h-[320px] w-full resize-y rounded-2xl border border-zinc-200 bg-white p-5 text-[15px] leading-7 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 sm:min-h-[360px] sm:text-base" />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="rounded-2xl border border-zinc-200 bg-white p-3"><span className="block text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">Expires</span><select value={expiresIn} onChange={(event) => setExpiresIn(event.target.value as ExpiryValue)} className="mt-2 w-full bg-transparent text-sm font-medium text-zinc-800 outline-none">{EXPIRY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3"><input type="checkbox" checked={deleteAfterFirstView} onChange={(event) => setDeleteAfterFirstView(event.target.checked)} className="size-4 rounded border-zinc-300" /><span><span className="block text-sm font-medium text-zinc-800">Delete after first view</span><span className="block text-xs text-zinc-400">Only one request can read it.</span></span></label>
                </div>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 px-1 text-xs text-zinc-500"><span className="inline-flex size-6 items-center justify-center rounded-full border border-zinc-200 bg-white">⏱</span><span>Expires in <strong className="font-medium text-zinc-700">{selectedExpiry?.label}</strong></span></div>
                  <button type="button" onClick={createShare} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <> <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Creating link </> : <>Create Link <span aria-hidden>→</span></>}</button>
                </div>
              </div>
              {error && <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>}
              {shareUrl && <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-950 p-4 text-white sm:p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold">Your link is ready</p><p className="mt-1 text-xs text-zinc-400">{deleteAfterFirstView ? "This link can be opened once." : "Anyone with this link can read the text until it expires."}</p></div><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">{selectedExpiry?.label}</span></div><div className="mt-4 flex flex-col gap-2 sm:flex-row"><input readOnly aria-label="Share link" value={shareUrl} onFocus={(event) => event.currentTarget.select()} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/10 px-3.5 py-3 text-sm text-zinc-200 outline-none" /><button type="button" onClick={copyLink} className="rounded-xl border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100">{copied ? "Copied ✓" : "Copy link"}</button></div><div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500"><span>The encryption key stays in the URL fragment.</span><button type="button" onClick={reset} className="font-medium text-zinc-300 underline-offset-4 hover:underline">Create another</button></div></div>}
            </div>
          </div>
        </section>
        <footer className="flex flex-col items-center justify-between gap-2 border-t border-zinc-200/70 pt-5 text-center text-xs text-zinc-400 sm:flex-row sm:text-left"><span>Encrypted in your browser. Expired shares are deleted.</span><span className="flex gap-3"><Link href="/privacy" className="hover:text-zinc-600">Privacy</Link><Link href="/terms" className="hover:text-zinc-600">Terms</Link></span></footer>
      </div>
    </main>
  );
}
