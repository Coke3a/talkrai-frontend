import type { Metadata, Viewport } from "next";
import { Trirong, Anuphan, Bodoni_Moda } from "next/font/google";
import { LiffProvider } from "./providers/liff-provider";
import { ErrorBoundary } from "./components/error-boundary";
import { PageViewTracker } from "./components/page-view-tracker";
import "./globals.css";

// Shared with landing-page — see /DESIGN.md
const trirong = Trirong({
  variable: "--font-trirong",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "TalkRai",
  description: "TalkRai — นิยายแชทบน LINE | สวมบทฟินๆ กับตัวละครที่ชอบ",
  openGraph: {
    title: "TalkRai",
    description: "TalkRai — นิยายแชทบน LINE | สวมบทฟินๆ กับตัวละครที่ชอบ",
    type: "website",
    images: [
      {
        url: "https://talkrai.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "TalkRai — AI Interactive Roleplay on LINE",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${trirong.variable} ${anuphan.variable} ${bodoni.variable} antialiased`}
      >
        <LiffProvider>
          <PageViewTracker />
          <ErrorBoundary>{children}</ErrorBoundary>
        </LiffProvider>
      </body>
    </html>
  );
}
