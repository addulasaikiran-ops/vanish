import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import crypto from "crypto";
import { getExpiryMilliseconds } from "@/lib/expiry";
import { prisma } from "@/lib/db";

type EncryptedShareBody = {
  ciphertext: string;
  iv: string;
  expiresIn: string;
  deleteAfterFirstView: boolean;
};

type ReturnedShare = {
  ciphertext: string;
  iv: string;
  expiresAt: Date;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<EncryptedShareBody>;
    const expiryMilliseconds = getExpiryMilliseconds(body.expiresIn);

    if (
      typeof body.ciphertext !== "string" ||
      body.ciphertext.length === 0 ||
      typeof body.iv !== "string" ||
      body.iv.length === 0 ||
      expiryMilliseconds === null ||
      typeof body.deleteAfterFirstView !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid share request" },
        { status: 400 }
      );
    }

    const token = nanoid(32);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + expiryMilliseconds);

    await prisma.share.create({
      data: {
        tokenHash,
        ciphertext: body.ciphertext,
        iv: body.iv,
        expiresAt,
        deleteAfterFirstView: body.deleteAfterFirstView,
      },
    });

    return NextResponse.json({
      success: true,
      token,
      expiresAt,
      deleteAfterFirstView: body.deleteAfterFirstView,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const now = new Date();

    const share = await prisma.share.findUnique({
      where: { tokenHash },
      select: {
        ciphertext: true,
        iv: true,
        expiresAt: true,
        destroyedAt: true,
        deleteAfterFirstView: true,
      },
    });

    if (!share || share.destroyedAt || share.expiresAt <= now) {
      return NextResponse.json(
        { error: "This share has expired or is unavailable" },
        { status: 410 }
      );
    }

    if (share.deleteAfterFirstView) {
      const deleted = await prisma.$queryRawUnsafe<ReturnedShare[]>(
        'DELETE FROM "Share" WHERE "tokenHash" = $1 AND "destroyedAt" IS NULL AND "expiresAt" > NOW() AND "deleteAfterFirstView" = true RETURNING "ciphertext", "iv", "expiresAt"',
        tokenHash
      );

      if (deleted.length === 0) {
        return NextResponse.json(
          { error: "This share has already been viewed or is unavailable" },
          { status: 410 }
        );
      }

      return NextResponse.json({
        ciphertext: deleted[0].ciphertext,
        iv: deleted[0].iv,
        expiresAt: deleted[0].expiresAt,
        deleteAfterFirstView: true,
      });
    }

    return NextResponse.json({
      ciphertext: share.ciphertext,
      iv: share.iv,
      expiresAt: share.expiresAt,
      deleteAfterFirstView: false,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
