"use client";

import { useEffect, useState, useCallback } from "react";
import { useLiff } from "@/app/providers/liff-provider";
import {
  fetchCreditBalance,
  fetchCreditTransactions,
  formatDate,
  type CreditBalance,
  type TransactionItem,
} from "@/app/lib/api";
import styles from "./credits.module.css";

// ── Constants (product config, not user data) ────────────

const CREDITS_PER_MESSAGE = 2;
const LOW_BALANCE_THRESHOLD = 20;
const PAGE_SIZE = 5;

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

// ── Transaction Helpers ────────────────────────────────────

function getTransactionLabel(type: string): string {
  switch (type) {
    case "consumption": return "ใช้เครดิต";
    case "purchase": return "เติมเครดิต";
    case "bonus": return "โบนัส";
    case "refund": return "คืนเครดิต";
    case "adjustment": return "ปรับปรุง";
    default: return type;
  }
}

function getTransactionIcon(type: string): string {
  switch (type) {
    case "consumption": return "💬";
    case "purchase": return "💳";
    case "bonus": return "🎁";
    case "refund": return "↩️";
    case "adjustment": return "🔧";
    default: return "📝";
  }
}

function isPositive(type: string): boolean {
  return type !== "consumption";
}

// ── Component ──────────────────────────────────────────────

export default function CreditsPage() {
  const { isReady, liff, liffError } = useLiff();
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || !liff || liffError) return;

    const loadData = async () => {
      try {
        const [balanceData, txData] = await Promise.all([
          fetchCreditBalance(),
          fetchCreditTransactions(PAGE_SIZE, 0),
        ]);
        setBalance(balanceData);
        setTransactions(txData.transactions);
        setTotalTransactions(txData.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isReady, liff, liffError]);

  const loadMore = useCallback(async () => {
    try {
      const txData = await fetchCreditTransactions(
        PAGE_SIZE,
        transactions.length
      );
      setTransactions((prev) => [...prev, ...txData.transactions]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }, [transactions.length]);

  if (!isReady || loading) {
    return (
      <div className="page-wrapper">
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="mb-3 text-4xl">💰</div>
            <p className="font-thai text-sm text-tgray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (liffError || error) {
    return (
      <div className="page-wrapper">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="card rounded-[var(--radius-xl)] p-8 text-center">
            <div className="mb-4 text-4xl">😢</div>
            <h1 className="font-display mb-2 text-xl font-semibold text-tgray-900">
              เกิดข้อผิดพลาด
            </h1>
            <p className="font-thai text-sm text-tgray-500">
              {liffError || error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const creditBalance = balance?.balance ?? 0;
  const totalPurchased = balance?.total_purchased ?? 0;
  const totalConsumed = balance?.total_consumed ?? 0;
  const isLowBalance = creditBalance < LOW_BALANCE_THRESHOLD;
  const hasMore = transactions.length < totalTransactions;

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
            <p className={styles.heroBalance}>{creditBalance}</p>
            <p className={`${styles.heroUnit} font-thai`}>เครดิต</p>
            <p className={`${isLowBalance ? styles.heroNoteWarning : styles.heroNote} font-thai`}>
              {isLowBalance && "⚠️ "}ใช้ {CREDITS_PER_MESSAGE} เครดิตต่อข้อความ
            </p>

            <div className={styles.statPills}>
              <div className={styles.statPill}>
                <span className={styles.statPillEmoji}>🌿</span>
                <span className="font-thai">เติมแล้ว {totalPurchased}</span>
              </div>
              <div className={styles.statPill}>
                <span className={styles.statPillEmoji}>💬</span>
                <span className="font-thai">ใช้แล้ว {totalConsumed}</span>
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
            {transactions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="font-thai text-sm text-tgray-400">ยังไม่มีธุรกรรม</p>
              </div>
            ) : (
              transactions.map((tx, i) => (
                <TransactionRow key={`${tx.created_at}-${tx.amount}-${i}`} tx={tx} />
              ))
            )}

            {hasMore && (
              <button
                className={`${styles.loadMoreBtn} font-thai`}
                onClick={loadMore}
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

function TransactionRow({ tx }: { tx: TransactionItem }) {
  const positive = isPositive(tx.type);
  const icon = getTransactionIcon(tx.type);
  const label = getTransactionLabel(tx.type);
  const sign = positive ? "+" : "";
  const dateStr = formatDate(tx.created_at);

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
        <p className={`${styles.transactionDesc} font-thai`}>{tx.description ?? ""}</p>
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
          {dateStr}
        </p>
      </div>
    </div>
  );
}
