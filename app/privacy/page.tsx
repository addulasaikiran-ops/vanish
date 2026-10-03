import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-10 text-zinc-950 sm:px-8">
      <article className="mx-auto max-w-3xl rounded-[28px] border border-zinc-200 bg-white p-7 shadow-sm sm:p-10">
        <Link href="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">← Vanish</Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-tight">Privacy</h1>
        <p className="mt-3 text-sm text-zinc-500">Last updated: October 4, 2026</p>
        <div className="mt-8 space-y-8 text-sm leading-7 text-zinc-700">
          <section><h2 className="text-lg font-semibold text-zinc-950">What Vanish stores</h2><p className="mt-2">Vanish stores an encrypted ciphertext and its initialization vector, plus a SHA-256 hash of the share token, creation and expiry metadata, and limited operational records needed for rate limiting and link reports.</p></section>
          <section><h2 className="text-lg font-semibold text-zinc-950">Your text and encryption key</h2><p className="mt-2">Text is encrypted in your browser with AES-GCM before it is sent to Vanish. The decryption key is placed in the URL fragment after the # character. URL fragments are handled by the browser and are not included in the HTTP request sent to the Vanish API. Vanish does not receive the plaintext or the decryption key as part of share creation or retrieval.</p></section>
          <section><h2 className="text-lg font-semibold text-zinc-950">IP addresses and abuse prevention</h2><p className="mt-2">Vanish uses the requester IP address transiently to derive a one-way rate-limit key. The database stores a hash of that key rather than the raw IP address. Vercel and other infrastructure providers may also process request metadata under their own privacy notices.</p></section>
          <section><h2 className="text-lg font-semibold text-zinc-950">Retention</h2><p className="mt-2">Shares are deleted after their expiry. View-once shares are deleted atomically when first read. Rate-limit buckets are deleted when their windows expire. Link reports are retained only as long as reasonably needed for abuse review and service security.</p></section>
          <section><h2 className="text-lg font-semibold text-zinc-950">Reports</h2><p className="mt-2">A report records a SHA-256 hash of the reported link token and a timestamp. The report does not contain the shared plaintext or the URL fragment key.</p></section>
          <section><h2 className="text-lg font-semibold text-zinc-950">Contact</h2><p className="mt-2">For privacy requests or questions, contact the Vanish operator through the contact method published with the service. This page is a product privacy notice, not legal advice.</p></section>
        </div>
      </article>
    </main>
  );
}
