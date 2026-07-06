import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// ─── Store Settings Type ──────────────────────────────────────────────────────

export interface StoreSettings {
  // Contact
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  // Social
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  // Commerce
  shippingRate: number;
  taxRate: number;
  allowPromoCodes: boolean;
  freeShippingThreshold: number;
  // Notifications
  notifyLowStock: boolean;
  notifyNewRepair: boolean;
  notifyOrders: boolean;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Bujji Cellulars',
  storeEmail: 'contact@bujjicellulars.com',
  storePhone: '+91 98765 43210',
  storeAddress: 'Hyderabad, Telangana, India',
  instagramUrl: '',
  twitterUrl: '',
  youtubeUrl: '',
  shippingRate: 15,
  taxRate: 8.25,
  allowPromoCodes: true,
  freeShippingThreshold: 999,
  notifyLowStock: true,
  notifyNewRepair: true,
  notifyOrders: true,
};

const SETTINGS_DOC = doc(db, 'settings', 'store');

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function fetchStoreSettings(): Promise<StoreSettings> {
  try {
    const snap = await getDoc(SETTINGS_DOC);
    if (snap.exists()) {
      return { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<StoreSettings>) };
    }
    // First time — seed defaults into Firestore
    await setDoc(SETTINGS_DOC, { ...DEFAULT_SETTINGS, createdAt: serverTimestamp() });
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to fetch store settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// ─── Save ─────────────────────────────────────────────────────────────────────

export async function saveStoreSettings(
  settings: StoreSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    await setDoc(SETTINGS_DOC, { ...settings, updatedAt: serverTimestamp() }, { merge: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
