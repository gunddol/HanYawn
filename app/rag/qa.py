from textwrap import shorten

from .llm import chat_model
from .store import get_retriever


def _build_context(docs) -> str:
    """retriever 결과 Document 리스트를 하나의 context 문자열로 합침."""
    parts = []
    for i, d in enumerate(docs, start=1):
        source = d.metadata.get("source")
        page = d.metadata.get("page")
        header = f"[출처 {i}] source={source}, page={page}"
        parts.append(f"{header}\n{d.page_content}\n")
    return "\n\n".join(parts)


def answer_question(question: str, k: int = 5):
    """
    1) 벡터스토어에서 관련 청크 검색
    2) context + 질문으로 Gemini 호출
    3) 답변과 참조 정보 반환
    """
    retriever = get_retriever(k=k)
    docs = retriever.invoke(question)

    if not docs:
        # 관련 문서가 없을 때 간단히 안내
        fallback = "업로드된 PDF에서 관련 내용을 찾지 못했어요. 질문을 조금 더 구체적으로 해줄 수 있을까요?"
        return fallback, []

    context = _build_context(docs)

    system_instruction = (
        "당신은 업로드된 PDF 문서에 기반해 답변하는 한국어 도우미입니다. "
        "반드시 제공된 문서 내용을 우선으로 답변하고, 추측은 최소화하세요."
    )

    prompt = f"""
{system_instruction}

# 참고 문서 발췌
{context}

# 사용자 질문
{question}

위 문서 내용 안에서 답을 찾을 수 있다면 한국어로 자세히 설명해 주세요.
답을 찾기 어려우면 "문서에서 관련 정보를 찾지 못했습니다."라고 말해 주세요.
""".strip()

    response = chat_model.invoke(prompt)
    answer_text = getattr(response, "content", str(response))

    # 클라이언트에서 출처 표시할 수 있도록 간단히 가공
    sources = [
        {
            "source": d.metadata.get("source"),
            "page": d.metadata.get("page"),
            # 너무 길지 않게 미리보기
            "preview": shorten(d.page_content, width=120, placeholder="..."),
        }
        for d in docs
    ]

    return answer_text, sources
