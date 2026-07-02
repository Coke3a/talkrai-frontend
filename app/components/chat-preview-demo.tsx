"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLiff } from "../providers/liff-provider";
import { getLineReturnUrl } from "@/app/lib/navigation";

// ── Generic example conversation ────────────────────────────
// This is a SAMPLE shown for every character, not a scene's real opening.
// Only the character's name + avatar and the scene's location/time are real;
// the narration and dialogue below are neutral placeholders that teach the
// rhythm of a reply: "*narration* + \"dialogue\" → you type → they answer".
// Narration leads with the chosen character's name so the sample never reads
// as an anonymous message, but the lines stay generic on purpose.
const USER_REPLY = "ดีใจที่ได้เจอเหมือนกันนะ";
const BOT_FOLLOW_UP = "เล่าให้ฟังหน่อยสิ วันนี้เป็นยังไงบ้าง";

// Phase timeline (ms until the next phase):
// 0 bot typing → 1 bot flex card → 2 you typing → 3 your bubble
// → 4 bot typing → 5 bot follow-up (hold) → loop back to 0.
const PHASE_DURATIONS = [1000, 2000, 1200, 950, 1000, 2400] as const;
const LAST_PHASE = PHASE_DURATIONS.length - 1;

// One signature deceleration curve for the whole screen (ease-out-quart-ish).
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// ── Typing indicator ────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--gray-500)",
            display: "inline-block",
          }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

interface ChatPreviewDemoProps {
  characterName: string;
  characterAvatarUrl: string | null;
  characterGender: "male" | "female";
  sceneLocation: string;
  sceneTimeOfDay: string;
}

