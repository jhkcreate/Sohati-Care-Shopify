import { useWishlistStore } from '../stores/wishlistStore';

export function useWishlist() {
  return useWishlistStore();
}
