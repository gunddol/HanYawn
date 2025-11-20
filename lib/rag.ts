import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { chatModel } from "./llm";
import { getRetriever } from "./ragStore";

const qaPrompt = PromptTemplate.fromTemplate(`
당신은 업로드된 PDF 문서 내용에 대해서만 답변하는 보조자입니다.

[컨텍스트]
{context}

[질문]
{question}

규칙:
- 위 컨텍스트에 있는 내용만 활용해서 답변하세요.
- 컨텍스트에 정보가 없으면 "문서에서 찾을 수 없습니다."라고 답하세요.
- 추측하거나 지어내지 마세요.
`);

export async function answerQuestion(question: string) {
  const retriever = await getRetriever();
  const docs = await retriever._getRelevantDocuments(question);

  const context = docs
    .map((d: any, idx: number) => `[#${idx + 1}] ${d.pageContent}`)
    .join("\n\n---\n\n");

  const chain = RunnableSequence.from([
    qaPrompt,
    chatModel,
    new StringOutputParser(),
  ]);

  const answer = await chain.invoke({ context, question });

  return {
    answer,
    sources: docs.map((d: any) => d.metadata),
  };
}
