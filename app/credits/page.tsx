"use client";

import { useState } from "react";
import styles from "./credits.module.css";

// ── Mock Data ──────────────────────────────────────────────

const CREDIT_BALANCE = 66;
const TOTAL_PURCHASED = 200;
const TOTAL_CONSUMED = 134;
const CREDITS_PER_MESSAGE = 2;
const LOW_BALANCE_THRESHOLD = 20;

interface Transaction {
  type: "consume" | "purchase" | "welcome_bonus";
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

const TRANSACTIONS: Transaction[] = [
  { type: "consume", amount: -2, balance_after: 66, description: "แชทกับมิโอะ · คาเฟ่ริมทาง", created_at: "2025-03-06T14:30:00" },
  { type: "consume", amount: -2, balance_after: 68, description: "แชทกับมิโอะ · คาเฟ่ริมทาง", created_at: "2025-03-06T14:28:00" },
  { type: "consume", amount: -2, balance_after: 70, description: "แชทกับมิโอะ · คาเฟ่ริมทาง", created_at: "2025-03-06T14:25:00" },
  { type: "purchase", amount: 150, balance_after: 72, description: "เติมเครดิต ✨ สายฟิน", created_at: "2025-03-05T10:00:00" },
  { type: "consume", amount: -2, balance_after: -78, description: "แชทกับอากิระ · สวนสาธารณะ", created_at: "2025-03-04T20:15:00" },
  { type: "consume", amount: -2, balance_after: -76, description: "แชทกับอากิระ · สวนสาธารณะ", created_at: "2025-03-04T20:10:00" },
  { type: "purchase", amount: 50, balance_after: -74, description: "เติมเครดิต ☕ ลองเลย", created_at: "2025-03-02T09:00:00" },
  { type: "welcome_bonus", amount: 20, balance_after: -94, description: "โบนัสต้อนรับ — ยินดีต้อนรับสู่ TalkRai! 🎉", created_at: "2025-03-01T12:00:00" },
];

const PACKAGES = [
  {
    id: "basic",
    emoji: "☕",
    name: "ลองเลย",
    credits: 50,
    price: 29,
    tier: "basic" as const,
  },
  {
    id: "recommended",
    emoji: "✨",
    name: "สายฟิน",
    credits: 150,
    price: 69,
    tier: "recommended" as const,
    badge: "แนะนำ",
  },
  {
    id: "premium",
    emoji: "💎",
    name: "ฟินไม่จำกัด",
    credits: 400,
    price: 149,
    tier: "premium" as const,
    badge: "คุ้มที่สุด",
  },
];

// ── Thai Date Helpers ──────────────────────────────────────

const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function formatThaiDate(isoString: string): string {
  const date = new Date(isoString);
  const day = date.getDate();
  const month = THAI_MONTHS[date.getMonth()];
  const buddhistYear = date.getFullYear() + 543;
  const shortYear = String(buddhistYear).slice(-2);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${shortYear} · ${hours}:${minutes}`;
}

// ── Transaction Helpers ────────────────────────────────────

function getTransactionLabel(type: Transaction["type"]): string {
  switch (type) {
    case "consume": return "ใช้เครดิต";
    case "purchase": return "เติมเครดิต";
    case "welcome_bonus": return "โบนัสต้อนรับ";
  }
}

function getTransactionIcon(type: Transaction["type"]): string {
  switch (type) {
    case "consume": return "💬";
    case "purchase": return "💳";
    case "welcome_bonus": return "🎁";
  }
}

function isPositive(type: Transaction["type"]): boolean {
  return type === "purchase" || type === "welcome_bonus";
}

// ── Component ──────────────────────────────────────────────

export default function CreditsPage() {
  const [visibleCount, setVisibleCount] = useState(5);
  const isLowBalance = CREDIT_BALANCE < LOW_BALANCE_THRESHOLD;
  const visibleTransactions = TRANSACTIONS.slice(0, visibleCount);
  const hasMore = visibleCount < TRANSACTIONS.length;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="page-header">
        <div className="header-inner">
          <h1 className="header-title">เครดิต</h1>
        </div>
      </header>

      <main className="px-5 pt-5 pb-12">
        {/* ── Credit Hero ────────────────────── */}
        <section
          className={styles.heroCard}
          style={{
            background: "linear-gradient(160deg, var(--soft-ivory) 0%, var(--blush) 100%)",
          }}
        >
          {/* Radial glow */}
          <div
            className={styles.heroGlow}
            style={{
              background: "radial-gradient(circle, rgba(249, 109, 75, 0.15) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10">
            <p className={`${styles.heroLabel} font-thai`}>เครดิตคงเหลือ</p>
            <p className={styles.heroBalance}>{CREDIT_BALANCE}</p>
            <p className={`${styles.heroUnit} font-thai`}>เครดิต</p>
            <p className={`${isLowBalance ? styles.heroNoteWarning : styles.heroNote} font-thai`}>
              {isLowBalance && "⚠️ "}ใช้ {CREDITS_PER_MESSAGE} เครดิตต่อข้อความ
            </p>

            <div className={styles.statPills}>
              <div className={styles.statPill}>
                <span className={styles.statPillEmoji}>🌿</span>
                <span className="font-thai">เติมแล้ว {TOTAL_PURCHASED}</span>
              </div>
              <div className={styles.statPill}>
                <span className={styles.statPillEmoji}>💬</span>
                <span className="font-thai">ใช้แล้ว {TOTAL_CONSUMED}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Package Selection ──────────────── */}
        <div className="mt-8 mb-6">
          <span className="section-label">เติมเครดิต</span>
          <div className={styles.packageGrid}>
            {PACKAGES.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </div>

        {/* ── Transaction History ────────────── */}
        <div className="mt-8">
          <span className="section-label">ประวัติธุรกรรม</span>
          <div className={styles.transactionList}>
            {visibleTransactions.map((tx, i) => (
              <TransactionRow key={i} tx={tx} />
            ))}

            {hasMore && (
              <button
                className={`${styles.loadMoreBtn} font-thai`}
                onClick={() => setVisibleCount((c) => c + 5)}
              >
                โหลดเพิ่มเติม
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Package Card ───────────────────────────────────────────

function PackageCard({
  pkg,
}: {
  pkg: (typeof PACKAGES)[number];
}) {
  const perCredit = (pkg.price / pkg.credits).toFixed(2);

  const cardClass = (() => {
    switch (pkg.tier) {
      case "basic": return `${styles.packageCard} ${styles.packageBasic}`;
      case "recommended": return `${styles.packageCard} ${styles.packageRecommended}`;
      case "premium": return `${styles.packageCard} ${styles.packagePremium}`;
    }
  })();

  const ctaClass = (() => {
    switch (pkg.tier) {
      case "basic": return `${styles.packageCta} ${styles.packageCtaBasic}`;
      case "recommended": return `${styles.packageCta} ${styles.packageCtaRecommended}`;
      case "premium": return `${styles.packageCta} ${styles.packageCtaPremium}`;
    }
  })();

  const dividerBg = pkg.tier === "recommended" ? "rgba(255,255,255,0.3)" : "var(--gray-200)";
  const textColor = pkg.tier === "recommended" ? "white" : "var(--gray-800)";
  const subTextColor = pkg.tier === "recommended" ? "rgba(255,255,255,0.7)" : undefined;

  return (
    <div
      className={cardClass}
      style={
        pkg.tier === "recommended"
          ? {
              background:
                "linear-gradient(135deg, var(--coral-500) 0%, var(--coral-600) 60%, var(--lavender-500) 100%)",
            }
          : undefined
      }
    >
      {/* Badge */}
      {pkg.badge && (
        <span
          className={`${styles.badge} ${
            pkg.tier === "recommended" ? styles.badgeRecommended : styles.badgeBestValue
          }`}
        >
          {pkg.badge}
        </span>
      )}

      <span className={styles.packageEmoji}>{pkg.emoji}</span>
      <p className={`${styles.packageName} font-thai`} style={{ color: textColor }}>
        {pkg.name}
      </p>
      <p className={styles.packageCredits} style={{ color: textColor }}>
        {pkg.credits}
      </p>
      <p className={styles.packageCreditsLabel} style={subTextColor ? { color: subTextColor } : undefined}>
        เครดิต
      </p>

      <div className={styles.packageDivider} style={{ background: dividerBg }} />

      <p className={styles.packagePrice} style={{ color: textColor }}>
        {pkg.price} <span className={styles.packagePriceCurrency}>บาท</span>
      </p>
      <p className={styles.packagePerCredit} style={subTextColor ? { color: subTextColor } : undefined}>
        ({perCredit} บาท/เครดิต)
      </p>

      <button className={ctaClass} disabled>
        <span className="font-thai">เร็วๆ นี้</span>
        <span className={styles.tooltip}>กำลังพัฒนา</span>
      </button>
    </div>
  );
}

// ── Transaction Row ────────────────────────────────────────

function TransactionRow({ tx }: { tx: Transaction }) {
  const positive = isPositive(tx.type);
  const icon = getTransactionIcon(tx.type);
  const label = getTransactionLabel(tx.type);
  const sign = positive ? "+" : "";
  const thaiDate = formatThaiDate(tx.created_at);

  return (
    <div
      className={`${styles.transactionCard} ${
        positive ? styles.transactionPositive : styles.transactionNegative
      }`}
    >
      <div
        className={`${styles.transactionIcon} ${
          positive ? styles.transactionIconPositive : styles.transactionIconNegative
        }`}
      >
        {icon}
      </div>
      <div className={styles.transactionInfo}>
        <p className={`${styles.transactionType} font-thai`}>{label}</p>
        <p className={`${styles.transactionDesc} font-thai`}>{tx.description}</p>
      </div>
      <div className={styles.transactionRight}>
        <p
          className={`${styles.transactionAmount} ${
            positive ? styles.transactionAmountPositive : styles.transactionAmountNegative
          }`}
        >
          {sign}{tx.amount}
        </p>
        <p className={`${styles.transactionMeta} font-thai`}>
          คงเหลือ {tx.balance_after}<br />
          {thaiDate}
        </p>
      </div>
    </div>
  );
}
