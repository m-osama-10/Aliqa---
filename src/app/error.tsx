"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the actual error to help debugging
    console.error("[Alieqa Error]", error.message, error.stack);
  }, [error]);

  return (
    <div style={{ padding: 20, textAlign: "center", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#2E7D4F", marginBottom: 10 }}>
        حدث خطأ في التطبيق
      </h2>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 15 }}>
        {error.message || "خطأ غير معروف"}
      </p>
      {error.stack && (
        <details style={{ textAlign: "left", fontSize: 11, color: "#999", marginBottom: 15 }}>
          <summary>تفاصيل الخطأ</summary>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {error.stack}
          </pre>
        </details>
      )}
      <button
        onClick={reset}
        style={{
          background: "#2E7D4F",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
