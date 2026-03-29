"use client";

import { CheckCircle, ExternalLink } from "lucide-react";
import { getLineReturnUrl } from "@/app/lib/navigation";

interface SuccessOverlayProps {
  title: string;
  subtitle: string;
  showLineButton?: boolean;
}

export function SuccessOverlay({
  title,
  subtitle,
  showLineButton = false,
}: SuccessOverlayProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--cream)",
        padding: 32,
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--mint-100), var(--mint-50))",
          marginBottom: 24,
          animation: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <CheckCircle size={40} color="var(--mint-500)" />
      </div>
      <h2
        className="font-display"
        style={{
          fontSize: "1.4rem",
          fontWeight: 700,
          color: "var(--gray-900)",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        {title}
      </h2>
      <p
        className="font-thai"
        style={{
          fontSize: 15,
          color: "var(--gray-500)",
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        {subtitle}
      </p>
      {showLineButton && (
        <a
          href={getLineReturnUrl()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 28,
            padding: "14px 32px",
            borderRadius: "var(--radius-full)",
            border: "none",
            background: "var(--line-green)",
            color: "white",
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          <span className="font-thai">กลับไป LINE</span>
          <ExternalLink size={16} />
        </a>
      )}
    </div>
  );
}
