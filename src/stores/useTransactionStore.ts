import { create } from 'zustand';
import type { Transaction, TransactionType } from '@/domain/entities';
import { db } from '@/infrastructure/db/database';

interface TransactionTotals {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

interface TransactionState {
  transactions: readonly Transaction[];
  loading: boolean;
  error: string | null;
}

interface TransactionActions {
  loadBySession: (sessionId: string) => Promise<void>;
  createTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTotals: (sessionId: string) => Promise<TransactionTotals>;
  resetError: () => void;
}

type TransactionStore = TransactionState & TransactionActions;

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

  loadBySession: async (sessionId) => {
    set({ loading: true, error: null });
    try {
      const transactions = await db.transactions
        .where('sessionId')
        .equals(sessionId)
        .toArray();
      set({ transactions, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  createTransaction: async (data) => {
    set({ loading: true, error: null });
    try {
      const now = new Date().toISOString();
      await db.transactions.add({
        ...data,
        id: crypto.randomUUID(),
        createdAt: now,
      } as Transaction);
      await get().loadBySession(data.sessionId);
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ loading: true, error: null });
    try {
      const tx = await db.transactions.get(id);
      if (tx) {
        await db.transactions.delete(id);
        await get().loadBySession(tx.sessionId);
      }
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  getTotals: async (sessionId) => {
    const transactions = await db.transactions
      .where('sessionId')
      .equals(sessionId)
      .toArray();

    const incomeTypes: TransactionType[] = ['sale_cash', 'sale_transfer', 'cash_deposit', 'refund'];
    const expenseTypes: TransactionType[] = ['expense', 'cash_withdrawal', 'adjustment'];

    const totalIncome = transactions
      .filter((t) => incomeTypes.includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => expenseTypes.includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
    };
  },

  resetError: () => set({ error: null }),
}));

export const selectTransactions = (state: TransactionStore) => state.transactions;
export const selectIsLoading = (state: TransactionStore) => state.loading;
export const selectError = (state: TransactionStore) => state.error;
export const selectIncomeTransactions = (state: TransactionStore) =>
  state.transactions.filter((t) => t.type.startsWith('sale_'));
export const selectExpenseTransactions = (state: TransactionStore) =>
  state.transactions.filter((t) => t.type === 'expense' || t.type === 'cash_withdrawal');