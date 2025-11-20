import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "PDF RAG Chatbot",
  description: "Gemini 기반 PDF RAG 챗봇 데모",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
