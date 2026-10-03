import crypto from "crypto";
import { prisma } from "@/lib/db";

type RateLimitResult = {
  allowed: boolean;
};

export async function consumeRateLimit(
  ip: string,
  scope: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const keyHash = crypto
    .createHash("sha256")
    .update(`${scope}:${ip}`)
    .digest("hex");

  const now = new Date();
  const expiresAt = new Date(Date.now() + windowMs);

  const result = await prisma.$queryRawUnsafe<RateLimitResult[]>(
    'INSERT INTO "RateLimit" ("id", "keyHash", "windowStartedAt", "count", "expiresAt") VALUES ($1, $2, $3, 1, $4) ON CONFLICT ("keyHash") DO UPDATE SET "windowStartedAt" = CASE WHEN "RateLimit"."expiresAt" <= NOW() THEN $3 ELSE "RateLimit"."windowStartedAt" END, "count" = CASE WHEN "RateLimit"."expiresAt" <= NOW() THEN 1 ELSE "RateLimit"."count" + 1 END, "expiresAt" = CASE WHEN "RateLimit"."expiresAt" <= NOW() THEN $4 ELSE "RateLimit"."expiresAt" END RETURNING "count" <= $5 AS "allowed"',
    crypto.randomUUID(),
    keyHash,
    now,
    expiresAt,
    limit
  );

  return result[0]?.allowed ?? false;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
