import { UserX } from "lucide-react";
import { PageHeader } from "./page-header";

interface InactiveUserStateProps {
  headerTitle?: string;
}

export function InactiveUserState({ headerTitle }: InactiveUserStateProps) {
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
            <UserX size={32} color="var(--coral-500)" />
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
            {"ไม่สามารถใช้งานได้"}
          </h1>
          <p className="font-thai" style={{ fontSize: 14, color: "var(--gray-500)", lineHeight: 1.6 }}>
            {"กรุณา Add Friend TalkRai บน LINE เพื่อใช้งานต่อ"}
          </p>
        </div>
      </div>
    </div>
  );
}
