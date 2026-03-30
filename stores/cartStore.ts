import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shopifyClient } from '../graphql/client';
import { GET_CART } from '../graphql/queries/cart';
import { CART_CREATE } from '../graphql/mutations/cartCreate';
import { CART_LINES_ADD } from '../graphql/mutations/cartLinesAdd';
import { CART_LINES_UPDATE } from '../graphql/mutations/cartLinesUpdate';
import { CART_LINES_REMOVE } from '../graphql/mutations/cartLinesRemove';
import { CART_DISCOUNT_CODES_UPDATE } from '../graphql/mutations/cartDiscountCodesUpdate';

const CART_ID_KEY = 'sohaticare_cart_id';

interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    image?: { url: string; altText?: string };
    price: { amount: string; currencyCode: string };
    compareAtPrice?: { amount: string; currencyCode: string } | null;
    product: { handle: string; title: string; vendor: string };
    selectedOptions: { name: string; value: string }[];
  };
  cost: {
    totalAmount: { amount: string; currencyCode: string };
    compareAtAmountPerQuantity?: { amount: string; currencyCode: string } | null;
  };
}

interface CartCost {
  subtotalAmount: { amount: string; currencyCode: string };
  totalAmount: { amount: string; currencyCode: string };
  totalTaxAmount?: { amount: string; currencyCode: string } | null;
}

interface CartState {
  cartId: string | null;
  lines: CartLine[];
  totalQuantity: number;
  cost: CartCost | null;
  checkoutUrl: string | null;
  discountCodes: { code: string; applicable: boolean }[];
  loading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  applyDiscount: (code: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

function updateStateFromCart(cart: Record<string, unknown>): Partial<CartState> {
  return {
    cartId: cart.id as string,
    lines: ((cart.lines as Record<string, unknown>)?.nodes ?? []) as CartLine[],
    totalQuantity: (cart.totalQuantity as number) ?? 0,
    cost: (cart.cost as CartCost) ?? null,
    checkoutUrl: (cart.checkoutUrl as string) ?? null,
    discountCodes: (cart.discountCodes as { code: string; applicable: boolean }[]) ?? [],
  };
}

export const useCartStore = create<CartState>((set, get) => ({
  cartId: null,
  lines: [],
  totalQuantity: 0,
  cost: null,
  checkoutUrl: null,
  discountCodes: [],
  loading: false,
  error: null,

  initialize: async () => {
    const savedCartId = await AsyncStorage.getItem(CART_ID_KEY);
    if (!savedCartId) return;

    set({ loading: true });
    const result = await shopifyClient.query(GET_CART, { cartId: savedCartId }).toPromise();

    if (result.data?.cart) {
      set({ ...updateStateFromCart(result.data.cart), loading: false });
    } else {
      await AsyncStorage.removeItem(CART_ID_KEY);
      set({ loading: false });
    }
  },

  addToCart: async (variantId, quantity = 1) => {
    set({ loading: true, error: null });
    let { cartId } = get();

    if (!cartId) {
      const result = await shopifyClient.mutation(CART_CREATE, {
        input: { lines: [{ merchandiseId: variantId, quantity }] },
      }).toPromise();

      if (result.data?.cartCreate?.cart) {
        const cart = result.data.cartCreate.cart;
        await AsyncStorage.setItem(CART_ID_KEY, cart.id);
        set({ ...updateStateFromCart(cart), loading: false });
        return;
      }
      set({ loading: false, error: result.data?.cartCreate?.userErrors?.[0]?.message ?? 'Failed to create cart' });
      return;
    }

    const result = await shopifyClient.mutation(CART_LINES_ADD, {
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    }).toPromise();

    if (result.data?.cartLinesAdd?.cart) {
      set({ ...updateStateFromCart(result.data.cartLinesAdd.cart), loading: false });
    } else {
      set({ loading: false, error: result.data?.cartLinesAdd?.userErrors?.[0]?.message ?? 'Failed to add item' });
    }
  },

  updateQuantity: async (lineId, quantity) => {
    const { cartId } = get();
    if (!cartId) return;

    set({ loading: true, error: null });
    const result = await shopifyClient.mutation(CART_LINES_UPDATE, {
      cartId,
      lines: [{ id: lineId, quantity }],
    }).toPromise();

    if (result.data?.cartLinesUpdate?.cart) {
      set({ ...updateStateFromCart(result.data.cartLinesUpdate.cart), loading: false });
    } else {
      set({ loading: false, error: 'Failed to update quantity' });
    }
  },

  removeItem: async (lineId) => {
    const { cartId } = get();
    if (!cartId) return;

    set({ loading: true, error: null });
    const result = await shopifyClient.mutation(CART_LINES_REMOVE, {
      cartId,
      lineIds: [lineId],
    }).toPromise();

    if (result.data?.cartLinesRemove?.cart) {
      set({ ...updateStateFromCart(result.data.cartLinesRemove.cart), loading: false });
    } else {
      set({ loading: false, error: 'Failed to remove item' });
    }
  },

  applyDiscount: async (code) => {
    const { cartId } = get();
    if (!cartId) return;

    set({ loading: true, error: null });
    const result = await shopifyClient.mutation(CART_DISCOUNT_CODES_UPDATE, {
      cartId,
      discountCodes: [code],
    }).toPromise();

    if (result.data?.cartDiscountCodesUpdate?.cart) {
      set({ ...updateStateFromCart(result.data.cartDiscountCodesUpdate.cart), loading: false });
    } else {
      set({ loading: false, error: 'Invalid discount code' });
    }
  },

  clearCart: async () => {
    await AsyncStorage.removeItem(CART_ID_KEY);
    set({
      cartId: null,
      lines: [],
      totalQuantity: 0,
      cost: null,
      checkoutUrl: null,
      discountCodes: [],
      error: null,
    });
  },
}));
