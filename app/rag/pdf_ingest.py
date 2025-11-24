from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from .store import add_documents


def ingest_pdf(file_path: str) -> int:
    """
    PDF 파일 경로를 받아서:
    1) 페이지별 로드 → 2) 청크 분할 → 3) 벡터스토어에 저장
    반환값: 저장된 chunk 개수
    """
    loader = PyPDFLoader(file_path)
    docs = loader.load()  # page 단위 Document 리스트

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )
    chunks = text_splitter.split_documents(docs)

    add_documents(chunks)
    return len(chunks)
