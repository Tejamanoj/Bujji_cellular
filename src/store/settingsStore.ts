import { create } from 'zustand';
import { StoreSettings, DEFAULT_SETTINGS, fetchStoreSettings, saveStoreSettings } from '@/backend/settings';

interface SettingsState {
  settings: StoreSettings;
  isLoaded: boolean;
  isSaving: boolean;
  load: () => Promise<void>;
  save: (settings: StoreSettings) => Promise<{ success: boolean; error?: string }>;
  update: (partial: Partial<StoreSettings>) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,
  isSaving: false,

  load: async () => {
    if (get().isLoaded) return;
    try {
      const settings = await fetchStoreSettings();
      set({ settings, isLoaded: true });
    } catch {
      set({ isLoaded: true }); // fallback to defaults
    }
  },

  save: async (settings: StoreSettings) => {
    set({ isSaving: true });
    const result = await saveStoreSettings(settings);
    if (result.success) {
      set({ settings, isSaving: false });
    } else {
      set({ isSaving: false });
    }
    return result;
  },

  update: (partial) => {
    set((state) => ({ settings: { ...state.settings, ...partial } }));
  },
}));
