"use client";

import { useCallback, useMemo, useState } from "react";
import { useLiff } from "../providers/liff-provider";
import {
  startSession,
  isUserInactiveError,
  type SceneItem,
  type TagsData,
} from "@/app/lib/api";
import { useScenes, useTags, useCurrentSession } from "@/app/lib/hooks";
import Image from "next/image";
import { PageHeader } from "../components/page-header";
import { ErrorState } from "../components/error-state";
import { InactiveUserState } from "../components/inactive-user-state";
import { SuccessOverlay } from "../components/success-overlay";
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

// ── Dialogue block parser ──────────────────────────────────

type DialogueBlock = { type: "narration" | "dialogue"; text: string };

function parseDialogueBlocks(text: string): DialogueBlock[] {
  const blocks: DialogueBlock[] = [];
  let buffer = "";
  let inNarration = false;
  let inQuote = false;

  for (const ch of text) {
    if (ch === "*" && !inQuote) {
      const trimmed = buffer.trim();
      if (trimmed)
        blocks.push({ type: inNarration ? "narration" : "dialogue", text: trimmed });
      buffer = "";
      inNarration = !inNarration;
    } else if (ch === '"' && !inNarration) {
      inQuote = !inQuote;
      buffer += ch;
    } else {
      buffer += ch;
    }
  }

  const remaining = buffer.trim();
  if (remaining)
    blocks.push({ type: inNarration ? "narration" : "dialogue", text: remaining });
  if (blocks.length === 0 && text.trim())
    blocks.push({ type: "dialogue", text: text.trim() });
  return blocks;
}

// ── Tag Taglines & Colors ──────────────────────────────────

// Midnight Theatre: a single champagne-gold accent, with ember-rose reserved
// (sparingly) for the affectionate/romance archetypes. See /DESIGN.md.
const ACCENT_GOLD = "var(--color-gold-400)";
const ACCENT_ROSE = "var(--color-rose-400)";

const TAG_TAGLINES: Record<string, { tagline: string; color: string }> = {
  tsundere: { tagline: "ปากไม่ตรงกับใจ", color: ACCENT_GOLD },
  cheerful: { tagline: "ยิ้มทั้งวัน หัวเราะทั้งคืน", color: ACCENT_GOLD },
  caring: { tagline: "คนที่จะดูแลเธอเสมอ", color: ACCENT_ROSE },
  mysterious: { tagline: "รู้ทุกอย่าง แต่ไม่บอกสักคำ", color: ACCENT_GOLD },
  shy: { tagline: "แก้มแดงง่ายกว่าที่คิด", color: ACCENT_GOLD },
  confident: { tagline: "ไม่แคร์สายตาใคร", color: ACCENT_GOLD },
  flirty: { tagline: "หยุดใจไม่อยู่ ถอนตัวไม่ทัน", color: ACCENT_ROSE },
  serious: { tagline: "จริงจัง ไม่เล่นๆ", color: ACCENT_GOLD },
  sensitive: { tagline: "หัวใจบาง รู้สึกลึกกว่าใคร", color: ACCENT_GOLD },
  cute: { tagline: "น่ารักจนต้องมองซ้ำ", color: ACCENT_ROSE },
  cool: { tagline: "เท่จนใจสั่น", color: ACCENT_GOLD },
  elegant: { tagline: "สง่างาม ดูแพงทุกมุม", color: ACCENT_GOLD },
  sporty: { tagline: "พลังเหลือเฟือ หัวใจนักสู้", color: ACCENT_GOLD },
  gentle_look: { tagline: "อ่อนโยนจนใจละลาย", color: ACCENT_ROSE },
  wild: { tagline: "อันตราย แต่เสน่ห์แรง", color: ACCENT_GOLD },
  intellectual: { tagline: "ฉลาดจนน่าหลงใหล", color: ACCENT_GOLD },
};

// ── Atmosphere Mood Labels ─────────────────────────────────

// Mood chips render as dark tinted pills (accent text + hairline) built from
// the accent below — no light pastel fills (Midnight Theatre, see /DESIGN.md).
const ATMOSPHERE_MOOD_LABELS: Record<
  string,
  { label: string; accent: string }
