import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import crypto from "crypto";
import { prisma } from "@/lib/db";

type EncryptedShareBody = {
  ciphertext: string;
  iv: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<EncryptedShareBody>;

    if (
      typeof body.ciphertext !== "string" ||
      body.ciphertext.length === 0 ||
      typeof body.iv !== "string" ||
      body.iv.length === 0
    ) {
      return NextResponse.json(
        { error: "Encrypted text is required" },
        { status: 400 }
      );
    }

    const token = nanoid(32);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.share.create({
      data: {
        tokenHash,
        ciphertext: body.ciphertext,
        iv: body.iv,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      token,
      expiresAt,
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

    const share = await prisma.share.findUnique({
      where: { tokenHash },
    });

    if (!share || share.destroyedAt || share.expiresAt <= new Date()) {
      return NextResponse.json(
        { error: "This share has expired or is unavailable" },
        { status: 410 }
      );
    }

    return NextResponse.json({
      ciphertext: share.ciphertext,
      iv: share.iv,
      expiresAt: share.expiresAt,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
