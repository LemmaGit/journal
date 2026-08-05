import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { Settings } from "../types";

const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  pairs: ["EURUSD", "GBPUSD", "USDJPY", "BTCUSD"],
};

export const useSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings = DEFAULT_SETTINGS, isLoading: loading } = useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: api.getSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: api.saveSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(["settings"], data);
    },
  });

  const updateSettings = async (newSettings: Settings) => {
    try {
      await updateSettingsMutation.mutateAsync(newSettings);
    } catch (err) {
      console.error("Failed to update settings:", err);
    }
  };

  const updatePairs = (pairs: string[]) => {
    void updateSettings({ ...settings, pairs });
  };

  const updateTheme = (theme: "light" | "dark") => {
    void updateSettings({ ...settings, theme });
  };

  return { settings, loading, updateSettings, updatePairs, updateTheme };
};
