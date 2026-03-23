"use client";

import { useState, useEffect, useCallback } from "react";
import { useLiff } from "@/app/providers/liff-provider";
import {
  fetchCurrentSession,
  endSession,
  formatDateShort,
  type CurrentSessionData,
} from "@/app/lib/api";
import styles from "./status.module.css";

const MOOD_MAP: Record<string, {
  emoji: string;
  label: string;
  desc: string;
  backdropClass: string;
}> = {
  happy: {
    emoji: "😊",
    label: "มีความสุข",
    desc: "เธอรู้สึกดีขึ้น เมื่อได้อยู่กับคุณ",
    backdropClass: "moodBackdropHappy",
  },
  sad: {
    emoji: "😢",
    label: "เศร้า",
    desc: "เธอรู้สึกเศร้าใจอยู่",
    backdropClass: "moodBackdropSad",
  },
  angry: {
    emoji: "😠",
    label: "โกรธ",
    desc: "เธอรู้สึกหงุดหงิดอยู่",
    backdropClass: "moodBackdropAngry",
  },
  neutral: {
    emoji: "😐",
    label: "เฉยๆ",
    desc: "เธอรู้สึกเฉยๆ",
    backdropClass: "moodBackdropNeutral",
  },
  excited: {
    emoji: "🤩",
    label: "ตื่นเต้น",
    desc: "เธอรู้สึกตื่นเต้นมาก",
    backdropClass: "moodBackdropExcited",
  },
  shy: {
    emoji: "😳",
    label: "อาย",
    desc: "เธอรู้สึกเขินอาย",
    backdropClass: "moodBackdropShy",
  },
  playful: {
    emoji: "😜",
    label: "ขี้เล่น",
    desc: "เธออารมณ์ดี อยากเล่นสนุก",
    backdropClass: "moodBackdropHappy",
  },
  serious: {
    emoji: "😐",
    label: "จริงจัง",
    desc: "เธอรู้สึกจริงจังอยู่",
    backdropClass: "moodBackdropNeutral",
  },
  worried: {
    emoji: "😟",
    label: "เป็นห่วง",
    desc: "เธอรู้สึกกังวลอยู่",
    backdropClass: "moodBackdropSad",
  },
};

const RELATIONSHIP_MAP: Record<string, { icon: string; label: string }> = {
  stranger: { icon: "🤝", label: "คนแปลกหน้า" },
  acquaintance: { icon: "👋", label: "คนรู้จัก" },
  friend: { icon: "💚", label: "เพื่อน" },
  close_friend: { icon: "💛", label: "เพื่อนสนิท" },
};

const SUMMARY_COLLAPSE_THRESHOLD = 80;