> = {
  romantic:    { label: "โรแมนติก",  accent: ACCENT_ROSE },
  cozy:        { label: "อบอุ่นใจ",   accent: ACCENT_ROSE },
  tense:       { label: "ตึงเครียด",  accent: ACCENT_GOLD },
  mysterious:  { label: "ลึกลับ",     accent: ACCENT_GOLD },
  playful:     { label: "สนุกสนาน",  accent: ACCENT_GOLD },
  melancholic: { label: "เศร้าหมอง", accent: ACCENT_GOLD },
  exciting:    { label: "ตื่นเต้น",   accent: ACCENT_ROSE },
};

function parseAtmosphereSummary(summary: string): {
  mood: string | null;
  tags: string[];
} {
  const dashIdx = summary.indexOf(" \u2014 ");
  if (dashIdx !== -1) {
    const mood = summary.slice(0, dashIdx).trim();
    const tags = summary
      .slice(dashIdx + 3)
      .split(", ")
      .map((t) => t.trim())
      .filter(Boolean);
    return { mood, tags };
  }
  if (summary.trim() in ATMOSPHERE_MOOD_LABELS) {
    return { mood: summary.trim(), tags: [] };
  }
  return { mood: null, tags: summary ? [summary] : [] };
}

const WELCOME_MESSAGES: { text: string; sub: string }[] = [
  {
    text: "วันนี้อยากคุยกับใคร?",
    sub: "เลือกคนที่สนใจ แล้วเริ่มบทสนทนาที่ไม่เหมือนใคร",
  },
  {
    text: "พร้อมเจอคนใหม่ไหม?",
    sub: "ทุกการพบกันคือจุดเริ่มต้นของเรื่องราว",
  },
  {
    text: "ใครจะมาเติมเต็มวันนี้ของเธอ?",
    sub: "แต่ละตัวละครมีชีวิตเป็นของตัวเอง กดเลือกเลย",
  },
  {
    text: "เรื่องราวดีๆ กำลังรอเธออยู่",
    sub: "บทสนทนาที่จะเกิดขึ้น ขึ้นอยู่กับเธอ",
  },
  {
    text: "ตัวละครใหม่ เรื่องราวใหม่",
    sub: "ทุกฉากเขียนขึ้นมาเพื่อเธอ",
  },
];

interface Section {
  key: string;
  title: string;
  color: string;
  items: SceneItem[];
}

