"use client";

import { useRouter } from "next/navigation";

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      className={className}
      onClick={() => router.back()}
      aria-label="Go back"
    >
      &larr;
    </button>
  );
}
