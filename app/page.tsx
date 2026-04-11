"use client";

import { useLiff } from "./providers/liff-provider";
import { PageHeader } from "./components/page-header";
import { LoadingState } from "./components/loading-state";
import { ErrorState } from "./components/error-state";
import { CheckCircle2, Lock, Unlock, Smartphone, Play, Coins, BookOpen, Sparkles, Heart } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

const floatingIcons = [
  { icon: Sparkles, size: 14, top: "18%", right: "8%", delay: 0, color: "var(--coral-300)" },
  { icon: Heart, size: 12, top: "55%", left: "5%", delay: 1.5, color: "var(--lavender-300)" },
  { icon: Sparkles, size: 10, bottom: "15%", right: "12%", delay: 3, color: "var(--coral-200)" },
];

export default function Home() {
  const { liff, liffError, isLoggedIn, isInClient, isReady, login } = useLiff();

  if (!isReady) {
    return <LoadingState title="TalkRai" />;
  }

  if (liffError) {
    return (
      <ErrorState
        headerTitle="TalkRai"
        message={liffError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="page-wrapper">
      <PageHeader title="TalkRai" />

      <main className="px-5 pt-5 pb-12">
        {/* Hero Section */}
        <motion.section
          className="relative mb-8 overflow-hidden rounded-[var(--radius-xl)] px-6 py-12 text-center text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--coral-500) 0%, var(--coral-600) 25%, var(--lavender-500) 100%)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
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

          {/* Floating decorative icons */}
          {floatingIcons.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="pointer-events-none absolute"
                style={{
                  top: item.top, right: item.right, left: item.left, bottom: item.bottom,
                  color: "rgba(255,255,255,0.2)",
                  animation: `bobFloat ${3 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${item.delay}s`,
                }}
              >
                <Icon size={item.size} />
              </div>
            );
          })}

          <div className="relative z-10">
            <motion.img
              src="/talkrai-logo-cream.svg"
              alt="TalkRai"
              style={{
                width: 72,
                height: "auto",
                marginBottom: 16,
                filter: "brightness(0) invert(1)",
                opacity: 0.95,
                display: "inline-block",
              }}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
            />
            <h2 className="font-display mb-3 text-3xl font-bold">TalkRai</h2>
            <p className="font-thai text-base text-white/95">
              AI-powered interactive roleplay
            </p>
          </div>
        </motion.section>

        {/* LIFF Status */}
        <span className="section-label">สถานะการเชื่อมต่อ</span>
        <motion.section
          className="card mb-6 rounded-[var(--radius-xl)] p-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="space-y-3">
            <StatusRow
              icon={<CheckCircle2 size={20} color="var(--mint-500)" />}
              label="LIFF"
              value={liff ? "พร้อมใช้งาน" : "ไม่พร้อม"}
              active={!!liff}
            />
            <StatusRow
              icon={
                isLoggedIn ? (
                  <Unlock size={20} color="var(--mint-500)" />
                ) : (
                  <Lock size={20} color="var(--gray-400)" />
                )
              }
              label="สถานะ"
              value={isLoggedIn ? "เข้าสู่ระบบแล้ว" : "ยังไม่เข้าสู่ระบบ"}
              active={isLoggedIn}
            />
            <StatusRow
              icon={<Smartphone size={20} color="var(--lavender-500)" />}
              label="LINE Client"
              value={isInClient ? "อยู่ใน LINE" : "เบราว์เซอร์ภายนอก"}
              active={isInClient}
            />
          </div>
        </motion.section>

        {/* Login Button */}
        {!isLoggedIn && !isInClient && (
          <motion.button
            onClick={login}
            className="font-thai w-full rounded-[var(--radius-md)] py-4 text-base font-bold text-white transition-all active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(135deg, var(--coral-500) 0%, var(--coral-600) 100%)",
              boxShadow: "0 6px 16px rgba(249, 109, 75, 0.2)",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            whileTap={{ scale: 0.97 }}
          >
            เข้าสู่ระบบด้วย LINE
          </motion.button>
        )}

        {/* LINE Status (when logged in) */}
        {isLoggedIn && (
          <motion.div
            className="rounded-[var(--radius-lg)] border-2 p-4"
            style={{
              borderColor: "var(--line-green)",
              background:
                "linear-gradient(135deg, rgba(6, 199, 85, 0.08) 0%, rgba(6, 199, 85, 0.04) 100%)",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{
                  backgroundColor: "var(--line-green)",
                  boxShadow: "0 0 12px rgba(6, 199, 85, 0.6)",
                  animation: "glowPulse 2s ease-in-out infinite",
                }}
              />
              <span
                className="font-thai text-sm font-semibold"
                style={{ color: "var(--line-green)" }}
              >
                เชื่อมต่อกับ LINE อยู่
              </span>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        {isLoggedIn && <div style={{ padding: "24px 0 40px" }}>
          <span className="section-label">เมนูลัด</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            {[
              { href: "/scenes", icon: Play, iconBg: "var(--coral-50)", iconColor: "var(--coral-500)", title: "เลือกฉาก", desc: "เริ่มเรื่องราวใหม่กับตัวละคร AI" },
              { href: "/credits", icon: Coins, iconBg: "var(--lavender-50)", iconColor: "var(--lavender-500)", title: "เครดิต", desc: "ดูยอดเครดิตและเติมเครดิต" },
              { href: "/status", icon: BookOpen, iconBg: "var(--mint-50)", iconColor: "var(--mint-500)", title: "สถานะเรื่อง", desc: "ดูสถานะเรื่องราวปัจจุบัน" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.08, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <Link href={item.href} style={{ textDecoration: "none" }}>
                    <motion.div
                      className="card"
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px" }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: "50%", background: item.iconBg }}>
                        <Icon size={20} color={item.iconColor} />
                      </div>
                      <div>
                        <div className="font-display" style={{ fontWeight: 600, fontSize: 15, color: "var(--gray-800)" }}>{item.title}</div>
                        <div className="font-thai" style={{ fontSize: 13, color: "var(--gray-500)" }}>{item.desc}</div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>}
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
  icon: ReactNode;
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center justify-center" style={{ width: 24, height: 24 }}>{icon}</span>
      <div className="flex-1">
        <span className="font-display text-xs font-bold uppercase tracking-wide" style={{ color: "var(--gray-500)" }}>
          {label}
        </span>
        <p
          className="font-thai text-sm font-semibold"
          style={{ color: active ? "var(--gray-900)" : "var(--gray-400)" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
