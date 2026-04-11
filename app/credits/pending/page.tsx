"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLiff } from "@/app/providers/liff-provider";
import {
  fetchPaymentStatus,
  type PaymentStatusResponse,
} from "@/app/lib/api";
import { PageHeader } from "../../components/page-header";
import { LoadingState } from "../../components/loading-state";
import { Coins, CheckCircle, XCircle, Loader2 } from "lucide-react";
import styles from "./pending.module.css";

const INITIAL_POLL_INTERVAL = 3000;
const MAX_POLL_INTERVAL = 15000;
const MAX_POLL_DURATION = 180000; // 3 minutes max

export default function PendingPaymentPage() {
  return (
    <Suspense fallback={<LoadingState title="ชำระเงิน" />}>
      <PendingContent />
    </Suspense>
  );
}

function PendingContent() {
  const { isReady, liff, liffError } = useLiff();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawOrderId = searchParams.get("id");
  const orderId = rawOrderId && /^[a-zA-Z0-9_-]+$/.test(rawOrderId) ? rawOrderId : null;

  const [status, setStatus] = useState<PaymentStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isReady || !liff || liffError || !orderId) return;

    let cancelled = false;
    const startTime = Date.now();
    let interval = INITIAL_POLL_INTERVAL;

    const poll = async () => {
      try {
        const result = await fetchPaymentStatus(orderId);
        if (cancelled) return;
        setStatus(result);

        if (result.status !== "pending") return;

        if (Date.now() - startTime >= MAX_POLL_DURATION) {
          setError("หมดเวลาตรวจสอบ กรุณาตรวจสอบอีกครั้ง");
          return;
        }

        // Exponential backoff: 3s → 4.5s → 6.75s → ... capped at 15s
        interval = Math.min(interval * 1.5, MAX_POLL_INTERVAL);
        timeoutRef.current = setTimeout(poll, interval);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isReady, liff, liffError, orderId]);

  const handleGoToCredits = () => {
    if (status?.status === "completed") {
      router.push(
        `/credits?success=true&credits=${status.credits_amount}`
      );
    } else {
      router.push("/credits?failed=true");
    }
  };

  if (!isReady) {
    return <LoadingState title="ชำระเงิน" />;
  }

  if (!orderId) {
    return (
      <div className="page-wrapper">
        <PageHeader title="ชำระเงิน" />
        <main className="px-5 pt-5 pb-12">
          <div className={styles.centerCard}>
            <XCircle size={48} color="var(--coral-500)" />
            <p className={`${styles.statusText} font-thai`}>
              ไม่พบรายการชำระเงิน
            </p>
            <button
              className={`${styles.actionBtn} font-thai`}
              onClick={() => router.push("/credits?failed=true")}
            >
              กลับหน้าเครดิต
            </button>
          </div>
        </main>
      </div>
    );
  }

  const isPending = !status || status.status === "pending";
  const isCompleted = status?.status === "completed";
  const isFailed = status?.status === "failed" || status?.status === "expired";

  return (
    <div className="page-wrapper">
      <PageHeader title="ชำระเงิน" />

      <main className="px-5 pt-5 pb-12">
        <AnimatePresence mode="wait">
          {/* ── Pending State ── */}
          {isPending && !error && (
            <motion.div
              key="pending"
              className={styles.centerCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className={styles.spinnerWrapper}>
                <Loader2 size={48} className={styles.spinner} color="var(--coral-500)" />
                <Coins size={24} className={styles.coinIcon} color="var(--coral-400)" />
              </div>
              <h2 className={`${styles.statusTitle} font-display`}>
                กำลังตรวจสอบการชำระเงิน
              </h2>
              <p className={`${styles.statusText} font-thai`}>
                กรุณารอสักครู่...
              </p>
              <div className={styles.dots}>
                <span className={styles.dot} style={{ animationDelay: "0s" }} />
                <span className={styles.dot} style={{ animationDelay: "0.3s" }} />
                <span className={styles.dot} style={{ animationDelay: "0.6s" }} />
              </div>
            </motion.div>
          )}

          {/* ── Success State ── */}
          {isCompleted && (
            <motion.div
              key="success"
              className={styles.centerCard}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              <div className={styles.successIcon}>
                <CheckCircle size={56} color="var(--mint-500)" />
              </div>
              <h2 className={`${styles.statusTitle} font-display`}>
                ชำระเงินสำเร็จ!
              </h2>
              <p className={`${styles.statusText} font-thai`}>
                ได้รับ <strong>{status.credits_amount}</strong> เครดิต
              </p>
              <p className={`${styles.priceText} font-thai`}>
                {status.price_thb} บาท
              </p>
              <button
                className={`${styles.actionBtn} ${styles.successBtn} font-thai`}
                onClick={handleGoToCredits}
              >
                กลับหน้าเครดิต
              </button>
            </motion.div>
          )}

          {/* ── Failed/Error State ── */}
          {(isFailed || error) && (
            <motion.div
              key="failed"
              className={styles.centerCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <XCircle size={48} color="var(--coral-500)" />
              <h2 className={`${styles.statusTitle} font-display`}>
                {error ? "เกิดข้อผิดพลาด" : "การชำระเงินไม่สำเร็จ"}
              </h2>
              <p className={`${styles.statusText} font-thai`}>
                {error || "กรุณาลองใหม่อีกครั้ง"}
              </p>
              <button
                className={`${styles.actionBtn} font-thai`}
                onClick={() => router.push("/credits?failed=true")}
              >
                กลับหน้าเครดิต
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
