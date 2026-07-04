import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
}

interface UIState {
  isCartOpen: boolean;
  isSidebarOpen: boolean;
  activeModal: string | null;
  toasts: ToastMessage[];
  openCart: () => void;
  closeCart: () => void;
  toggleSidebar: () => void;
  setSidebar: (isOpen: boolean) => void;
  setActiveModal: (modalId: string | null) => void;
  showToast: (message: string, type?: ToastMessage['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isCartOpen: false,
  isSidebarOpen: false,
  activeModal: null,
  toasts: [],

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebar: (isOpen) => set({ isSidebarOpen: isOpen }),
  setActiveModal: (modalId) => set({ activeModal: modalId }),

  showToast: (message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, message, type, duration };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
