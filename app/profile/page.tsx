"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLiff } from "@/app/providers/liff-provider";
import { useProfile } from "@/app/lib/hooks";
import { isUserInactiveError } from "@/app/lib/api";
import { PageHeader } from "../components/page-header";
import { LoadingState } from "../components/loading-state";
import { ErrorState } from "../components/error-state";
import { InactiveUserState } from "../components/inactive-user-state";
import { BookOpen, MessageSquare, Sparkles } from "lucide-react";
import styles from "./profile.module.css";

interface LineProfile {
  displayName: string;
  pictureUrl?: string;
}

function formatMemberSince(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const { isReady, liffError, liff, isLoggedIn, login } = useLiff();
  const [lineProfile, setLineProfile] = useState<LineProfile | null>(null);

  const enabled = isReady && isLoggedIn && !!liff && !liffError;
  const { data: stats, error: statsError } = useProfile(enabled);

  const loading = enabled && !stats && !statsError;
  const error = statsError?.message || null;

  useEffect(() => {
    if (!enabled || !liff) return;

    liff.getProfile().then((profile) => {
      setLineProfile({
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
      });
    });
  }, [enabled, liff]);

  if (!isReady || loading) {
    return <LoadingState title="โปรไฟล์" />;
  }

  if (isUserInactiveError(statsError)) {
    return <InactiveUserState headerTitle="โปรไฟล์" />;
  }

  if (liffError || error) {
    return (
      <ErrorState
        headerTitle="โปรไฟล์"
        message={(liffError || error)!}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="page-wrapper">
        <PageHeader title="โปรไฟล์" />
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="text-center">
            <p className="font-thai text-base" style={{ color: "var(--gray-500)", marginBottom: 16 }}>
              กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์
            </p>
            <button
              onClick={login}
              className="font-thai rounded-[var(--radius-md)] px-8 py-3 text-sm font-bold text-[var(--color-ink-950)]"
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

  const displayName = lineProfile?.displayName ?? "คุณ";
  const pictureUrl =
    lineProfile?.pictureUrl ??
    `https://api.dicebear.com/9.x/adventurer/svg?seed=${displayName}`;
  const createdAt = stats?.created_at ?? new Date().toISOString();
  const totalSessions = stats?.total_sessions ?? 0;
  const totalMessages = stats?.total_messages ?? 0;
  const longestStreak = stats?.longest_streak ?? 0;
  const currentStreak = stats?.current_streak ?? 0;
  const checkedInToday = stats?.checked_in_today ?? false;
  const cycleDay = stats?.today_cycle_day ?? 1;
  const todayCredits = stats?.today_credits ?? 2;
  const daysToChest = stats?.days_to_chest ?? 6;
  const weeklyCredits = stats?.weekly_credits ?? [2, 3, 4, 4, 4, 4, 10];
  const chestCredits = weeklyCredits[6];

  return (
    <div className="page-wrapper">
      <PageHeader title="โปรไฟล์" />

      <main className="px-5 pt-5 pb-12">
        {/* Profile Hero */}
        <motion.section
          className={styles.hero}
          style={{
            background:
              "linear-gradient(135deg, var(--coral-500) 0%, var(--coral-400) 25%, var(--lavender-500) 100%)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className={styles.heroDecorativeCircle} />

          <div className="relative z-10">
            {/* Avatar with sparkle */}
            <div className={styles.avatarWrapper}>
              <div className={styles.avatarRing} />
              {/* Sparkle decorations */}
              <div className={styles.avatarSparkle} style={{ top: -4, right: -4 }}>
                <Sparkles size={14} color="oklch(0.145 0.012 350 / 0.7)" />
              </div>
              <div className={styles.avatarSparkle} style={{ bottom: 8, left: -6, animationDelay: '1s' }}>
                <Sparkles size={10} color="oklch(0.145 0.012 350 / 0.5)" />
              </div>
              <Image
                src={pictureUrl}
                alt={displayName}
                className={styles.avatar}
                width={120}
                height={120}
                unoptimized
              />
            </div>

            <h2 className={styles.displayName}>{displayName}</h2>
            <p className={styles.memberSince}>
              Member since {formatMemberSince(createdAt)}
            </p>
          </div>
        </motion.section>

        {/* Stats Grid */}
        <div className="mb-6 mt-6">
          <span className="section-label">สถิติของคุณ</span>
          <div className={styles.statsGrid}>
            <motion.div
              className={`card ${styles.statCard}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className={`${styles.statIconWrapper} ${styles.statIconCoral}`}>
                <BookOpen size={22} />
              </div>
              <motion.div
                className={styles.statValue}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              >
                {totalSessions}
              </motion.div>
              <div className={styles.statLabel}>เรื่องราวทั้งหมด</div>
            </motion.div>

            <motion.div
              className={`card ${styles.statCard}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className={`${styles.statIconWrapper} ${styles.statIconLavender}`}>
                <MessageSquare size={22} />
              </div>
              <motion.div
                className={styles.statValue}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              >
                {totalMessages}
              </motion.div>
              <div className={styles.statLabel}>ข้อความ</div>
            </motion.div>
          </div>
        </div>

        {/* Weekly check-in calendar — a visible, escalating run with teeth (spec §R4.2) */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        >
          <span className="section-label">เช็คอินรายวัน</span>
          <div className={styles.checkinCalendar}>
            <p className={`font-thai ${styles.checkinSubtitle}`}>
              รับเครดิตฟรีทุกวัน ยิ่งต่อเนื่องยิ่งได้เยอะ
            </p>
            <div className={styles.checkinRow}>
              {weeklyCredits.map((credits, i) => {
                const day = i + 1;
                const isChest = day === 7;
                const isToday = day === cycleDay;
                const isClaimed = day < cycleDay;
                let stateClass: string;
                let glyph: string;
                if (isChest) {
                  stateClass = styles.chest;
                  glyph = "🎁";
                } else if (isToday) {
                  stateClass = checkedInToday ? styles.today : styles.claimable;
                  glyph = checkedInToday ? "◆" : "◇";
                } else if (isClaimed) {
                  stateClass = styles.claimed;
                  glyph = "✓";
                } else {
                  stateClass = styles.locked;
                  glyph = "·";
                }
                const todayEmphasis =
                  isToday && checkedInToday ? ` ${styles.todayMark}` : "";
                return (
                  <div
                    key={day}
                    className={`${styles.cell} ${stateClass}${todayEmphasis}`}
                  >
                    <span className={styles.cellDay}>{day}</span>
                    <span className={styles.cellGlyph}>{glyph}</span>
                    <span className={styles.cellCredits}>+{credits}</span>
                  </div>
                );
              })}
            </div>

            <p className={`font-thai ${styles.checkinStreakLine}`}>
              ต่อเนื่อง {currentStreak} วัน · สถิติสูงสุด {longestStreak} วัน
            </p>

            {checkedInToday ? (
              <p className={`font-thai ${styles.checkinStateActive}`}>
                ✓ เช็คอินวันนี้แล้ว
              </p>
            ) : currentStreak > 0 ? (
              <p className={`font-thai ${styles.checkinStateActive}`}>
                ทักหาเธอวันนี้ รับ +{todayCredits}
              </p>
            ) : (
              <p className={`font-thai ${styles.checkinStateActive}`}>
                เริ่ม streak ใหม่วันนี้
              </p>
            )}

            <p className={`font-thai ${styles.checkinChest}`}>
              {daysToChest > 0
                ? `อีก ${daysToChest} วันเปิดกล่อง ${chestCredits} เครดิต`
                : checkedInToday
                  ? "เปิดกล่องวันนี้แล้ว"
                  : `เปิดกล่องวันนี้ รับ +${chestCredits} เครดิต`}
            </p>
            <p className={`font-thai ${styles.checkinFaint}`}>
              เริ่มรอบใหม่เที่ยงคืน (เวลาไทย)
            </p>
            <p className={`font-thai ${styles.checkinFaint}`}>
              ขาดแม้แต่วันเดียว เริ่มนับใหม่วันที่ 1
            </p>
          </div>
        </motion.div>

        {/* LINE Status */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <span className="section-label">การเชื่อมต่อ</span>
          <div
            className={styles.lineStatus}
            style={{
              background:
                "linear-gradient(135deg, rgba(6, 199, 85, 0.08) 0%, rgba(6, 199, 85, 0.04) 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className={styles.lineStatusDot} />
              <span className={`font-thai ${styles.lineStatusText}`}>
                เชื่อมต่อกับ LINE อยู่
              </span>
            </div>
          </div>
        </motion.div>

        {/* Gratitude Card */}
        <motion.div
          className={styles.gratitudeCard}
          style={{
            background:
              "linear-gradient(135deg, var(--coral-500) 0%, var(--coral-400) 25%, var(--lavender-500) 100%)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <span className={styles.gratitudeIcon}><Sparkles size={28} /></span>
          <h3 className={styles.gratitudeTitle}>
            ขอบคุณที่เป็นส่วนหนึ่งของ TalkRai!
          </h3>
          <p className={`font-thai ${styles.gratitudeText}`}>
            ขอบคุณที่เป็นส่วนหนึ่งของ TalkRai
          </p>
        </motion.div>
      </main>
    </div>
  );
}
