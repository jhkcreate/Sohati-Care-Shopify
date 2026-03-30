import { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'urql';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';
import { useRegionStore } from '../stores/regionStore';
import { useToastStore } from '../stores/toastStore';
import { Toast } from '../components/Toast';
import '../i18n';

export default function RootLayout() {
  const initializeCart = useCartStore((s) => s.initialize);
  const initializeWishlist = useWishlistStore((s) => s.initialize);
  const initializeAuth = useAuthStore((s) => s.initialize);
  const initializeRegion = useRegionStore((s) => s.initialize);
  const client = useRegionStore((s) => s.client);
  const { message, visible, action, hide } = useToastStore();

  useEffect(() => {
    initializeRegion().then(() => {
      initializeCart();
    });
    initializeWishlist();
    initializeAuth();
  }, [initializeRegion, initializeCart, initializeWishlist, initializeAuth]);

  const handleDismiss = useCallback(() => hide(), [hide]);

  return (
    <SafeAreaProvider>
      <Provider value={client}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#ffffff' },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="cart"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: '',
            }}
          />
          <Stack.Screen
            name="checkout"
            options={{
              presentation: 'fullScreenModal',
            }}
          />
        </Stack>
        <Toast message={message} visible={visible} onDismiss={handleDismiss} action={action} />
        <StatusBar style="dark" />
      </Provider>
    </SafeAreaProvider>
  );
}
