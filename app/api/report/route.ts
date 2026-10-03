import { NextResponse } from "next/server";
import crypto from "crypto";
import { MAX_REPORT_REQUEST_BODY_BYTES } from "@/lib/limits";
import { getClientIp, consumeRateLimit } from "@/lib/rate-limit";
import { readRequestText } from "@/lib/request";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const allowed = await consumeRateLimit(
      getClientIp(request),
      "report",
      5,
      60 * 60 * 1000
    );

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many reports. Please try again later." },
        { status: 429 }
      );
    }

    const rawBody = await readRequestText(request, MAX_REPORT_REQUEST_BODY_BYTES);

    if (rawBody === null) {
      return NextResponse.json(
        { error: "Request payload is too large" },
        { status: 413 }
      );
    }

    const body = JSON.parse(rawBody) as { token?: unknown };

    if (
      typeof body.token !== "string" ||
      body.token.length !== 32 ||
      !/^[A-Za-z0-9_-]+$/.test(body.token)
    ) {
      return NextResponse.json(
        { error: "Invalid link" },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(body.token).digest("hex");

    await prisma.$executeRawUnsafe(
      'INSERT INTO "Report" ("id", "tokenHash", "createdAt") VALUES ($1, $2, NOW())',
      crypto.randomUUID(),
      tokenHash
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to submit report" },
      { status: 400 }
    );
  }
}
