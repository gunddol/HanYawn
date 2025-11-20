"use client";

import { useState, useRef } from "react";
import styles from "./upload.module.css";

type UploadFile = {
  file: File;
  status: "uploading" | "completed" | "error";
  progress: number;
  docId?: string;
  error?: string;
};

export default function AdminUploadPage() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    const newFile: UploadFile = {
      file,
      status: "uploading",
      progress: 0,
    };

    setUploadFiles((prev) => [...prev, newFile]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setUploadFiles((prev) =>
          prev.map((f) =>
            f.file === file && f.status === "uploading"
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          )
        );
      }, 200);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      const data = await res.json();

      if (!res.ok) {
        setUploadFiles((prev) =>
          prev.map((f) =>
            f.file === file
              ? {
                  ...f,
                  status: "error",
                  progress: 100,
                  error: data.error || "업로드 실패",
                }
              : f
          )
        );
        return;
      }

      setUploadFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? {
                ...f,
                status: "completed",
                progress: 100,
                docId: data.docId,
              }
            : f
        )
      );
    } catch {
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? {
                ...f,
                status: "error",
                progress: 100,
                error: "네트워크 오류",
              }
            : f
        )
      );
    }
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      alert("PDF 파일만 업로드 가능합니다.");
      return;
    }

    uploadFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
    // 같은 파일을 다시 선택할 수 있도록 리셋
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (file: File) => {
    setUploadFiles((prev) => prev.filter((f) => f.file !== file));
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = Math.round((bytes / Math.pow(k, i)) * 100) / 100;
    return `${value} ${sizes[i]}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>PDF 문서 업로드</h1>
          <p className={styles.subtitle}>
            PDF 파일을 드래그하거나 클릭하여 업로드하세요
          </p>
        </header>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleInputChange}
            className={styles.fileInput}
          />
          <div className={styles.dropZoneContent}>
            <div className={styles.uploadIcon}>
              <svg
                className={styles.uploadIconSvg}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className={styles.dropZoneTitle}>
                Drag & drop files here or choose from your device
              </p>
              <p className={styles.dropZoneSubtext}>
                PDF only · Max file size: 25MB
              </p>
            </div>
          </div>
        </div>

        {/* Uploads List */}
        <div className={styles.uploadsSection}>
          <div className={styles.uploadsHeader}>
            <h2 className={styles.uploadsTitle}>Uploads</h2>
            {uploadFiles.length > 0 && (
              <span className={styles.uploadsCount}>
                {uploadFiles.length} file{uploadFiles.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {uploadFiles.length === 0 && (
            <div className={styles.emptyState}>
              <svg
                className={styles.emptyIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className={styles.emptyText}>업로드할 파일을 선택하세요</p>
            </div>
          )}

          <div className={styles.filesList}>
            {uploadFiles.map((uploadFile, index) => (
              <div key={index} className={styles.fileCard}>
                <div className={styles.fileCardHeader}>
                  <div className={styles.fileInfo}>
                    <div className={styles.fileIcon}>
                      <svg
                        className={styles.fileIconSvg}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className={styles.fileDetails}>
                      <p className={styles.fileName}>{uploadFile.file.name}</p>
                      <div className={styles.fileMeta}>
                        <span className={styles.fileSize}>
                          {formatFileSize(uploadFile.file.size)}
                        </span>
                        {uploadFile.status === "uploading" && (
                          <>
                            <span className={styles.metaSeparator}>·</span>
                            <span className={styles.fileProgress}>
                              {uploadFile.progress}%
                            </span>
                          </>
                        )}
                        {uploadFile.status === "completed" && (
                          <span className={styles.statusCompleted}>
                            <svg
                              className={styles.statusIcon}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Completed
                          </span>
                        )}
                        {uploadFile.status === "error" && (
                          <span className={styles.statusError}>
                            <svg
                              className={styles.statusIcon}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Error
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(uploadFile.file)}
                    className={styles.removeButton}
                    title={uploadFile.status === "uploading" ? "취소" : "삭제"}
                  >
                    {uploadFile.status === "uploading" ? (
                      <svg
                        className={styles.removeIcon}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    ) : (
                      <svg
                        className={styles.removeIcon}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Progress Bar */}
                {uploadFile.status === "uploading" && (
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${uploadFile.progress}%` }}
                    />
                  </div>
                )}
                {uploadFile.status === "error" && (
                  <div className={styles.errorBox}>
                    <p className={styles.errorText}>{uploadFile.error}</p>
                  </div>
                )}
                {uploadFile.status === "completed" && uploadFile.docId && (
                  <div className={styles.docId}>
                    Document ID: {uploadFile.docId}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
