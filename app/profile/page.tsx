"use client";

import { useEffect, useState } from "react";
import { useLiff } from "@/app/providers/liff-provider";
import { fetchProfile, type ProfileStats } from "@/app/lib/api";
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
  const { isReady, liffError, liff } = useLiff();
  const [lineProfile, setLineProfile] = useState<LineProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || !liff || liffError) return;

    const loadData = async () => {
      try {
        const [profile, profileStats] = await Promise.all([
          liff.getProfile(),
          fetchProfile(),
        ]);

        setLineProfile({
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
        });
        setStats(profileStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      }
    };

    loadData();
  }, [isReady, liff, liffError]);

  if (!isReady || (!lineProfile && !error && !liffError)) {
    return (
      <div className="page-wrapper">
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="mb-3 text-4xl">👤</div>
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

  const displayName = lineProfile?.displayName ?? "User";
  const pictureUrl =
    lineProfile?.pictureUrl ??
    `https://api.dicebear.com/9.x/adventurer/svg?seed=${displayName}`;
  const createdAt = stats?.created_at ?? new Date().toISOString();
  const totalSessions = stats?.total_sessions ?? 0;
  const totalMessages = stats?.total_messages ?? 0;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="page-header">
        <div className="header-inner">
          <h1 className="header-title">โปรไฟล์</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 pt-5 pb-12">
        {/* Profile Hero */}
        <section
          className={styles.hero}
          style={{
            background:
              "linear-gradient(135deg, var(--coral-500) 0%, var(--coral-400) 25%, var(--lavender-500) 100%)",
          }}
        >
          <div className={styles.heroDecorativeCircle} />

          <div className="relative z-10">
            {/* Avatar */}
            <div className={styles.avatarWrapper}>
              <div className={styles.avatarRing} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pictureUrl}
                alt={displayName}
                className={styles.avatar}
              />
            </div>

            <h2 className={styles.displayName}>{displayName}</h2>
            <p className={styles.memberSince}>
              Member since {formatMemberSince(createdAt)}
            </p>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="mb-6 mt-6">
          <span className="section-label">สถิติของคุณ</span>
          <div className={styles.statsGrid}>
            <div className={`card ${styles.statCard}`}>
              <div
                className={`${styles.statIconWrapper} ${styles.statIconCoral}`}
              >
                📖
              </div>
              <div className={styles.statValue}>{totalSessions}</div>
              <div className={styles.statLabel}>เรื่องราวทั้งหมด</div>
            </div>

            <div className={`card ${styles.statCard}`}>
              <div
                className={`${styles.statIconWrapper} ${styles.statIconLavender}`}
              >
                💬
              </div>
              <div className={styles.statValue}>{totalMessages}</div>
              <div className={styles.statLabel}>ข้อความ</div>
            </div>
          </div>
        </div>

        {/* LINE Status */}
        <div className="mb-6">
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
        </div>

        {/* Gratitude Card */}
        <div
          className={styles.gratitudeCard}
          style={{
            background:
              "linear-gradient(135deg, var(--coral-500) 0%, var(--coral-400) 25%, var(--lavender-500) 100%)",
          }}
        >
          <span className={styles.gratitudeIcon}>✨</span>
          <h3 className={styles.gratitudeTitle}>
            ขอบคุณที่เป็นส่วนหนึ่งของ TalkRai!
          </h3>
          <p className={`font-thai ${styles.gratitudeText}`}>
            ขอบคุณที่เป็นส่วนหนึ่งของ TalkRai
          </p>
        </div>
      </main>
    </div>
  );
}
