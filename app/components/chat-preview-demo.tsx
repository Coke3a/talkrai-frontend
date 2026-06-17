"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLiff } from "../providers/liff-provider";
import { getLineReturnUrl } from "@/app/lib/navigation";

// ── Generic demo conversation ───────────────────────────────
// Semi-abstract: reused for EVERY character. This is NOT a scene's real opening
// — only the avatar + name belong to the chosen character; the lines below teach
// the rhythm of "they speak → you type → they reply".
const CHAR_LINE_1 = "เฮ้ ดีใจที่ได้เจอกันนะ";
const USER_DRAFT = "ดีใจเหมือนกันเลย";
const CHAR_LINE_2 = "วันนี้อยากเล่าอะไรให้ฟังไหม?";

// Phase timeline (ms until the next phase):
// 0: character typing → 1: character bubble 1 → 2: user typing → 3: user bubble
// → 4: character typing → 5: character bubble 2 (hold) → loop back to 0.
const PHASE_DURATIONS = [1000, 1300, 1150, 1300, 1000, 1900] as const;
const LAST_PHASE = PHASE_DURATIONS.length - 1;

// Premium deceleration curve — one signature easing for the whole screen.
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// ── Secondary layer: typing indicator ───────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "2px 2px" }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={{
            width: 7,
            height: 7,
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
}

