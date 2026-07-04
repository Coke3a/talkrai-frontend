"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLiff } from "../providers/liff-provider";
import { track } from "../lib/analytics";

/**
 * Maps a LIFF route to its analytics `page` key. Only the five tracked pages
 * return a value; everything else ("/", "/credits/pending", unknown routes)
 * returns null and is skipped. Note the hyphen→underscore for how-to.
 */
function pathToPage(pathname: string): string | null {
  switch (pathname) {
    case "/scenes":
      return "scenes";
    case "/credits":
      return "credits";
    case "/profile":
      return "profile";
    case "/status":
      return "status";
    case "/how-to":
      return "how_to";
    default:
      return null;
  }
}

/**
 * Fires one `page_view` event per route entry, once LIFF is ready. Renders
 * nothing. The ref guard suppresses duplicate fires from StrictMode's
 * double-invoked effects and from unrelated re-renders on the same path.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const { isReady } = useLiff();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    const page = pathToPage(pathname);
    if (page && lastTracked.current !== pathname) {
      lastTracked.current = pathname;
      track("page_view", { page });
    }
  }, [pathname, isReady]);

  return null;
}
