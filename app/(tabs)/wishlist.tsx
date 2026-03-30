import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useWishlistStore, WishlistItem } from '../../stores/wishlistStore';
import { useCartStore } from '../../stores/cartStore';
import { formatPrice, storeConfig } from '../../config/store';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { EmptyState } from '../../components/EmptyState';
import i18n from '../../i18n';

function WishlistCard({ item }: { item: WishlistItem }) {
  const router = useRouter();
  const isArabic = i18n.language === 'ar';
  const toggle = useWishlistStore((s) => s.toggle);
  const addToCart = useCartStore((s) => s.addToCart);
  const hasDiscount = item.compareAtPrice && parseFloat(item.compareAtPrice) > parseFloat(item.price);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${item.handle}`)}
      activeOpacity={0.8}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} contentFit="cover" />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Ionicons name="image-outline" size={32} color={Colors.textLight} />
        </View>
      )}

      <TouchableOpacity
        style={styles.removeHeart}
        onPress={() => toggle(item)}
      >
        <Ionicons name="heart" size={20} color={Colors.sale} />
      </TouchableOpacity>

      <View style={styles.cardInfo}>
        <Text style={styles.cardVendor} numberOfLines={1}>{item.vendor}</Text>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.cardPriceRow}>
          <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
          {hasDiscount && (
            <Text style={styles.cardComparePrice}>{formatPrice(item.compareAtPrice!)}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => item.variantId && addToCart(item.variantId)}
      >
        <Ionicons name="cart-outline" size={16} color={Colors.white} />
        <Text style={styles.addButtonText}>{isArabic ? 'أضف للسلة' : 'Add to Cart'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function WishlistScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const isArabic = i18n.language === 'ar';
  const items = useWishlistStore((s) => s.items);

  const shareViaWhatsApp = () => {
    const productList = items.map((item) => `- ${item.title} (${formatPrice(item.price)})`).join('\n');
    const message = isArabic
      ? `قائمة المفضلة من SohatiCare:\n\n${productList}\n\nتسوق الآن من SohatiCare!`
      : `My Wishlist from SohatiCare:\n\n${productList}\n\nShop now at SohatiCare!`;
    const url = `https://wa.me/${storeConfig.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon="heart-outline"
        title={t('wishlist.empty')}
        subtitle={t('wishlist.emptyDescription')}
        actionLabel={t('wishlist.browse')}
        onAction={() => router.push('/(tabs)/shop')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.count}>{items.length} {isArabic ? 'منتج' : 'items'}</Text>
        <TouchableOpacity style={styles.shareButton} onPress={shareViaWhatsApp}>
          <Ionicons name="logo-whatsapp" size={18} color={Colors.success} />
          <Text style={styles.shareText}>{isArabic ? 'مشاركة' : 'Share'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => <WishlistCard item={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  count: { fontSize: FontSize.md, color: Colors.textSecondary },
  shareButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.surface, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  shareText: { fontSize: FontSize.sm, color: Colors.success, fontWeight: '600' },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxxl },
  row: { justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  cardImage: { width: '100%', height: 160, backgroundColor: Colors.surface },
  cardImagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  removeHeart: { position: 'absolute', top: Spacing.sm, right: Spacing.sm, backgroundColor: Colors.white, borderRadius: BorderRadius.full, width: 30, height: 30, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardInfo: { padding: Spacing.sm },
  cardVendor: { fontSize: FontSize.xs, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginTop: 2, minHeight: 34 },
  cardPriceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.xs },
  cardPrice: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary },
  cardComparePrice: { fontSize: FontSize.sm, color: Colors.textLight, textDecorationLine: 'line-through' },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, backgroundColor: Colors.primary, paddingVertical: Spacing.md, marginHorizontal: Spacing.sm, marginBottom: Spacing.sm, borderRadius: BorderRadius.md },
  addButtonText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '600' },
});
