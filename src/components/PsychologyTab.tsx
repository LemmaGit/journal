import React from "react";
import type { Trade } from "../types";
import {
  Brain,
  CheckSquare,
  Compass,
  AlertCircle,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface PsychologyTabProps {
  trades: Trade[];
}

export const PsychologyTab: React.FC<PsychologyTabProps> = ({ trades }) => {
  // Statistics on tags
  let positiveCount = 0;
  let negativeCount = 0;
  const tagBreakdown: { [tag: string]: { win: number; loss: number; total: number } } = {};

  trades.forEach((t) => {
    if (t.psychTags && t.psychTags.length > 0) {
      t.psychTags.forEach((tag) => {
        // Classify tags
        const isPositive = ["Discipline", "Patience", "Calm", "Plan Followed", "Acceptance"].includes(tag);
        const isNegative = ["FOMO", "Revenge Trading", "Greed", "Fear", "Overtrading", "Early Exit"].includes(tag);

        if (isPositive) positiveCount++;
        if (isNegative) negativeCount++;

        if (!tagBreakdown[tag]) {
          tagBreakdown[tag] = { win: 0, loss: 0, total: 0 };
        }
        tagBreakdown[tag].total++;
        if (t.result === "Win") tagBreakdown[tag].win++;
        else if (t.result === "Loss") tagBreakdown[tag].loss++;
      });
    }
  });

  const totalTags = positiveCount + negativeCount;
  const disciplineRatio = totalTags > 0 ? (positiveCount / totalTags) * 100 : 100;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Overview Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Discipline Meter */}
        <div className="glass-panel rounded-2xl p-6 shadow-sm flex flex-col justify-between md:col-span-2">
          <div>
            <h3 className="font-extrabold text-base text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-500" /> Psychology & Discipline Index
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Your discipline index represents the ratio of positive, patient trades relative to emotional, reactive trades.
            </p>

            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2.5 uppercase rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    Discipline Ratio
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                    {disciplineRatio.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-3 text-xs flex rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  style={{ width: `${disciplineRatio}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 rounded-full transition-all duration-500"
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-emerald-500/10 text-emerald-500 rounded">
                <ThumbsUp className="h-4 w-4" />
              </div>
              <span>Positive States: <strong>{positiveCount}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-rose-500/10 text-rose-500 rounded">
                <ThumbsDown className="h-4 w-4" />
              </div>
              <span>Negative States: <strong>{negativeCount}</strong></span>
            </div>
          </div>
        </div>

        {/* Actionable Tip Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10">
            <Brain className="h-40 w-40" />
          </div>
          <div>
            <span className="text-xs font-extrabold tracking-widest uppercase text-indigo-200">Daily Wisdom</span>
            <h4 className="text-lg font-bold mt-2 leading-snug">The best traders do not force results.</h4>
            <p className="text-xs text-indigo-100 mt-2 font-light leading-relaxed">
              They protect capital, execute high-probability setups, and respect daily limit stops. 1 Win/1 Loss = stop day. Preserve your mental capital first.
            </p>
          </div>
          <div className="text-xs font-semibold text-indigo-200 mt-4">
            — Capital Protection Rule
          </div>
        </div>
      </div>

      {/* Psychology list details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emotional States Breakdown */}
        <div className="glass-panel rounded-2xl p-5 shadow-sm">
          <h3 className="font-extrabold text-base text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <Compass className="h-5 w-5 text-indigo-500" /> Emotional Tag Metrics
          </h3>
          {Object.keys(tagBreakdown).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">
              No emotional tags recorded. Log a trade with psychological notes to inspect behaviors.
            </p>
          ) : (
            <div className="space-y-4">
              {Object.keys(tagBreakdown).map((tag) => {
                const info = tagBreakdown[tag];
                const isPositive = ["Discipline", "Patience", "Calm", "Plan Followed", "Acceptance"].includes(tag);
                const winRate = info.total > 0 ? (info.win / info.total) * 100 : 0;
                return (
                  <div key={tag} className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${isPositive ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{tag}</span>
                    </div>
                    <div className="flex gap-4 items-center text-slate-400">
                      <span>Count: <strong className="text-slate-600 dark:text-slate-200">{info.total}</strong></span>
                      <span className="font-bold text-indigo-500">{winRate.toFixed(0)}% WR</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Psychological Guardrails checklist */}
        <div className="glass-panel rounded-2xl p-5 shadow-sm">
          <h3 className="font-extrabold text-base text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-indigo-500" /> Psychological Guardrails
          </h3>
          <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex gap-2 items-start">
              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <strong>Overtrading Guardrail:</strong> Never override a "STOP" badge. If today status is stopped, close the trading terminal.
              </div>
            </li>
            <li className="flex gap-2 items-start">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong>FOMO Protection:</strong> Write down your entry criteria before pressing buy or sell. If notes are empty, the entry is unverified.
              </div>
            </li>
            <li className="flex gap-2 items-start">
              <AlertCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong>Acceptance Mindset:</strong> Losses are standard business operating costs. Acknowledge them calmly, document your psychology notes, and step away.
              </div>
            </li>
            <li className="flex gap-2 items-start">
              <HelpCircle className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <strong>Weekly Review:</strong> Generate your weekly Word report at the end of every Friday. Read through screenshots to identify recurring behavioral traps.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
