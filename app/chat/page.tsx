"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./chat.module.css";

type Message = {
  from: "user" | "bot";
  text: string;
  sources?: Array<Record<string, any>>;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || isLoading) return;

    const userMsg: Message = { from: "user", text: content };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: `에러: ${data.error || "Unknown error"}` },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: data.answer, sources: data.sources },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "네트워크 오류가 발생했습니다." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  return (
    <div className={styles.container}>
      <div className={styles.chatBox}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.avatar}>
              <svg
                className={styles.avatarIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div>
              <h1 className={styles.title}>PDF RAG 챗봇</h1>
              <p className={styles.subtitle}>업로드된 PDF 문서에 대해 질문하세요</p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className={styles.messagesArea}>
          <div className={styles.messagesContainer}>
            {messages.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg
                    className={styles.emptyIconSvg}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h2 className={styles.emptyTitle}>안녕하세요! 👋</h2>
                <p className={styles.emptyText}>
                  업로드된 PDF 문서에 대해 질문해보세요
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`${styles.messageRow} ${m.from === "user" ? styles.messageRowUser : ""}`}
              >
                {m.from === "bot" && (
                  <div className={styles.botAvatar}>
                    <svg
                      className={styles.botAvatarIcon}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                )}
                <div className={styles.messageContent}>
                  <div
                    className={`${styles.messageBubble} ${
                      m.from === "user" ? styles.messageBubbleUser : styles.messageBubbleBot
                    }`}
                  >
                    <p className={styles.messageText}>{m.text}</p>
                    {m.sources && m.sources.length > 0 && (
                      <div className={styles.sources}>
                        <p className={styles.sourcesLabel}>📎 참고 문서</p>
                        <div className={styles.sourcesTags}>
                          {Array.from(
                            new Set(
                              m.sources.map((source) => source.filename || `문서 #${m.sources!.indexOf(source) + 1}`)
                            )
                          ).map((filename, idx) => (
                            <span
                              key={idx}
                              className={`${styles.sourceTag} ${
                                m.from === "user" ? styles.sourceTagUser : styles.sourceTagBot
                              }`}
                            >
                              {filename}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {m.from === "user" && (
                  <div className={styles.userAvatar}>
                    <svg
                      className={styles.userAvatarIcon}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className={styles.messageRow}>
                <div className={styles.botAvatar}>
                  <svg
                    className={styles.botAvatarIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div className={styles.messageContent}>
                  <div className={`${styles.messageBubble} ${styles.messageBubbleBot}`}>
                    <div className={styles.loadingDots}>
                      <div className={styles.dot}></div>
                      <div className={styles.dot}></div>
                      <div className={styles.dot}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className={styles.inputArea}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
            className={styles.inputForm}
          >
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={onKeyDown}
              rows={1}
              style={{ minHeight: "56px", maxHeight: "140px" }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={styles.sendButton}
            >
              <svg
                className={styles.sendIcon}
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
