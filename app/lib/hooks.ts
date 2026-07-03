import useSWR from "swr";
import {
  fetchScenes,
  fetchTags,
  fetchProfile,
  fetchMe,
  fetchLegalDoc,
  fetchCurrentSession,
  fetchCreditBalance,
  fetchCreditTransactions,
  type SceneItem,
  type TagsData,
  type ProfileStats,
  type MeResponse,
  type LegalDoc,
  type LegalDocKey,
  type CurrentSessionResponse,
  type CreditBalance,
  type CreditTransactionsResponse,
} from "./api";

// SWR will not fetch until the key is truthy.
// Pass `isReady && isLoggedIn` to gate all hooks on LIFF readiness.

export function useScenes(enabled: boolean) {
  return useSWR<SceneItem[]>(
    enabled ? "scenes" : null,
    fetchScenes,
  );
}

export function useTags(enabled: boolean) {
  return useSWR<TagsData>(
    enabled ? "tags" : null,
    fetchTags,
  );
}

export function useCurrentSession(enabled: boolean) {
  return useSWR<CurrentSessionResponse>(
    enabled ? "current-session" : null,
    fetchCurrentSession,
  );
}

export function useProfile(enabled: boolean) {
  return useSWR<ProfileStats>(
    enabled ? "profile" : null,
    fetchProfile,
  );
}

export function useMe(enabled: boolean) {
  return useSWR<MeResponse>(
    enabled ? "me" : null,
    fetchMe,
  );
}

// Lazy: only fetches once `doc` is set (i.e. when the user opens a legal sheet).
// Each document is cached under its own key so re-opening is instant.
export function useLegalDoc(doc: LegalDocKey | null) {
  return useSWR<LegalDoc>(
    doc ? `legal-${doc}` : null,
    () => fetchLegalDoc(doc as LegalDocKey),
  );
}

export function useCreditBalance(enabled: boolean) {
  return useSWR<CreditBalance>(
    enabled ? "credit-balance" : null,
    fetchCreditBalance,
  );
}

export function useCreditTransactions(
  enabled: boolean,
  limit: number,
  offset: number,
) {
  return useSWR<CreditTransactionsResponse>(
    enabled ? `credit-transactions-${limit}-${offset}` : null,
    () => fetchCreditTransactions(limit, offset),
  );
}
