import React, { useState } from "react";
import {
  Sun,
  Moon,
  Plus,
  Trash2,
  LayoutDashboard,
  Calendar,
  BarChart3,
  FileDown,
  Settings,
  Wallet,
} from "lucide-react";
import type { Account } from "../types";
import { useModals } from "../hooks/useModals";

interface HeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onClearAll: () => void;
  onNewTrade: () => void;
  onExport: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  canTradeToday: boolean;
  accounts: Account[];
  activeAccountId: string | null;
  onSelectAccount: (id: string) => void;
  onCreateAccount: (name: string, initialBalance: number) => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onClearAll,
  onNewTrade,
  onExport,
  activeTab,
  onSelectTab,
  canTradeToday: _canTradeToday,
  accounts,
  activeAccountId,
  onSelectAccount,
  onCreateAccount,
}) => {
  // Navigation tabs
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const { showAlert } = useModals();
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountBalance, setNewAccountBalance] = useState("10000");

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;

    try {
      await onCreateAccount(newAccountName.trim(), parseFloat(newAccountBalance) || 0);
      setNewAccountName("");
      setNewAccountBalance("10000");
      setShowAddAccountModal(false);
    } catch (err) {
      console.error(err);
      void showAlert({
        title: "Account Creation Failed",
        message: "Failed to create the new account. Please verify input values and try again.",
        type: "danger",
      });
    }
  };

  // activeAccount is unused, removed line

  return (
    <header className="space-y-4 mb-6">
      {/* Brand logo & Global controls */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30 shrink-0">
            <BarChart3 className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight font-sans text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              Antigravity <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/10">V1 Journal</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Capital Guarded Trading</p>
          </div>
        </div>

        {/* Account Selector Dropdown & Quick stats */}
        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap lg:flex-nowrap justify-between lg:justify-end">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 px-3 py-2 rounded-xl">
              <Wallet className="h-4 w-4 text-indigo-500 shrink-0" />
              <select
                value={activeAccountId || ""}
                onChange={(e) => onSelectAccount(e.target.value)}
                className="text-xs bg-transparent border-0 outline-none text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
              >
                {accounts.length === 0 ? (
                  <option value="">No Accounts</option>
                ) : (
                  accounts.map((acc) => (
                    <option key={acc.id} value={acc.id} className="dark:bg-slate-950 dark:text-slate-100">
                      {acc.name} (${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              onClick={() => setShowAddAccountModal(true)}
              title="Create new trading account"
              className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-500/15 hover:bg-indigo-600/20 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Theme switcher */}
            <button
              onClick={onToggleTheme}
              title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
              className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-slate-500 dark:text-slate-400 active:scale-95 bg-white/50 dark:bg-slate-950/50"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Export Report */}
            <button
              onClick={onExport}
              title="Export Weekly Word Report"
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-600/10"
            >
              <FileDown className="h-4 w-4" /> <span className="hidden sm:inline">Export Report</span>
            </button>

            {/* New Trade */}
            <button
              onClick={onNewTrade}
              disabled={!activeAccountId}
              className={`p-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md ${
                activeAccountId
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10 shadow-md glow-indigo"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
              }`}
            >
              <Plus className="h-4 w-4" /> <span>New Trade</span>
            </button>

            {/* Clear Data */}
            <button
              onClick={onClearAll}
              title="Clear all data from active account"
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 p-2.5 rounded-xl transition-all border border-rose-500/10 active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 select-none scrollbar-none no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                  : "bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Add Account Modal Popover */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-slide-up space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-indigo-500" /> Create Trading Account
              </h3>
              <button
                onClick={() => setShowAddAccountModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateAccountSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FTMO Funded, Personal Live"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">
                  Initial Balance ($)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="10000"
                  value={newAccountBalance}
                  onChange={(e) => setNewAccountBalance(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="px-4 py-2 text-xs font-bold border border-slate-200/60 dark:border-slate-800/85 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl active:scale-95"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
