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
import { PageHeader } from "../components/page-header";
import { ErrorState } from "../components/error-state";
import { SuccessOverlay } from "../components/success-overlay";
import { getCategoryIcon } from "@/app/lib/icons";
import { ImageOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  { key: "popular", label: "ยอดนิยม", filter: () => true },
  {
    key: "tsundere",
    label: "ซึนเดเระ — ปากร้ายแต่ใจดี",
    filter: (s) => s.character.personality_tags.includes("tsundere"),
  },
  {
    key: "cheerful",
    label: "สดใส เต็มพลัง",
    filter: (s) => s.character.personality_tags.includes("cheerful"),
  },
  {
    key: "mysterious",
    label: "ลึกลับ ชวนค้นหา",
    filter: (s) => s.character.personality_tags.includes("mysterious"),
  },
  {
    key: "caring",
    label: "อ่อนโยน ดูแลเธอเสมอ",
    filter: (s) => s.character.personality_tags.includes("caring"),
  },
  {
    key: "shy",
    label: "ขี้อาย แต่น่าค้นหา",
    filter: (s) => s.character.personality_tags.includes("shy"),
  },
  {
    key: "flirty",
    label: "มีเสน่ห์ หยุดใจไม่อยู่",
    filter: (s) => s.character.personality_tags.includes("flirty"),
  },
  {
    key: "cool",
    label: "เท่ มีออร่า",
    filter: (s) => s.character.appearance_tags.includes("cool"),
  },
  {
    key: "latest",
    label: "ใหม่ล่าสุด",
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

  // Bottom sheet detail states
  const [expandedPersonality, setExpandedPersonality] = useState(false);
  const [expandedBackground, setExpandedBackground] = useState(false);
  const [openingPreviewOpen, setOpeningPreviewOpen] = useState(false);

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
        <PageHeader title="เลือกฉาก" />
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
      <ErrorState
        headerTitle="เลือกฉาก"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // ── Success State (external browser) ────────────────

  if (showSuccess) {
    return (
      <SuccessOverlay
        title="เริ่มเรื่องราวแล้ว!"
        subtitle="กรุณากลับไปที่ LINE เพื่อเริ่มแชท"
        showLineButton
      />
    );
  }

  // ── Main Render ──────────────────────────────────────

  return (
    <div className="page-wrapper">
      {/* Header */}
      <PageHeader title="เลือกฉาก" />

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
            <div className={styles.categoryTitle}>
              {(() => {
                const Icon = getCategoryIcon(category.key);
                return <Icon size={16} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6, opacity: 0.75 }} />;
              })()}
              {category.label}
            </div>
          </div>
          <div className={styles.scrollTrack}>
            {category.items.map((scene) => (
              <div
                key={`${category.key}-${scene.id}`}
                className={styles.sceneCard}
                onClick={() => {
                  setSelectedScene(scene);
                  setStartError(null);
                  setExpandedPersonality(false);
                  setExpandedBackground(false);
                  setOpeningPreviewOpen(false);
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
                  <div className={styles.cardFallback}><ImageOff size={32} color="var(--gray-300)" /></div>
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
      <AnimatePresence>
      {selectedScene && (
        <>
          <motion.div
            className={styles.sheetBackdrop}
            onClick={() => {
              if (!startingSession) setSelectedScene(null);
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className={styles.sheetPanel}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <div className={styles.sheetHandle}>
              <div className={styles.sheetHandleBar} />
            </div>

            {/* Hero with avatar overlay */}
            <div className={styles.sheetHero}>
              {selectedScene.image_url ? (
                <img
                  className={styles.sheetImage}
                  src={selectedScene.image_url}
                  alt={selectedScene.name}
                />
              ) : null}
              {selectedScene.character.avatar_url ? (
                <img
                  className={styles.sheetAvatarOverlay}
                  src={selectedScene.character.avatar_url}
                  alt={selectedScene.character.name}
                />
              ) : null}
            </div>

            <div className={styles.sheetBody}>
              {/* Character Header */}
              <div className={styles.sheetCharHeader}>
                <div className={styles.sheetCharName}>
                  {selectedScene.character.name}
                  <span
                    className={`${styles.sheetGenderBadge} ${selectedScene.character.gender === "male" ? styles.sheetGenderBadgeMale : styles.sheetGenderBadgeFemale}`}
                  >
                    {selectedScene.character.gender === "male" ? "ชาย" : "หญิง"}
                  </span>
                </div>
                <div className={styles.sheetCharTags}>
                  {selectedScene.character.personality_tags.map((tag) => (
                    <span
                      key={`p-${tag}`}
                      className={styles.sheetTagPersonality}
                    >
                      {tagMap?.get(tag) ?? tag}
                    </span>
                  ))}
                  {selectedScene.character.appearance_tags.map((tag) => (
                    <span
                      key={`a-${tag}`}
                      className={styles.sheetTagAppearance}
                    >
                      {tagMap?.get(tag) ?? tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Character Essence Card */}
              <div className={styles.essenceCard}>
                {selectedScene.character.personality && (
                  <div className={styles.essenceRow}>
                    <div className={styles.essenceIcon}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 1l1.796 4.858L15 6.5l-3.8 3.142L12.392 15 8 12.2 3.608 15l1.192-5.358L1 6.5l5.204-.642L8 1z" fill="currentColor" opacity="0.85"/>
                      </svg>
                    </div>
                    <div className={styles.essenceContent}>
                      <div className={styles.essenceLabel}>บุคลิกภาพ</div>
                      <div
                        className={`${styles.essenceText} ${expandedPersonality ? styles.essenceTextExpanded : ""}`}
                      >
                        {selectedScene.character.personality}
                      </div>
                      {selectedScene.character.personality.length > 80 && (
                        <button
                          className={styles.essenceToggle}
                          onClick={() =>
                            setExpandedPersonality(!expandedPersonality)
                          }
                        >
                          {expandedPersonality ? "ย่อ" : "อ่านเพิ่ม"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {selectedScene.character.background && (
                  <div className={styles.essenceRow}>
                    <div className={styles.essenceIcon}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 2.5A1.5 1.5 0 013.5 1h4.379a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0112.5 5.62V13.5A1.5 1.5 0 0111 15H3.5A1.5 1.5 0 012 13.5v-11zM4.5 8a.5.5 0 000 1h5a.5.5 0 000-1h-5zm0 2.5a.5.5 0 000 1h5a.5.5 0 000-1h-5z" fill="currentColor" opacity="0.85"/>
                      </svg>
                    </div>
                    <div className={styles.essenceContent}>
                      <div className={styles.essenceLabel}>ภูมิหลัง</div>
                      <div
                        className={`${styles.essenceText} ${expandedBackground ? styles.essenceTextExpanded : ""}`}
                      >
                        {selectedScene.character.background}
                      </div>
                      {selectedScene.character.background.length > 80 && (
                        <button
                          className={styles.essenceToggle}
                          onClick={() =>
                            setExpandedBackground(!expandedBackground)
                          }
                        >
                          {expandedBackground ? "ย่อ" : "อ่านเพิ่ม"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Scene Context Card */}
              <div className={styles.sceneContextCard}>
                <div className={styles.sceneContextName}>
                  {selectedScene.name}
                </div>
                <div className={styles.sceneContextMeta}>
                  <span>{selectedScene.location}</span>
                  <span className={styles.sceneContextDot}>&middot;</span>
                  <span>{selectedScene.atmosphere_summary}</span>
                </div>
              </div>

              {/* Opening Preview (collapsible) */}
              <div className={styles.sheetSection}>
                <button
                  className={styles.sheetSectionToggle}
                  onClick={() => setOpeningPreviewOpen(!openingPreviewOpen)}
                >
                  <span className={styles.sheetSectionTitle}>
                    ตัวอย่างบทเปิด
                  </span>
                  <svg
                    className={`${styles.chevronIcon} ${openingPreviewOpen ? styles.chevronOpen : ""}`}
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M3.5 5.25L7 8.75L10.5 5.25"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {openingPreviewOpen && (
                  <div className={styles.previewBox}>
                    <div className={styles.previewNarrator}>
                      {selectedScene.opening_narrator}
                    </div>
                    <div className={styles.previewDialogue}>
                      &ldquo;{selectedScene.opening_dialogue}&rdquo;
                    </div>
                  </div>
                )}
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
          </motion.div>
        </>
      )}
      </AnimatePresence>

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
