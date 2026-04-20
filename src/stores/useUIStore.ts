import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';
export type ModalName = 'createBranch' | 'editBranch' | 'createSession' | 'closeSession' | 'createTransaction' | 'createMovement' | null;
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface UIState {
  sidebarOpen: boolean;
  theme: Theme;
  currentModal: ModalName;
  toasts: readonly Toast[];
  loading: boolean;
  error: string | null;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  openModal: (name: ModalName) => void;
  closeModal: () => void;
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
  resetError: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  theme: 'system',
  currentModal: null,
  toasts: [],
  loading: false,
  error: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setTheme: (theme) => set({ theme }),

  openModal: (name) => set({ currentModal: name }),

  closeModal: () => set({ currentModal: null }),

  addToast: (message, type) => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 5000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  resetError: () => set({ error: null }),
}));

export const selectSidebarOpen = (state: UIStore) => state.sidebarOpen;
export const selectTheme = (state: UIStore) => state.theme;
export const selectCurrentModal = (state: UIStore) => state.currentModal;
export const selectToasts = (state: UIStore) => state.toasts;
export const selectIsLoading = (state: UIStore) => state.loading;
export const selectError = (state: UIStore) => state.error;