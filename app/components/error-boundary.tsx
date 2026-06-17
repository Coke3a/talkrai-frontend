"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--coral-50, oklch(0.255 0.028 72))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              fontSize: 24,
            }}
          >
            !
          </div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--gray-900, oklch(0.940 0.015 75))",
              marginBottom: 8,
            }}
          >
            เกิดข้อผิดพลาด
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--gray-500, oklch(0.660 0.016 64))",
              marginBottom: 24,
              maxWidth: 320,
            }}
          >
            {this.state.message || "กรุณาลองใหม่อีกครั้ง"}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 32px",
              borderRadius: 12,
              border: "none",
              background:
                "linear-gradient(135deg, var(--coral-500, oklch(0.815 0.100 81)) 0%, var(--coral-600, oklch(0.745 0.115 78)) 100%)",
              color: "var(--color-ink-950)",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ลองใหม่
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