export function ChatPreviewDemo({
  characterName,
  characterAvatarUrl,
  characterGender,
  sceneLocation,
  sceneTimeOfDay,
}: ChatPreviewDemoProps) {
  const { liff, isInClient } = useLiff();
  const prefersReduced = useReducedMotion() ?? false;

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState(0);
  const [ctaReady, setCtaReady] = useState(false);
  const [typed, setTyped] = useState("");

  // Gate reduced-motion behaviour until after mount: `useReducedMotion()` reads
  // `false` on the server but `true` on a RM client's first paint, so branching
  // DOM on it directly desyncs SSR from hydration. Deferring keeps them in sync.
  const reduce = mounted && prefersReduced;

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  const pronoun = characterGender === "male" ? "เขา" : "เธอ";
  const narration1 = `${characterName}เงยหน้าขึ้นมองคุณ รอยยิ้มบางๆ ผุดขึ้นที่มุมปาก`;
  const narration2 = `${pronoun}เอียงหน้าเล็กน้อย รอฟังคำตอบจากคุณ`;
  const sceneParts = [sceneLocation, sceneTimeOfDay].filter(Boolean);

  // Drive the looping phase timeline. Skipped entirely under reduced motion
  // (a settled final state is shown instead).
  useEffect(() => {
    if (reduce) return;
    const id = setTimeout(() => {
      setPhase((p) => (p >= LAST_PHASE ? 0 : p + 1));
    }, PHASE_DURATIONS[phase]);
    return () => clearTimeout(id);
  }, [phase, reduce]);

  // Reveal the CTA shortly after mount so the reader is never blocked waiting
  // for a full loop. (Reduced motion shows it immediately via `showCta` below.)
  useEffect(() => {
    if (reduce) return;
    const id = setTimeout(() => setCtaReady(true), 900);
    return () => clearTimeout(id);
  }, [reduce]);

  const userTyping = !reduce && phase === 2;

  // Typewriter for the user's draft, only during the you-typing phase. Every
  // setState runs inside a scheduled tick (never synchronously in the effect).
  useEffect(() => {
    if (reduce || !userTyping) return;
    const chars = Array.from(USER_REPLY);
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setTyped(chars.slice(0, i).join(""));
      if (i < chars.length) {
        i += 1;
        timer = setTimeout(tick, 60);
      }
    };
    timer = setTimeout(tick, 0);
    return () => clearTimeout(timer);
  }, [userTyping, reduce]);

  const handleCta = useCallback(() => {
    if (isInClient && liff) {
      liff.closeWindow();
    } else {
      window.location.href = getLineReturnUrl();
    }
  }, [isInClient, liff]);

  // Derived visibility (reduced motion => everything settled).
  const showBotCard = reduce || phase >= 1;
  const showUser = reduce || phase >= 3;
  const showFollowUp = reduce || phase >= 5;
  const botTyping = !reduce && (phase === 0 || phase === 4);
  const showCta = reduce || ctaReady;
  const draft = userTyping ? typed : "";

  const bubbleEnter = reduce ? false : { opacity: 0, y: 14, scale: 0.97 };
  const bubbleTransition = { duration: 0.34, ease: EASE_OUT };
  // Staggered fade on loop reset so bubbles clear top-to-bottom, not all at once.
  const bubbleExit = (delay: number) => ({
    opacity: 0,
    transition: { duration: 0.3, delay },
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-ink-950)",
      }}
    >
      {/* Ambient light pool behind the frame */}
      {!reduce && (
        <motion.div
          aria-hidden
          style={{
            position: "fixed",
            top: "18%",
            left: "50%",
            width: 420,
            height: 420,
            marginLeft: -210,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.735 0.140 15 / 0.14) 0%, transparent 68%)",
            pointerEvents: "none",
          }}
          animate={{ opacity: [0.55, 0.85, 0.55], scale: [1, 1.06, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Centered column (margin auto keeps it centred when it fits, scrolls when not) */}
      <div
        style={{
          width: "100%",
          maxWidth: 384,
          marginInline: "auto",
          marginBlock: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          padding: "30px 22px calc(28px + env(safe-area-inset-bottom))",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Teaching headline */}
        <div style={{ textAlign: "center", width: "100%" }}>
          <span
            className="font-thai"
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.14em",
              color: "var(--color-gold-400)",
            }}
          >
            พร้อมเริ่มแล้ว
          </span>
          <h2
            className="font-display"
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--gray-900)",
              margin: "8px 0 0",
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
            }}
          >
            เรื่องของคุณกับ{characterName}
            <br />
            กำลังรออยู่ใน LINE
          </h2>
          <p
            className="font-thai"
            style={{
              fontSize: 13.5,
              color: "var(--gray-500)",
              margin: "10px 0 0",
              lineHeight: 1.6,
            }}
          >
            ด้านล่างคือ<span style={{ color: "var(--gray-700)" }}>ตัวอย่าง</span>
            บรรยากาศการเล่น แชทจริงเล่นต่อได้เลยใน LINE
          </p>
        </div>

        {/* ── Framed sample: a mini LINE chat window ── */}
        <div style={{ position: "relative", width: "100%" }}>
          {/* "example" label straddling the top edge */}
          <div
            className="font-thai"
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 3,
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 13px",
              borderRadius: "var(--radius-full)",
              background: "var(--color-ink-800)",
              border: "1px solid oklch(0.815 0.100 81 / 0.45)",
              color: "var(--color-gold-300)",
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: "0.03em",
              whiteSpace: "nowrap",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <circle cx="12" cy="12" r="2.6" fill="currentColor" />
            </svg>
            ตัวอย่างการเล่น
          </div>

          {/* The device frame (overflow hidden clips the chat, not the label) */}
          <div
            style={{
              overflow: "hidden",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--hairline-strong)",
              background: "var(--color-ink-900)",
              boxShadow: "var(--shadow-card-hover)",
            }}
          >
            {/* Mini LINE header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 14px",
                background: "var(--color-ink-850)",
                borderBottom: "1px solid var(--hairline)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--gray-500)"
                strokeWidth="2"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {characterAvatarUrl ? (
                <Image
                  src={characterAvatarUrl}
                  alt={characterName}
                  width={30}
                  height={30}
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div
                  className="font-display"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "var(--color-ink-800)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-gold-400)",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {Array.from(characterName)[0] ?? "?"}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
                <span
                  className="font-display"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--gray-900)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {characterName}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    color: "var(--gray-500)",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--color-line-green-bright)",
                      display: "inline-block",
                    }}
                  />
                  <span className="font-thai">กำลังรอเธออยู่</span>
                </span>
              </div>
            </div>

            {/* Chat body — fixed height, bottom-aligned, older lines scroll off */}
            <div
              style={{
                position: "relative",
                height: 320,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                gap: 10,
                padding: "16px 14px 14px",
                background: "var(--color-ink-900)",
              }}
            >
              {/* top fade so anything scrolling off the top dissolves cleanly */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 34,
                  background:
                    "linear-gradient(var(--color-ink-900), transparent)",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />

              <AnimatePresence>
                {/* Bot opening — a real LINE flex card */}
                {showBotCard && (
                  <motion.div
                    key="bot-card"
                    initial={bubbleEnter}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={bubbleExit(0)}
                    transition={bubbleTransition}
                    style={rowStyle("left")}
                  >
                    <div style={flexCardStyle}>
                      {sceneParts.length > 0 && (
                        <div style={sceneHeaderStyle} className="font-thai">
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"
                            />
                            <circle cx="12" cy="10" r="2.4" />
                          </svg>
                          {sceneParts.map((part, i) => (
                            <span key={part} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {i > 0 && <span style={{ color: "var(--gray-400)" }}>·</span>}
                              <span>{part}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ padding: "11px 14px 13px" }}>
                        <p style={narrationStyle} className="font-display">
                          {narration1}
                        </p>
                        <p style={dialogueStyle} className="font-display">
                          “ดีใจนะที่เธอมาถึงสักที”
                        </p>
                        <p style={{ ...narrationStyle, marginTop: 9 }} className="font-display">
                          {narration2}
                        </p>
                        <p style={dialogueStyle} className="font-display">
                          “มานั่งข้างๆ กันก่อนไหม”
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Your reply — rose bubble */}
                {showUser && (
                  <motion.div
                    key="user"
                    initial={bubbleEnter}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={bubbleExit(0.06)}
                    transition={bubbleTransition}
                    style={rowStyle("right")}
                  >
                    <div style={userBubbleStyle} className="font-thai">
                      {USER_REPLY}
                    </div>
                  </motion.div>
                )}

                {/* Bot follow-up — plain dialogue bubble */}
                {showFollowUp && (
                  <motion.div
                    key="follow-up"
                    initial={bubbleEnter}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={bubbleExit(0.12)}
                    transition={bubbleTransition}
                    style={rowStyle("left")}
                  >
                    <div style={botBubbleStyle} className="font-thai">
                      {BOT_FOLLOW_UP}
                    </div>
                  </motion.div>
                )}

                {/* Typing indicator (bot side) */}
                {botTyping && (
                  <motion.div
                    key="bot-typing"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.25, ease: EASE_OUT }}
                    style={rowStyle("left")}
                  >
                    <div style={{ ...botBubbleStyle, padding: "12px 14px" }}>
                      <TypingDots />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dimmed, non-interactive input — signals "this is a preview" */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 12px",
                background: "var(--color-ink-850)",
                borderTop: "1px solid var(--hairline)",
                opacity: 0.75,
              }}
            >
              <div
                className="font-thai"
                style={{
                  flex: 1,
                  padding: "8px 14px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--color-ink-800)",
                  fontSize: 13,
                  color: draft ? "var(--gray-700)" : "var(--gray-400)",
                  minHeight: 17,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {draft ? (
                  <>
                    {draft}
                    {userTyping && (
                      <motion.span
                        style={{
                          display: "inline-block",
                          width: 2,
                          height: 13,
                          marginLeft: 1,
                          verticalAlign: "middle",
                          background: "var(--color-gold-400)",
                        }}
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </>
                ) : (
                  "พิมพ์ข้อความ…"
                )}
              </div>
              <span
                aria-hidden
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: "var(--color-ink-750)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--gray-400)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10.2 15 12 3.4 13.8z" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* CTA — back to LINE */}
        <div style={{ width: "100%", minHeight: 56 }}>
          <AnimatePresence>
            {showCta && (
              <motion.button
                key="cta"
                onClick={handleCta}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                className="font-thai"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  padding: "15px 24px",
                  borderRadius: "var(--radius-full)",
                  border: "none",
                  cursor: "pointer",
                  background: "var(--color-line-green)",
                  color: "#ffffff",
                  fontSize: 16,
                  fontWeight: 700,
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 3C6.5 3 2 6.7 2 11c0 3.9 3.6 7.2 8.4 7.9.33.07.78.22.9.5.1.25.06.62.03.87l-.14.82c-.04.25-.2.98.87.53 1.06-.45 5.72-3.37 7.8-5.77C21.1 14.9 22 13.05 22 11c0-4.3-4.5-8-10-8z" />
                </svg>
                กลับไป LINE เพื่อเริ่มคุย
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Shared styles ───────────────────────────────────────────
function rowStyle(side: "left" | "right"): CSSProperties {
  return {
    display: "flex",
    justifyContent: side === "right" ? "flex-end" : "flex-start",
    width: "100%",
  };
}

const flexCardStyle: CSSProperties = {
  maxWidth: "88%",
  overflow: "hidden",
  borderRadius: "4px 16px 16px 16px",
  border: "1px solid var(--hairline)",
  background: "var(--color-ink-850)",
};

const sceneHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 14px 7px",
  borderBottom: "1px solid var(--hairline)",
  fontSize: 11,
  color: "var(--color-gold-300)",
};

const narrationStyle: CSSProperties = {
  margin: 0,
  fontStyle: "italic",
  fontSize: 13,
  lineHeight: 1.55,
  color: "var(--gray-500)",
};

const dialogueStyle: CSSProperties = {
  margin: "5px 0 0",
  fontSize: 14.5,
  fontWeight: 500,
  lineHeight: 1.5,
  color: "var(--gray-900)",
};

const bubbleBase: CSSProperties = {
  maxWidth: "78%",
  padding: "10px 14px",
  fontSize: 14,
  lineHeight: 1.45,
  wordBreak: "break-word",
};

const botBubbleStyle: CSSProperties = {
  ...bubbleBase,
  background: "var(--color-ink-850)",
  border: "1px solid var(--hairline)",
  color: "var(--gray-900)",
  borderRadius: "4px 16px 16px 16px",
};

const userBubbleStyle: CSSProperties = {
  ...bubbleBase,
  background: "oklch(0.735 0.140 15 / 0.16)",
  border: "1px solid oklch(0.735 0.140 15 / 0.32)",
  color: "var(--gray-900)",
  borderRadius: "16px 4px 16px 16px",
};
