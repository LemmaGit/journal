import type { Trade, DayStatus, WeekStatus } from "../types/index";

export const todayStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const getWeekId = (dateStr: string): string => {
  // Parse date as local timezone
  const parts = dateStr.split("-");
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const day = d.getDay();
  // Adjust to Monday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
};

export const getDayStatus = (trades: Trade[], dateStr: string): DayStatus => {
  const dayTrades = trades.filter((t) => t.date === dateStr);
  const wins = dayTrades.filter((t) => t.result === "Win").length;
  const losses = dayTrades.filter((t) => t.result === "Loss").length;
  const bes = dayTrades.filter((t) => t.result === "BE").length;

  let stopped = false;
  let details = "Trading allowed";

  if (wins >= 1) {
    stopped = true;
    details = "Daily Stop: 1 Win reached (Stop Day)";
  } else if (losses >= 1) {
    stopped = true;
    details = "Daily Stop: 1 Loss reached (Stop Day)";
  } else if (bes >= 2) {
    stopped = true;
    details = "Daily Stop: 2 Break-Evens reached (Stop Day)";
  }

  return { wins, losses, bes, stopped, total: dayTrades.length, details };
};

export const getWeekStatus = (trades: Trade[], weekId: string): WeekStatus => {
  // Get all trades for the week containing weekId
  const weekTrades = trades.filter((t) => getWeekId(t.date) === weekId);
  const wins = weekTrades.filter((t) => t.result === "Win").length;
  const losses = weekTrades.filter((t) => t.result === "Loss").length;

  let stopped = false;
  let details = "Trading allowed";

  if (wins >= 4) {
    stopped = true;
    details = "Weekly Stop: 4 Wins reached (Stop Week)";
  } else if (losses >= 3) {
    stopped = true;
    details = "Weekly Stop: 3 Losses reached (Stop Week)";
  }

  return { wins, losses, stopped, total: weekTrades.length, details };
};

export interface Stats {
  total: number;
  wins: number;
  losses: number;
  bes: number;
  winRate: number;
  netProfit: number;
  profitFactor: number;
  avgRR: number;
  avgRisk: number;
  winStreak: number;
  lossStreak: number;
  currentStreak: number;
  currentStreakType: "Win" | "Loss" | "None";
}

export const calculateStats = (trades: Trade[]): Stats => {
  const total = trades.length;
  const wins = trades.filter((t) => t.result === "Win").length;
  const losses = trades.filter((t) => t.result === "Loss").length;
  const bes = trades.filter((t) => t.result === "BE").length;

  const decidedTrades = wins + losses;
  const winRate = decidedTrades > 0 ? (wins / decidedTrades) * 100 : 0;
  const avgRR = trades.reduce((sum, t) => sum + (Number(t.rr) || 0), 0) / (total || 1);
  const avgRisk = trades.reduce((sum, t) => sum + (Number(t.risk) || 0), 0) / (total || 1);

  // Profit calculations
  let netProfit = 0;
  let grossProfit = 0;
  let grossLoss = 0;

  trades.forEach((t) => {
    const pnlVal = Number(t.pnl) || 0;
    netProfit += pnlVal;
    if (pnlVal > 0) {
      grossProfit += pnlVal;
    } else if (pnlVal < 0) {
      grossLoss += Math.abs(pnlVal);
    }
  });

  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // Streak calculations (chronological order)
  const sortedTrades = [...trades].sort((a, b) => {
    // Sort by date, and then by id
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.id.localeCompare(b.id);
  });

  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  sortedTrades.forEach((t) => {
    if (t.result === "Win") {
      currentWinStreak++;
      currentLossStreak = 0;
      if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
    } else if (t.result === "Loss") {
      currentLossStreak++;
      currentWinStreak = 0;
      if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
    } else {
      // BE doesn't break streak or does it? In trading, usually BE neutralizes but doesn't count towards streak. Let's reset streak or preserve it. Let's reset streak on BE as well.
      currentWinStreak = 0;
      currentLossStreak = 0;
    }
  });

  // Calculate current streak
  let currentStreak = 0;
  let currentStreakType: "Win" | "Loss" | "None" = "None";

  if (sortedTrades.length > 0) {
    const revTrades = [...sortedTrades].reverse();
    const firstResult = revTrades[0].result;
    if (firstResult === "Win") {
      currentStreakType = "Win";
      for (const t of revTrades) {
        if (t.result === "Win") currentStreak++;
        else break;
      }
    } else if (firstResult === "Loss") {
      currentStreakType = "Loss";
      for (const t of revTrades) {
        if (t.result === "Loss") currentStreak++;
        else break;
      }
    }
  }

  return {
    total,
    wins,
    losses,
    bes,
    winRate,
    netProfit,
    profitFactor,
    avgRR,
    avgRisk,
    winStreak: maxWinStreak,
    lossStreak: maxLossStreak,
    currentStreak,
    currentStreakType,
  };
};

