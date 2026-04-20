import { create } from 'zustand';
import type { CashSession } from '@/domain/entities';
import { db } from '@/infrastructure/db/database';

interface SessionState {
  sessions: readonly CashSession[];
  activeSession: CashSession | null;
  selectedSessionId: string | null;
  loading: boolean;
  error: string | null;
}

interface SessionActions {
  loadSessions: () => Promise<void>;
  openSession: (branchId: string, name: string, openingCash: number) => Promise<string | undefined>;
  closeSession: (sessionId: string, countedClosingCash: number) => Promise<void>;
  setActiveSession: (id: string | null) => void;
  loadSessionById: (id: string) => Promise<void>;
  resetError: () => void;
}

type SessionStore = SessionState & SessionActions;

async function calculateExpectedClosingCash(sessionId: string, openingCash: number): Promise<number> {
  const transactions = await db.transactions
    .where('sessionId')
    .equals(sessionId)
    .toArray();

  const incomeTypes = ['sale_cash', 'sale_transfer', 'cash_deposit', 'refund'];
  const expenseTypes = ['expense', 'cash_withdrawal', 'adjustment'];

  const totalIncome = transactions
    .filter((t) => incomeTypes.includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => expenseTypes.includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  return openingCash + totalIncome - totalExpense;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  activeSession: null,
  selectedSessionId: null,
  loading: false,
  error: null,

  loadSessions: async () => {
    set({ loading: true, error: null });
    try {
      const sessions = await db.cashSessions.toArray();
      const openSession = sessions.find((s) => s.status === 'open') ?? null;
      set({ sessions, activeSession: openSession, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  openSession: async (branchId, name, openingCash) => {
    set({ loading: true, error: null });
    try {
      const now = new Date().toISOString();
      const id = await db.cashSessions.add({
        id: crypto.randomUUID(),
        branchId,
        name,
        openedAt: now,
        openingCash,
        closingCash: undefined,
        status: 'open',
        createdAt: now,
        updatedAt: now,
      } as CashSession);
      await get().loadSessions();
      set({ selectedSessionId: String(id) });
      return String(id);
    } catch (e) {
      set({ error: String(e), loading: false });
      return undefined;
    }
  },

  closeSession: async (sessionId, countedClosingCash) => {
    set({ loading: true, error: null });
    try {
      const session = await db.cashSessions.get(sessionId);
      if (!session) {
        set({ error: 'Session not found', loading: false });
        return;
      }

      const expectedClosingCash = await calculateExpectedClosingCash(sessionId, session.openingCash);
      const cashDifference = countedClosingCash - expectedClosingCash;

      const now = new Date().toISOString();
      await db.cashSessions.update(sessionId, {
        closedAt: now,
        closingCash: countedClosingCash,
        expectedClosingCash,
        countedClosingCash,
        cashDifference,
        status: 'closed',
        updatedAt: now,
      });
      await get().loadSessions();
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  setActiveSession: (id) => {
    const session = id ? get().sessions.find((s) => s.id === id) ?? null : null;
    set({ selectedSessionId: id, activeSession: session });
  },

  loadSessionById: async (id) => {
    set({ loading: true, error: null });
    try {
      const session = await db.cashSessions.get(id);
      set({ selectedSessionId: id, activeSession: session ?? null, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  resetError: () => set({ error: null }),
}));

export const selectSessions = (state: SessionStore) => state.sessions;
export const selectActiveSession = (state: SessionStore) => state.activeSession;
export const selectSelectedSessionId = (state: SessionStore) => state.selectedSessionId;
export const selectIsLoading = (state: SessionStore) => state.loading;
export const selectError = (state: SessionStore) => state.error;
export const selectOpenSessions = (state: SessionStore) =>
  state.sessions.filter((s) => s.status === 'open');
export const selectClosedSessions = (state: SessionStore) =>
  state.sessions.filter((s) => s.status === 'closed');