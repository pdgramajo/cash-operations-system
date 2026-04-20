import { create } from 'zustand';
import type { Branch } from '@/domain/entities';
import { db } from '@/infrastructure/db/database';

interface BranchState {
  branches: readonly Branch[];
  selectedBranchId: string | null;
  loading: boolean;
  error: string | null;
}

interface BranchActions {
  loadBranches: () => Promise<void>;
  createBranch: (data: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBranch: (id: string, data: Partial<Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  setSelectedBranch: (id: string | null) => void;
  toggleBranchActive: (id: string) => Promise<void>;
  resetError: () => void;
}

type BranchStore = BranchState & BranchActions;

export const useBranchStore = create<BranchStore>((set, get) => ({
  branches: [],
  selectedBranchId: null,
  loading: false,
  error: null,

  loadBranches: async () => {
    set({ loading: true, error: null });
    try {
      const branches = await db.branches.toArray();
      set({ branches, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  createBranch: async (data) => {
    set({ loading: true, error: null });
    try {
      const now = new Date().toISOString();
      await db.branches.add({
        id: crypto.randomUUID(),
        ...data,
        createdAt: now,
        updatedAt: now,
      });
      await get().loadBranches();
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  updateBranch: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await db.branches.update(id, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      await get().loadBranches();
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  setSelectedBranch: (id) => {
    set({ selectedBranchId: id });
  },

  toggleBranchActive: async (id) => {
    const branch = get().branches.find((b) => b.id === id);
    if (!branch) return;
    await get().updateBranch(id, { active: !branch.active });
  },

  resetError: () => set({ error: null }),
}));

export const selectBranches = (state: BranchStore) => state.branches;
export const selectSelectedBranchId = (state: BranchStore) => state.selectedBranchId;
export const selectIsLoading = (state: BranchStore) => state.loading;
export const selectError = (state: BranchStore) => state.error;
export const selectSelectedBranch = (state: BranchStore) =>
  state.branches.find((b) => b.id === state.selectedBranchId) ?? null;
export const selectActiveBranches = (state: BranchStore) =>
  state.branches.filter((b) => b.active);