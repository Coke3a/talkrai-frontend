"use client";

import liff, { Liff } from "@line/liff";
import {
  createContext,
  useContext,
  useEffect,
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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) {
      setLiffError("NEXT_PUBLIC_LIFF_ID is not set");
      setIsReady(true);
      return;
    }

    liff
      .init({
        liffId,
        withLoginOnExternalBrowser: true,
      })
      .then(() => {
        setLiffObject(liff);
      })
      .catch((error: Error) => {
        setLiffError(error.message);
      })
      .finally(() => {
        setIsReady(true);
      });
  }, []);

  return (
    <LiffContext.Provider
      value={{
        liff: liffObject,
        liffError,
        isLoggedIn: liffObject?.isLoggedIn() ?? false,
        isInClient: typeof window !== "undefined" && liff.isInClient(),
        isReady,
      }}
    >
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
