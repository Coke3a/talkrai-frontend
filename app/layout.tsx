import type { Metadata, Viewport } from "next";
import { Quicksand, Plus_Jakarta_Sans, IBM_Plex_Sans_Thai } from "next/font/google";
import { LiffProvider } from "./providers/liff-provider";
import { ErrorBoundary } from "./components/error-boundary";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-thai",
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
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
        className={`${quicksand.variable} ${plusJakartaSans.variable} ${ibmPlexSansThai.variable} antialiased`}
      >
        <LiffProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </LiffProvider>
      </body>
    </html>
  );
}
