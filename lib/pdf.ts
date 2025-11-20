import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { Document } from "@langchain/core/documents";
import { addDocumentsToStore } from "./ragStore";

export async function ingestPdf(
  filePath: string,
  metadata: Record<string, any> = {}
) {
  // 1) PDF 로딩 (페이지 단위)
  const loader = new PDFLoader(filePath, {
    splitPages: true,
  });
  const rawDocs = await loader.load(); // Document[]

  // 2) 기본 메타데이터에 docId, 파일명 등 추가
  const docsWithMeta: Document[] = rawDocs.map((doc) => ({
    ...doc,
    metadata: {
      ...(doc.metadata || {}),
      ...metadata,
    },
  }));

  // 3) 청크 분할
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await splitter.splitDocuments(docsWithMeta);

  // 4) 벡터스토어에 삽입
  await addDocumentsToStore(splitDocs);
}
