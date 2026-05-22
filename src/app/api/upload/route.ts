import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "video/mp4"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const requestId = formData.get("requestId") as string;

    if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });
    if (!files.length) return NextResponse.json({ error: "No files provided" }, { status: 400 });

    const uploadDir = path.join(process.cwd(), "public", "uploads", requestId);
    await mkdir(uploadDir, { recursive: true });

    const saved = [];

    for (const file of files) {
      if (file.size > MAX_SIZE) continue;
      if (!ALLOWED.includes(file.type)) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(uploadDir, safeName);
      await writeFile(filePath, buffer);

      const attachment = await prisma.attachment.create({
        data: {
          requestId,
          fileName: file.name,
          fileUrl: `/uploads/${requestId}/${safeName}`,
          fileType: file.type,
          fileSize: file.size,
        },
      });
      saved.push(attachment);
    }

    return NextResponse.json(saved, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
