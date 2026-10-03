import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = body.text;

    if (typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (text.length > 1_000_000) {
      return NextResponse.json(
        { error: "Text is too large" },
        { status: 400 }
      );
    }

    const token = nanoid(32);

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + 60 * 60 * 1000
    );

    await prisma.share.create({
      data: {
        tokenHash,
        text,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      token,
      expiresAt,
    });
  } catch (error) {
    console.error("CREATE SHARE ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
export async function GET(
  request: Request
) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const share = await prisma.share.findUnique({
      where: {
        tokenHash,
      },
    });

    if (!share) {
      return NextResponse.json(
        { error: "Share not found" },
        { status: 404 }
      );
    }

    if (share.destroyedAt || share.expiresAt <= new Date()) {
      return NextResponse.json(
        { error: "This share has expired" },
        { status: 410 }
      );
    }

    return NextResponse.json({
      text: share.text,
      expiresAt: share.expiresAt,
    });
  } catch (error) {
    console.error("GET SHARE ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}