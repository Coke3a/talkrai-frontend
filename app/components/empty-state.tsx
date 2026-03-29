import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="card rounded-[var(--radius-xl)] p-8 text-center">
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
        <Icon size={28} color="var(--coral-400)" />
      </div>
      <h2
        className="font-display"
        style={{
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "var(--gray-900)",
          marginBottom: 6,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="font-thai"
          style={{ fontSize: 14, color: "var(--gray-500)", lineHeight: 1.6 }}
        >
          {subtitle}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="font-thai"
          style={{
            marginTop: 16,
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
          {actionLabel}
        </button>
      )}
    </div>
  );
}
