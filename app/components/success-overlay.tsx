"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, X, ExternalLink } from "lucide-react";
import { getLineReturnUrl } from "@/app/lib/navigation";

// ── Toast Banner (new — auto-dismiss notification) ─────────

type ToastVariant = "success" | "error";

interface ToastBannerProps {
  variant: ToastVariant;
  message: string;
  onClose: () => void;
  duration?: number;
}

const VARIANT_CONFIG = {
  success: {
    Icon: CheckCircle,
    bg: "linear-gradient(135deg, var(--mint-50) 0%, var(--mint-100) 100%)",
    border: "var(--mint-200)",
    iconColor: "var(--mint-500)",
    textColor: "var(--mint-700, var(--gray-800))",
    closeColor: "var(--mint-400)",
    closeHover: "var(--mint-200)",
  },
  error: {
    Icon: XCircle,
    bg: "linear-gradient(135deg, var(--coral-50, #FFF5F3) 0%, var(--coral-100, #FFE8E3) 100%)",
    border: "var(--coral-200)",
    iconColor: "var(--coral-500)",
    textColor: "var(--coral-700, var(--gray-800))",
    closeColor: "var(--coral-400)",
    closeHover: "var(--coral-200)",
  },
} as const;

export function ToastBanner({
  variant,
  message,
  onClose,
  duration = 4000,
}: ToastBannerProps) {
  const [visible, setVisible] = useState(true);
  const config = VARIANT_CONFIG[variant];

  const dismiss = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, [dismiss, duration]);

  return (
    <AnimatePresence onExitComplete={onClose}>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -40, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={{
            position: "fixed",
            top: 68,
            left: 16,
            right: 16,
            zIndex: 900,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 16px",
            borderRadius: 16,
            background: config.bg,
            border: `1.5px solid ${config.border}`,
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.25)",
              flexShrink: 0,
            }}
          >
            <config.Icon size={20} color={config.iconColor} />
          </div>

          <p
            className="font-thai"
            style={{
              flex: 1,
              fontSize: 14,
              fontWeight: 600,
              color: config.textColor,
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            {message}
          </p>

          <button
            onClick={dismiss}
            aria-label="ปิด"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              color: config.closeColor,
              cursor: "pointer",
              flexShrink: 0,
              transition: "background 0.15s ease",
            }}
            onPointerEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                config.closeHover;
            }}
            onPointerLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Full-Screen Success Overlay (original — used by scenes/status pages) ──

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
          background:
            "linear-gradient(135deg, var(--mint-100), var(--mint-50))",
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
