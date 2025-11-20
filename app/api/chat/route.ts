import { NextRequest, NextResponse } from "next/server";
import { answerQuestion } from "@/lib/rag";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message as string | undefined;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "message 필드가 필요합니다." },
        { status: 400 }
      );
    }

    const { answer, sources } = await answerQuestion(message.trim());

    return NextResponse.json({ answer, sources });
  } catch (err: any) {
    console.error("chat error", err);
    return NextResponse.json(
      { error: "챗봇 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
