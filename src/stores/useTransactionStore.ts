import { create } from 'zustand';
import type { Transaction } from '@/domain/entities';
import { db } from '@/infrastructure/db/database';
import { getSessionSummary, type SessionSummary } from '@/domain/services';

interface TransactionState {
  transactions: readonly Transaction[];
  loading: boolean;
  error: string | null;
}

interface TransactionActions {
  loadBySession: (sessionId: string) => Promise<void>;
  createTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  softDeleteTransaction: (id: string) => Promise<void>;
  getSessionSummary: (openingCash: number) => SessionSummary;
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
        .sortBy('createdAt');

      const sortedDesc = [...transactions].reverse();
      set({ transactions: sortedDesc, loading: false });
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

  softDeleteTransaction: async (id) => {
    set({ loading: true, error: null });
    try {
      const tx = await db.transactions.get(id);
      if (tx) {
        const now = new Date().toISOString();
        await db.transactions.update(id, { deletedAt: now });
        await get().loadBySession(tx.sessionId);
      }
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  getSessionSummary: (openingCash: number) => {
    return getSessionSummary(get().transactions, openingCash);
  },

  resetError: () => set({ error: null }),
}));

export const selectTransactions = (state: TransactionStore) => state.transactions;
export const selectLoading = (state: TransactionStore) => state.loading;
export const selectError = (state: TransactionStore) => state.error;
export const selectVisibleTransactions = (state: TransactionStore) =>
  state.transactions.filter((t) => !t.deletedAt);
export const selectSalesTransactions = (state: TransactionStore) =>
  state.transactions.filter(
    (t) => !t.deletedAt && (t.type === 'sale_cash' || t.type === 'sale_transfer'),
  );
export const selectExpenseTransactions = (state: TransactionStore) =>
  state.transactions.filter(
    (t) =>
      !t.deletedAt &&
      (t.type === 'expense' || t.type === 'cash_withdrawal'),
  );