export default function StatusPage() {
  const { isReady, liff, liffError, isInClient } = useLiff();
  const [session, setSession] = useState<CurrentSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    if (!isReady || !liff || liffError) return;

    const loadData = async () => {
      try {
        const data = await fetchCurrentSession();
        setSession(data.session);
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isReady, liff, liffError]);

  const handleEndStory = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    setShowConfirm(false);
    setEnding(true);
    try {
      await endSession();
      if (isInClient && liff) {
        liff.closeWindow();
      } else {
        setShowSuccess(true);
        setSession(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setEnding(false);
    }
  }, [isInClient, liff]);

  const handleCancelConfirm = useCallback(() => {
    setShowConfirm(false);
  }, []);

  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  if (!isReady || loading) {
    return (
      <div className="page-wrapper">
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="mb-3 text-4xl">📖</div>
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

  if (!session) {
    return (
      <div className="page-wrapper">
        <header className="page-header">
          <div className="header-inner">
            <h1 className="header-title">สถานะเรื่องราว</h1>
          </div>
        </header>
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="card rounded-[var(--radius-xl)] p-8 text-center">
            <div className="mb-4 text-4xl">📭</div>
            <h2 className="font-display mb-2 text-lg font-semibold text-tgray-900">
              ยังไม่มีเรื่องราว
            </h2>
            <p className="font-thai text-sm text-tgray-500">
              เลือกเรื่องที่ชอบแล้วเริ่มแชทกับตัวละครได้เลย!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const moodData = MOOD_MAP[session.mood] ?? MOOD_MAP.neutral;
  const relData = RELATIONSHIP_MAP[session.relationship_level] ?? RELATIONSHIP_MAP.stranger;
  const sceneSummary = session.scene_summary ?? "";
  const isLongSummary = sceneSummary.length > SUMMARY_COLLAPSE_THRESHOLD;
  const displayedSummary =
    !isLongSummary || isExpanded
      ? sceneSummary
      : sceneSummary.slice(0, SUMMARY_COLLAPSE_THRESHOLD) + "...";

  const imageUrl =
    session.character_avatar_url ??
    `https://api.dicebear.com/9.x/adventurer/svg?seed=${session.character_name}&backgroundColor=ffd5dc&scale=110`;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="page-header">
        <div className="header-inner">
          <h1 className="header-title">สถานะเรื่องราว</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-28">
        {/* Character Hero */}
        <section className={styles.heroSection}>
          <div className={styles.heroImageWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={session.character_name}
              className={styles.heroImage}
            />
            <div className={styles.heroGradient} />
          </div>
          <div className={styles.heroInfo}>
            <h2 className={styles.characterName}>{session.character_name}</h2>
            <p className={`font-thai ${styles.sceneName}`}>
              {session.scene_name}
            </p>
            <div className={styles.badgeRow}>
              {session.current_location ? (
                <span className={`font-thai ${styles.badge}`}>
                  📍 {session.current_location}
                </span>
              ) : null}
              {session.scene_time ? (
                <span className={`font-thai ${styles.badge}`}>
                  🕐 {session.scene_time}
                </span>
              ) : null}
            </div>
          </div>
        </section>

        {/* Mood Section */}
        <div className="mt-8 px-5">
          <span className="section-label">อารมณ์</span>
          <div className={`card ${styles.moodCard}`}>
            <div className={styles.moodInner}>
              <div
                className={`${styles.moodBackdrop} ${styles[moodData.backdropClass]}`}
              >
                {moodData.emoji}
              </div>
              <div>
                <div className={styles.moodLabel}>{moodData.label}</div>
                <div className={`font-thai ${styles.moodDesc}`}>
                  {moodData.desc}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Relationship Level */}
        <div className="mt-6 px-5">
          <span className="section-label">ความสัมพันธ์</span>
          <div className={`card ${styles.relationshipCard}`}>
            <div className={styles.relationshipInner}>
              <span className={styles.relationshipIcon}>{relData.icon}</span>
              <span className={`font-thai ${styles.relationshipLevel}`}>
                {relData.label}
              </span>
            </div>
          </div>
        </div>

        {/* Scene Summary */}
        {sceneSummary && (
          <div className="mt-6 px-5">
            <span className="section-label">สรุปเรื่องราว</span>
            <div className={`card ${styles.sceneSummaryCard}`}>
              <p className={`font-thai ${styles.sceneSummaryText}`}>
                {displayedSummary}
              </p>
              {isLongSummary && (
                <button
                  className={`font-thai ${styles.readMoreBtn}`}
                  onClick={() => setIsExpanded((prev) => !prev)}
                >
                  {isExpanded ? "ย่อ" : "อ่านเพิ่มเติม"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mt-6 px-5">
          <span className="section-label">สถิติ</span>
          <div className={styles.statsGrid}>
            <div className={`card ${styles.statCard}`}>
              <div className={styles.statIconWrapper}>💬</div>
              <div className={styles.statValue}>{session.message_count}</div>
              <div className={`font-thai ${styles.statLabel}`}>ข้อความทั้งหมด</div>
            </div>
            <div className={`card ${styles.statCard}`}>
              <div className={styles.statIconWrapper}>📅</div>
              <div className={`font-thai ${styles.statValue}`}>
                {formatDateShort(session.created_at)}
              </div>
              <div className={`font-thai ${styles.statLabel}`}>วันที่เริ่มต้น</div>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomBarInner}>
          <button
            className={`font-thai ${styles.endStoryBtn}`}
            onClick={handleEndStory}
            disabled={ending}
          >
            {ending ? "กำลังจบเรื่อง..." : "จบเรื่อง"}
          </button>
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirm && (
        <div className={styles.overlay} onClick={handleCancelConfirm}>
          <div
            className={styles.dialog}
            onClick={(e) => e.stopPropagation()}
          >
            <span className={styles.dialogIcon}>❓</span>
            <h3 className={styles.dialogTitle}>จบเรื่องราวนี้?</h3>
            <p className={`font-thai ${styles.dialogMessage}`}>
              เมื่อจบเรื่องแล้ว คุณจะไม่สามารถส่งข้อความในเรื่องนี้ได้อีก
              แต่ยังสามารถดูประวัติได้
            </p>
            <div className={styles.dialogButtons}>
              <button
                className={`font-thai ${styles.cancelBtn}`}
                onClick={handleCancelConfirm}
              >
                ยกเลิก
              </button>
              <button
                className={`font-thai ${styles.confirmBtn}`}
                onClick={handleConfirm}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {showSuccess && (
        <div className={styles.successOverlay}>
          <div className={styles.successCircle}>
            <span className={styles.successCheck}>✓</span>
          </div>
          <p className={styles.successText}>จบเรื่องราวเรียบร้อยแล้ว</p>
        </div>
      )}
    </div>
  );
}
