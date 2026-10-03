CREATE TABLE "Report" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Report_tokenHash_idx" ON "Report"("tokenHash");
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");

CREATE TABLE "RateLimit" (
  "id" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "windowStartedAt" TIMESTAMP(3) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RateLimit_keyHash_key" ON "RateLimit"("keyHash");
CREATE INDEX "RateLimit_expiresAt_idx" ON "RateLimit"("expiresAt");
