import { create } from 'zustand';

interface ToastState {
  message: string;
  visible: boolean;
  action?: { label: string; onPress: () => void };
  show: (message: string, action?: { label: string; onPress: () => void }) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  visible: false,
  action: undefined,
  show: (message, action) => set({ message, visible: true, action }),
  hide: () => set({ visible: false }),
}));
