import React, { useState } from "react";
import { saveAs } from "file-saver";
import {
  Wrench,
  Plus,
  X,
  Download,
  Upload,
  Database,
  RefreshCw,
} from "lucide-react";
import { useModals } from "../hooks/useModals";
import { api } from "../services/api";
import type { Trade } from "../types";

interface PairManagerProps {
  pairs: string[];
  onAddPair: (pairs: string[]) => void;
  onRemovePair: (pairs: string[]) => void;
  trades: Trade[];
  activeAccountId: string | null;
}

export const PairManager: React.FC<PairManagerProps> = ({
  pairs,
  onAddPair,
  onRemovePair,
  trades,
  activeAccountId,
}) => {
  const { showAlert, showConfirm } = useModals();
  const [newPair, setNewPair] = useState("");
  const [importing, setImporting] = useState(false);

  const handleAddPair = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = newPair.trim().toUpperCase();
    if (formatted && !pairs.includes(formatted)) {
      onAddPair([...pairs, formatted]);
      setNewPair("");
    }
  };

  const handleRemovePair = async (pair: string) => {
    if (pairs.length <= 1) {
      void showAlert({
        title: "Action Restricted",
        message: "You must keep at least one trading pair.",
        type: "warning",
      });
      return;
    }
    onRemovePair(pairs.filter((p) => p !== pair));
  };

  // Export JSON Backup
  const handleExportBackup = async () => {
    try {
      const backupData = {
        version: 1,
        source: "Antigravity Trading Journal",
        exportedAt: new Date().toISOString(),
        trades: trades,
        pairs: pairs,
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, `Trading_Journal_Backup_${new Date().toISOString().split("T")[0]}.json`);
    } catch (err) {
      console.error("Backup export failed:", err);
      void showAlert({
        title: "Export Failed",
        message: "Failed to export backup.",
        type: "danger",
      });
    }
  };

  // Import JSON Backup
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmed = await showConfirm({
      title: "Import Backup Data",
      message: "Importing backup will OVERWRITE all current database logs. Proceed?",
      confirmText: "Proceed",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!confirmed) {
      e.target.value = "";
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      if (backup && Array.isArray(backup.trades)) {
        // Clear active account's existing trades
        for (const t of trades) {
          await api.deleteTrade(t.id);
        }

        // Post all trades from backup to the current account
        for (const t of backup.trades) {
          const { id, ...tradeData } = t;
          await api.createTrade({
            ...tradeData,
            accountId: activeAccountId || tradeData.accountId,
          });
        }

        if (Array.isArray(backup.pairs)) {
          onAddPair(backup.pairs);
        }

        await showAlert({
          title: "Import Successful",
          message: "Data imported successfully! The dashboard will now refresh.",
          type: "success",
        });
        window.location.reload();
      } else {
        void showAlert({
          title: "Invalid Structure",
          message: "Invalid backup file structure.",
          type: "danger",
        });
      }
    } catch (err) {
      console.error("Backup import failed:", err);
      void showAlert({
        title: "Import Failed",
        message: "Failed to import backup data. Make sure it is a valid backup JSON file.",
        type: "danger",
      });
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
      {/* Pair Management Card */}
      <div className="glass-panel rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Wrench className="h-5 w-5 text-indigo-500" /> Trading Pairs Management
        </h3>
        <p className="text-xs text-slate-400">
          Add or remove pairs from your dashboard. At least one pair must remain.
        </p>

        {/* Pair tags list */}
        <div className="flex flex-wrap gap-2 pt-1">
          {pairs.map((p) => (
            <span
              key={p}
              className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              {p}
              <button
                onClick={() => handleRemovePair(p)}
                className="text-slate-400 hover:text-rose-500 transition-all"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>

        {/* Add pair form */}
        <form onSubmit={handleAddPair} className="flex gap-2 pt-2">
          <input
            type="text"
            required
            placeholder="Add e.g. ETHUSD, EURJPY"
            value={newPair}
            onChange={(e) => setNewPair(e.target.value)}
            className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200 uppercase"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-indigo-600/10"
          >
            <Plus className="h-4 w-4" /> Add Pair
          </button>
        </form>
      </div>

      {/* Local Storage Backup Card */}
      <div className="glass-panel rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Database className="h-5 w-5 text-indigo-500" /> Local Storage & Backups
        </h3>
        <p className="text-xs text-slate-400">
          Save your database as a local JSON backup, or restore a previous back up file. Everything remains in-browser.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Export JSON button */}
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 bg-white/50 dark:bg-slate-950/50 p-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all active:scale-[0.98]"
          >
            <Download className="h-4 w-4 text-indigo-500" />
            <span>Export JSON Backup</span>
          </button>

          {/* Import JSON button */}
          <div className="relative">
            <input
              type="file"
              id="import-backup-file"
              accept=".json"
              disabled={importing}
              onChange={handleImportBackup}
              className="hidden"
            />
            <label
              htmlFor="import-backup-file"
              className={`flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer ${
                importing
                  ? "bg-slate-100 dark:bg-slate-900 opacity-60"
                  : "bg-white/50 dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              {importing ? (
                <RefreshCw className="h-4 w-4 text-indigo-500 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 text-indigo-500" />
              )}
              <span>{importing ? "Importing..." : "Import JSON Backup"}</span>
            </label>
          </div>
        </div>

        <div className="pt-2 text-[10px] text-slate-400/80 leading-normal flex items-start gap-1">
          <span>ℹ️</span>
          <span>
            Database: IndexedDB (Dexie). Clear browser caches or resetting cookies may clear data. Always keep a weekly JSON backup saved safely.
          </span>
        </div>
      </div>
    </div>
  );
};
