import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Upload,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import type { Trade } from "../types";

interface TradeFormProps {
  pairs: string[];
  initialDate: string;
  onSave: (tradeData: Omit<Trade, "id" | "accountId">) => Promise<void> | void;
  onCancel: () => void;
}

const PSYCH_TAGS = {
  positive: ["Discipline", "Patience", "Calm", "Plan Followed", "Acceptance"],
  negative: [
    "FOMO",
    "Revenge Trading",
    "Greed",
    "Fear",
    "Overtrading",
    "Early Exit",
  ],
};

export const TradeForm: React.FC<TradeFormProps> = ({
  pairs,
  initialDate,
  onSave,
  onCancel,
}) => {
  const [date, setDate] = useState(initialDate);
  const [pair, setPair] = useState(pairs[0] || "EURUSD");
  const [direction, setDirection] = useState<"Long" | "Short">("Long");
  const [result, setResult] = useState<"Win" | "Loss" | "BE">("Win");

  const [risk, setRisk] = useState<number>(100);
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [rr, setRr] = useState<number>(2);

  const [pnl, setPnl] = useState<number>(200);
  const [isCustomPnl, setIsCustomPnl] = useState(false);

  const [entryPrice, setEntryPrice] = useState<string>("");
  const [exitPrice, setExitPrice] = useState<string>("");
  const [sl, setSl] = useState<string>("");
  const [tp, setTp] = useState<string>("");

  const [notes, setNotes] = useState("");
  const [psychNotes, setPsychNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Lock body scroll when TradeForm is open
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Sync PnL dynamically when risk, rr, or result changes, unless overridden
  useEffect(() => {
    if (!isCustomPnl) {
      if (result === "Win") {
        setPnl(risk * rr);
      } else if (result === "Loss") {
        setPnl(-risk);
      } else {
        setPnl(0);
      }
    }
  }, [risk, rr, result, isCustomPnl]);

  // Sync pair if list of pairs changes
  useEffect(() => {
    if (pairs.length > 0 && !pairs.includes(pair)) {
      setPair(pairs[0]);
    }
  }, [pairs, pair]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Images must be smaller than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setScreenshots((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const tradeData = {
        date,
        pair,
        direction,
        result,
        risk,
        riskPercent,
        rr,
        pnl,
        notes,
        psychNotes,
        psychTags: selectedTags,
        screenshots,
        entryPrice: entryPrice ? parseFloat(entryPrice) : undefined,
        exitPrice: exitPrice ? parseFloat(exitPrice) : undefined,
        sl: sl ? parseFloat(sl) : undefined,
        tp: tp ? parseFloat(tp) : undefined,
      };

      await onSave(tradeData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to log the trade.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 --backdrop-blur-md transition-opacity duration-300"
        onClick={onCancel}
      />

      {/* Modal Card */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden animate-slide-up --backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        {/* Top brand line */}
        {/* <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600" /> */}

        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/50">
          <div>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 font-sans tracking-tight flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-indigo-500" /> Log New Trade
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">
              Journal performance details & rule parameters
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-2 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                Trade Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
              />
            </div>

            {/* Pair Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                Trading Pair
              </label>
              <select
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                {pairs.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Direction Segmented Control */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                Direction
              </label>
              <div className="flex bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setDirection("Long")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    direction === "Long"
                      ? "bg-sky-500 text-white shadow-md shadow-sky-500/15"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Long
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("Short")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    direction === "Short"
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/15"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Short
                </button>
              </div>
            </div>

            {/* Result Segmented Control */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                Outcome
              </label>
              <div className="flex bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setResult("Win")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    result === "Win"
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/15"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Win
                </button>
                <button
                  type="button"
                  onClick={() => setResult("Loss")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    result === "Loss"
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/15"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Loss
                </button>
                <button
                  type="button"
                  onClick={() => setResult("BE")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    result === "BE"
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/15"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  BE
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Risk $ */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                Risk Amount ($)
              </label>
              <input
                type="number"
                required
                min="0"
                value={risk}
                onChange={(e) =>
                  setRisk(Math.max(0, parseFloat(e.target.value) || 0))
                }
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
              />
            </div>

            {/* Risk % */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                Risk (%)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={riskPercent}
                onChange={(e) =>
                  setRiskPercent(Math.max(0, parseFloat(e.target.value) || 0))
                }
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
              />
            </div>

            {/* R:R */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                Target R:R
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.1"
                value={rr}
                onChange={(e) =>
                  setRr(Math.max(0, parseFloat(e.target.value) || 0))
                }
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Computed Net PnL Card */}
          <div className="p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-50/40 dark:bg-slate-950/20 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                  Net Profit / Loss
                </span>
                <span
                  className={`text-lg font-extrabold font-sans block mt-1 ${pnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {pnl >= 0
                    ? `+$${pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                    : `-$${Math.abs(pnl).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                </span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-500 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={isCustomPnl}
                  onChange={(e) => setIsCustomPnl(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                />
                Custom P&L
              </label>
            </div>

            {isCustomPnl && (
              <div className="pt-2">
                <input
                  type="number"
                  placeholder="Enter custom P&L"
                  value={pnl}
                  onChange={(e) => setPnl(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
                />
              </div>
            )}
          </div>

          {/* Toggle Advanced Section */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-all flex items-center gap-1 cursor-pointer"
            >
              {showAdvanced
                ? "Hide Advanced Parameters"
                : "Show Advanced (Prices & SL/TP)"}
            </button>
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 animate-slide-up">
              {/* Entry Price */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Entry Price
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="1.0850"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* Exit Price */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Exit Price
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="1.0920"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* SL */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Stop Loss (SL)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="1.0820"
                  value={sl}
                  onChange={(e) => setSl(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* TP */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Take Profit (TP)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="1.0950"
                  value={tp}
                  onChange={(e) => setTp(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Notes */}
            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                Setup Notes
              </label>
              <textarea
                placeholder="Log your execution triggers, setup pattern, mistakes, or comments..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-750 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 min-h-20 max-h-36"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                Psychology & Mood notes
              </label>
              <textarea
                placeholder="Log how you felt before, during, and after this trade. Was it an impulse trade?"
                value={psychNotes}
                onChange={(e) => setPsychNotes(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-755 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 min-h-20 max-h-36"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-rose-500 font-bold bg-rose-500/5 p-2.5 rounded-xl border border-rose-500/10 animate-pulse">
              <AlertCircle className="h-4 w-4" /> {errorMsg}
            </div>
          )}

          {/* Behavioral Tags Section */}
          <div className="space-y-3 bg-slate-50/20 dark:bg-slate-950/10 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
              Behavioral & Psychological Tags
            </span>

            <div className="space-y-2">
              <div>
                <span className="text-[9px] font-bold text-emerald-500 dark:text-emerald-450 uppercase tracking-wide block mb-1">
                  ✅ Positive Habits
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PSYCH_TAGS.positive.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                          isSelected
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/30 font-extrabold"
                            : "bg-white dark:bg-slate-900 text-slate-450 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:text-slate-605 dark:hover:text-slate-400"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-[9px] font-bold text-rose-500 dark:text-rose-450 uppercase tracking-wide block mb-1">
                  ⚠️ Behavioral Hazards
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PSYCH_TAGS.negative.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                          isSelected
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-500/30 font-extrabold"
                            : "bg-white dark:bg-slate-900 text-slate-450 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:text-slate-605 dark:hover:text-slate-400"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Screenshots Uploader */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
              Chart Screenshots
            </span>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/20 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer transition-all min-h-24">
                <Upload className="h-5 w-5 text-indigo-500 mb-1" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-450">
                  Upload images
                </span>
                <span className="text-[8px] text-slate-400">
                  PNG, JPG up to 5MB
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {screenshots.length > 0 && (
                <div className="flex-1 flex gap-2 overflow-x-auto p-1 max-w-sm rounded-xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/10 dark:bg-slate-950/10 items-center scrollbar-none">
                  {screenshots.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative shrink-0 h-16 w-16 rounded-lg border border-slate-250 dark:border-slate-800 overflow-hidden shadow-sm"
                    >
                      <img
                        src={src}
                        alt={`Upload preview ${idx}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(idx)}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/85 text-white hover:bg-red-650 hover:text-white transition-all shadow"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 dark:border-slate-800/50">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl active:scale-95 transition-all shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Trade"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
