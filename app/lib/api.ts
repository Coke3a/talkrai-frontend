const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.talkrai.app";

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export function isUserInactiveError(error: unknown): boolean {
  return error instanceof ApiError && error.code === "USER_INACTIVE";
}

let liffModule: typeof import("@line/liff").default | null = null;

async function getLiff() {
  if (!liffModule) {
    const mod = await import("@line/liff");
    liffModule = mod.default;
  }
  return liffModule;
}

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";
const DEV_TOKEN = process.env.NEXT_PUBLIC_DEV_AUTH_TEST_TOKEN || "dev-token";

async function getAuthHeaders(): Promise<HeadersInit> {
  if (DEV_BYPASS) {
    return {
      Authorization: `Bearer ${DEV_TOKEN}`,
      "Content-Type": "application/json",
    };
  }
  const liff = await getLiff();
  const accessToken = liff.getAccessToken();
  if (!accessToken) {
    throw new Error("Not logged in");
  }
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

const LIFF_AUTH_RETRY_KEY = "liff_auth_retry";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { ...headers, ...init?.headers },
  });

  // Token expired — logout to clear cached token, then re-login (once only)
  if (res.status === 401) {
    if (
      !DEV_BYPASS &&
      typeof window !== "undefined" &&
      !sessionStorage.getItem(LIFF_AUTH_RETRY_KEY)
    ) {
      sessionStorage.setItem(LIFF_AUTH_RETRY_KEY, "1");
      const liff = await getLiff();
      liff.logout(); // Clear cached expired token
      liff.login({ redirectUri: window.location.href });
      throw new Error("Token expired — re-authenticating");
    }
    // Already retried once this session or in dev bypass — don't loop
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(LIFF_AUTH_RETRY_KEY);
    }
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || "Authentication failed");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      body?.error || "UNKNOWN_ERROR",
      body?.message || `API error: ${res.status}`
    );
  }

  // Success — clear retry flag
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(LIFF_AUTH_RETRY_KEY);
  }

  return res.json();
}

// ── Types ──────────────────────────────────────────────────

export interface ProfileStats {
  created_at: string;
  total_sessions: number;
  total_messages: number;
  longest_streak: number;
  current_streak: number;
  checked_in_today: boolean;
  today_cycle_day: number; // 1..7 — which cell is "today"
  today_credits: number;
  days_to_chest: number;
  weekly_credits: number[]; // 7 entries; [6] is the chest
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
  relationship_progress: number;
  next_level_label: string | null;
  messages_to_next: number | null;
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
  personality: string;
  background: string;
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

export interface MeResponse {
  terms_accepted: boolean;
}

export type LegalDocKey = "terms" | "privacy";

export interface LegalSection {
  title: string;
  body: string;
}

export interface LegalDoc {
  doc: LegalDocKey;
  title: string;
  version: number;
  updated: string;
  sections: LegalSection[];
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

export function fetchMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>("/api/me");
}

export function acceptTerms(): Promise<MeResponse> {
  return apiFetch<MeResponse>("/api/terms/accept", { method: "POST" });
}

export function fetchLegalDoc(doc: LegalDocKey): Promise<LegalDoc> {
  return apiFetch<LegalDoc>(`/api/legal/${doc}`);
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

// ── Payments ──────────────────────────────────────────────

export interface CreatePaymentResponse {
  payment_url: string;
  order_id: string;
}

export interface PaymentStatusResponse {
  status: "pending" | "completed" | "failed" | "expired";
  credits_amount: number;
  price_thb: number;
}

export function createPayment(
  packageId: string
): Promise<CreatePaymentResponse> {
  return apiFetch<CreatePaymentResponse>("/api/payments/create", {
    method: "POST",
    body: JSON.stringify({ package_id: packageId }),
  });
}

export function fetchPaymentStatus(
  orderId: string
): Promise<PaymentStatusResponse> {
  return apiFetch<PaymentStatusResponse>(
    `/api/payments/status?order_id=${orderId}`
  );
}
