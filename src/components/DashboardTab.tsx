import React from "react";
import type { Trade } from "../types";
import { calculateStats, todayStr } from "../utils/helpers";
import { StatusCards } from "./StatusCards";
import {
  TrendingUp,
  Activity,
  Award,
  Plus,
  Flame,
  ArrowRight,
  TrendingDown,
  CheckCircle,
} from "lucide-react";

interface DashboardTabProps {
  trades: Trade[];
  todayStatus: any;
  weekStatus: any;
  canTradeToday: boolean;
  onNewTrade: () => void;
  onSelectTab: (tab: string) => void;
  isLoading?: boolean;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  trades,
  todayStatus,
  weekStatus,
  canTradeToday,
  onNewTrade,
  onSelectTab,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Welcome Banner Skeleton */}
        <div className="h-20 bg-slate-200/50 dark:bg-slate-800/40 border border-slate-200/20 dark:border-slate-800/20 rounded-2xl"></div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/10 dark:border-slate-800/10"
            ></div>
          ))}
        </div>

        {/* Logged Trades List Skeleton */}
        <div className="h-52 bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/10 dark:border-slate-800/10"></div>
      </div>
    );
  }

  const stats = calculateStats(trades);

  // Filter today's trades
  const todayDate = todayStr();
  const todayTrades = trades.filter((t) => t.date === todayDate);

  // SVG Circular progress radius helper
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (stats.winRate / 100) * circumference;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome & Log Banner */}
      <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500 text-white rounded-full">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-sans">
              Trading Dashboard
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Welcome back. Follow your strategy, keep risk in check, and record
              your performance daily.
            </p>
          </div>
        </div>
        <button
          onClick={onNewTrade}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 glow-indigo"
        >
          <Plus className="h-4 w-4" /> Log New Trade
        </button>
      </div>

      <StatusCards
        todayStatus={todayStatus}
        weekStatus={weekStatus}
        canTradeToday={canTradeToday}
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Profit Card */}
        <div className="glass-panel rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Net Profit/Loss
              </p>
              <h3
                className={`text-2xl font-extrabold mt-2 font-sans ${stats.netProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}
              >
                {stats.netProfit >= 0
                  ? `+$${stats.netProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                  : `-$${Math.abs(stats.netProfit).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
              </h3>
            </div>
            <div
              className={`p-2.5 rounded-xl ${stats.netProfit >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
            >
              {stats.netProfit >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
            <span>Average risk size:</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              ${stats.avgRisk.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Win Rate Card */}
        <div className="glass-panel rounded-2xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Win Rate
            </p>
            <h3 className="text-2xl font-extrabold mt-2 text-indigo-500 font-sans">
              {stats.winRate.toFixed(1)}%
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Wins:{" "}
              <span className="text-emerald-500 font-semibold">
                {stats.wins}
              </span>{" "}
              | Losses:{" "}
              <span className="text-rose-500 font-semibold">
                {stats.losses}
              </span>
            </p>
          </div>
          {/* Donut Chart */}
          <div className="relative h-16 w-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-indigo-500"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-bold text-slate-600 dark:text-slate-300">
              {stats.winRate.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Profit Factor Card */}
        <div className="glass-panel rounded-2xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Profit Factor
              </p>
              <h3 className="text-2xl font-extrabold mt-2 text-indigo-500 dark:text-indigo-400 font-sans">
                {stats.profitFactor === Infinity
                  ? "∞"
                  : stats.profitFactor.toFixed(2)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
            <span>Average R:R:</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              1 : {stats.avgRR.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Streaks Card */}
        <div className="glass-panel rounded-2xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Current Streak
              </p>
              <h3
                className={`text-2xl font-extrabold mt-2 font-sans flex items-center gap-2 ${
                  stats.currentStreakType === "Win"
                    ? "text-emerald-500"
                    : stats.currentStreakType === "Loss"
                      ? "text-rose-500"
                      : "text-slate-500"
                }`}
              >
                {stats.currentStreak}{" "}
                {stats.currentStreakType === "Win"
                  ? "Wins"
                  : stats.currentStreakType === "Loss"
                    ? "Losses"
                    : "None"}
                {stats.currentStreak >= 3 && (
                  <Flame className="h-6 w-6 text-amber-500 fill-amber-500" />
                )}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex justify-between">
            <span>
              Max Win Streak:{" "}
              <span className="font-semibold text-emerald-500">
                {stats.winStreak}
              </span>
            </span>
            <span>
              Max Loss Streak:{" "}
              <span className="font-semibold text-rose-500">
                {stats.lossStreak}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Today's Trade Breakdown / List summary */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-extrabold text-base text-slate-700 dark:text-slate-300">
            Today's Logged Trades ({todayTrades.length})
          </h3>
          <button
            onClick={() => onSelectTab("calendar")}
            className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-all"
          >
            Go to Calendar <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {todayTrades.length === 0 ? (
          <div className="text-center py-6 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-sm">No trades logged today ({todayDate}).</p>
            <button
              onClick={onNewTrade}
              className="mt-2 text-xs font-semibold text-indigo-500 hover:underline"
            >
              Log a trade now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <th className="py-2">Pair</th>
                  <th className="py-2">Direction</th>
                  <th className="py-2">Result</th>
                  <th className="py-2">Risk</th>
                  <th className="py-2">R:R</th>
                  <th className="py-2">PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {todayTrades.map((t) => (
                  <tr key={t.id} className="text-slate-600 dark:text-slate-300">
                    <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                      {t.pair}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          t.direction === "Long"
                            ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                            : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                        }`}
                      >
                        {t.direction}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          t.result === "Win"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : t.result === "Loss"
                              ? "bg-rose-500/10 text-rose-500"
                              : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {t.result}
                      </span>
                    </td>
                    <td className="py-2.5">
                      ${t.risk} ({t.riskPercent}%)
                    </td>
                    <td className="py-2.5">{t.rr}R</td>
                    <td
                      className={`py-2.5 font-bold ${t.pnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {t.pnl >= 0
                        ? `+$${t.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                        : `-$${Math.abs(t.pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
