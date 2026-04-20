import { create } from 'zustand';
import type { OperationalMovement } from '@/domain/entities';
import { db } from '@/infrastructure/db/database';

interface MovementState {
  movements: readonly OperationalMovement[];
  loading: boolean;
  error: string | null;
}

interface MovementActions {
  loadBySession: (sessionId: string) => Promise<void>;
  createMovement: (data: Omit<OperationalMovement, 'id' | 'createdAt'>) => Promise<void>;
  deleteMovement: (id: string) => Promise<void>;
  resetError: () => void;
}

type MovementStore = MovementState & MovementActions;

export const useMovementStore = create<MovementStore>((set, get) => ({
  movements: [],
  loading: false,
  error: null,

  loadBySession: async (sessionId) => {
    set({ loading: true, error: null });
    try {
      const movements = await db.operationalMovements
        .where('sessionId')
        .equals(sessionId)
        .toArray();
      set({ movements, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  createMovement: async (data) => {
    set({ loading: true, error: null });
    try {
      const now = new Date().toISOString();
      await db.operationalMovements.add({
        ...data,
        id: crypto.randomUUID(),
        createdAt: now,
      } as OperationalMovement);
      await get().loadBySession(data.sessionId);
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  deleteMovement: async (id) => {
    set({ loading: true, error: null });
    try {
      const movement = await db.operationalMovements.get(id);
      if (movement) {
        await db.operationalMovements.delete(id);
        await get().loadBySession(movement.sessionId);
      }
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  resetError: () => set({ error: null }),
}));

export const selectMovements = (state: MovementStore) => state.movements;
export const selectIsLoading = (state: MovementStore) => state.loading;
export const selectError = (state: MovementStore) => state.error;
export const selectIncomingMovements = (state: MovementStore) =>
  state.movements.filter((m) => m.type === 'incoming');
export const selectOutgoingMovements = (state: MovementStore) =>
  state.movements.filter((m) => m.type === 'outgoing');