"use client";

import { useLiff } from "./providers/liff-provider";

export default function Home() {
  const { liff, liffError, isLoggedIn, isInClient, isReady } = useLiff();

  if (!isReady) {
    return (
      <div className="page-wrapper">
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="mb-3 text-4xl">🎭</div>
            <p className="font-thai text-sm text-tgray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (liffError) {
    return (
      <div className="page-wrapper">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="card rounded-[var(--radius-xl)] p-8 text-center">
            <div className="mb-4 text-4xl">😢</div>
            <h1 className="font-display mb-2 text-xl font-semibold text-tgray-900">
              เกิดข้อผิดพลาด
            </h1>
            <p className="font-thai text-sm text-tgray-500">{liffError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="page-header">
        <div className="header-inner">
          <h1 className="header-title">TalkRai</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 pt-5 pb-12">
        {/* Hero Section */}
        <section
          className="relative mb-8 overflow-hidden rounded-[var(--radius-xl)] px-6 py-12 text-center text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--coral-500) 0%, var(--coral-600) 25%, var(--lavender-500) 100%)",
            animation: "fadeInUp 0.6s ease-out",
          }}
        >
          {/* Decorative circles */}
          <div
            className="pointer-events-none absolute top-[-80px] right-[-60px] h-[200px] w-[200px] rounded-full"
            style={{ background: "rgba(255,255,255,0.15)" }}
          />
          <div
            className="pointer-events-none absolute bottom-[-40px] left-[-50px] h-[150px] w-[150px] rounded-full"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />

          <div className="relative z-10">
            <span className="mb-4 block text-5xl">🎭</span>
            <h2 className="font-display mb-3 text-3xl font-bold">TalkRai</h2>
            <p className="font-thai text-base text-white/95">
              AI-powered interactive roleplay
            </p>
          </div>
        </section>

        {/* LIFF Status */}
        <span className="section-label">สถานะการเชื่อมต่อ</span>
        <section
          className="card mb-6 rounded-[var(--radius-xl)] p-5"
          style={{ animation: "fadeInUp 0.6s ease-out 0.15s both" }}
        >
          <div className="space-y-3">
            <StatusRow
              icon="🟢"
              label="LIFF"
              value={liff ? "พร้อมใช้งาน" : "ไม่พร้อม"}
              active={!!liff}
            />
            <StatusRow
              icon={isLoggedIn ? "🔓" : "🔒"}
              label="สถานะ"
              value={isLoggedIn ? "เข้าสู่ระบบแล้ว" : "ยังไม่เข้าสู่ระบบ"}
              active={isLoggedIn}
            />
            <StatusRow
              icon="📱"
              label="LINE Client"
              value={isInClient ? "อยู่ใน LINE" : "เบราว์เซอร์ภายนอก"}
              active={isInClient}
            />
          </div>
        </section>

        {/* Login Button */}
        {!isLoggedIn && !isInClient && liff && (
          <button
            onClick={() => liff.login()}
            className="font-thai w-full rounded-[var(--radius-md)] py-4 text-base font-bold text-white transition-all active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(135deg, var(--coral-500) 0%, var(--coral-600) 100%)",
              boxShadow: "0 6px 16px rgba(249, 109, 75, 0.2)",
              animation: "fadeInUp 0.6s ease-out 0.3s both",
            }}
          >
            เข้าสู่ระบบด้วย LINE
          </button>
        )}

        {/* LINE Status (when logged in) */}
        {isLoggedIn && (
          <div
            className="rounded-[var(--radius-lg)] border-2 p-4"
            style={{
              borderColor: "var(--line-green)",
              background:
                "linear-gradient(135deg, rgba(6, 199, 85, 0.08) 0%, rgba(6, 199, 85, 0.04) 100%)",
              animation: "fadeInUp 0.6s ease-out 0.3s both",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{
                  backgroundColor: "var(--line-green)",
                  boxShadow: "0 0 12px rgba(6, 199, 85, 0.6)",
                }}
              />
              <span
                className="font-thai text-sm font-semibold"
                style={{ color: "var(--line-green)" }}
              >
                เชื่อมต่อกับ LINE อยู่
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusRow({
  icon,
  label,
  value,
  active,
}: {
  icon: string;
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <span className="font-display text-xs font-bold uppercase tracking-wide text-tgray-500">
          {label}
        </span>
        <p
          className={`font-thai text-sm font-semibold ${active ? "text-tgray-900" : "text-tgray-400"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
