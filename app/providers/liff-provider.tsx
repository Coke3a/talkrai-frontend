"use client";

import type { Liff } from "@line/liff";
import {
  createContext,
  useCallback,
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
  login: () => void;
};

const LiffContext = createContext<LiffContextType>({
  liff: null,
  liffError: null,
  isLoggedIn: false,
  isInClient: false,
  isReady: false,
  login: () => {},
});

export function LiffProvider({ children }: { children: ReactNode }) {
  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInClient, setIsInClient] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  const devBypass = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";

  useEffect(() => {
    if (devBypass) {
      setIsLoggedIn(true);
      setIsInClient(false);
      setIsReady(true);
      return;
    }

    if (!liffId) return;

    import("@line/liff").then((mod) => {
      const liff = mod.default;
      liff
        .init({ liffId })
        .then(() => {
          setLiffObject(liff);
          const inClient = liff.isInClient?.() ?? false;
          setIsInClient(inClient);

          if (liff.isLoggedIn()) {
            setIsLoggedIn(true);
          } else if (!inClient) {
            liff.login({ redirectUri: window.location.href });
            return;
          }
          setIsReady(true);
        })
        .catch((error: Error) => {
          setLiffError(error.message);
          setIsReady(true);
        });
    });
  }, [liffId, devBypass]);

  const login = useCallback(() => {
    liffObject?.login({ redirectUri: window.location.href });
  }, [liffObject]);

  const value = useMemo(
    () => ({
      liff: liffObject,
      liffError: devBypass || liffId ? liffError : "NEXT_PUBLIC_LIFF_ID is not set",
      isLoggedIn,
      isInClient,
      isReady: devBypass || liffId ? isReady : true,
      login,
    }),
    [liffObject, liffError, liffId, devBypass, isLoggedIn, isInClient, isReady, login]
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
