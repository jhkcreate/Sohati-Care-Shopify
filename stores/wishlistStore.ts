import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WISHLIST_KEY = 'sohaticare_wishlist';

export interface WishlistItem {
  productId: string;
  handle: string;
  title: string;
  vendor: string;
  price: string;
  compareAtPrice?: string | null;
  currencyCode: string;
  imageUrl?: string;
  variantId: string;
}

interface WishlistState {
  items: WishlistItem[];
  initialized: boolean;
  initialize: () => Promise<void>;
  toggle: (item: WishlistItem) => void;
  isInWishlist: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  initialized: false,

  initialize: async () => {
    const saved = await AsyncStorage.getItem(WISHLIST_KEY);
    if (saved) {
      set({ items: JSON.parse(saved), initialized: true });
    } else {
      set({ initialized: true });
    }
  },

  toggle: (item) => {
    const { items } = get();
    const exists = items.some((i) => i.productId === item.productId);
    const updated = exists
      ? items.filter((i) => i.productId !== item.productId)
      : [...items, item];
    set({ items: updated });
    AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
  },

  isInWishlist: (productId) => {
    return get().items.some((i) => i.productId === productId);
  },

  clear: () => {
    set({ items: [] });
    AsyncStorage.removeItem(WISHLIST_KEY);
  },
}));
