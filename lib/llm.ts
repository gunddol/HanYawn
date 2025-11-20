import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";

// Gemini Chat 모델 
export const chatModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  // maxOutputTokens, safetySettings 등 옵션 필요하면 여기서 추가
});

// Gemini Embedding 모델
export const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",  // 또는 최신 임베딩 모델 ID 사용
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: "RAG PDF Document",
});