export function ChatPreviewDemo({
  characterName,
  characterAvatarUrl,
}: ChatPreviewDemoProps) {
  const { liff, isInClient } = useLiff();
  const reduce = useReducedMotion() ?? false;

  const [phase, setPhase] = useState(0);
  const [ctaReady, setCtaReady] = useState(false);
  const [typed, setTyped] = useState("");

  // Drive the looping phase timeline. Reveal the CTA after the first full loop.
  // Skipped entirely under prefers-reduced-motion (static final state instead).
  useEffect(() => {
    if (reduce) return;
    const id = setTimeout(() => {
      if (phase >= LAST_PHASE) {
        setCtaReady(true);
        setPhase(0);
      } else {
        setPhase(phase + 1);
      }
    }, PHASE_DURATIONS[phase]);
    return () => clearTimeout(id);
  }, [phase, reduce]);

  const userTyping = !reduce && phase === 2;

  // Typewriter for the user's draft, only during the user-typing phase.
  // Every setState runs asynchronously inside the scheduled tick (first tick
  // resets to ""), never synchronously in the effect body.
  useEffect(() => {
    if (reduce || !userTyping) return;
    const chars = Array.from(USER_DRAFT);
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setTyped(chars.slice(0, i).join(""));
      if (i < chars.length) {
        i += 1;
        timer = setTimeout(tick, 65);
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

  // Derived visibility (reduced motion => everything settled + CTA shown).
  const showChar1 = reduce || phase >= 1;
  const showUser = reduce || phase >= 3;
  const showChar2 = reduce || phase >= 5;
  const charTyping = !reduce && (phase === 0 || phase === 4);
  const showCta = reduce || ctaReady;
  // Draft text is only meaningful while the user is "typing"; otherwise the
  // input shows its placeholder (no stale text after the bubble is sent).
  const draft = userTyping ? typed : "";

  const bubbleEnter = reduce ? false : { opacity: 0, y: 16, scale: 0.96 };
  const bubbleTransition = { duration: 0.32, ease: EASE_OUT };
  // Gentle, staggered fade on loop reset so the three bubbles clear top-to-bottom
  // instead of wiping all at once (choreography: ≤⅓ of elements moving together).
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
        display: "flex",
        flexDirection: "column",
        background: "var(--color-ink-950)",
        overflow: "hidden",
      }}
    >
      {/* Ambient layer: soft glow behind the header */}
      {!reduce && (
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            top: -120,
            left: "50%",
            width: 360,
            height: 360,
            marginLeft: -180,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.735 0.140 15 / 0.16) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
          animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Header — chosen character's avatar + name */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          borderBottom: "1px solid var(--hairline)",
          position: "relative",
        }}
      >
        {characterAvatarUrl ? (
          <Image
            src={characterAvatarUrl}
            alt={characterName}
            width={40}
            height={40}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "var(--color-ink-800)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-gold-400)",
              fontWeight: 700,
              fontSize: 18,
            }}
            className="font-display"
          >
            {Array.from(characterName)[0] ?? "?"}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            className="font-display"
            style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)" }}
          >
            {characterName}
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: "var(--gray-500)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--color-line-green-bright)",
                display: "inline-block",
              }}
            />
            <span className="font-thai">กำลังรอเธออยู่</span>
          </span>
        </div>
      </div>

      {/* Teaching headline */}
      <div style={{ padding: "18px 20px 6px" }}>
        <h2
          className="font-display"
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--gray-900)",
            margin: 0,
            lineHeight: 1.35,
          }}
        >
          ตาคุณแล้ว — พิมพ์ตอบได้เลย
        </h2>
        <p
          className="font-thai"
          style={{
            fontSize: 13.5,
            color: "var(--gray-500)",
            margin: "6px 0 0",
            lineHeight: 1.55,
          }}
        >
          แค่พิมพ์ตอบกลับในแชท เรื่องราวก็เดินหน้าต่อ ลองดูตัวอย่างด้านล่าง
        </p>
      </div>

      {/* Chat area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 10,
          padding: "12px 20px 8px",
          minHeight: 0,
        }}
      >
        <AnimatePresence>
          {/* Character line 1 */}
          {showChar1 && (
            <motion.div
              key="char1"
              initial={bubbleEnter}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={bubbleExit(0)}
              transition={bubbleTransition}
              style={rowStyle("left")}
            >
              <div style={charBubbleStyle} className="font-thai">
                {CHAR_LINE_1}
              </div>
            </motion.div>
          )}

          {/* User line */}
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
                {USER_DRAFT}
              </div>
            </motion.div>
          )}

          {/* Character line 2 */}
          {showChar2 && (
            <motion.div
              key="char2"
              initial={bubbleEnter}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={bubbleExit(0.12)}
              transition={bubbleTransition}
              style={rowStyle("left")}
            >
              <div style={charBubbleStyle} className="font-thai">
                {CHAR_LINE_2}
              </div>
            </motion.div>
          )}

          {/* Typing indicator — character side (before each character line) */}
          {charTyping && (
            <motion.div
              key="char-typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              style={rowStyle("left")}
            >
              <div style={{ ...charBubbleStyle, padding: "12px 14px" }}>
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fake input bar — secondary layer (typewriter draft) */}
      <div style={{ padding: "8px 20px 4px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px 10px 16px",
            borderRadius: "var(--radius-full)",
            background: "var(--color-ink-850)",
            border: "1px solid var(--hairline-strong)",
          }}
        >
          <span
            className="font-thai"
            style={{
              flex: 1,
              fontSize: 14,
              color: draft ? "var(--gray-900)" : "var(--gray-400)",
              minHeight: 18,
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
                      height: 14,
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
          </span>
          <span
            aria-hidden
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              flexShrink: 0,
              background:
                "linear-gradient(135deg, var(--color-gold-300), var(--color-gold-500))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-ink-950)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M3.4 20.4 21 12 3.4 3.6 3.4 10.2 15 12 3.4 13.8z"
                fill="currentColor"
              />
            </svg>
          </span>
        </div>
      </div>

      {/* CTA — appears after the first loop (or immediately under reduced motion) */}
      <div
        style={{
          padding: "8px 20px calc(20px + env(safe-area-inset-bottom))",
          minHeight: 92,
        }}
      >
        <AnimatePresence>
          {showCta && (
            <motion.button
              key="cta"
              onClick={handleCta}
              initial={reduce ? false : { opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="font-thai"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "15px 24px",
                borderRadius: "var(--radius-full)",
                border: "none",
                cursor: "pointer",
                background:
                  "linear-gradient(135deg, var(--color-line-green-bright), var(--color-line-green))",
                color: "#03301A",
                fontSize: 16,
                fontWeight: 700,
                boxShadow: "var(--shadow-card)",
              }}
            >
              เข้าใจแล้ว เริ่มเลย
            </motion.button>
          )}
        </AnimatePresence>
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

const bubbleBase: CSSProperties = {
  maxWidth: "78%",
  padding: "11px 15px",
  fontSize: 14.5,
  lineHeight: 1.45,
  wordBreak: "break-word",
};

const charBubbleStyle: CSSProperties = {
  ...bubbleBase,
  background: "var(--color-ink-850)",
  border: "1px solid var(--hairline)",
  color: "var(--gray-900)",
  borderRadius: "4px 18px 18px 18px",
};

const userBubbleStyle: CSSProperties = {
  ...bubbleBase,
  background:
    "linear-gradient(135deg, var(--color-gold-300), var(--color-gold-400))",
  color: "var(--color-ink-950)",
  fontWeight: 600,
  borderRadius: "18px 4px 18px 18px",
};
