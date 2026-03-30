import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';

export default function TabLayout() {
  const { t } = useTranslation();
  const totalQuantity = useCartStore((s) => s.totalQuantity);
  const wishlistCount = useWishlistStore((s) => s.items.length);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          borderTopColor: Colors.border,
          backgroundColor: Colors.white,
        },
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: Colors.white },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: t('tabs.shop'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: t('tabs.wishlist'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
          tabBarBadge: wishlistCount > 0 ? wishlistCount : undefined,
          tabBarBadgeStyle: { backgroundColor: Colors.sale, fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('cart.title'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
          tabBarBadge: totalQuantity > 0 ? totalQuantity : undefined,
          tabBarBadgeStyle: { backgroundColor: Colors.primary, fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t('tabs.account'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
