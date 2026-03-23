"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLiff } from "../providers/liff-provider";
import {
  fetchScenes,
  fetchTags,
  fetchCurrentSession,
  startSession,
  type SceneItem,
  type TagsData,
} from "@/app/lib/api";
import styles from "./scenes.module.css";

// ── Types (page-local) ─────────────────────────────────────

interface CurrentSessionSummary {
  id: string;
  character_name: string;
  character_avatar_url: string | null;
  scene_name: string;
}

type GenderFilter = "all" | "male" | "female";

// ── Category Definitions ──────────────────────────────────

const CATEGORY_ROWS: {
  key: string;
  label: string;
  filter: (s: SceneItem) => boolean;
  sortLatest?: boolean;
}[] = [
  { key: "popular", label: "🔥 ยอดนิยม", filter: () => true },
  {
    key: "tsundere",
    label: "💔 ซึนเดเระ — ปากร้ายแต่ใจดี",
    filter: (s) => s.character.personality_tags.includes("tsundere"),
  },
  {
    key: "cheerful",
    label: "☀️ สดใส เต็มพลัง",
    filter: (s) => s.character.personality_tags.includes("cheerful"),
  },
  {
    key: "mysterious",
    label: "🌙 ลึกลับ ชวนค้นหา",
    filter: (s) => s.character.personality_tags.includes("mysterious"),
  },
  {
    key: "caring",
    label: "🤍 อ่อนโยน ดูแลเธอเสมอ",
    filter: (s) => s.character.personality_tags.includes("caring"),
  },
  {
    key: "shy",
    label: "🦋 ขี้อาย แต่น่าค้นหา",
    filter: (s) => s.character.personality_tags.includes("shy"),
  },
  {
    key: "flirty",
    label: "✨ มีเสน่ห์ หยุดใจไม่อยู่",
    filter: (s) => s.character.personality_tags.includes("flirty"),
  },
  {
    key: "cool",
    label: "🖤 เท่ มีออร่า",
    filter: (s) => s.character.appearance_tags.includes("cool"),
  },
  {
    key: "latest",
    label: "✨ ใหม่ล่าสุด",
    filter: () => true,
    sortLatest: true,
  },
];

// ── Tag Map Builder ──────────────────────────────────────

function buildTagMap(tags: TagsData | null): Map<string, string> | null {
  if (!tags) return null;
  const map = new Map<string, string>();
  for (const t of tags.appearance) map.set(t.key, t.display_name);
  for (const t of tags.personality) map.set(t.key, t.display_name);
  return map;
}

// ── Page Component ──────────────────────────────────────

