import { API_BASE_URL, getAuthHeaders } from "./api";

type QueuedEvent = {
  name: string;
  page?: string;
  properties?: Record<string, unknown>;
  client_event_id: string;
  occurred_at: string;
};

const queue: QueuedEvent[] = [];
const MAX_BATCH = 20;
const HARD_CAP = 200;

export function track(
  name: string,
  params?: { page?: string; [key: string]: unknown }
): void {
  // Contain ALL errors here: track() is called synchronously right before user
  // actions (startSession, createPayment) and inside a render effect, so a throw
  // would skip the action or crash the page. crypto.randomUUID() in particular is
  // undefined on older in-app WebViews. Analytics is best-effort — never break UX.
  try {
    const { page, ...rest } = params ?? {};
    const event: QueuedEvent = {
      name,
      page,
      properties: Object.keys(rest).length > 0 ? rest : undefined,
      client_event_id: crypto.randomUUID(),
      occurred_at: new Date().toISOString(),
    };
    queue.push(event);

    // Bound memory: drop oldest events once the hard cap is exceeded.
    if (queue.length > HARD_CAP) {
      queue.splice(0, queue.length - HARD_CAP);
    }

    if (queue.length >= MAX_BATCH) void flush();
  } catch {
    // Swallow: a failed track() must never propagate into a caller or effect.
  }
}

async function flush(): Promise<void> {
  // Both visibilitychange->hidden and pagehide fire on close; the first
  // snapshots+clears the queue, so the second must no-op here rather than
  // POSTing an empty batch (which would still cost 2 LINE-verify calls).
  if (queue.length === 0) return;

  const batch = queue.splice(0, queue.length);

  let headers: HeadersInit;
  try {
    headers = await getAuthHeaders();
  } catch {
    // Token not ready yet — requeue and retry on the next flush.
    queue.unshift(...batch);
    if (queue.length > HARD_CAP) {
      queue.splice(0, queue.length - HARD_CAP);
    }
    return;
  }

  try {
    await fetch(`${API_BASE_URL}/api/events`, {
      method: "POST",
      keepalive: true, // NOT sendBeacon — we must send the Bearer header
      headers,
      body: JSON.stringify({ events: batch }),
    });
  } catch {
    // Best-effort analytics: swallow. Do not requeue — keepalive already
    // dispatched the request, so retrying here would risk duplicate events.
  }
}

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flush();
  });
  window.addEventListener("pagehide", () => void flush());
}
