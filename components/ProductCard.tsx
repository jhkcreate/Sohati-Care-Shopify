import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice } from '../config/store';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { useWishlistStore } from '../stores/wishlistStore';
import { useCartStore } from '../stores/cartStore';
import { useToastStore } from '../stores/toastStore';
import i18n from '../i18n';

const CARD_WIDTH = (Dimensions.get('window').width - Spacing.md * 3) / 2;

interface ProductNode {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  compareAtPriceRange?: {
    minVariantPrice?: { amount: string; currencyCode: string };
  };
  featuredImage?: { url: string; altText?: string };
  variants: {
    nodes: { id: string; availableForSale: boolean }[];
  };
}

interface Props {
  product: ProductNode;
}

export function ProductCard({ product }: Props) {
  const router = useRouter();
  const { toggle, isInWishlist } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addToCart);
  const showToast = useToastStore((s) => s.show);
  const wishlisted = isInWishlist(product.id);

  const price = product.priceRange.minVariantPrice.amount;
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount;
  const hasDiscount = compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price);
  const discountPercent = hasDiscount
    ? Math.round(((parseFloat(compareAtPrice!) - parseFloat(price)) / parseFloat(compareAtPrice!)) * 100)
    : 0;

  const firstVariantId = product.variants.nodes[0]?.id;

  const handleWishlistToggle = () => {
    toggle({
      productId: product.id,
      handle: product.handle,
      title: product.title,
      vendor: product.vendor,
      price,
      compareAtPrice: compareAtPrice ?? null,
      currencyCode: product.priceRange.minVariantPrice.currencyCode,
      imageUrl: product.featuredImage?.url,
      variantId: firstVariantId,
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/product/${product.handle}`)}
      activeOpacity={0.8}
    >
      <View style={styles.imageWrapper}>
        {product.featuredImage ? (
          <Image
            source={{ uri: product.featuredImage.url }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={32} color={Colors.textLight} />
          </View>
        )}

        {hasDiscount && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>{discountPercent}%</Text>
          </View>
        )}

        <TouchableOpacity style={styles.wishlistButton} onPress={handleWishlistToggle}>
          <Ionicons
            name={wishlisted ? 'heart' : 'heart-outline'}
            size={20}
            color={wishlisted ? Colors.sale : Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.vendor} numberOfLines={1}>{product.vendor}</Text>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(price)}</Text>
          {hasDiscount && (
            <Text style={styles.comparePrice}>{formatPrice(compareAtPrice!)}</Text>
          )}
        </View>
      </View>

      {product.availableForSale && firstVariantId && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={async () => {
            await addToCart(firstVariantId);
            const msg = i18n.language === 'ar' ? 'تمت الإضافة إلى السلة' : 'Added to cart';
            const actionLabel = i18n.language === 'ar' ? 'عرض السلة' : 'View Cart';
            showToast(msg, { label: actionLabel, onPress: () => router.push('/(tabs)/cart') });
          }}
        >
          <Ionicons name="add" size={18} color={Colors.white} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: Colors.surface,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  saleBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.sale,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  saleBadgeText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  wishlistButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  info: {
    padding: Spacing.sm,
  },
  vendor: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
    minHeight: 34,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  price: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primary,
  },
  comparePrice: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  addButton: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
