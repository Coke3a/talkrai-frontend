const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.talkrai.app";

async function getAuthHeaders(): Promise<HeadersInit> {
  const { default: liff } = await import("@line/liff");
  const accessToken = liff.getAccessToken();
  if (!accessToken) {
    throw new Error("Not logged in");
  }
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { ...headers, ...init?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `API error: ${res.status}`);
  }

  return res.json();
}

// ── Types ──────────────────────────────────────────────────

export interface ProfileStats {
  created_at: string;
  total_sessions: number;
  total_messages: number;
}

export interface CreditBalance {
  balance: number;
  total_purchased: number;
  total_consumed: number;
}

export interface TransactionItem {
  type: string;
  amount: number;
  balance_after: number;
  description: string | null;
  created_at: string;
}

export interface CreditTransactionsResponse {
  transactions: TransactionItem[];
  total: number;
}

export interface CurrentSessionData {
  id: string;
  character_name: string;
  character_avatar_url: string | null;
  scene_name: string;
  scene_image_url: string | null;
  current_location: string | null;
  scene_time: string | null;
  mood: string;
  relationship_level: string;
  message_count: number;
  scene_summary: string | null;
  created_at: string;
}

export interface CurrentSessionResponse {
  session: CurrentSessionData | null;
}

export interface EndSessionResponse {
  session_id: string;
}

export interface SceneCharacter {
  id: string;
  name: string;
  gender: "male" | "female";
  avatar_url: string | null;
  appearance_tags: string[];
  personality_tags: string[];
}

export interface SceneItem {
  id: string;
  name: string;
  location: string;
  time_of_day: string;
  atmosphere_summary: string;
  opening_narrator: string;
  opening_dialogue: string;
  start_mood: string;
  image_url: string | null;
  created_at: string;
  character: SceneCharacter;
}

export interface TagDef {
  key: string;
  display_name: string;
  description: string | null;
}

export interface TagsData {
  appearance: TagDef[];
  personality: TagDef[];
}

export interface StartSessionResponse {
  session_id: string;
}

// ── Helpers ───────────────────────────────────────────────

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${datePart} · ${hours}:${minutes}`;
}

export function formatDateShort(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Scenes & Tags (authenticated) ────────────────────────

export async function fetchScenes(): Promise<SceneItem[]> {
  const data = await apiFetch<{ scenes: SceneItem[] }>("/api/scenes");
  return data.scenes;
}

export function fetchTags(): Promise<TagsData> {
  return apiFetch<TagsData>("/api/tags");
}

// ── Authenticated API ────────────────────────────────────

export function fetchProfile(): Promise<ProfileStats> {
  return apiFetch<ProfileStats>("/api/profile");
}

export function startSession(sceneId: string): Promise<StartSessionResponse> {
  return apiFetch<StartSessionResponse>("/api/sessions/start", {
    method: "POST",
    body: JSON.stringify({ scene_id: sceneId }),
  });
}

export function fetchCreditBalance(): Promise<CreditBalance> {
  return apiFetch<CreditBalance>("/api/credits/balance");
}

export function fetchCreditTransactions(
  limit: number = 20,
  offset: number = 0
): Promise<CreditTransactionsResponse> {
  return apiFetch<CreditTransactionsResponse>(
    `/api/credits/transactions?limit=${limit}&offset=${offset}`
  );
}

export function fetchCurrentSession(): Promise<CurrentSessionResponse> {
  return apiFetch<CurrentSessionResponse>("/api/sessions/current");
}

export function endSession(): Promise<EndSessionResponse> {
  return apiFetch<EndSessionResponse>("/api/sessions/end", {
    method: "POST",
  });
}