export default function ScenesPage() {
  const { liff, isReady, isLoggedIn, isInClient } = useLiff();

  const [scenes, setScenes] = useState<SceneItem[]>([]);
  const [tags, setTags] = useState<TagsData | null>(null);
  const [currentSession, setCurrentSession] =
    useState<CurrentSessionSummary | null>(null);
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [selectedScene, setSelectedScene] = useState<SceneItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Session start flow states
  const [showConfirmChange, setShowConfirmChange] = useState(false);
  const [startingSession, setStartingSession] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ── Data Fetching ────────────────────────────────────

  useEffect(() => {
    if (!isReady) return;

    async function loadData() {
      try {
        const [scenesData, tagsData, sessionData] = await Promise.all([
          fetchScenes(),
          fetchTags(),
          isLoggedIn
            ? fetchCurrentSession().then((r) => r.session)
            : Promise.resolve(null),
        ]);

        setScenes(scenesData);
        setTags(tagsData);
        if (sessionData) {
          setCurrentSession({
            id: sessionData.id,
            character_name: sessionData.character_name,
            character_avatar_url: sessionData.character_avatar_url,
            scene_name: sessionData.scene_name,
          });
        }
      } catch {
        setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isReady, isLoggedIn]);

  // ── Tag Map (O(1) lookups) ──────────────────────────

  const tagMap = useMemo(() => buildTagMap(tags), [tags]);

  // ── Filtered Categories ──────────────────────────────

  const filteredScenes = useMemo(() => {
    if (genderFilter === "all") return scenes;
    return scenes.filter((s) => s.character.gender === genderFilter);
  }, [scenes, genderFilter]);

  const categories = useMemo(() => {
    return CATEGORY_ROWS.map((row) => {
      let items = filteredScenes.filter(row.filter);
      if (row.sortLatest) {
        items = [...items].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      if (row.key === "popular") {
        items = items.slice(0, 12);
      }
      return { ...row, items };
    }).filter((row) => row.items.length > 0);
  }, [filteredScenes]);

  // ── Session Start Flow ───────────────────────────────

  const doStartSession = useCallback(async () => {
    if (!selectedScene || !liff) return;

    setStartingSession(true);
    setStartError(null);

    try {
      await startSession(selectedScene.id);

      if (isInClient) {
        liff.closeWindow();
      } else {
        setShowSuccess(true);
      }
    } catch (err) {
      setStartError(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
      );
    } finally {
      setStartingSession(false);
    }
  }, [selectedScene, liff, isInClient]);

  const handleStartSession = useCallback(async () => {
    if (!selectedScene || !liff) return;

    if (currentSession) {
      setShowConfirmChange(true);
      return;
    }

    await doStartSession();
  }, [selectedScene, liff, currentSession, doStartSession]);

  const handleConfirmChange = useCallback(() => {
    setShowConfirmChange(false);
    doStartSession();
  }, [doStartSession]);

  // ── Loading State ────────────────────────────────────

  if (!isReady || loading) {
    return (
      <div className="page-wrapper">
        <header className="page-header">
          <div className="header-inner">
            <h1 className="header-title">เลือกฉาก</h1>
          </div>
        </header>
        <div className={styles.genderToggle}>
          <div className={styles.genderPill}>
            {["ทั้งหมด", "ชาย", "หญิง"].map((label) => (
              <div key={label} className={styles.genderBtn}>
                {label}
              </div>
            ))}
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skeletonRow}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonTrack}>
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className={styles.skeletonCard}
                  style={{ animationDelay: `${j * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Error State ──────────────────────────────────────

  if (error) {
    return (
      <div className="page-wrapper">
        <header className="page-header">
          <div className="header-inner">
            <h1 className="header-title">เลือกฉาก</h1>
          </div>
        </header>
        <div className={styles.errorState}>
          <div className={styles.errorEmoji}>{"😿"}</div>
          <div className={styles.errorTitle}>โหลดข้อมูลไม่สำเร็จ</div>
          <div className={styles.errorText}>{error}</div>
          <button
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  // ── Success State (external browser) ────────────────

  if (showSuccess) {
    return (
      <div className={styles.successOverlay}>
        <div className={styles.successEmoji}>{"🎭"}</div>
        <div className={styles.successText}>เริ่มเรื่องราวแล้ว!</div>
        <div className={styles.successSub}>
          กรุณากลับไปที่ LINE เพื่อเริ่มแชท
        </div>
      </div>
    );
  }

  // ── Main Render ──────────────────────────────────────

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="page-header">
        <div className="header-inner">
          <h1 className="header-title">เลือกฉาก</h1>
        </div>
      </header>

      {/* Gender Toggle */}
      <div className={styles.genderToggle}>
        <div className={styles.genderPill}>
          {(
            [
              { value: "all", label: "ทั้งหมด" },
              { value: "male", label: "ชาย" },
              { value: "female", label: "หญิง" },
            ] as { value: GenderFilter; label: string }[]
          ).map(({ value, label }) => (
            <button
              key={value}
              className={`${styles.genderBtn} ${genderFilter === value ? styles.genderBtnActive : ""}`}
              onClick={() => setGenderFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero / Active Session */}
      <div className={styles.hero}>
        {currentSession ? (
          <div
            className={styles.sessionBanner}
            onClick={() => {
              if (isInClient && liff) liff.closeWindow();
            }}
          >
            {currentSession.character_avatar_url ? (
              <img
                className={styles.sessionAvatar}
                src={currentSession.character_avatar_url}
                alt={currentSession.character_name}
              />
            ) : null}
            <div className={styles.sessionInfo}>
              <div className={styles.sessionLabel}>กำลังเล่นอยู่</div>
              <div className={styles.sessionName}>
                {currentSession.character_name} &middot;{" "}
                {currentSession.scene_name}
              </div>
            </div>
            <div className={styles.sessionArrow}>{"›"}</div>
          </div>
        ) : (
          <div>
            <div className={styles.welcomeText}>เลือกฉากที่สนใจ</div>
            <div className={styles.welcomeSub}>
              แต่ละฉากคือเรื่องราวใหม่ กดเลือกแล้วเริ่มแชทได้เลย
            </div>
          </div>
        )}
      </div>

      {/* Category Rows */}
      {categories.map((category, idx) => (
        <div
          key={category.key}
          className={styles.categorySection}
          style={{ animationDelay: `${idx * 0.08}s` }}
        >
          <div className={styles.categoryHeader}>
            <div className={styles.categoryTitle}>{category.label}</div>
          </div>
          <div className={styles.scrollTrack}>
            {category.items.map((scene) => (
              <div
                key={`${category.key}-${scene.id}`}
                className={styles.sceneCard}
                onClick={() => {
                  setSelectedScene(scene);
                  setStartError(null);
                }}
              >
                {scene.image_url ? (
                  <img
                    className={styles.cardImage}
                    src={scene.image_url}
                    alt={scene.name}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.cardFallback}>{"🎭"}</div>
                )}
                <div className={styles.cardOverlay}>
                  <div className={styles.cardSceneName}>{scene.name}</div>
                  <div className={styles.cardCharName}>
                    {scene.character.name}
                  </div>
                </div>
                <div
                  className={`${styles.genderBadge} ${scene.character.gender === "male" ? styles.genderBadgeMale : styles.genderBadgeFemale}`}
                >
                  {scene.character.gender === "male" ? "ชาย" : "หญิง"}
                </div>
                {scene.character.personality_tags[0] ? (
                  <div className={styles.tagBadge}>
                    {tagMap?.get(scene.character.personality_tags[0]) ??
                      scene.character.personality_tags[0]}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className={styles.pageBottom} />

      {/* Bottom Sheet */}
      {selectedScene && (
        <>
          <div
            className={styles.sheetBackdrop}
            onClick={() => {
              if (!startingSession) setSelectedScene(null);
            }}
          />
          <div className={styles.sheetPanel}>
            <div className={styles.sheetHandle}>
              <div className={styles.sheetHandleBar} />
            </div>

            {selectedScene.image_url ? (
              <img
                className={styles.sheetImage}
                src={selectedScene.image_url}
                alt={selectedScene.name}
              />
            ) : null}

            <div className={styles.sheetBody}>
              <div className={styles.sheetCharName}>
                {selectedScene.character.name}
                <span
                  className={`${styles.sheetGenderBadge} ${selectedScene.character.gender === "male" ? styles.sheetGenderBadgeMale : styles.sheetGenderBadgeFemale}`}
                >
                  {selectedScene.character.gender === "male" ? "ชาย" : "หญิง"}
                </span>
              </div>
              <div className={styles.sheetSceneName}>{selectedScene.name}</div>

              {/* Preview */}
              <div className={styles.sheetSection}>
                <div className={styles.sheetSectionTitle}>ตัวอย่างบทเปิด</div>
                <div className={styles.previewBox}>
                  <div className={styles.previewNarrator}>
                    {selectedScene.opening_narrator}
                  </div>
                  <div className={styles.previewDialogue}>
                    &ldquo;{selectedScene.opening_dialogue}&rdquo;
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className={styles.sheetSection}>
                <div className={styles.sheetSectionTitle}>แท็กตัวละคร</div>
                <div className={styles.tagRow}>
                  {selectedScene.character.appearance_tags.map((tag) => (
                    <span
                      key={`a-${tag}`}
                      className={styles.sheetTagAppearance}
                    >
                      {tagMap?.get(tag) ?? tag}
                    </span>
                  ))}
                  {selectedScene.character.personality_tags.map((tag) => (
                    <span
                      key={`p-${tag}`}
                      className={styles.sheetTagPersonality}
                    >
                      {tagMap?.get(tag) ?? tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Scene Info */}
              <div className={styles.sheetSection}>
                <div className={styles.sheetSectionTitle}>ข้อมูลฉาก</div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>สถานที่</div>
                    <div className={styles.infoValue}>
                      {selectedScene.location}
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>อารมณ์</div>
                    <div className={styles.infoValue}>
                      {selectedScene.atmosphere_summary}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button
                className={styles.ctaButton}
                onClick={handleStartSession}
                disabled={startingSession}
              >
                {startingSession ? (
                  <>
                    <span className={styles.spinner} />
                    กำลังสร้างเรื่องราว...
                  </>
                ) : (
                  "เริ่มบทสนทนา"
                )}
              </button>

              {startError && (
                <div className={styles.sheetError}>{startError}</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Confirm Change Dialog */}
      {showConfirmChange && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalPanel}>
            <div className={styles.modalTitle}>
              เรื่องราวปัจจุบันจะจบลง
            </div>
            <div className={styles.modalText}>
              คุณกำลังคุยกับ &ldquo;{currentSession?.character_name}&rdquo; อยู่
              ถ้าเริ่มฉากใหม่ เรื่องเดิมจะจบลง
            </div>
            <div className={styles.modalButtons}>
              <button
                className={styles.modalBtnCancel}
                onClick={() => setShowConfirmChange(false)}
              >
                ยกเลิก
              </button>
              <button
                className={styles.modalBtnConfirm}
                onClick={handleConfirmChange}
              >
                เริ่มฉากใหม่
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
