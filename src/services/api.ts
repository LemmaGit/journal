import type { Trade, Account, Settings } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `HTTP error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Accounts
  getAccounts: async (): Promise<Account[]> => {
    const accounts = await request<any[]>("/accounts");
    return accounts.map((a) => ({
      id: a._id,
      name: a.name,
      initialBalance: a.initialBalance,
      balance: a.balance,
      currency: a.currency,
      description: a.description,
    }));
  },

  createAccount: async (
    accountData: Omit<Account, "id" | "balance">,
  ): Promise<Account> => {
    const a = await request<any>("/accounts", {
      method: "POST",
      body: JSON.stringify(accountData),
    });
    return {
      id: a._id,
      name: a.name,
      initialBalance: a.initialBalance,
      balance: a.balance,
      currency: a.currency,
      description: a.description,
    };
  },

  deleteAccount: async (id: string): Promise<void> => {
    await request<void>(`/accounts/${id}`, {
      method: "DELETE",
    });
  },

  // Trades
  getTrades: async (accountId: string): Promise<Trade[]> => {
    const trades = await request<any[]>(`/trades?accountId=${accountId}`);
    return trades.map((t) => ({
      id: t._id,
      accountId: t.accountId,
      date: t.date,
      pair: t.pair,
      direction: t.direction,
      result: t.result,
      risk: t.risk,
      riskPercent: t.riskPercent,
      rr: t.rr,
      notes: t.notes,
      psychNotes: t.psychNotes,
      screenshots: t.screenshots || [],
      pnl: t.pnl,
      entryPrice: t.entryPrice,
      exitPrice: t.exitPrice,
      sl: t.sl,
      tp: t.tp,
      psychTags: t.psychTags || [],
    }));
  },

  createTrade: async (tradeData: Omit<Trade, "id">): Promise<Trade> => {
    const t = await request<any>("/trades", {
      method: "POST",
      body: JSON.stringify(tradeData),
    });
    return {
      id: t._id,
      accountId: t.accountId,
      date: t.date,
      pair: t.pair,
      direction: t.direction,
      result: t.result,
      risk: t.risk,
      riskPercent: t.riskPercent,
      rr: t.rr,
      notes: t.notes,
      psychNotes: t.psychNotes,
      screenshots: t.screenshots || [],
      pnl: t.pnl,
      entryPrice: t.entryPrice,
      exitPrice: t.exitPrice,
      sl: t.sl,
      tp: t.tp,
      psychTags: t.psychTags || [],
    };
  },

  deleteTrade: async (id: string): Promise<void> => {
    await request<void>(`/trades/${id}`, {
      method: "DELETE",
    });
  },

  // Settings
  getSettings: async (): Promise<Settings> => {
    const s = await request<any>("/settings");
    return {
      theme: s.theme,
      pairs: s.pairs,
    };
  },

  saveSettings: async (settings: Settings): Promise<Settings> => {
    const s = await request<any>("/settings", {
      method: "POST",
      body: JSON.stringify(settings),
    });
    return {
      theme: s.theme,
      pairs: s.pairs,
    };
  },
};
