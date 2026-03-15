"use client";

import { useLiff } from "./providers/liff-provider";

export default function Home() {
  const { liff, liffError, isLoggedIn, isInClient, isReady } = useLiff();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (liffError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600">
            Initialization Error
          </h1>
          <p className="mt-2 text-zinc-500">{liffError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex w-full max-w-md flex-col items-center gap-6 px-6 py-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight">TalkRai</h1>
        <p className="text-zinc-500">AI-powered interactive roleplay</p>

        <div className="mt-4 w-full rounded-lg border border-zinc-200 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <p>LIFF Ready: {isReady ? "Yes" : "No"}</p>
          <p>Logged In: {isLoggedIn ? "Yes" : "No"}</p>
          <p>In LINE Client: {isInClient ? "Yes" : "No"}</p>
          <p>LIFF SDK: {liff ? "Loaded" : "Not loaded"}</p>
        </div>

        {!isLoggedIn && !isInClient && liff && (
          <button
            onClick={() => liff.login()}
            className="mt-2 rounded-full bg-[#06C755] px-8 py-3 font-medium text-white transition-colors hover:bg-[#05b34d]"
          >
            Login with LINE
          </button>
        )}
      </main>
    </div>
  );
}
