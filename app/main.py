# app/main.py
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

from .rag.pdf_ingest import ingest_pdf
from .rag.qa import answer_question

app = FastAPI(title="PDF RAG Chatbot (Gemini)")

# 템플릿 설정
templates = Jinja2Templates(directory="app/templates")

# CORS (필요하면 나중에 도메인 제한)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- 프론트 페이지 ----------

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    # 기본 진입점은 챗봇 페이지로 리다이렉트
    return RedirectResponse(url="/chat")


@app.get("/admin", response_class=HTMLResponse)
async def admin_page(request: Request):
    """PDF 업로드용 Admin 페이지 (프론트)."""
    return templates.TemplateResponse("admin.html", {"request": request})


@app.get("/chat", response_class=HTMLResponse)
async def chat_page(request: Request):
    """유저용 챗봇 페이지 (프론트)."""
    return templates.TemplateResponse("chat.html", {"request": request})


# ---------- API DTO ----------

class ChatRequest(BaseModel):
    question: str
    k: int = 5


# ---------- API: PDF 업로드 & 인덱싱 ----------

@app.post("/admin/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """관리자용 PDF 업로드 → 인덱싱 API."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="PDF 파일만 업로드할 수 있습니다.")

    uploads_dir = Path("data/uploads")
    uploads_dir.mkdir(parents=True, exist_ok=True)

    file_path = uploads_dir / file.filename
    content = await file.read()
    file_path.write_bytes(content)

    try:
        chunk_count = ingest_pdf(str(file_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF 처리 중 오류: {e}")

    return {
        "status": "ok",
        "filename": file.filename,
        "chunks_indexed": chunk_count,
    }


# ---------- API: 챗봇 RAG ----------

@app.post("/chat")
async def chat(req: ChatRequest):
    """유저용 질문 → RAG 답변 API."""
    answer, sources = answer_question(req.question, k=req.k)
    return {
        "answer": answer,
        "sources": sources,
    }
