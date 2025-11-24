from pathlib import Path
from typing import Optional

from langchain_chroma import Chroma

from .llm import embeddings

CHROMA_DIR = Path("data/chroma_db")
CHROMA_COLLECTION = "pdf_rag"

_vector_store: Optional[Chroma] = None


def get_vector_store() -> Chroma:
    """전역 Chroma 인스턴스를 가져오거나 초기화."""
    global _vector_store
    if _vector_store is None:
        CHROMA_DIR.mkdir(parents=True, exist_ok=True)
        _vector_store = Chroma(
            collection_name=CHROMA_COLLECTION,
            embedding_function=embeddings,
            persist_directory=str(CHROMA_DIR),
        )
    return _vector_store


def add_documents(docs):
    """Document 리스트를 벡터스토어에 추가하고 persist."""
    vs = get_vector_store()
    vs.add_documents(docs)
    # vs.persist()  <-- Removed: Chroma 0.4+ persists automatically


def get_retriever(k: int = 5):
    """k개 유사도 검색을 위한 retriever 반환."""
    vs = get_vector_store()
    return vs.as_retriever(search_kwargs={"k": k})
