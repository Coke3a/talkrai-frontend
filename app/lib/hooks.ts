import useSWR from "swr";
import {
  fetchScenes,
  fetchTags,
  fetchProfile,
  fetchCurrentSession,
  fetchCreditBalance,
  fetchCreditTransactions,
  type SceneItem,
  type TagsData,
  type ProfileStats,
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
