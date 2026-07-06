import { create } from 'zustand';
import { Address, Card, RepairRequest, RepairMessage } from '@/types';
import { db } from '@/backend/firebase';
import { doc, getDoc, updateDoc, setDoc, onSnapshot, collection, query, where, arrayUnion, arrayRemove } from 'firebase/firestore';
import { createRepairRequest, addRepairMessage as dbAddRepairMessage } from '@/backend';

interface UserState {
  wishlist: string[]; // array of product ids
  addresses: Address[];
  cards: Card[];
  repairRequests: RepairRequest[];
  isLoading: boolean;
  
  syncUserData: (userId: string) => () => void;
  toggleWishlist: (userId: string, productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  
  addAddress: (userId: string, address: Omit<Address, 'id'>) => Promise<void>;
  removeAddress: (userId: string, id: string) => Promise<void>;
  updateAddress: (userId: string, id: string, address: Partial<Address>) => Promise<void>;
  
  addCard: (userId: string, card: Omit<Card, 'id'>) => Promise<void>;
  removeCard: (userId: string, id: string) => Promise<void>;
  
  submitRepairRequest: (
    userId: string,
    deviceName: string,
    issueDesc: string,
    imageUrls: string[],
    pickupAddress: Address,
    preferredDate: string,
    preferredTime: string
  ) => Promise<RepairRequest | null>;
  addRepairMessage: (requestId: string, text: string, sender: 'user' | 'admin') => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  wishlist: [],
  addresses: [],
  cards: [],
  repairRequests: [],
  isLoading: false,

  syncUserData: (userId) => {
    set({ isLoading: true });

    // Sync user profile document (wishlist, addresses, cards)
    const unsubProfile = onSnapshot(doc(db, 'customers', userId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        set({
          wishlist: data.wishlist ?? [],
          addresses: data.addresses ?? [],
          cards: data.cards ?? [],
        });
      }
      set({ isLoading: false });
    });

    // Sync user repair tickets
    const unsubRepairs = onSnapshot(
      query(collection(db, 'repair_requests'), where('customerId', '==', userId)),
      (snapshot) => {
        const list: RepairRequest[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            deviceName: data.deviceName,
            issueDesc: data.issueDesc,
            imageUrls: data.imageUrls ?? [],
            pickupAddress: data.pickupAddress,
            preferredDate: data.preferredDate,
            preferredTime: data.preferredTime,
            status: data.status ?? 'submitted',
            cost: data.cost ?? 0,
            messages: data.messages ?? [],
          };
        });
        set({ repairRequests: list });
      }
    );

    return () => {
      unsubProfile();
      unsubRepairs();
    };
  },

  toggleWishlist: async (userId, productId) => {
    const wishlist = get().wishlist;
    const isAdded = wishlist.includes(productId);
    const userDocRef = doc(db, 'customers', userId);

    if (isAdded) {
      set({ wishlist: wishlist.filter((id) => id !== productId) });
      await updateDoc(userDocRef, {
        wishlist: arrayRemove(productId),
      });
    } else {
      set({ wishlist: [...wishlist, productId] });
      await updateDoc(userDocRef, {
        wishlist: arrayUnion(productId),
      });
    }
  },

  isInWishlist: (productId) => {
    return get().wishlist.includes(productId);
  },

  addAddress: async (userId, addr) => {
    const newAddress: Address = {
      ...addr,
      id: 'addr_' + Math.floor(1000 + Math.random() * 9000),
    };
    const userDocRef = doc(db, 'customers', userId);
    let updated = [...get().addresses];
    
    if (newAddress.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    updated.push(newAddress);

    set({ addresses: updated });
    await updateDoc(userDocRef, { addresses: updated });
  },

  removeAddress: async (userId, id) => {
    const updated = get().addresses.filter((a) => a.id !== id);
    set({ addresses: updated });
    await updateDoc(doc(db, 'customers', userId), { addresses: updated });
  },

  updateAddress: async (userId, id, updatedFields) => {
    const updated = get().addresses.map((a) => {
      if (a.id === id) {
        const res = { ...a, ...updatedFields };
        return res;
      }
      if (updatedFields.isDefault) {
        return { ...a, isDefault: false };
      }
      return a;
    });

    set({ addresses: updated });
    await updateDoc(doc(db, 'customers', userId), { addresses: updated });
  },

  addCard: async (userId, c) => {
    const newCard: Card = {
      ...c,
      id: 'card_' + Math.floor(1000 + Math.random() * 9000),
    };
    const updated = [...get().cards, newCard];
    set({ cards: updated });
    await updateDoc(doc(db, 'customers', userId), { cards: updated });
  },

  removeCard: async (userId, id) => {
    const updated = get().cards.filter((c) => c.id !== id);
    set({ cards: updated });
    await updateDoc(doc(db, 'customers', userId), { cards: updated });
  },

  submitRepairRequest: async (userId, deviceName, issueDesc, imageUrls, pickupAddress, preferredDate, preferredTime) => {
    set({ isLoading: true });
    const res = await createRepairRequest(userId, deviceName, issueDesc, imageUrls, pickupAddress, preferredDate, preferredTime);
    set({ isLoading: false });
    if (res.success && res.repairId) {
      return {
        id: res.repairId,
        deviceName,
        issueDesc,
        imageUrls,
        pickupAddress,
        preferredDate,
        preferredTime,
        status: 'submitted',
        cost: 0,
        messages: [],
      };
    }
    return null;
  },

  addRepairMessage: async (requestId, text, sender) => {
    await dbAddRepairMessage(requestId, text, sender);
  }
}));
