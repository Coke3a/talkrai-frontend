"use client";

import { Suspense, useEffect, useState, useCallback, memo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLiff } from "@/app/providers/liff-provider";
import {
  fetchCreditTransactions,
  createPayment,
  formatDate,
  isUserInactiveError,
  type TransactionItem,
} from "@/app/lib/api";
import { useCreditBalance } from "@/app/lib/hooks";
import { PageHeader } from "../components/page-header";
import { LoadingState } from "../components/loading-state";
import { ErrorState } from "../components/error-state";
import { InactiveUserState } from "../components/inactive-user-state";
import { EmptyState } from "../components/empty-state";
import { ToastBanner } from "../components/success-overlay";
import { getTransactionIcon } from "@/app/lib/icons";
import { Coffee, Sparkles, Gem, TrendingUp, MessageCircle, AlertTriangle, Receipt, Coins } from "lucide-react";
import styles from "./credits.module.css";

// ── Constants (product config, not user data) ────────────
const CREDITS_PER_MESSAGE = 2;
const LOW_BALANCE_THRESHOLD = 20;
const PAGE_SIZE = 5;

const PACKAGES = [
  {
    id: "basic",
    icon: Coffee,
    name: "ลองเลย",
    credits: 50,
    price: 29,
    tier: "basic" as const,
  },
  {
    id: "plus",
    icon: Sparkles,
    name: "สายฟิน",
    credits: 150,
    price: 69,
    tier: "recommended" as const,
    badge: "แนะนำ",
  },
  {
    id: "premium",
    icon: Gem,
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

function isPositive(type: string): boolean {
  return type !== "consumption";
}

// ── Component ──────────────────────────────────────────────
export default function CreditsPage() {
  return (
    <Suspense fallback={<LoadingState title="เครดิต" />}>
      <CreditsContent />
    </Suspense>
  );
}

function CreditsContent() {
  const { isReady, liff, liffError, isLoggedIn, login } = useLiff();
  const searchParams = useSearchParams();

  const enabled = isReady && !!liff && !liffError;
  const { data: balance, error: balanceError, mutate: mutateBalance } = useCreditBalance(enabled);

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [txLoading, setTxLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loading = enabled && !balance && !balanceError;

  useEffect(() => {
    if (!enabled) return;

    const loadTransactions = async () => {
      try {
        const txData = await fetchCreditTransactions(PAGE_SIZE, 0);
        setTransactions(txData.transactions);
        setTotalTransactions(txData.total);

        // Show toast if redirected from payment
        const success = searchParams.get("success");
        const credits = searchParams.get("credits");
        const failed = searchParams.get("failed");
        if (success === "true" && credits) {
          setToast({ type: "success", message: `เติมเครดิตสำเร็จ! ได้รับ +${credits} เครดิต` });
          mutateBalance();
          window.history.replaceState(null, "", "/credits");
        } else if (failed === "true") {
          setToast({ type: "error", message: "การชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" });
          window.history.replaceState(null, "", "/credits");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      } finally {
        setTxLoading(false);
      }
    };

    loadTransactions();
  }, [enabled, searchParams, mutateBalance]);

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

  if (!isReady || loading || txLoading) {
    return <LoadingState title="เครดิต" />;
  }

  if (isUserInactiveError(balanceError)) {
    return <InactiveUserState headerTitle="เครดิต" />;
  }

  if (liffError || balanceError || error) {
    return (
      <ErrorState
        headerTitle="เครดิต"
        message={(liffError || balanceError?.message || error)!}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="page-wrapper">
        <PageHeader title="เครดิต" />
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="text-center">
            <p className="font-thai text-base" style={{ color: "var(--gray-500)", marginBottom: 16 }}>
              กรุณาเข้าสู่ระบบเพื่อดูเครดิต
            </p>
            <button
              onClick={login}
              className="font-thai rounded-[var(--radius-md)] px-8 py-3 text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, var(--coral-500) 0%, var(--coral-600) 100%)",
              }}
            >
              เข้าสู่ระบบด้วย LINE
            </button>
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
      <PageHeader title="เครดิต" />

      <main className="px-5 pt-5 pb-12">
        {/* ── Credit Hero ────────────────────── */}
        <motion.section
          className={styles.heroCard}
          style={{
            background: "linear-gradient(160deg, var(--soft-ivory) 0%, var(--blush) 100%)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {/* Radial glow */}
          <div
            className={styles.heroGlow}
            style={{
              background: "radial-gradient(circle, rgba(249, 109, 75, 0.15) 0%, transparent 70%)",
            }}
          />

          {/* Floating coin particles */}
          <Coins size={16} className={styles.heroParticle} style={{ top: '15%', left: '12%', color: 'var(--coral-300)' }} />
          <Coins size={12} className={styles.heroParticle} style={{ top: '25%', right: '15%', color: 'var(--lavender-300)' }} />
          <Sparkles size={14} className={styles.heroParticle} style={{ bottom: '20%', left: '20%', color: 'var(--coral-200)' }} />

          <div className="relative z-10">
            <p className={`${styles.heroLabel} font-thai`}>เครดิตคงเหลือ</p>
            <motion.p
              className={styles.heroBalance}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
            >
              {creditBalance}
            </motion.p>
            <p className={`${styles.heroUnit} font-thai`}>เครดิต</p>
            <p className={`${isLowBalance ? styles.heroNoteWarning : styles.heroNote} font-thai`}>
              {isLowBalance && <AlertTriangle size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />}ใช้ {CREDITS_PER_MESSAGE} เครดิตต่อข้อความ
            </p>

            <div className={styles.statPills}>
              <motion.div
                className={styles.statPill}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <TrendingUp size={14} style={{ opacity: 0.7 }} />
                <span className="font-thai">เติมแล้ว {totalPurchased}</span>
              </motion.div>
              <motion.div
                className={styles.statPill}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <MessageCircle size={14} style={{ opacity: 0.7 }} />
                <span className="font-thai">ใช้แล้ว {totalConsumed}</span>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ── Package Selection ──────────────── */}
        <div className="mt-8 mb-6">
          <span className="section-label">เติมเครดิต</span>
          <div className={styles.packageGrid}>
            {PACKAGES.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <PackageCard pkg={pkg} onError={(msg) => setToast({ type: "error", message: msg })} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Transaction History ────────────── */}
        <div className="mt-8">
          <span className="section-label">ประวัติธุรกรรม</span>
          <div className={styles.transactionList}>
            {transactions.length === 0 ? (
              <div className="py-4">
                <EmptyState icon={Receipt} title="ยังไม่มีธุรกรรม" />
              </div>
            ) : (
              <AnimatePresence>
                {transactions.map((tx, i) => (
                  <motion.div
                    key={`${tx.created_at}-${tx.amount}-${i}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                  >
                    <TransactionRow tx={tx} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {hasMore && (
              <motion.button
                className={`${styles.loadMoreBtn} font-thai`}
                onClick={loadMore}
                whileTap={{ scale: 0.97 }}
              >
                โหลดเพิ่มเติม
              </motion.button>
            )}
          </div>
        </div>
      </main>

      {toast && (
        <ToastBanner
          variant={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// ── Package Card ───────────────────────────────────────────
const PackageCard = memo(function PackageCard({
  pkg,
  onError,
}: {
  pkg: (typeof PACKAGES)[number];
  onError: (message: string) => void;
}) {
  const [purchasing, setPurchasing] = useState(false);
  const perCredit = (pkg.price / pkg.credits).toFixed(2);

  const handlePurchase = async () => {
    if (purchasing) return;
    setPurchasing(true);
    try {
      const result = await createPayment(pkg.id);
      // Redirect to Beam payment page
      window.location.href = result.payment_url;
    } catch (err) {
      setPurchasing(false);
      onError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

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
          {pkg.tier === "recommended" && (
            <Sparkles size={10} className={styles.badgeSparkle} />
          )}
          {pkg.badge}
        </span>
      )}

      {(() => {
        const PkgIcon = pkg.icon;
        return (
          <div className={styles.packageIconWrapper} style={
            pkg.tier === "recommended"
              ? { background: "rgba(255,255,255,0.2)" }
              : { background: "var(--coral-50)" }
          }>
            <PkgIcon size={20} color={pkg.tier === "recommended" ? "white" : "var(--coral-500)"} />
          </div>
        );
      })()}
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

      <button
        className={ctaClass}
        onClick={handlePurchase}
        disabled={purchasing}
      >
        <span className="font-thai">
          {purchasing ? "กำลังดำเนินการ..." : "เติมเครดิต"}
        </span>
      </button>
    </div>
  );
});

// ── Transaction Row ────────────────────────────────────────
const TransactionRow = memo(function TransactionRow({ tx }: { tx: TransactionItem }) {
  const positive = isPositive(tx.type);
  const label = getTransactionLabel(tx.type);
  const sign = positive ? "+" : "";
  const dateStr = formatDate(tx.created_at);
  const TxIconComponent = getTransactionIcon(tx.type);

  return (
    <div
      className={`${styles.transactionCard} ${
        positive ? styles.transactionPositive : styles.transactionNegative
      }`}
    >
      <div className={`${styles.transactionIcon} ${positive ? styles.transactionIconPositive : styles.transactionIconNegative}`}>
        {/* eslint-disable-next-line react-hooks/static-components */}
        <TxIconComponent size={18} />
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
});
