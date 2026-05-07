import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  generateUploadPresignedUrl,
  buildStorageKey,
  isAllowed3DFile,
} from "@/lib/s3";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  orderId: z.string(),
  fileName: z.string(),
  fileSize: z.number().max(100 * 1024 * 1024, "File must be under 100MB"),
  mimeType: z.string(),
  version: z.number().default(1),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Validate file extension
    if (!isAllowed3DFile(data.fileName)) {
      return NextResponse.json(
        { error: "Only STL, OBJ, STEP, STP, 3MF files are allowed" },
        { status: 400 }
      );
    }

    // Verify order belongs to user (or user is admin)
    const order = await prisma.order.findFirst({
      where: {
        id: data.orderId,
        ...(session.user.role !== "ADMIN" ? { customerId: session.user.id } : {}),
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Generate storage key and presigned URL
    const key = buildStorageKey(data.orderId, data.fileName, data.version);
    const uploadUrl = await generateUploadPresignedUrl(key, data.mimeType);

    // Record file in DB
    const file = await prisma.uploadedFile.create({
      data: {
        orderId: data.orderId,
        originalName: data.fileName,
        storedKey: key,
        fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        version: data.version,
      },
    });

    return NextResponse.json({ uploadUrl, fileId: file.id, key });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[UPLOAD]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
