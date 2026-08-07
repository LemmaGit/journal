import React from "react";
import type { Trade } from "../types";
import { calculateStats } from "../utils/helpers";
import {
  BarChart2,
  TrendingUp,
  Activity,
  Calendar,
  Shield,
} from "lucide-react";

interface AnalyticsTabProps {
  trades: Trade[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ trades }) => {
  if (trades.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 animate-slide-up">
        <Activity className="h-12 w-12 mx-auto text-indigo-500 mb-3" />
        <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300">No Analytics Available</h3>
        <p className="text-sm mt-1">Log some trades first to populate performance charts.</p>
      </div>
    );
  }

  const stats = calculateStats(trades);

  // --- 1. Equity Curve Calculation ---
  const sortedTrades = [...trades].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.id.localeCompare(b.id);
  });

  let cumulativePnl = 0;
  const equityPoints = [{ x: 0, y: 0, date: "Start" }];
  sortedTrades.forEach((t, i) => {
    cumulativePnl += t.pnl;
    equityPoints.push({
      x: i + 1,
      y: cumulativePnl,
      date: t.date,
    });
  });

  // Calculate SVG dimensions for Equity Curve
  const svgWidth = 600;
  const svgHeight = 220;
  const padding = 30;

  const yValues = equityPoints.map((p) => p.y);
  const minY = Math.min(0, ...yValues);
  const maxY = Math.max(100, ...yValues);
  const yRange = maxY - minY || 1;

  const getSvgX = (index: number) => {
    return padding + (index / (equityPoints.length - 1 || 1)) * (svgWidth - 2 * padding);
  };

  const getSvgY = (value: number) => {
    return (
      svgHeight -
      padding -
      ((value - minY) / yRange) * (svgHeight - 2 * padding)
    );
  };

  // Build the line path
  let linePath = "";
  let areaPath = "";

  if (equityPoints.length > 0) {
    linePath = `M ${getSvgX(0)} ${getSvgY(equityPoints[0].y)}`;
    equityPoints.forEach((p, idx) => {
      if (idx > 0) {
        linePath += ` L ${getSvgX(idx)} ${getSvgY(p.y)}`;
      }
    });

    // For area chart, close the path to the zero line or bottom
    const zeroY = getSvgY(minY);
    areaPath = linePath + ` L ${getSvgX(equityPoints.length - 1)} ${zeroY} L ${getSvgX(0)} ${zeroY} Z`;
  }

  // --- 2. Pair Performance ---
  const pairStats: { [pair: string]: { wins: number; losses: number; total: number; pnl: number } } = {};
  trades.forEach((t) => {
    if (!pairStats[t.pair]) {
      pairStats[t.pair] = { wins: 0, losses: 0, total: 0, pnl: 0 };
    }
    pairStats[t.pair].total++;
    pairStats[t.pair].pnl += t.pnl;
    if (t.result === "Win") pairStats[t.pair].wins++;
    else if (t.result === "Loss") pairStats[t.pair].losses++;
  });

  const pairStatsList = Object.keys(pairStats).map((p) => ({
    pair: p,
    ...pairStats[p],
    winRate: (pairStats[p].wins + pairStats[p].losses) > 0 ? (pairStats[p].wins / (pairStats[p].wins + pairStats[p].losses)) * 100 : 0,
  })).sort((a, b) => b.pnl - a.pnl);

  // --- 3. Weekday Performance ---
  const weekdayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const weekdayStats = weekdayNames.map((day) => ({ name: day, wins: 0, losses: 0, total: 0, pnl: 0 }));

  trades.forEach((t) => {
    const parts = t.date.split("-");
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    let dayIdx = d.getDay() - 1; // Mon is 0, Sun is 6
    if (dayIdx < 0) dayIdx = 6; // Sunday fix
    if (dayIdx >= 0 && dayIdx < 7) {
      weekdayStats[dayIdx].total++;
      weekdayStats[dayIdx].pnl += t.pnl;
      if (t.result === "Win") weekdayStats[dayIdx].wins++;
      else if (t.result === "Loss") weekdayStats[dayIdx].losses++;
    }
  });



  return (
    <div className="space-y-6 animate-slide-up">
      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 shadow-sm text-center">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Trades</span>
          <h4 className="text-xl font-bold mt-1 text-slate-700 dark:text-slate-300">{stats.total}</h4>
        </div>
        <div className="glass-panel rounded-2xl p-4 shadow-sm text-center">
          <span className="text-xs text-slate-400 font-semibold uppercase">Win Rate</span>
          <h4 className="text-xl font-bold mt-1 text-indigo-500">{stats.winRate.toFixed(1)}%</h4>
        </div>
        <div className="glass-panel rounded-2xl p-4 shadow-sm text-center">
          <span className="text-xs text-slate-400 font-semibold uppercase">Net Profit</span>
          <h4 className={`text-xl font-bold mt-1 ${stats.netProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            ${stats.netProfit.toFixed(0)}
          </h4>
        </div>
        <div className="glass-panel rounded-2xl p-4 shadow-sm text-center">
          <span className="text-xs text-slate-400 font-semibold uppercase">Profit Factor</span>
          <h4 className="text-xl font-bold mt-1 text-slate-700 dark:text-slate-300">
            {stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)}
          </h4>
        </div>
      </div>

      {/* Equity Curve SVG */}
      <div className="glass-panel rounded-2xl p-5 shadow-sm">
        <h3 className="font-extrabold text-base text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-500" /> Cumulative Equity Growth (PnL)
        </h3>
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible"
          >
            {/* Gradients */}
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Zero Line */}
            <line
              x1={padding}
              y1={getSvgY(0)}
              x2={svgWidth - padding}
              y2={getSvgY(0)}
              className="stroke-slate-300 dark:stroke-slate-700"
              strokeDasharray="4 4"
              strokeWidth="1"
            />

            {/* Y axis labels */}
            <text x={padding - 5} y={getSvgY(maxY)} className="text-[10px] fill-slate-400 font-semibold text-right" textAnchor="end">
              ${maxY.toFixed(0)}
            </text>
            <text x={padding - 5} y={getSvgY(0)} className="text-[10px] fill-slate-400 font-semibold text-right" textAnchor="end">
              $0
            </text>
            <text x={padding - 5} y={getSvgY(minY)} className="text-[10px] fill-slate-400 font-semibold text-right" textAnchor="end">
              ${minY.toFixed(0)}
            </text>

            {/* Grid Line guides */}
            <line x1={padding} y1={padding} x2={padding} y2={svgHeight - padding} className="stroke-slate-200 dark:stroke-slate-800" />
            <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} className="stroke-slate-200 dark:stroke-slate-800" />

            {/* Area Path */}
            {areaPath && (
              <path d={areaPath} fill="url(#equityGrad)" />
            )}

            {/* Line Path */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                className="stroke-indigo-500 dark:stroke-indigo-400"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Trade dots */}
            {equityPoints.map((p, idx) => (
              <circle
                key={idx}
                cx={getSvgX(idx)}
                cy={getSvgY(p.y)}
                r="3.5"
                className="fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-slate-950"
                strokeWidth="1.5"
                style={{ cursor: "pointer" }}
              >
                <title>{`Trade #${idx}: ${p.date} PnL: $${p.y.toFixed(0)}`}</title>
              </circle>
            ))}
          </svg>
        </div>
      </div>

      {/* Grid: Pair and Weekday breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pair Performance */}
        <div className="glass-panel rounded-2xl p-5 shadow-sm">
          <h3 className="font-extrabold text-base text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-indigo-500" /> Pair Breakdown
          </h3>
          <div className="space-y-4">
            {pairStatsList.slice(0, 5).map((p) => (
              <div key={p.pair} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{p.pair} ({p.total} trades)</span>
                  <div className="flex gap-2">
                    <span className="text-indigo-500">{p.winRate.toFixed(0)}% WR</span>
                    <span className={p.pnl >= 0 ? "text-emerald-500" : "text-rose-500"}>
                      {p.pnl >= 0 ? `+$${p.pnl.toFixed(0)}` : `-$${Math.abs(p.pnl).toFixed(0)}`}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(p.wins / p.total) * 100}%` }}
                  ></div>
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${(p.losses / p.total) * 100}%` }}
                  ></div>
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${((p.total - p.wins - p.losses) / p.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekday Performance */}
        <div className="glass-panel rounded-2xl p-5 shadow-sm">
          <h3 className="font-extrabold text-base text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500" /> Performance by Weekday
          </h3>
          <div className="space-y-3.5">
            {weekdayStats.filter((w) => w.total > 0).map((w) => {
              const wr = w.total > 0 ? (w.wins / w.total) * 100 : 0;
              return (
                <div key={w.name} className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 w-24">{w.name}</span>
                  <div className="flex-1 px-4">
                    <div className="relative h-4 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden flex items-center pl-2">
                      <div
                        className={`absolute top-0 left-0 h-full ${w.pnl >= 0 ? "bg-emerald-500/20" : "bg-rose-500/20"}`}
                        style={{ width: `${Math.min(100, (w.total / trades.length) * 100)}%` }}
                      ></div>
                      <span className="text-[10px] font-bold text-slate-500 z-10">{w.total} Trades</span>
                    </div>
                  </div>
                  <div className="text-right w-28">
                    <span className="text-xs font-semibold text-slate-400 mr-2">{wr.toFixed(0)}% WR</span>
                    <span className={`font-bold text-xs ${w.pnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {w.pnl >= 0 ? `+$${w.pnl.toFixed(0)}` : `-$${Math.abs(w.pnl).toFixed(0)}`}
                    </span>
                  </div>
                </div>
              );
            })}
            {weekdayStats.filter((w) => w.total > 0).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No data logged for active weekdays.</p>
            )}
          </div>
        </div>
      </div>


      {/* Strict Rule Performance Summary */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 text-white rounded-full">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Strict Rule Compliance</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              The stop rules (1 Win, 1 Loss, 2 BE daily / 4 Wins, 3 Losses weekly) enforce capital preservation. Your dashboard updates real-time to maintain discipline.
            </p>
          </div>
        </div>
        <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
          V1 Verified
        </span>
      </div>
    </div>
  );
};
