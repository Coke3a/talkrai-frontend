"use client";

import type { Liff } from "@line/liff";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type LiffContextType = {
  liff: Liff | null;
  liffError: string | null;
  isLoggedIn: boolean;
  isInClient: boolean;
  isReady: boolean;
};

const LiffContext = createContext<LiffContextType>({
  liff: null,
  liffError: null,
  isLoggedIn: false,
  isInClient: false,
  isReady: false,
});

export function LiffProvider({ children }: { children: ReactNode }) {
  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInClient, setIsInClient] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

  useEffect(() => {
    if (!liffId) return;

    import("@line/liff").then((mod) => {
      const liff = mod.default;
      liff
        .init({
          liffId,
          withLoginOnExternalBrowser: true,
        })
        .then(() => {
          setLiffObject(liff);
          setIsLoggedIn(liff.isLoggedIn());
          setIsInClient(liff.isInClient?.() ?? false);
        })
        .catch((error: Error) => {
          setLiffError(error.message);
        })
        .finally(() => {
          setIsReady(true);
        });
    });
  }, [liffId]);

  const value = useMemo(
    () => ({
      liff: liffObject,
      liffError: liffId ? liffError : "NEXT_PUBLIC_LIFF_ID is not set",
      isLoggedIn,
      isInClient,
      isReady: liffId ? isReady : true,
    }),
    [liffObject, liffError, liffId, isLoggedIn, isInClient, isReady]
  );

  return (
    <LiffContext.Provider value={value}>
      {children}
    </LiffContext.Provider>
  );
}

export function useLiff() {
  const context = useContext(LiffContext);
  if (context === undefined) {
    throw new Error("useLiff must be used within a LiffProvider");
  }
  return context;
}
