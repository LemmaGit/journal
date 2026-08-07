import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Trade, Account } from "../types";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  X,
} from "lucide-react";
import { TradeList } from "./TradeList";

interface CalendarProps {
  trades: Trade[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onNewTrade: () => void;
  isLoading?: boolean;
  activeAccount: Account | null;
  onDeleteTrade: (id: string) => void;
  onEditTrade?: (trade: Trade) => void;
  pairs: string[];
}

export const Calendar: React.FC<CalendarProps> = ({
  trades,
  selectedDate,
  onSelectDate,
  onNewTrade,
  isLoading = false,
  activeAccount,
  onDeleteTrade,
  onEditTrade,
  pairs,
}) => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [showDayModal, setShowDayModal] = useState(false);
  const lastTapRef = useRef<{ [key: string]: number }>({});

  // Lock background scrolling when day modal is open
  useEffect(() => {
    if (showDayModal) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [showDayModal]);

  const handleDayClick = (dateStr: string) => {
    onSelectDate(dateStr);
    setShowDayModal(true);
  };

  // Skeleton Loader State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Monthly Statistics Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/10 dark:border-slate-800/10"
            ></div>
          ))}
        </div>

        {/* Weekly Performance Skeleton header */}
        <div className="h-4 w-32 bg-slate-200/50 dark:bg-slate-800/40 rounded-md"></div>

        {/* Weekly Performance Skeleton cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-24 bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/10 dark:border-slate-800/10"
            ></div>
          ))}
        </div>

        {/* Calendar Grid + Panel Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-[400px] bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl lg:col-span-2 border border-slate-200/10 dark:border-slate-800/10"></div>
          <div className="h-[400px] bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/10 dark:border-slate-800/10"></div>
        </div>
      </div>
    );
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday is 0, Monday is 1...

  // Shift first day so Monday is 0. If Sunday (0), it becomes 6, else day - 1
  const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // Calendar days array
  const calendarDays: (string | null)[] = [];

  // Padding days before the 1st of the month
  for (let i = 0; i < adjustedFirstDay; i++) {
    calendarDays.push(null);
  }

  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push(dateStr);
  }

  // Helper to change month
  const changeMonth = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setMonth(newMonth);
    setYear(newYear);
  };

  // Group days into weeks (chunks of 7) to render rows
  const weeks: (string | null)[][] = [];
  let currentWeek: (string | null)[] = [];

  calendarDays.forEach((day, idx) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || idx === calendarDays.length - 1) {
      // Pad the last week if it is shorter than 7
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Calculate stats for the selected month
  const monthlyTrades = trades.filter((t) => {
    const tradeDate = new Date(t.date + "T00:00:00");
    return tradeDate.getMonth() === month && tradeDate.getFullYear() === year;
  });

  const monthlyNetPnl = monthlyTrades.reduce(
    (sum, t) => sum + (Number(t.pnl) || 0),
    0,
  );
  const monthlyTotalTrades = monthlyTrades.length;
  const monthlyWins = monthlyTrades.filter((t) => t.result === "Win");
  const monthlyLosses = monthlyTrades.filter((t) => t.result === "Loss");
  const monthlyDecidedTrades = monthlyWins.length + monthlyLosses.length;
  const monthlyWinRate =
    monthlyDecidedTrades > 0
      ? (monthlyWins.length / monthlyDecidedTrades) * 100
      : 0;

  const monthlyAvgWin =
    monthlyWins.length > 0
      ? monthlyWins.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0) /
        monthlyWins.length
      : 0;
  const monthlyAvgLoss =
    monthlyLosses.length > 0
      ? monthlyLosses.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0) /
        monthlyLosses.length
      : 0;

  // Helper to get stats for a single day
  const getDayStats = (dateStr: string) => {
    const dayTrades = trades.filter((t) => t.date === dateStr);
    const total = dayTrades.length;
    const wins = dayTrades.filter((t) => t.result === "Win").length;
    const losses = dayTrades.filter((t) => t.result === "Loss").length;
    const decided = wins + losses;
    const pnl = dayTrades.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0);
    const winRate = decided > 0 ? Math.round((wins / decided) * 100) : 0;
    return { total, pnl, winRate };
  };

  // Helper to get stats for a whole week
  const getWeekStats = (weekDays: (string | null)[]) => {
    let weekPnl = 0;
    let totalTrades = 0;
    weekDays.forEach((dateStr) => {
      if (dateStr) {
        const dayTrades = trades.filter((t) => t.date === dateStr);
        totalTrades += dayTrades.length;
        weekPnl += dayTrades.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0);
      }
    });
    return { weekPnl, totalTrades };
  };

  // Current selected day's trades list
  // const selectedDayTrades = trades.filter((t) => t.date === selectedDate);
  // const selectedDayStats = getDayStats(selectedDate);

  const initialBalance = activeAccount?.initialBalance || 10000;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Monthly Statistics Summary Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Net P&L Card */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Monthly Net P&L
            </span>
            <span
              className={`text-xl font-extrabold font-sans block mt-1 ${monthlyNetPnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}
            >
              {monthlyNetPnl >= 0
                ? `+$${monthlyNetPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                : `-$${Math.abs(monthlyNetPnl).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            </span>
          </div>
          <div className="absolute right-3 bottom-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
            {monthlyNetPnl >= 0 ? (
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-rose-500" />
            )}
          </div>
        </div>

        {/* Win Rate Card */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Monthly Win Rate
            </span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-sans block mt-1">
              {monthlyWinRate.toFixed(1)}%
            </span>
          </div>
          <div className="absolute right-3 bottom-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <Award className="h-5 w-5 text-indigo-500" />
          </div>
        </div>

        {/* Total Trades Card */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Monthly Trades
            </span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-sans block mt-1">
              {monthlyTotalTrades} Trades
            </span>
          </div>
          <div className="absolute right-3 bottom-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <Activity className="h-5 w-5 text-sky-500" />
          </div>
        </div>

        {/* Avg Win/Loss Card */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Avg Win / Avg Loss
            </span>
            <div className="flex gap-2 items-center mt-1">
              <span className="text-xs font-bold text-emerald-500 font-sans">
                +${Math.round(monthlyAvgWin)}
              </span>
              <span className="text-slate-400">/</span>
              <span className="text-xs font-bold text-rose-500 font-sans">
                -${Math.round(Math.abs(monthlyAvgLoss))}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        {/* Calendar Grid card */}
        <div className="glass-panel rounded-2xl p-5 shadow-sm w-full">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-slate-800 dark:text-slate-100 font-sans">
                {new Date(year, month).toLocaleString("default", {
                  month: "long",
                })}
              </span>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="text-xs font-extrabold bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-100 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              >
                {Array.from({ length: 21 }, (_, i) => 2020 + i).map((y) => (
                  <option key={y} value={y} className="dark:bg-slate-900 font-sans">
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-slate-600 dark:text-slate-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  setMonth(now.getMonth());
                  setYear(now.getFullYear());
                  onSelectDate(
                    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
                  );
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                Today
              </button>
              <button
                onClick={() => changeMonth(1)}
                className="p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-slate-600 dark:text-slate-400"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 8-Column Grid Header: Weekdays + Weekly P&L (Tradezella Layout) */}

          <div className="grid grid-cols-8 gap-2 text-center text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-200/40 dark:border-slate-800/40 pb-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "W-P&L"].map(
              (d) => (
                <div key={d}>{d}</div>
              ),
            )}
          </div>

          {/* Days Grid */}
          <div className="space-y-2">
            {weeks.map((week, weekIdx) => {
              const { weekPnl, totalTrades } = getWeekStats(week);
              const pnlPercent = (weekPnl / initialBalance) * 100;
              const hasWeekTrades = totalTrades > 0;
              /**ring-1 ring-gray-300 hover:ring-2 hover:ring-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 */
              let weekCellStyle =
                "ml-4 aspect-square relative rounded-xl font-bold flex flex-col justify-between p-3 transition-all select-none --border text-left dark:ring-3 ring-2 dark:ring-blue-900 ring-[#FAEBD7] hover:ring-[#FAEBD7] dark:hover:ring-4 hover:ring-3 dark:hover:ring-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500";
              if (hasWeekTrades) {
                if (weekPnl >= 0) {
                  weekCellStyle +=
                    " --bg-emerald-500/5 --dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 --border-emerald-500/25";
                } else {
                  weekCellStyle +=
                    " --bg-rose-500/5 --dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 --border-rose-500/25";
                }
              } else {
                weekCellStyle +=
                  " --bg-slate-50/10 --dark:bg-slate-900/10 --text-slate-450 --dark:text-slate-550 --border-slate-200/10 dark:border-slate-800/10 opacity-40 space-y-2";
              }
              /**🎤🎤🎤 */
              return (
                <div key={weekIdx} className="grid grid-cols-8 gap-2">
                  {/* Render the 7 days */}
                  {week.map((dateStr, dayIdx) => {
                    if (!dateStr) {
                      return (
                        <div
                          key={`empty-${weekIdx}-${dayIdx}`}
                          className="aspect-square bg-slate-50/10 dark:bg-slate-950/10 rounded-xl border border-dashed border-slate-200/20 dark:border-slate-800/10"
                        ></div>
                      );
                    }

                    const isSelected = dateStr === selectedDate;
                    const { total, pnl } = getDayStats(dateStr);
                    const hasDayTrades = total > 0;

                    let cellStyle =
                      "border border-slate-200/40 dark:border-slate-800/30 text-slate-500 dark:text-slate-400 bg-gray-200/40 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900/80";

                    if (hasDayTrades) {
                      if (pnl > 0) {
                        cellStyle =
                          "cal-day-win hover:bg-emerald-500/15 dark:hover:bg-emerald-500/25";
                      } else if (pnl < 0) {
                        cellStyle =
                          "cal-day-loss hover:bg-rose-500/15 dark:hover:bg-rose-500/25";
                      } else {
                        cellStyle =
                          "cal-day-be hover:bg-amber-500/15 dark:hover:bg-amber-500/25";
                      }
                    }

                    if (isSelected) {
                      cellStyle +=
                        " ring-2 ring-indigo-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-slate-950 scale-[0.98] z-10 shadow-md";
                    }

                    const dayNumber = dateStr.split("-")[2];

                    // Track double tap state
                    const handleTouchStart = (e: React.TouchEvent) => {
                      const now = Date.now();
                      const lastTap = lastTapRef.current[dateStr] || 0;
                      if (now - lastTap < 300) {
                        e.preventDefault();
                        onSelectDate(dateStr);
                        onNewTrade();
                      }
                      lastTapRef.current[dateStr] = now;
                    };

                    return (
                      <button
                        key={dateStr}
                        onClick={() => {
                          if (isSelected) {
                            if (hasDayTrades) {
                              handleDayClick(dateStr);
                            } else onNewTrade();
                          }
                          onSelectDate(dateStr);
                        }}
                        // onDoubleClick={() => {
                        //   onSelectDate(dateStr);
                        //   if (hasDayTrades) {
                        //     handleDayClick(dateStr);
                        //   } else onNewTrade();
                        // }}
                        onTouchStart={handleTouchStart}
                        className={`aspect-square relative rounded-xl font-bold flex flex-col justify-between p-1.5 transition-all select-none ${cellStyle}`}
                      >
                        <span className="self-end text-[10px] opacity-80">
                          {Number(dayNumber)}
                        </span>

                        {hasDayTrades && (
                          <div className="w-full text-right flex flex-col justify-center  items-right flex-1">
                            <span className="text-lg text-black/70 dark:text-white/70 font-extrabold leading-tight block">
                              {pnl >= 0
                                ? `+$${Math.round(pnl)}`
                                : `-$${Math.round(Math.abs(pnl))}`}
                            </span>
                            <span className="text-xs text-black/60 dark:text-white/60 opacity-75 font-semibold leading-none block mt-0.5">
                              {total} {total === 1 ? "Trade" : "Trades"}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {/* Render the 8th column: Weekly summary */}
                  <div className={weekCellStyle}>
                    <span className="self-start text-[10px] opacity-85 uppercase tracking-wider dark:text-gray-300! text-black/60!">
                      W{weekIdx + 1}
                    </span>
                    <div className="w-full text-left flex flex-col justify-center items-left flex-1 gap-2">
                      <span className="text-lg font-extrabold leading-tight block">
                        {hasWeekTrades
                          ? weekPnl >= 0
                            ? `+$${Math.round(weekPnl)}`
                            : `-$${Math.round(Math.abs(weekPnl))}`
                          : "$0"}
                      </span>
                      <span className="text-xs opacity-75 font-semibold leading-none block mt-0.5 dark:text-gray-300! text-black/60">
                        {totalTrades} {totalTrades === 1 ? "Trade" : "Trades"}
                      </span>
                      {hasWeekTrades && (
                        <span className="text-xs opacity-80 font-bold leading-none block mt-0.5 dark:text-gray-300 text-black/60">
                          {weekPnl >= 0 ? "+" : ""}
                          {pnlPercent.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legends */}
          <div className="mt-5 pt-4 border-t border-slate-200/40 dark:border-slate-800/40 flex flex-wrap gap-x-4 gap-y-2 justify-center text-[10px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-emerald-500/10 border border-emerald-500/30"></span>
              <span>Profit Day</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-rose-500/10 border border-rose-500/30"></span>
              <span>Loss Day</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-amber-500/10 border border-amber-500/30"></span>
              <span>Break-Even Day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day Trades Modal Overlay */}
      {showDayModal &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 --backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl max-w-4xl w-full p-6 shadow-2xl overflow-hidden animate-slide-up backdrop-blur-xl max-h-[90vh] flex flex-col">
              {/* Top brand line */}
              {/* <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600" /> */}

              {/* Header */}
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/50">
                <div>
                  <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 font-sans tracking-tight">
                    Trades for{" "}
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                      undefined,
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">
                    Click trade row to expand setup details & screenshots
                  </p>
                </div>
                <button
                  onClick={() => setShowDayModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-all font-extrabold text-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body content */}
              <div className="overflow-y-auto flex-1 max-h-[60vh] pr-1">
                <TradeList
                  trades={trades.filter((t) => t.date === selectedDate)}
                  onDeleteTrade={onDeleteTrade}
                  onEditTrade={(trade) => {
                    setShowDayModal(false);
                    if (onEditTrade) onEditTrade(trade);
                  }}
                  pairs={pairs}
                />
              </div>

              {/* Footer options */}
              <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/50">
                <button
                  onClick={() => {
                    setShowDayModal(false);
                    onNewTrade();
                  }}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-indigo-600/10"
                >
                  <Plus className="h-4 w-4" /> Log Trade on this date
                </button>
                <button
                  onClick={() => setShowDayModal(false)}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800/80 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
