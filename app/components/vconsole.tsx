"use client";

import { useEffect } from "react";

export default function VConsoleInit() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("vconsole").then(({ default: VConsole }) => {
        new VConsole();
      });
    }
  }, []);

  return null;
}
