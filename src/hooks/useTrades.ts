import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { Trade } from "../types";
import { useModals } from "./useModals";

export const useTrades = (accountId: string | null) => {
  const queryClient = useQueryClient();
  const { showConfirm } = useModals();

  const { data: trades = [], isLoading: loading } = useQuery<Trade[]>({
    queryKey: ["trades", accountId],
    queryFn: () => api.getTrades(accountId!),
    enabled: !!accountId,
  });

  const addTradeMutation = useMutation({
    mutationFn: api.createTrade,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["trades", accountId] });
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const deleteTradeMutation = useMutation({
    mutationFn: api.deleteTrade,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["trades", accountId] });
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const addTrade = async (trade: Omit<Trade, "id">) => {
    return await addTradeMutation.mutateAsync(trade);
  };

  const deleteTrade = async (id: string) => {
    await deleteTradeMutation.mutateAsync(id);
  };

  const clearAllTrades = async () => {
    const confirmed = await showConfirm({
      title: "Clear All Trading Data",
      message: "Delete ALL trading data for the active account? This action is permanent and cannot be undone.",
      confirmText: "Clear All",
      cancelText: "Cancel",
      type: "danger",
    });

    if (confirmed) {
      try {
        // Delete all trades for the active account
        for (const t of trades) {
          await api.deleteTrade(t.id);
        }
        void queryClient.invalidateQueries({ queryKey: ["trades", accountId] });
        void queryClient.invalidateQueries({ queryKey: ["accounts"] });
      } catch (err) {
        console.error("Error clearing trades:", err);
      }
    }
  };

  return { trades, loading, addTrade, deleteTrade, clearAllTrades };
};
