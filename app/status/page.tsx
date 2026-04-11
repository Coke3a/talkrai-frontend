"use client";

import { useState, useEffect, useCallback } from "react";
import { useLiff } from "@/app/providers/liff-provider";
import {
  endSession,
  formatDateShort,
} from "@/app/lib/api";
import { useCurrentSession } from "@/app/lib/hooks";
import Image from "next/image";
import { PageHeader } from "../components/page-header";
import { LoadingState } from "../components/loading-state";
import { ErrorState } from "../components/error-state";
import { EmptyState } from "../components/empty-state";
import { SuccessOverlay } from "../components/success-overlay";
import { getMoodIcon, getRelationshipIcon } from "@/app/lib/icons";
import { MessageCircle, Calendar, MapPin, Clock, Inbox, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./status.module.css";

const RELATIONSHIP_ORDER = ["stranger", "acquaintance", "friend", "close_friend"];
function getRelationshipProgress(level: string): number {
  const idx = RELATIONSHIP_ORDER.indexOf(level);
  if (idx < 0) return 0;
  return ((idx + 1) / RELATIONSHIP_ORDER.length) * 100;
}

const MOOD_MAP: Record<string, {
  label: string;
  desc: string;
  backdropClass: string;
}> = {
  happy: {
    label: "มีความสุข",
    desc: "เธอรู้สึกดีขึ้น เมื่อได้อยู่กับคุณ",
    backdropClass: "moodBackdropHappy",
  },
  sad: {
    label: "เศร้า",
    desc: "เธอรู้สึกเศร้าใจอยู่",
    backdropClass: "moodBackdropSad",
  },
  angry: {
    label: "โกรธ",
    desc: "เธอรู้สึกหงุดหงิดอยู่",
    backdropClass: "moodBackdropAngry",
  },
  neutral: {
    label: "เฉยๆ",
    desc: "เธอรู้สึกเฉยๆ",
    backdropClass: "moodBackdropNeutral",
  },
  excited: {
    label: "ตื่นเต้น",
    desc: "เธอรู้สึกตื่นเต้นมาก",
    backdropClass: "moodBackdropExcited",
  },
  shy: {
    label: "อาย",
    desc: "เธอรู้สึกเขินอาย",
    backdropClass: "moodBackdropShy",
  },
  playful: {
    label: "ขี้เล่น",
    desc: "เธออารมณ์ดี อยากเล่นสนุก",
    backdropClass: "moodBackdropHappy",
  },
  serious: {
    label: "จริงจัง",
    desc: "เธอรู้สึกจริงจังอยู่",
    backdropClass: "moodBackdropNeutral",
  },
  worried: {
    label: "เป็นห่วง",
    desc: "เธอรู้สึกกังวลอยู่",
    backdropClass: "moodBackdropSad",
  },
};

const RELATIONSHIP_MAP: Record<string, { label: string }> = {
  stranger: { label: "คนแปลกหน้า" },
  acquaintance: { label: "คนรู้จัก" },
  friend: { label: "เพื่อน" },
  close_friend: { label: "เพื่อนสนิท" },
};

const SUMMARY_COLLAPSE_THRESHOLD = 80;

export default function StatusPage() {
  const { isReady, liff, liffError, isInClient, isLoggedIn, login } = useLiff();

  const enabled = isReady && isLoggedIn && !!liff && !liffError;
  const { data: sessionData, error: sessionError, mutate: mutateSession } = useCurrentSession(enabled);

  const session = sessionData?.session ?? null;
  const loading = enabled && !sessionData && !sessionError;
  const [actionError, setActionError] = useState<string | null>(null);
  const error = sessionError?.message || actionError || null;

  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ending, setEnding] = useState(false);

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
        mutateSession({ session: null }, false);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setEnding(false);
    }
  }, [isInClient, liff, mutateSession]);

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
    return <LoadingState title="สถานะเรื่องราว" />;
  }

  if (liffError || error) {
    return (
      <ErrorState
        headerTitle="สถานะเรื่องราว"
        message={(liffError || error)!}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="page-wrapper">
        <PageHeader title="สถานะเรื่องราว" />
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="text-center">
            <p className="font-thai text-base" style={{ color: "var(--gray-500)", marginBottom: 16 }}>
              กรุณาเข้าสู่ระบบเพื่อดูสถานะเรื่องราว
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

  if (!session) {
    return (
      <div className="page-wrapper">
        <PageHeader title="สถานะเรื่องราว" />
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <EmptyState
            icon={Inbox}
            title="ยังไม่มีเรื่องราว"
            subtitle="เลือกเรื่องที่ชอบแล้วเริ่มแชทกับตัวละครได้เลย!"
          />
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
    session.scene_image_url ??
    `https://api.dicebear.com/9.x/adventurer/svg?seed=${session.scene_name}&backgroundColor=b6e3f4&scale=110`;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <PageHeader title="สถานะเรื่องราว" />

      {/* Main Content */}
      <main className="pb-28">
        {/* Character Hero */}
        <section className={styles.heroSection}>
          <div className={styles.heroImageWrapper}>
            <Image
              src={imageUrl}
              alt={session.character_name}
              className={styles.heroImage}
              fill
              sizes="540px"
              unoptimized={imageUrl.includes("dicebear")}
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
                  <MapPin size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 2 }} /> {session.current_location}
                </span>
              ) : null}
              {session.scene_time ? (
                <span className={`font-thai ${styles.badge}`}>
                  <Clock size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 2 }} /> {session.scene_time}
                </span>
              ) : null}
            </div>
          </div>
        </section>

        {/* Mood Section */}
        <motion.div
          className="mt-8 px-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <span className="section-label">อารมณ์</span>
          <div className={`card ${styles.moodCard}`}>
            <div className={styles.moodInner}>
              <div
                className={`${styles.moodBackdrop} ${styles[moodData.backdropClass]}`}
                style={{ animation: "bobFloat 3s ease-in-out infinite" }}
              >
                {(() => {
                  const MoodIcon = getMoodIcon(session.mood);
                  return <MoodIcon size={24} />;
                })()}
              </div>
              <div>
                <div className={styles.moodLabel}>{moodData.label}</div>
                <div className={`font-thai ${styles.moodDesc}`}>
                  {moodData.desc}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Relationship Level */}
        <motion.div
          className="mt-6 px-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <span className="section-label">ความสัมพันธ์</span>
          <div className={`card ${styles.relationshipCard}`}>
            <div className={styles.relationshipInner}>
              {(() => {
                const RelIcon = getRelationshipIcon(session.relationship_level);
                return (
                  <span className={styles.relationshipIcon}>
                    <RelIcon size={22} />
                  </span>
                );
              })()}
              <span className={`font-thai ${styles.relationshipLevel}`}>
                {relData.label}
              </span>
            </div>
            {/* Progress bar */}
            <div className={styles.progressTrack}>
              <motion.div
                className={styles.progressFill}
                initial={{ width: 0 }}
                animate={{ width: `${getRelationshipProgress(session.relationship_level)}%` }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              />
              <div className={styles.progressLabels}>
                {RELATIONSHIP_ORDER.map((level) => (
                  <span
                    key={level}
                    className={styles.progressDot}
                    style={{
                      left: `${((RELATIONSHIP_ORDER.indexOf(level) + 1) / RELATIONSHIP_ORDER.length) * 100}%`,
                      background: RELATIONSHIP_ORDER.indexOf(level) < RELATIONSHIP_ORDER.indexOf(session.relationship_level) + 1
                        ? "var(--coral-500)"
                        : "var(--gray-300)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

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
              <div className={styles.statIconWrapper}><MessageCircle size={20} color="var(--coral-500)" /></div>
              <div className={styles.statValue}>{session.message_count}</div>
              <div className={`font-thai ${styles.statLabel}`}>ข้อความทั้งหมด</div>
            </div>
            <div className={`card ${styles.statCard}`}>
              <div className={styles.statIconWrapper}><Calendar size={20} color="var(--coral-500)" /></div>
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
            <div className={styles.dialogIcon} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', background: 'var(--coral-50)' }}>
              <HelpCircle size={28} color="var(--coral-500)" />
            </div>
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
        <SuccessOverlay
          title="จบเรื่องราวเรียบร้อยแล้ว"
          subtitle="คุณสามารถเลือกเรื่องใหม่ได้ตลอดเวลา"
          showLineButton={!isInClient}
        />
      )}
    </div>
  );
}
