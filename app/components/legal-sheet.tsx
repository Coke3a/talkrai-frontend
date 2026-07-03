"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLegalDoc } from "../lib/hooks";
import type { LegalDocKey } from "../lib/api";
import styles from "./legal-sheet.module.css";

// Render a section body (plain text with "• " bullets and "N.N " sub-headings)
// into light structure — no Markdown engine, keeping the bundle lean.
function renderBody(body: string): ReactNode[] {
  const out: ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = () => {
    if (bullets.length === 0) return;
    out.push(
      <ul key={`u-${out.length}`} className={styles.bullets}>
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  for (const line of body.split("\n")) {
    const text = line.trim();
    if (!text) {
      flushBullets();
      continue;
    }
    if (text.startsWith("• ")) {
      bullets.push(text.slice(2));
      continue;
    }
    flushBullets();
    out.push(
      <p
        key={`p-${out.length}`}
        className={/^\d+\.\d+\s/.test(text) ? styles.subheading : styles.para}
      >
        {text}
      </p>,
    );
  }
  flushBullets();
  return out;
}

// `doc` stays set (its content stays cached) while `open` drives presence — so the
// sheet keeps its content during the exit animation instead of blanking.
export default function LegalSheet({
  doc,
  open,
  onClose,
}: {
  doc: LegalDocKey | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data, error, isLoading } = useLegalDoc(doc);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={styles.backdrop}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-label={data?.title ?? "เอกสาร"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className={styles.head}>
              <div>
                <div className={styles.title}>
                  {data?.title ?? "กำลังโหลด..."}
                </div>
                {data?.updated && (
                  <div className={styles.updated}>
                    อัปเดตล่าสุด {data.updated}
                  </div>
                )}
              </div>
              <button
                className={styles.close}
                onClick={onClose}
                aria-label="ปิด"
              >
                ✕
              </button>
            </div>

            <div className={styles.body}>
              {isLoading && !data && (
                <div className={styles.state}>กำลังโหลด...</div>
              )}
              {error && !data && (
                <div className={styles.state}>
                  โหลดเอกสารไม่สำเร็จ ปิดแล้วลองใหม่อีกครั้ง
                </div>
              )}
              {data?.sections.map((section, i) => (
                <section key={i} className={styles.section}>
                  <h4 className={styles.secTitle}>{section.title}</h4>
                  {renderBody(section.body)}
                </section>
              ))}
            </div>

            <div className={styles.foot}>
              <button className={styles.doneBtn} onClick={onClose}>
                เข้าใจแล้ว
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
