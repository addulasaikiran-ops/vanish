import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-10 text-zinc-950 sm:px-8">
      <article className="mx-auto max-w-3xl rounded-[28px] border border-zinc-200 bg-white p-7 shadow-sm sm:p-10">
        <Link href="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">← Vanish</Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-tight">Terms</h1>
        <p className="mt-3 text-sm text-zinc-500">Last updated: October 4, 2026</p>
        <div className="mt-8 space-y-8 text-sm leading-7 text-zinc-700">
          <section><h2 className="text-lg font-semibold text-zinc-950">Use of the service</h2><p className="mt-2">You may use Vanish to create temporary text links for lawful purposes. You are responsible for the content you submit and for sharing links only with people who should have access to them.</p></section>
          <section><h2 className="text-lg font-semibold text-zinc-950">Prohibited use</h2><p className="mt-2">Do not use Vanish for unlawful activity, harassment, threats, fraud, malware distribution, attempts to defeat service security, or content that violates the rights of others. We may block or remove links when reasonably necessary to protect the service or comply with law.</p></section>
          <section><h2 className="text-lg font-semibold text-zinc-950">Temporary links</h2><p className="mt-2">Links are temporary and may stop working before their configured expiry if they are reported, removed, or the service experiences an operational problem. View-once links are deleted when their first read is accepted by the server.</p></section>
          <section><h2 className="text-lg font-semibold text-zinc-950">Privacy and security</h2><p className="mt-2">Vanish is designed so the server stores encrypted share content rather than plaintext. You are responsible for protecting the complete share URL, including its fragment key, because anyone who obtains the complete URL may be able to decrypt the share while it remains available.</p></section>
          <section><h2 className="text-lg font-semibold text-zinc-950">Availability</h2><p className="mt-2">Vanish is provided on an as-available basis. We do not guarantee uninterrupted availability, permanent storage, or recovery of expired, deleted, or otherwise unavailable shares.</p></section>
          <section><h2 className="text-lg font-semibold text-zinc-950">Changes</h2><p className="mt-2">These terms may be updated as the service changes. Continued use of Vanish after an update constitutes acceptance of the updated terms where permitted by applicable law.</p></section>
          <p className="rounded-2xl bg-zinc-50 p-4 text-xs text-zinc-500">These are starter product terms and should be reviewed by a qualified lawyer for the jurisdictions and use cases in which Vanish operates.</p>
        </div>
      </article>
    </main>
  );
}
