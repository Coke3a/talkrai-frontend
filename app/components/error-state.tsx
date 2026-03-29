import { AlertTriangle, RotateCcw } from "lucide-react";
import { PageHeader } from "./page-header";

interface ErrorStateProps {
  title?: string;
  headerTitle?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "เกิดข้อผิดพลาด",
  headerTitle,
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="page-wrapper">
      {headerTitle && <PageHeader title={headerTitle} />}
      <div className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="card rounded-[var(--radius-xl)] p-8 text-center" style={{ maxWidth: 360 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--coral-50)",
              marginBottom: 16,
            }}
          >
            <AlertTriangle size={32} color="var(--coral-500)" />
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              color: "var(--gray-900)",
              marginBottom: 8,
            }}
          >
            {title}
          </h1>
          <p className="font-thai" style={{ fontSize: 14, color: "var(--gray-500)", lineHeight: 1.6 }}>
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 20,
                padding: "10px 24px",
                borderRadius: "var(--radius-full)",
                border: "none",
                background: "linear-gradient(135deg, var(--coral-500), var(--coral-600))",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <RotateCcw size={14} />
              <span className="font-thai">ลองใหม่</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
