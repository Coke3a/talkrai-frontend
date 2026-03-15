"use client";

import { useRouter } from "next/navigation";
import styles from "./how-to.module.css";

export default function HowToPage() {
  const router = useRouter();

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="page-header">
        <div className="header-inner relative">
          <button
            className={styles.backButton}
            onClick={() => router.back()}
            aria-label="Go back"
          >
            ←
          </button>
          <h1 className="header-title font-thai">วิธีเล่น</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 pt-5 pb-12">
        {/* Hero Section */}
        <section
          className={styles.hero}
          style={{
            background:
              "linear-gradient(135deg, var(--coral-500) 0%, var(--coral-400) 30%, var(--lavender-500) 100%)",
          }}
        >
          <div className={styles.heroDecorativeCircle1} />
          <div className={styles.heroDecorativeCircle2} />

          <div className="relative z-10">
            <span className={styles.heroEmoji}>🎭</span>
            <h2 className={styles.heroTitle}>วิธีเล่นเรื่องราว</h2>
            <p className={`font-thai ${styles.heroSubtitle}`}>
              เริ่มต้นง่ายๆ แค่ไม่กี่ขั้นตอน ☺️
            </p>
          </div>
        </section>

        {/* Steps Timeline */}
        <div className="mb-8 mt-8">
          <span className="section-label">ขั้นตอนการเล่น</span>

          <div className={styles.timeline}>
            <div className={styles.timelineLine} />

            {/* Step 1 */}
            <div className={styles.step}>
              <div className={`${styles.stepBadge} ${styles.stepBadgeCoral}`}>
                1
              </div>
              <h3 className={styles.stepTitle}>เลือกฉากที่ชอบ</h3>
              <div className={`${styles.stepCard} ${styles.stepCardCoral}`}>
                <p className={`font-thai ${styles.stepCardText}`}>
                  เลือกฉากที่สนใจจากรายการฉากต่างๆ
                  แต่ละฉากจะมีตัวละครและเนื้อเรื่องที่แตกต่างกัน
                  เลือกฉากที่ถูกใจแล้วเริ่มเล่นเลย!
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className={styles.step}>
              <div
                className={`${styles.stepBadge} ${styles.stepBadgeLavender}`}
              >
                2
              </div>
              <h3 className={styles.stepTitle}>พิมพ์แชทกับตัวละคร</h3>
              <div className={styles.subCards}>
                {/* Normal Speech */}
                <div className={styles.subCard}>
                  <div className={styles.subCardHeader}>
                    <span className={styles.subCardEmoji}>💬</span>
                    <span className={`font-thai ${styles.subCardTitle}`}>
                      คำพูดธรรมดา
                    </span>
                  </div>
                  <p className={`font-thai ${styles.subCardDesc}`}>
                    พิมพ์ข้อความธรรมดาเหมือนแชทปกติ
                  </p>
                  <div className={`font-thai ${styles.chatPreview}`}>
                    &quot;สวัสดีครับ วันนี้เป็นยังไงบ้าง?&quot;
                  </div>
                </div>

                {/* Action */}
                <div className={styles.subCard}>
                  <div className={styles.subCardHeader}>
                    <span className={styles.subCardEmoji}>⚡</span>
                    <span className={`font-thai ${styles.subCardTitle}`}>
                      การกระทำ Action
                    </span>
                  </div>
                  <p className={`font-thai ${styles.subCardDesc}`}>
                    ใช้เครื่องหมาย <strong>*ดอกจัน*</strong>{" "}
                    ครอบข้อความเพื่อบอกการกระทำ
                  </p>
                  <div className={`font-thai ${styles.chatPreview}`}>
                    *เดินเข้าไปในร้านกาแฟแล้วนั่งลงที่โต๊ะริมหน้าต่าง*
                  </div>
                </div>

                {/* Mixed */}
                <div className={styles.subCard}>
                  <div className={styles.subCardHeader}>
                    <span className={styles.subCardEmoji}>🎬</span>
                    <span className={`font-thai ${styles.subCardTitle}`}>
                      ผสมกัน Mixed
                    </span>
                  </div>
                  <p className={`font-thai ${styles.subCardDesc}`}>
                    ใช้ทั้งคำพูดและการกระทำรวมกันได้
                  </p>
                  <div className={`font-thai ${styles.chatPreview}`}>
                    *ยิ้มให้* สวัสดีครับ ผมมาตามนัดครับ *ยื่นดอกไม้ให้*
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className={styles.step}>
              <div className={`${styles.stepBadge} ${styles.stepBadgeMint}`}>
                3
              </div>
              <h3 className={styles.stepTitle}>สนุกกับเรื่องราว</h3>
              <div className={`${styles.stepCard} ${styles.stepCardMint}`}>
                <p className={`font-thai ${styles.stepCardText}`}>
                  ตัวละคร AI จะตอบกลับตามบทบาทและอารมณ์ของเรื่อง
                  ยิ่งคุยมากยิ่งสนิท ความสัมพันธ์จะพัฒนาไปเรื่อยๆ
                  สนุกกับเรื่องราวที่คุณร่วมสร้าง!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Mockup */}
        <div className="mb-8">
          <span className="section-label">ตัวอย่างการสนทนา</span>
          <div className={styles.chatMockup}>
            <div className={styles.chatMockupHeader}>
              Chat Preview
            </div>
            <div className={styles.chatMockupBody}>
              {/* User message */}
              <div className={`font-thai ${styles.chatBubbleUser}`}>
                *เดินเข้าไปในคาเฟ่แล้วโบกมือ* สวัสดีครับ!
              </div>

              {/* AI narration */}
              <div className={`font-thai ${styles.chatBubbleNarration}`}>
                มินาหันมามอง ดวงตาเป็นประกายเมื่อเห็นคุณเดินเข้ามา
                เธอยกมือโบกตอบพร้อมรอยยิ้มอ่อนโยน
              </div>

              {/* AI dialogue */}
              <div className={`font-thai ${styles.chatBubbleAi}`}>
                &quot;สวัสดีค่ะ! มานั่งตรงนี้เลย
                วันนี้มินาทำเค้กใหม่มาลองด้วยนะคะ ☺️&quot;
              </div>

              {/* User message */}
              <div className={`font-thai ${styles.chatBubbleUser}`}>
                *นั่งลงแล้วยิ้ม* เค้กอะไรครับ? ดูน่าอร่อยจัง
              </div>

              {/* AI narration */}
              <div className={`font-thai ${styles.chatBubbleNarration}`}>
                มินาหยิบจานเค้กสตรอว์เบอร์รี่หน้าตาน่ารักมาวางตรงหน้าคุณ
                พร้อมส้อมเล็กๆ
              </div>

              {/* AI dialogue */}
              <div className={`font-thai ${styles.chatBubbleAi}`}>
                &quot;สตรอว์เบอร์รี่ชีสเค้กค่ะ ลองชิมดูนะ
                มินาตั้งใจทำเลยล่ะ 🍰&quot;
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mb-8">
          <span className="section-label">เคล็ดลับ</span>
          <div className={styles.tipsGrid}>
            <div className={`${styles.tipCard} ${styles.tipCardLavender}`}>
              <span className={styles.tipEmoji}>💭</span>
              <p className={`font-thai ${styles.tipTitle}`}>
                ใช้การกระทำบอกอารมณ์ จะทำให้เรื่องสมจริงขึ้น
              </p>
            </div>

            <div className={`${styles.tipCard} ${styles.tipCardMint}`}>
              <span className={styles.tipEmoji}>🧠</span>
              <p className={`font-thai ${styles.tipTitle}`}>
                ตัวละครจำเรื่องราวได้ และพัฒนาไปเรื่อยๆ
              </p>
            </div>

            <div className={`${styles.tipCard} ${styles.tipCardCoral}`}>
              <span className={styles.tipEmoji}>💝</span>
              <p className={`font-thai ${styles.tipTitle}`}>
                ยิ่งคุยมาก ความสัมพันธ์ยิ่งลึกซึ้ง
              </p>
            </div>

            <div className={`${styles.tipCard} ${styles.tipCardMixed}`}>
              <span className={styles.tipEmoji}>🎯</span>
              <p className={`font-thai ${styles.tipTitle}`}>
                ลองวิธีเข้าหาตัวละครหลายๆ แบบ
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <section
          className={styles.ctaSection}
          style={{
            background:
              "linear-gradient(135deg, var(--coral-500) 0%, var(--coral-400) 30%, var(--lavender-500) 100%)",
          }}
        >
          <h3 className={styles.ctaTitle}>พร้อมเริ่มเล่นแล้วใช่ไหม?</h3>
          <p className={`font-thai ${styles.ctaSubtitle}`}>
            เลือกฉากแล้วเริ่มผจญภัยเลย!
          </p>
          <button className={`font-thai ${styles.ctaButton}`}>
            เลือกฉากตอนนี้
          </button>
        </section>
      </main>
    </div>
  );
}
