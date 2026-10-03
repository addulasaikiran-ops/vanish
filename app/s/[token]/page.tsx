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
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    async function loadShare() {
      const { token } = await params;

      const response = await fetch(
        `/api/share?token=${encodeURIComponent(token)}`
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Unable to load share");
        return;
      }

      setData(result);
    }

    loadShare();
  }, [params]);

  useEffect(() => {
    if (!data) return;

    function updateCountdown() {
      const difference =
        new Date(data!.expiresAt).getTime() - Date.now();

      if (difference <= 0) {
        setRemaining("00:00:00");
        setError("This share has expired");
        setData(null);
        return;
      }

      const totalSeconds = Math.floor(difference / 1000);

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor(
        (totalSeconds % 3600) / 60
      );
      const seconds = totalSeconds % 60;

      setRemaining(
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`
      );
    }

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [data]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            Vanish
          </h1>

          <p className="mt-4 text-gray-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center">
          Vanish
        </h1>

        <p className="text-center mt-3 text-gray-500">
          Expires in
        </p>

        <div className="text-center text-4xl font-mono font-bold mt-2">
          {remaining}
        </div>

        <div className="mt-8 rounded-xl border p-6 whitespace-pre-wrap break-words">
          {data.text}
        </div>
      </div>
    </main>
  );
}