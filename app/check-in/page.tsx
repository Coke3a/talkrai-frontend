"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLiff } from "@/app/providers/liff-provider";
import {
  fetchCheckInStatus,
  performCheckIn,
  type CheckInStatusResponse,
  type CheckInResponse,
} from "@/app/lib/api";
import { PageHeader } from "../components/page-header";
import { LoadingState } from "../components/loading-state";
import { ErrorState } from "../components/error-state";
import { Flame, CheckCircle, Circle, Star, Coins } from "lucide-react";
import styles from "./check-in.module.css";

export default function CheckInPage() {
  const { isReady, liff, liffError, isLoggedIn } = useLiff();
  const router = useRouter();
  const [status, setStatus] = useState<CheckInStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckInResponse | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isReady || !liff || liffError) return;

    const loadStatus = async () => {
      try {
        const data = await fetchCheckInStatus();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [isReady, liff, liffError]);

  const handleCheckIn = async () => {
    if (checking || status?.checked_in_today) return;
    setChecking(true);
    try {
      const res = await performCheckIn();
      setResult(res);
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              checked_in_today: true,
              current_streak: res.current_streak,
              streak_day: res.streak_day,
            }
          : prev
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setChecking(false);
    }
  };

  if (!isReady || loading) {
    return <LoadingState title="เช็คอินรายวัน" />;
  }

  if (liffError || error) {
    return (
      <ErrorState
        headerTitle="เช็คอินรายวัน"
        message={(liffError || error)!}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="page-wrapper">
        <PageHeader title="เช็คอินรายวัน" showBackButton />
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <p className="font-thai text-base" style={{ color: "var(--gray-500)" }}>
            กรุณาเข้าสู่ระบบเพื่อเช็คอิน
          </p>
        </div>
      </div>
    );
  }

  const history = status?.streak_history ?? [];
  const checkedInToday = status?.checked_in_today ?? false;
  const currentStreak = status?.current_streak ?? 0;
  const creditsToEarn = status?.credits_to_earn ?? 0;

  return (
    <div className="page-wrapper">
      <PageHeader title="เช็คอินรายวัน" showBackButton />

      <main className={styles.content}>
        {/* ── Streak Counter ─────────────────────── */}
        <motion.div
          className={styles.streakCounter}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className={styles.streakFireWrap}>
            <Flame
              size={40}
              className={styles.streakFireIcon}
              style={{ color: currentStreak > 0 ? "var(--coral-500)" : "var(--gray-300)" }}
            />
          </div>
          <p className={styles.streakNumber}>{currentStreak}</p>
          <p className={`${styles.streakLabel} font-thai`}>วันติดต่อกัน</p>
        </motion.div>

        {/* ── 7-Day Tracker ──────────────────────── */}
        <motion.section
          className={styles.trackerSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <p className={`${styles.sectionTitle} font-thai`}>7 วันล่าสุด</p>
          <div className={styles.tracker}>
            {history.length > 0
              ? history.map((item, i) => {
                  const isToday = i === history.length - 1;
                  const isBonus = item.credits > 1;
                  const dayClass = [
                    styles.trackerDay,
                    item.completed ? styles.completed : "",
                    isToday ? styles.today : "",
                    isBonus && item.completed ? styles.bonus : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <motion.div
                      key={item.day}
                      className={dayClass}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                    >
                      <span className={`${styles.trackerDayNum} font-thai`}>
                        {isToday ? "วันนี้" : `วัน ${item.day}`}
                      </span>
                      <div className={styles.trackerIcon}>
                        {item.completed ? (
                          isBonus ? (
                            <Star size={18} fill="currentColor" />
                          ) : (
                            <CheckCircle size={18} />
                          )
                        ) : (
                          <Circle size={18} />
                        )}
                      </div>
                      <span className={`${styles.trackerCredits} font-thai`}>
                        +{item.credits}
                      </span>
                    </motion.div>
                  );
                })
              : Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className={`${styles.trackerDay} ${i === 6 ? styles.today : ""}`}>
                    <span className={`${styles.trackerDayNum} font-thai`}>
                      {i === 6 ? "วันนี้" : `วัน ${i + 1}`}
                    </span>
                    <div className={styles.trackerIcon}>
                      <Circle size={18} />
                    </div>
                    <span className={`${styles.trackerCredits} font-thai`}>+1</span>
                  </div>
                ))}
          </div>
        </motion.section>

        {/* ── Today's Reward Preview ─────────────── */}
        <AnimatePresence mode="wait">
          {!checkedInToday && (
            <motion.div
              key="reward-preview"
              className={styles.rewardPreview}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Coins size={20} style={{ color: "var(--coral-500)", flexShrink: 0 }} />
              <p className="font-thai" style={{ fontSize: "0.9rem", color: "var(--gray-700)" }}>
                เช็คอินวันนี้รับ{" "}
                <strong style={{ color: "var(--coral-500)" }}>+{creditsToEarn} เครดิต</strong>
              </p>
            </motion.div>
          )}

          {showSuccess && result && (
            <motion.div
              key="success-banner"
              className={styles.successBanner}
              initial={{ opacity: 0, scale: 0.9, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <CheckCircle size={22} style={{ color: "var(--mint-500)", flexShrink: 0 }} />
              <div>
                <p className="font-thai" style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--gray-800)" }}>
                  เช็คอินสำเร็จ!
                </p>
                <p className="font-thai" style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>
                  +{result.credits_earned} เครดิต · ยอดคงเหลือ {result.new_balance}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CTA Button ─────────────────────────── */}
        <motion.button
          className={`${styles.ctaButton} font-thai`}
          onClick={handleCheckIn}
          disabled={checkedInToday || checking}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          whileTap={!checkedInToday ? { scale: 0.97 } : {}}
        >
          {checking ? (
            "กำลังเช็คอิน..."
          ) : checkedInToday ? (
            <>
              <CheckCircle size={18} style={{ display: "inline", marginRight: 6, verticalAlign: "-3px" }} />
              เช็คอินแล้ววันนี้
            </>
          ) : (
            <>
              <Flame size={18} style={{ display: "inline", marginRight: 6, verticalAlign: "-3px" }} />
              เช็คอินวันนี้
            </>
          )}
        </motion.button>

        {checkedInToday && (
          <motion.p
            className="font-thai"
            style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--gray-400)", marginTop: 8 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            กลับมาพรุ่งนี้เพื่อรักษาสตรีค!
          </motion.p>
        )}
      </main>
    </div>
  );
}
