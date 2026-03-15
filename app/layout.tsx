import type { Metadata, Viewport } from "next";
import { Quicksand, Plus_Jakarta_Sans, IBM_Plex_Sans_Thai } from "next/font/google";
import { LiffProvider } from "./providers/liff-provider";
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
  description: "AI-powered interactive roleplay chatbot",
  openGraph: {
    title: "TalkRai",
    description: "AI-powered interactive roleplay chatbot",
    type: "website",
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
        <LiffProvider>{children}</LiffProvider>
      </body>
    </html>
  );
}
