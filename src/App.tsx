import React, { useState, useEffect } from "react";
import type { Trade, Account } from "./types";
import { Header } from "./components/Header";
import { DashboardTab } from "./components/DashboardTab";
import { Calendar } from "./components/Calender";
import { AnalyticsTab } from "./components/AnalyticsTab";
import { PairManager } from "./components/PairManagement";
import { TradeForm } from "./components/TradeForm";
import { useTheme } from "./hooks/useTheme";
import { useTrades } from "./hooks/useTrades";
import { useSettings } from "./hooks/useSettings";
import { api } from "./services/api";
import {
  todayStr,
  getDayStatus,
  getWeekStatus,
  getWeekId,
} from "./utils/helpers";
import { exportWeeklyReport } from "./utils/docxExport";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useModals } from "./hooks/useModals";

const App: React.FC = () => {
  const queryClient = useQueryClient();
  const { showAlert, showConfirm } = useModals();

  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const {
    settings,
    loading: settingsLoading,
    updatePairs,
    updateTheme,
  } = useSettings();
  const { theme, toggleTheme } = useTheme(settings.theme);

  // Load accounts using React Query
  const { data: accounts = [], isLoading: accountsLoading } = useQuery<
    Account[]
  >({
    queryKey: ["accounts"],
    queryFn: api.getAccounts,
  });

  const createAccountMutation = useMutation({
    mutationFn: api.createAccount,
    onSuccess: (newAcc) => {
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setActiveAccountId(newAcc.id);
    },
  });

  // Bind trades hook to active account
  const {
    trades,
    loading: tradesLoading,
    addTrade,
    updateTrade,
    deleteTrade,
    clearAllTrades,
  } = useTrades(activeAccountId);

  // Auto-initialize a default account if none exists
  useEffect(() => {
    if (!accountsLoading && accounts.length === 0) {
      const createDefault = async () => {
        try {
          const defaultAcc = await api.createAccount({
            name: "Default Account",
            initialBalance: 10000,
            currency: "USD",
            description: "Default account created automatically",
          });
          void queryClient.invalidateQueries({ queryKey: ["accounts"] });
          setActiveAccountId(defaultAcc.id);
        } catch (err) {
          console.error("Failed to auto-create account:", err);
        }
      };
      void createDefault();
    } else if (accounts.length > 0 && !activeAccountId) {
      setActiveAccountId(accounts[0].id);
    }
  }, [accounts, accountsLoading, activeAccountId, queryClient]);

  const handleCreateAccount = async (name: string, initialBalance: number) => {
    await createAccountMutation.mutateAsync({
      name,
      initialBalance,
      currency: "USD",
    });
  };

  const handleSaveTrade = async (tradeData: Omit<Trade, "id" | "accountId">) => {
    if (!activeAccountId) return;
    if (editingTrade) {
      await updateTrade({
        ...tradeData,
        id: editingTrade.id,
        accountId: activeAccountId,
      });
    } else {
      await addTrade({
        ...tradeData,
        accountId: activeAccountId,
      });
    }
    setShowTradeForm(false);
    setEditingTrade(null);
  };

  const handleDeleteAccount = async () => {
    if (!activeAccountId) return;
    const activeAcc = accounts.find((a) => a.id === activeAccountId);
    if (!activeAcc) return;

    const confirmed = await showConfirm({
      title: "Delete Account",
      message: `Are you sure you want to delete "${activeAcc.name}"? This action will permanently remove the account and all associated trade logs.`,
      confirmText: "Delete Account",
      cancelText: "Cancel",
      type: "danger",
    });

    if (confirmed) {
      try {
        await api.deleteAccount(activeAccountId);
        void queryClient.invalidateQueries({ queryKey: ["accounts"] });
        setActiveAccountId(null);
      } catch (err: any) {
        console.error(err);
        void showAlert({
          title: "Account Deletion Failed",
          message: err.message || "Failed to delete account.",
          type: "danger",
        });
      }
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    toggleTheme();
    updateTheme(nextTheme);
  };

  const handleExportWeek = async () => {
    try {
      await exportWeeklyReport(trades, selectedDate);
    } catch (err) {
      console.error(err);
      void showAlert({
        title: "Export Failed",
        message: "Failed to export Word report.",
        type: "danger",
      });
    }
  };

  const handleClearAllTrades = async () => {
    await clearAllTrades();
  };

  // Check if we are loading initial workspace setups
  const initialLoading = settingsLoading || accountsLoading;

  // Dynamically calculate rule states based on backend trade logs
  const todayStatus = getDayStatus(trades, todayStr());
  const weekStatus = getWeekStatus(trades, getWeekId(todayStr()));
  const canTradeToday = !todayStatus.stopped && !weekStatus.stopped;

  const activeAccount = accounts.find((a) => a.id === activeAccountId) || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300 p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <Header
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onClearAll={handleClearAllTrades}
          onNewTrade={() => {
            setEditingTrade(null);
            setShowTradeForm(true);
          }}
          onExport={handleExportWeek}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          canTradeToday={canTradeToday}
          accounts={accounts}
          activeAccountId={activeAccountId}
          onSelectAccount={setActiveAccountId}
          onCreateAccount={handleCreateAccount}
          onDeleteAccount={handleDeleteAccount}
        />

        {/* Tab Views */}
        <main className="min-h-[60vh]">
          {initialLoading ? (
            <div className="animate-pulse space-y-6">
              {/* Banner Skeleton */}
              <div className="h-20 bg-slate-200/50 dark:bg-slate-800/40 border border-slate-200/20 dark:border-slate-800/20 rounded-2xl"></div>
              {/* Cards Grid Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-28 bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/20 dark:border-slate-800/20"
                  ></div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardTab
                  trades={trades}
                  todayStatus={todayStatus}
                  weekStatus={weekStatus}
                  canTradeToday={canTradeToday}
                  onNewTrade={() => setShowTradeForm(true)}
                  onSelectTab={setActiveTab}
                  isLoading={tradesLoading}
                />
              )}

              {activeTab === "calendar" && (
                <Calendar
                  trades={trades}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  onNewTrade={() => {
                    setEditingTrade(null);
                    setShowTradeForm(true);
                  }}
                  isLoading={tradesLoading}
                  activeAccount={activeAccount}
                  onDeleteTrade={deleteTrade}
                  onEditTrade={(trade) => {
                    setEditingTrade(trade);
                    setShowTradeForm(true);
                  }}
                  pairs={settings.pairs}
                />
              )}

              {activeTab === "analytics" && <AnalyticsTab trades={trades} />}

              {activeTab === "settings" && (
                <PairManager
                  pairs={settings.pairs}
                  onAddPair={updatePairs}
                  onRemovePair={updatePairs}
                  trades={trades}
                  activeAccountId={activeAccountId}
                />
              )}
            </>
          )}
        </main>

        {/* Form Modal Overlay */}
        {showTradeForm && (
          <TradeForm
            pairs={settings.pairs}
            initialDate={selectedDate}
            initialTrade={editingTrade || undefined}
            onSave={handleSaveTrade}
            onCancel={() => {
              setShowTradeForm(false);
              setEditingTrade(null);
            }}
          />
        )}

        {/* Footer */}
        <footer className="text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400/60 dark:text-slate-600/60 pt-10 select-none">
          Tradezella-Inspired Trading Journal • Express & MongoDB Connected
        </footer>
      </div>
    </div>
  );
};

export default App;
