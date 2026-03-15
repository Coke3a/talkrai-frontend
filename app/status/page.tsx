"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./status.module.css";

// Mock data
const MOCK_DATA = {
  character: {
    name: "มิโอะ",
    scene: "คาเฟ่ริมทาง",
    location: "คาเฟ่เล็กๆ ย่านเมืองเก่า",
    time: "บ่ายแก่ๆ ช่วงแดดอ่อน",
    imageUrl:
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Mio&backgroundColor=ffd5dc&scale=110",
  },
  mood: "happy" as const,
  relationship_level: "friend" as const,
  message_count: 67,
  start_date: "1 มี.ค. 2025",
  scene_summary:
    "คุณกับมิโอะนั่งคุยกันที่คาเฟ่ริมทาง เธอเล่าเรื่องวัยเด็กให้ฟังพร้อมรอยยิ้มอบอุ่น คุณสั่งกาแฟให้เธอแก้วที่สอง เธอรู้สึกดีใจและเริ่มเปิดใจเล่าเรื่องราวต่างๆ ให้คุณฟังมากขึ้น บรรยากาศรอบข้างเงียบสงบ มีเสียงเพลงแจ๊สเบาๆ คลอเป็นพื้นหลัง",
};

const MOOD_MAP = {
  happy: {
    emoji: "😊",
    label: "มีความสุข",
    desc: "เธอรู้สึกดีขึ้น เมื่อได้อยู่กับคุณ",
    backdropClass: "moodBackdropHappy" as const,
  },
  sad: {
    emoji: "😢",
    label: "เศร้า",
    desc: "เธอรู้สึกเศร้าใจอยู่",
    backdropClass: "moodBackdropSad" as const,
  },
  angry: {
    emoji: "😠",
    label: "โกรธ",
    desc: "เธอรู้สึกหงุดหงิดอยู่",
    backdropClass: "moodBackdropAngry" as const,
  },
  neutral: {
    emoji: "😐",
    label: "เฉยๆ",
    desc: "เธอรู้สึกเฉยๆ",
    backdropClass: "moodBackdropNeutral" as const,
  },
  excited: {
    emoji: "🤩",
    label: "ตื่นเต้น",
    desc: "เธอรู้สึกตื่นเต้นมาก",
    backdropClass: "moodBackdropExcited" as const,
  },
  shy: {
    emoji: "😳",
    label: "อาย",
    desc: "เธอรู้สึกเขินอาย",
    backdropClass: "moodBackdropShy" as const,
  },
};

const RELATIONSHIP_MAP = {
  stranger: { icon: "🤝", label: "คนแปลกหน้า" },
  acquaintance: { icon: "👋", label: "คนรู้จัก" },
  friend: { icon: "💚", label: "เพื่อน" },
  close_friend: { icon: "💛", label: "เพื่อนสนิท" },
  best_friend: { icon: "❤️", label: "เพื่อนรัก" },
};

const SUMMARY_COLLAPSE_THRESHOLD = 80;

export default function StatusPage() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    character,
    mood: moodKey,
    relationship_level: relKey,
    message_count,
    start_date,
    scene_summary,
  } = MOCK_DATA;

  const moodData = MOOD_MAP[moodKey];
  const relData = RELATIONSHIP_MAP[relKey];
  const isLongSummary = scene_summary.length > SUMMARY_COLLAPSE_THRESHOLD;
  const displayedSummary =
    !isLongSummary || isExpanded
      ? scene_summary
      : scene_summary.slice(0, SUMMARY_COLLAPSE_THRESHOLD) + "...";

  const handleEndStory = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const handleConfirm = useCallback(() => {
    setShowConfirm(false);
    setShowSuccess(true);
  }, []);

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
              src={character.imageUrl}
              alt={character.name}
              className={styles.heroImage}
            />
            <div className={styles.heroGradient} />
          </div>
          <div className={styles.heroInfo}>
            <h2 className={styles.characterName}>{character.name}</h2>
            <p className={`font-thai ${styles.sceneName}`}>
              {character.scene}
            </p>
            <div className={styles.badgeRow}>
              <span className={`font-thai ${styles.badge}`}>
                📍 {character.location}
              </span>
              <span className={`font-thai ${styles.badge}`}>
                🕐 {character.time}
              </span>
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

        {/* Stats Grid */}
        <div className="mt-6 px-5">
          <span className="section-label">สถิติ</span>
          <div className={styles.statsGrid}>
            <div className={`card ${styles.statCard}`}>
              <div className={styles.statIconWrapper}>💬</div>
              <div className={styles.statValue}>{message_count}</div>
              <div className={`font-thai ${styles.statLabel}`}>ข้อความทั้งหมด</div>
            </div>
            <div className={`card ${styles.statCard}`}>
              <div className={styles.statIconWrapper}>📅</div>
              <div className={`font-thai ${styles.statValue}`}>{start_date}</div>
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
          >
            จบเรื่อง
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
