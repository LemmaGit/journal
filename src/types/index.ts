export interface Trade {
  id: string;
  accountId: string;
  date: string;
  pair: string;
  direction: "Long" | "Short";
  result: "Win" | "Loss" | "BE";
  risk: number;
  riskPercent: number;
  rr: number;
  notes: string;
  psychNotes: string;
  screenshots: string[]; // Base64 Data URLs
  pnl: number;        // Net Profit/Loss
  entryPrice?: number;
  exitPrice?: number;
  sl?: number;
  tp?: number;
  psychTags: string[]; // Emotions checklist
}

export interface Account {
  id: string;
  name: string;
  initialBalance: number;
  balance: number;
  currency: string;
  description?: string;
}

export interface Settings {
  theme: "light" | "dark";
  pairs: string[];
}

export interface DayStatus {
  wins: number;
  losses: number;
  bes: number;
  stopped: boolean;
  total: number;
  details: string; // Reason why stopped
}

export interface WeekStatus {
  wins: number;
  losses: number;
  stopped: boolean;
  total: number;
  details: string; // Reason why stopped
}

