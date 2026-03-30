import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'sohaticare_access_token';
const REFRESH_TOKEN_KEY = 'sohaticare_refresh_token';

interface CustomerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  customer: CustomerInfo | null;
  isLoggedIn: boolean;
  loading: boolean;

  initialize: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setCustomer: (customer: CustomerInfo) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  customer: null,
  isLoggedIn: false,
  loading: true,

  initialize: async () => {
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

    if (accessToken) {
      set({
        accessToken,
        refreshToken,
        isLoggedIn: true,
        loading: false,
      });
    } else {
      set({ loading: false });
    }
  },

  setTokens: async (accessToken, refreshToken) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    set({ accessToken, refreshToken, isLoggedIn: true });
  },

  setCustomer: (customer) => {
    set({ customer });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    set({
      accessToken: null,
      refreshToken: null,
      customer: null,
      isLoggedIn: false,
    });
  },
}));
