import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ingestPdf } from "@/lib/pdf";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "file 필드가 필요합니다." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "PDF 파일만 업로드 가능합니다." },
        { status: 400 }
      );
    }

    // 1) 파일을 서버 로컬 디스크에 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const docId = randomUUID();
    const filePath = path.join(uploadsDir, `${docId}.pdf`);
    await fs.writeFile(filePath, buffer);

    // 2) PDF → 청크 → 벡터스토어 인덱싱
    await ingestPdf(filePath, {
      docId,
      filename: file.name,
      uploadedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, docId });
  } catch (err: any) {
    console.error("upload error", err);
    return NextResponse.json(
      { error: "업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