function dateSeed(): number {
  const d = new Date().toISOString().slice(0, 10);
  let h = 0;
  for (let i = 0; i < d.length; i++) h = (h * 31 + d.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  let s = seed;
  const rng = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

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
  const { liff, isReady, isLoggedIn, isInClient, login } = useLiff();

  const enabled = isReady && isLoggedIn;
  const { data: scenes = [], error: scenesError } = useScenes(enabled);
  const { data: tags, error: tagsError } = useTags(enabled);
  const { data: sessionData, error: sessionError } = useCurrentSession(enabled);

  const loading = enabled && !scenes.length && !scenesError;
  const error = scenesError?.message || tagsError?.message || sessionError?.message || null;

  const currentSession = useMemo<CurrentSessionSummary | null>(() => {
    const s = sessionData?.session;
    if (!s) return null;
    return {
      id: s.id,
      character_name: s.character_name,
      character_avatar_url: s.character_avatar_url,
      scene_name: s.scene_name,
    };
  }, [sessionData]);

  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [selectedScene, setSelectedScene] = useState<SceneItem | null>(null);

  // Session start flow states
  const [showConfirmChange, setShowConfirmChange] = useState(false);
  const [startingSession, setStartingSession] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Latest section load-more
  const [latestLimit, setLatestLimit] = useState(20);

  // Bottom sheet detail states
  const [expandedPersonality, setExpandedPersonality] = useState(false);
  const [expandedBackground, setExpandedBackground] = useState(false);
  const [openingPreviewOpen, setOpeningPreviewOpen] = useState(false);

  // ── Tag Map (O(1) lookups) ──────────────────────────

  const tagMap = useMemo(() => buildTagMap(tags ?? null), [tags]);

  // ── Filtered Categories ──────────────────────────────

  const filteredScenes = useMemo(() => {
    if (genderFilter === "all") return scenes;
    return scenes.filter((s) => s.character.gender === genderFilter);
  }, [scenes, genderFilter]);

  // ── Daily Welcome Message ────────────────────────────

  const welcomeMsg = useMemo(() => {
    const seed = dateSeed();
    return WELCOME_MESSAGES[seed % WELCOME_MESSAGES.length];
  }, []);

  // ── Sections (popular + 4 tag sections + latest) ─────

  const sections = useMemo(() => {
    const seed = dateSeed();
    const result: Section[] = [];
    const usedIds = new Set<string>();

    // 1. ยอดฮิต — seeded-random (real popularity logic later)
    const popular = seededShuffle(filteredScenes, seed).slice(0, 8);
    if (popular.length > 0) {
      result.push({
        key: "popular",
        title: "ยอดฮิต",
        color: "var(--coral-500)",
        items: popular,
      });
      for (const s of popular) usedIds.add(s.id);
    }

    // 2. 4 random tag sections — exclude already-shown characters
    const allTagKeys = seededShuffle(Object.keys(TAG_TAGLINES), seed + 1);
    let tagCount = 0;

    for (const tagKey of allTagKeys) {
      if (tagCount >= 4) break;

      const matching = filteredScenes.filter(
        (s) =>
          !usedIds.has(s.id) &&
          (s.character.personality_tags.includes(tagKey) ||
            s.character.appearance_tags.includes(tagKey))
      );

      if (matching.length < 2) continue;

      const items = seededShuffle(matching, seed + tagCount + 2).slice(0, 6);
      const tagInfo = TAG_TAGLINES[tagKey];
      result.push({
        key: tagKey,
        title: tagInfo.tagline,
        color: tagInfo.color,
        items,
      });
      for (const s of items) usedIds.add(s.id);
      tagCount++;
    }

    // 3. ล่าสุด — all scenes sorted by newest (full list, sliced in JSX)
    const latest = [...filteredScenes].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    if (latest.length > 0) {
      result.push({
        key: "latest",
        title: "ล่าสุด",
        color: "var(--gray-600)",
        items: latest,
      });
    }

    return result;
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
        <PageHeader title="ค้นหาเรื่องราว" />
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
          <div key={i} className={styles.skeletonSection}>
            <div className={styles.skeletonSectionTitle} />
            <div className={styles.skeletonScrollTrack}>
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className={styles.skeletonScrollCard}
                  style={{ animationDelay: `${(i * 4 + j) * 0.06}s` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Error State ──────────────────────────────────────

  if ([scenesError, tagsError, sessionError].some(isUserInactiveError)) {
    return <InactiveUserState headerTitle="เลือกฉาก" />;
  }

  if (error) {
    return (
      <ErrorState
        headerTitle="เลือกฉาก"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // ── Not Logged In ────────────────────────────────────

  if (!isLoggedIn) {
    return (
      <div className="page-wrapper">
        <PageHeader title="ค้นหาเรื่องราว" />
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="text-center">
            <p className="font-thai text-base" style={{ color: "var(--gray-500)", marginBottom: 16 }}>
              กรุณาเข้าสู่ระบบเพื่อดูฉากทั้งหมด
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
      <PageHeader title="ค้นหาเรื่องราว" />

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
              <Image
                className={styles.sessionAvatar}
                src={currentSession.character_avatar_url}
                alt={currentSession.character_name}
                width={44}
                height={44}
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
            <div className={styles.welcomeText}>{welcomeMsg.text}</div>
            <div className={styles.welcomeSub}>{welcomeMsg.sub}</div>
          </div>
        )}
      </div>

      {/* Sections */}
      {sections.map((section, idx) => {
        const isGrid = section.key === "latest";
        const cardClass = isGrid ? styles.gridCard : styles.scrollCard;
        const displayItems = isGrid
          ? section.items.slice(0, latestLimit)
          : section.items;
        const hasMore = isGrid && section.items.length > latestLimit;

        return (
          <div
            key={section.key}
            className={styles.section}
            style={{ animationDelay: `${idx * 0.08}s` }}
          >
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>
                {section.title}
              </span>
            </div>
            <div
              className={
                isGrid ? styles.characterGrid : styles.scrollTrack
              }
            >
              {displayItems.map((scene) => (
                <div
                  key={`${section.key}-${scene.id}`}
                  className={cardClass}
                  onClick={() => {
                    setSelectedScene(scene);
                    setStartError(null);
                    setExpandedPersonality(false);
                    setExpandedBackground(false);
                    setOpeningPreviewOpen(false);
                  }}
                >
                  <div
                    className={styles.cardAccent}
                    style={{ backgroundColor: section.color }}
                  />
                  {scene.image_url ? (
                    <Image
                      className={styles.cardImage}
                      src={scene.image_url}
                      alt={scene.name}
                      fill
                      sizes="135px"
                    />
                  ) : (
                    <div className={styles.cardFallback}>
                      <ImageOff size={28} color="var(--gray-300)" />
                    </div>
                  )}
                  <div className={styles.cardOverlay}>
                    <div className={styles.cardCharName}>
                      {scene.character.name}
                    </div>
                    <div className={styles.cardSceneName}>
                      {scene.name}
                    </div>
                  </div>
                  <div
                    className={`${styles.genderBadge} ${
                      scene.character.gender === "male"
                        ? styles.genderBadgeMale
                        : styles.genderBadgeFemale
                    }`}
                  >
                    {scene.character.gender === "male" ? "ชาย" : "หญิง"}
                  </div>
                  {scene.character.personality_tags[0] && (
                    <div
                      className={styles.cardTagBadge}
                      style={{
                        color:
                          TAG_TAGLINES[scene.character.personality_tags[0]]
                            ?.color ?? ACCENT_GOLD,
                      }}
                    >
                      {tagMap?.get(scene.character.personality_tags[0]) ??
                        scene.character.personality_tags[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {hasMore && (
              <div className={styles.loadMoreWrap}>
                <button
                  className={styles.loadMoreBtn}
                  onClick={() => setLatestLimit((prev) => prev + 20)}
                >
                  ดูเพิ่มเติม
                </button>
              </div>
            )}
          </div>
        );
      })}

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
                <Image
                  className={styles.sheetImage}
                  src={selectedScene.image_url}
                  alt={selectedScene.name}
                  width={540}
                  height={304}
                />
              ) : null}
              {selectedScene.character.avatar_url ? (
                <Image
                  className={styles.sheetAvatarOverlay}
                  src={selectedScene.character.avatar_url}
                  alt={selectedScene.character.name}
                  width={52}
                  height={52}
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
                </div>
                {(() => {
                  const { mood, tags } = parseAtmosphereSummary(
                    selectedScene.atmosphere_summary
                  );
                  const moodDef = mood
                    ? ATMOSPHERE_MOOD_LABELS[mood]
                    : undefined;
                  if (!moodDef && tags.length === 0) return null;
                  return (
                    <div className={styles.atmosphereTags}>
                      {moodDef && (
                        <span
                          className={styles.atmosphereMoodTag}
                          style={{
                            background: `color-mix(in oklab, ${moodDef.accent} 14%, transparent)`,
                            color: moodDef.accent,
                            border: `1px solid color-mix(in oklab, ${moodDef.accent} 32%, transparent)`,
                          }}
                        >
                          {moodDef.label}
                        </span>
                      )}
                      {tags.map((tag) => (
                        <span key={tag} className={styles.atmosphereTag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  );
                })()}
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
                  <div className={styles.previewContainer}>
                    {/* Section 1: Narrator (บรรยาย) */}
                    <div className={styles.previewNarratorSection}>
                      <span className={styles.previewSectionLabel}>บรรยาย</span>
                      <p className={styles.previewNarratorText}>
                        {selectedScene.opening_narrator}
                      </p>
                    </div>

                    {/* Section 2: Dialogue blocks (บทเปิด) */}
                    <div className={styles.previewDialogueSection}>
                      <span className={styles.previewSectionLabel}>บทเปิด</span>
                      <div className={styles.previewDialogueBlocks}>
                        {parseDialogueBlocks(selectedScene.opening_dialogue).map(
                          (block, i) =>
                            block.type === "narration" ? (
                              <div key={i} className={styles.previewActionRow}>
                                {block.text}
                              </div>
                            ) : (
                              <div key={i} className={styles.previewSpeechRow}>
                                {block.text}
                              </div>
                            )
                        )}
                      </div>
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
