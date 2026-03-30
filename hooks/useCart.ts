import { useCartStore } from '../stores/cartStore';

export function useCart() {
  const store = useCartStore();

  const itemCount = store.totalQuantity;
  const subtotal = parseFloat(store.cost?.subtotalAmount?.amount ?? '0');
  const isEmpty = store.lines.length === 0;

  return {
    ...store,
    itemCount,
    subtotal,
    isEmpty,
  };
}
