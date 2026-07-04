import { create } from 'zustand';
import { Address, Card, RepairRequest, RepairMessage, Product } from '@/types';

interface UserState {
  wishlist: string[]; // array of product ids
  addresses: Address[];
  cards: Card[];
  repairRequests: RepairRequest[];
  isLoading: boolean;
  
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  
  addCard: (card: Omit<Card, 'id'>) => void;
  removeCard: (id: string) => void;
  
  submitRepairRequest: (
    deviceName: string,
    issueDesc: string,
    imageUrls: string[],
    pickupAddress: Address,
    preferredDate: string,
    preferredTime: string
  ) => Promise<RepairRequest>;
  addRepairMessage: (requestId: string, text: string, sender: 'user' | 'admin') => Promise<void>;
}

const mockAddresses: Address[] = [
  {
    id: 'addr_1',
    name: 'Teja M (Home)',
    street: '100 Golden Boulevard, Suite 500',
    city: 'Metropolis',
    state: 'NY',
    zip: '10001',
    phone: '+1 555-0199',
    isDefault: true
  },
  {
    id: 'addr_2',
    name: 'Teja M (Office)',
    street: '42 Cyber Plaza, Floor 8',
    city: 'Technopolis',
    state: 'CA',
    zip: '94016',
    phone: '+1 555-0188',
    isDefault: false
  }
];

const mockCards: Card[] = [
  {
    id: 'card_1',
    holderName: 'Teja M',
    cardNumber: 'â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ 4242',
    expiry: '12/28',
    cardType: 'visa'
  },
  {
    id: 'card_2',
    holderName: 'Teja M',
    cardNumber: 'â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ 8888',
    expiry: '06/29',
    cardType: 'mastercard'
  }
];

const mockRepairs: RepairRequest[] = [
  {
    id: 'rep_10298',
    deviceName: 'Bujji Gold-Phantom Smartphone',
    issueDesc: 'Outer gold bumper slightly scuffed after drop on concrete. Requesting replacement bumper plate.',
    imageUrls: ['https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&auto=format&fit=crop&q=80'],
    pickupAddress: mockAddresses[0],
    preferredDate: '2026-06-29',
    preferredTime: '10:00 AM - 01:00 PM',
    status: 'inspecting',
    cost: 150,
    messages: [
      { id: 'm1', sender: 'user', text: 'Submitted the repair request. Bumper shows minor gold flakes coming off.', timestamp: '2026-06-25T15:00:00Z' },
      { id: 'm2', sender: 'admin', text: 'Hi Teja, we have received your request. Our inspection team is reviewing the photos. We can courier you a new 24K plating kit or take it in for full re-polishing. Current cost is estimated at â‚¹150.', timestamp: '2026-06-25T16:12:00Z' }
    ]
  }
];

export const useUserStore = create<UserState>((set, get) => ({
  wishlist: ['prod_1', 'prod_4'],
  addresses: mockAddresses,
  cards: mockCards,
  repairRequests: mockRepairs,
  isLoading: false,

  toggleWishlist: (productId) => {
    const wishlist = get().wishlist;
    if (wishlist.includes(productId)) {
      set({ wishlist: wishlist.filter((id) => id !== productId) });
    } else {
      set({ wishlist: [...wishlist, productId] });
    }
  },

  isInWishlist: (productId) => {
    return get().wishlist.includes(productId);
  },

  addAddress: (addr) => {
    const newAddress: Address = {
      ...addr,
      id: 'addr_' + Math.floor(1000 + Math.random() * 9000),
    };
    if (newAddress.isDefault) {
      set((state) => ({
        addresses: state.addresses.map((a) => ({ ...a, isDefault: false })).concat(newAddress),
      }));
    } else {
      set((state) => ({
        addresses: [...state.addresses, newAddress],
      }));
    }
  },

  removeAddress: (id) => {
    set((state) => ({
      addresses: state.addresses.filter((a) => a.id !== id),
    }));
  },

  updateAddress: (id, updatedFields) => {
    set((state) => ({
      addresses: state.addresses.map((a) => {
        if (a.id === id) {
          const res = { ...a, ...updatedFields };
          if (updatedFields.isDefault) {
            // make others non-default
            return res;
          }
          return res;
        }
        if (updatedFields.isDefault) {
          return { ...a, isDefault: false };
        }
        return a;
      }),
    }));
  },

  addCard: (c) => {
    const newCard: Card = {
      ...c,
      id: 'card_' + Math.floor(1000 + Math.random() * 9000),
    };
    set((state) => ({
      cards: [...state.cards, newCard],
    }));
  },

  removeCard: (id) => {
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== id),
    }));
  },

  submitRepairRequest: async (deviceName, issueDesc, imageUrls, pickupAddress, preferredDate, preferredTime) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const newRequest: RepairRequest = {
      id: 'rep_' + Math.floor(10000 + Math.random() * 90000),
      deviceName,
      issueDesc,
      imageUrls,
      pickupAddress,
      preferredDate,
      preferredTime,
      status: 'submitted',
      messages: [
        {
          id: 'm_init',
          sender: 'user',
          text: `Repair request submitted for ${deviceName}. Issue details: ${issueDesc}`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    set((state) => ({
      repairRequests: [newRequest, ...state.repairRequests],
      isLoading: false
    }));

    return newRequest;
  },

  addRepairMessage: async (requestId, text, sender) => {
    const updatedRepairs = get().repairRequests.map((req) => {
      if (req.id === requestId) {
        const newMessage: RepairMessage = {
          id: 'msg_' + Math.floor(1000 + Math.random() * 9000),
          sender,
          text,
          timestamp: new Date().toISOString()
        };
        return {
          ...req,
          messages: [...req.messages, newMessage]
        };
      }
      return req;
    });

    set({ repairRequests: updatedRepairs });

    // Mock an admin automatic response if user is typing
    if (sender === 'user') {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const autoResponse = get().repairRequests.map((req) => {
        if (req.id === requestId) {
          const adminReply: RepairMessage = {
            id: 'msg_' + Math.floor(1000 + Math.random() * 9000),
            sender: 'admin',
            text: `[Agent Response] Thanks for details on "${text.substring(0, 15)}...". We have notified our technician. We will coordinate pickup for ${req.preferredDate} at ${req.preferredTime}.`,
            timestamp: new Date().toISOString()
          };
          return {
            ...req,
            messages: [...req.messages, adminReply]
          };
        }
        return req;
      });
      set({ repairRequests: autoResponse });
    }
  }
}));
