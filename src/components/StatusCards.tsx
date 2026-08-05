import React from "react";
import type { DayStatus, WeekStatus } from "../types/index";
import { Calendar, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

interface StatusCardsProps {
  todayStatus: DayStatus;
  weekStatus: WeekStatus;
  canTradeToday: boolean;
}

export const StatusCards: React.FC<StatusCardsProps> = ({
  todayStatus,
  weekStatus,
  canTradeToday: _canTradeToday,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
      {/* Today Status Card */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Today's Performance</span>
          </div>
          {todayStatus.stopped ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <AlertTriangle className="h-3 w-3" /> DAILY STOP
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle className="h-3 w-3" /> ACTIVE
            </span>
          )}
        </div>
        
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
              {todayStatus.total} {todayStatus.total === 1 ? "Trade" : "Trades"}
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-normal font-medium">
              {todayStatus.stopped ? todayStatus.details : "Within daily guardrail parameters (Max: 1W / 1L / 2BE)"}
            </p>
          </div>
          <div className="flex gap-2.5 text-xs font-bold shrink-0 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/40 px-3 py-1.5 rounded-xl">
            <span className="text-emerald-500">W {todayStatus.wins}</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-rose-500">L {todayStatus.losses}</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-amber-500 font-semibold">BE {todayStatus.bes}</span>
          </div>
        </div>
      </div>

      {/* This Week Status Card */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Weekly Progress</span>
          </div>
          {weekStatus.stopped ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <AlertTriangle className="h-3 w-3" /> WEEKLY STOP
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle className="h-3 w-3" /> ACTIVE
            </span>
          )}
        </div>
        
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
              {weekStatus.total} {weekStatus.total === 1 ? "Trade" : "Trades"}
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-normal font-medium">
              {weekStatus.stopped ? weekStatus.details : "Within weekly guardrail limits (Max: 4W / 3L)"}
            </p>
          </div>
          <div className="flex gap-2.5 text-xs font-bold shrink-0 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/40 px-3 py-1.5 rounded-xl">
            <span className="text-emerald-500">W {weekStatus.wins}</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-rose-500">L {weekStatus.losses}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
