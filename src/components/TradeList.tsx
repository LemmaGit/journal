import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Trade } from "../types";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  Calendar,
  Filter,
  Eye,
  X,
} from "lucide-react";
import { useModals } from "../hooks/useModals";

interface TradeListProps {
  trades: Trade[];
  onDeleteTrade: (id: string) => void;
  pairs: string[];
}

export const TradeList: React.FC<TradeListProps> = ({
  trades,
  onDeleteTrade,
  pairs,
}) => {
  const { showConfirm } = useModals();
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<"All" | "Win" | "Loss" | "BE">("All");
  const [pairFilter, setPairFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Lock body scroll when Lightbox is open
  useEffect(() => {
    if (lightboxImage) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [lightboxImage]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter trades based on search, result and pair
  const filteredTrades = trades
    .filter((t) => {
      const matchesSearch =
        t.pair.toLowerCase().includes(search.toLowerCase()) ||
        t.notes.toLowerCase().includes(search.toLowerCase()) ||
        t.psychNotes.toLowerCase().includes(search.toLowerCase()) ||
        (t.psychTags && t.psychTags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())));

      const matchesResult = resultFilter === "All" || t.result === resultFilter;
      const matchesPair = pairFilter === "All" || t.pair === pairFilter;

      return matchesSearch && matchesResult && matchesPair;
    })
    .sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.id.localeCompare(a.id);
    });

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Search and Filters Header */}
      <div className="glass-panel rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes, pairs, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
          {/* Pair filter dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/80 rounded-xl px-2.5 py-1 text-slate-600 dark:text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <select
              value={pairFilter}
              onChange={(e) => setPairFilter(e.target.value)}
              className="text-xs bg-transparent border-0 outline-none pr-3 cursor-pointer py-1 text-slate-700 dark:text-slate-200"
            >
              <option value="All">All Pairs</option>
              {pairs.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Result filters button group */}
          <div className="flex bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-1 shrink-0">
            {(["All", "Win", "Loss", "BE"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setResultFilter(r)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  resultFilter === r
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trades List View */}
      {filteredTrades.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-sm">No trades matched your search/filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTrades.map((t) => {
            const isExpanded = expandedId === t.id;
            return (
              <div
                key={t.id}
                className="glass-panel rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Header Summary Row */}
                <div
                  onClick={() => toggleExpand(t.id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-all select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/5 border border-indigo-500/10 text-indigo-500 rounded-xl shrink-0">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 font-sans">
                        {t.pair}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">{t.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:gap-5">
                    {/* Direction */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase ${
                      t.direction === "Long" ? "bg-sky-500/10 text-sky-600 dark:text-sky-400" : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                    }`}>
                      {t.direction}
                    </span>

                    {/* Result */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase ${
                      t.result === "Win" ? "bg-emerald-500/10 text-emerald-500" : t.result === "Loss" ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
                    }`}>
                      {t.result}
                    </span>

                    {/* PnL */}
                    <span className={`font-extrabold text-sm w-16 text-right font-sans ${t.pnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {t.pnl >= 0 ? `+$${t.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `-$${Math.abs(t.pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    </span>

                    {/* Collapsible Trigger */}
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>

                {/* Collapsible Body */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-950/10 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
                    {/* Panel 1: Trade Metrics */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Metrics & Sizing</h4>
                      <div className="bg-white/50 dark:bg-slate-900/30 rounded-xl p-3 border border-slate-200/40 dark:border-slate-800/40 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Risk ($):</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">${t.risk}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Risk (%):</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{t.riskPercent}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Reward Ratio:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{t.rr}R</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Entry Price:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{t.entryPrice !== undefined ? t.entryPrice : "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Exit Price:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{t.exitPrice !== undefined ? t.exitPrice : "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Stop Loss:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{t.sl !== undefined ? t.sl : "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Take Profit:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{t.tp !== undefined ? t.tp : "-"}</span>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={async () => {
                          const confirmed = await showConfirm({
                            title: "Delete Trade Log",
                            message: "Are you sure you want to delete this trade log? This action is permanent.",
                            confirmText: "Delete",
                            cancelText: "Cancel",
                            type: "danger",
                          });
                          if (confirmed) {
                            onDeleteTrade(t.id);
                          }
                        }}
                        className="flex items-center justify-center gap-1.5 w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 py-2 rounded-xl text-xs font-bold border border-rose-500/10 transition-all active:scale-95"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Trade Log
                      </button>
                    </div>

                    {/* Panel 2: Notes & Psychology */}
                    <div className="space-y-4 md:col-span-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Setup Notes</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/50 dark:bg-slate-900/30 rounded-xl p-3 border border-slate-200/40 dark:border-slate-800/40 min-h-[70px]">
                            {t.notes || "No setup notes recorded."}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Psychology & Mood</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/50 dark:bg-slate-900/30 rounded-xl p-3 border border-slate-200/40 dark:border-slate-800/40 min-h-[70px]">
                            {t.psychNotes || "No psychology notes recorded."}
                          </p>
                        </div>
                      </div>

                      {/* Psychological Tags */}
                      {t.psychTags && t.psychTags.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Emotional State</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {t.psychTags.map((tag) => {
                              const isPositive = ["Discipline", "Patience", "Calm", "Plan Followed", "Acceptance"].includes(tag);
                              return (
                                <span
                                  key={tag}
                                  className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                                    isPositive
                                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500"
                                      : "bg-rose-500/10 border-rose-500/25 text-rose-500"
                                  }`}
                                >
                                  {tag}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Screenshot attachments if any */}
                      {t.screenshots && t.screenshots.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5 text-indigo-500" /> Attached Chart Screenshots ({t.screenshots.length})
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {t.screenshots.map((src, idx) => (
                              <div
                                key={idx}
                                onClick={() => setLightboxImage(src)}
                                className="cursor-pointer rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video shadow-sm hover:scale-[1.03] transition-all duration-300 relative group"
                              >
                                <img
                                  src={src}
                                  alt={`Chart Screenshot ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-[10px] font-bold gap-1">
                                  <Eye className="h-3 w-3" /> View Large
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && createPortal(
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[100] animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image frame
          >
            <img
              src={lightboxImage}
              alt="Enlarged screenshot"
              className="max-w-full max-h-[85vh] object-contain"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/85 rounded-xl text-white hover:scale-105 active:scale-95 transition-all border border-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
