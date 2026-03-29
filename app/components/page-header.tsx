"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  showLogo?: boolean;
  showBackButton?: boolean;
  rightAction?: ReactNode;
}

export function PageHeader({
  title,
  showLogo = true,
  showBackButton = false,
  rightAction,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="page-header">
      <div className="header-inner">
        {/* Left slot */}
        <div style={{ position: "absolute", left: 0, display: "flex", alignItems: "center" }}>
          {showBackButton ? (
            <button
              onClick={() => router.back()}
              aria-label="กลับ"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--gray-700)",
              }}
            >
              <ChevronLeft size={24} />
            </button>
          ) : showLogo ? (
            <img
              src="/talkrai-logomark.svg"
              alt="TalkRai"
              width={22}
              height={22}
              style={{ marginLeft: 12 }}
            />
          ) : null}
        </div>

        {/* Center title */}
        <h1 className="header-title">{title}</h1>

        {/* Right slot */}
        {rightAction && (
          <div style={{ position: "absolute", right: 0, display: "flex", alignItems: "center" }}>
            {rightAction}
          </div>
        )}
      </div>
    </header>
  );
}
