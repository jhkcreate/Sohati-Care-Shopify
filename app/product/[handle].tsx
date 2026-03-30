import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, FlatList } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from 'urql';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { GET_PRODUCT } from '../../graphql/queries/products';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { formatPrice, getDiscountPercent, storeConfig } from '../../config/store';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useToastStore } from '../../stores/toastStore';
import { QuantityStepper } from '../../components/QuantityStepper';
import { ProductCard } from '../../components/ProductCard';
import { GET_PRODUCTS } from '../../graphql/queries/products';
import i18n from '../../i18n';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ProductDetailScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const addToCart = useCartStore((s) => s.addToCart);
  const cartLoading = useCartStore((s) => s.loading);
  const { toggle, isInWishlist } = useWishlistStore();
  const showToast = useToastStore((s) => s.show);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'howToUse'>('description');

  const [result] = useQuery({
    query: GET_PRODUCT,
    variables: { handle },
  });

  const product = result.data?.product;

  // Related products: same vendor, in stock, exclude current
  const [relatedResult] = useQuery({
    query: GET_PRODUCTS,
    variables: {
      first: 6,
      query: product ? `available_for_sale:true vendor:"${product.vendor}"` : '',
    },
    pause: !product,
  });
  const relatedProducts = (relatedResult.data?.products?.nodes ?? [])
    .filter((p: { id: string }) => p.id !== product?.id)
    .slice(0, 4);

  if (result.fetching) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ headerShown: true, title: '' }} />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ headerShown: true, title: '' }} />
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textLight} />
        <Text style={styles.errorText}>{isArabic ? 'المنتج غير موجود' : 'Product not found'}</Text>
      </View>
    );
  }

  const variants = product.variants?.nodes ?? [];
  const selectedVariant = variants[selectedVariantIndex] ?? variants[0];
  const images = product.media?.nodes?.map((m: { image: { url: string; altText?: string } }) => m.image).filter(Boolean) ?? [];
  if (images.length === 0 && product.featuredImage) {
    images.push(product.featuredImage);
  }

  const price = selectedVariant?.price?.amount ?? product.priceRange.minVariantPrice.amount;
  const compareAtPrice = selectedVariant?.compareAtPrice?.amount ?? product.compareAtPriceRange?.minVariantPrice?.amount;
  const discount = getDiscountPercent(price, compareAtPrice);
  const wishlisted = isInWishlist(product.id);

  const ingredients = product.metafields?.find((m: { key: string }) => m?.key === 'ingredients')?.value;
  const howToUse = product.metafields?.find((m: { key: string }) => m?.key === 'how_to_use')?.value;

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return;
    for (let i = 0; i < quantity; i++) {
      await addToCart(selectedVariant.id);
    }
    const msg = isArabic ? 'تمت الإضافة إلى السلة' : 'Added to cart';
    const actionLabel = isArabic ? 'عرض السلة' : 'View Cart';
    showToast(msg, { label: actionLabel, onPress: () => router.push('/(tabs)/cart') });
  };

  const handleWishlistToggle = () => {
    toggle({
      productId: product.id,
      handle: product.handle,
      title: product.title,
      vendor: product.vendor,
      price,
      compareAtPrice: compareAtPrice ?? null,
      currencyCode: storeConfig.currency,
      imageUrl: images[0]?.url,
      variantId: selectedVariant?.id,
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: Spacing.md }}>
              <TouchableOpacity onPress={handleWishlistToggle}>
                <Ionicons
                  name={wishlisted ? 'heart' : 'heart-outline'}
                  size={24}
                  color={wishlisted ? Colors.sale : Colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/cart')}>
                <Ionicons name="cart-outline" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Image gallery */}
        <View>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIndex(index);
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item.url }} style={styles.productImage} contentFit="contain" transition={200} />
            )}
          />
          {images.length > 1 && (
            <View style={styles.imageDots}>
              {images.map((_: unknown, i: number) => (
                <View key={i} style={[styles.dot, i === activeImageIndex && styles.dotActive]} />
              ))}
            </View>
          )}
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>-{discount}%</Text>
            </View>
          )}
        </View>

        {/* Product info */}
        <View style={styles.info}>
          <Text style={styles.vendor}>{product.vendor}</Text>
          <Text style={styles.title}>{product.title}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(price)}</Text>
            {discount > 0 && compareAtPrice && (
              <Text style={styles.comparePrice}>{formatPrice(compareAtPrice)}</Text>
            )}
            {discount > 0 && (
              <View style={styles.saleBadge}>
                <Text style={styles.saleBadgeText}>{t('common.off', { percent: discount })}</Text>
              </View>
            )}
          </View>

          {/* Variant selector */}
          {variants.length > 1 && (
            <View style={styles.variantSection}>
              <Text style={styles.variantLabel}>
                {variants[0]?.selectedOptions?.[0]?.name ?? (isArabic ? 'الحجم' : 'Size')}
              </Text>
              <View style={styles.variantOptions}>
                {variants.map((variant: { id: string; title: string; availableForSale: boolean }, index: number) => (
                  <TouchableOpacity
                    key={variant.id}
                    style={[
                      styles.variantOption,
                      index === selectedVariantIndex && styles.variantOptionActive,
                      !variant.availableForSale && styles.variantOptionDisabled,
                    ]}
                    onPress={() => variant.availableForSale && setSelectedVariantIndex(index)}
                    disabled={!variant.availableForSale}
                  >
                    <Text
                      style={[
                        styles.variantOptionText,
                        index === selectedVariantIndex && styles.variantOptionTextActive,
                        !variant.availableForSale && styles.variantOptionTextDisabled,
                      ]}
                    >
                      {variant.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quantity */}
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>{isArabic ? 'الكمية' : 'Quantity'}</Text>
            <QuantityStepper
              quantity={quantity}
              onIncrement={() => setQuantity((q) => Math.min(q + 1, 10))}
              onDecrement={() => setQuantity((q) => Math.max(q - 1, 1))}
            />
          </View>

          {/* Delivery info */}
          <View style={styles.deliveryInfo}>
            <View style={styles.deliveryRow}>
              <Ionicons name="car-outline" size={18} color={Colors.primary} />
              <Text style={styles.deliveryText}>{t('product.deliveryEstimate')}</Text>
            </View>
            <View style={styles.deliveryRow}>
              <Ionicons name="gift-outline" size={18} color={Colors.primary} />
              <Text style={styles.deliveryText}>
                {t('product.freeShipping', { threshold: formatPrice(storeConfig.freeShippingThreshold) })}
              </Text>
            </View>
          </View>

          {/* Description tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'description' && styles.tabActive]}
              onPress={() => setActiveTab('description')}
            >
              <Text style={[styles.tabText, activeTab === 'description' && styles.tabTextActive]}>
                {t('product.description')}
              </Text>
            </TouchableOpacity>
            {ingredients && (
              <TouchableOpacity
                style={[styles.tab, activeTab === 'ingredients' && styles.tabActive]}
                onPress={() => setActiveTab('ingredients')}
              >
                <Text style={[styles.tabText, activeTab === 'ingredients' && styles.tabTextActive]}>
                  {t('product.ingredients')}
                </Text>
              </TouchableOpacity>
            )}
            {howToUse && (
              <TouchableOpacity
                style={[styles.tab, activeTab === 'howToUse' && styles.tabActive]}
                onPress={() => setActiveTab('howToUse')}
              >
                <Text style={[styles.tabText, activeTab === 'howToUse' && styles.tabTextActive]}>
                  {t('product.howToUse')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'description' && (
              <Text style={styles.descriptionText}>{product.description || (isArabic ? 'لا يوجد وصف' : 'No description available')}</Text>
            )}
            {activeTab === 'ingredients' && ingredients && (
              <Text style={styles.descriptionText}>{ingredients}</Text>
            )}
            {activeTab === 'howToUse' && howToUse && (
              <Text style={styles.descriptionText}>{howToUse}</Text>
            )}
          </View>
        </View>

        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>{t('product.relatedProducts')}</Text>
            <FlatList
              data={relatedProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: Spacing.sm }}
              renderItem={({ item }) => (
                <View style={{ width: SCREEN_WIDTH * 0.42 }}>
                  <ProductCard product={item} />
                </View>
              )}
            />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky add to cart */}
      <View style={styles.stickyFooter}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerTotal}>{formatPrice(parseFloat(price) * quantity)}</Text>
          <Text style={styles.footerQty}>{quantity} {isArabic ? 'قطعة' : 'item(s)'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addToCartButton, (!selectedVariant?.availableForSale || cartLoading) && styles.addToCartDisabled]}
          onPress={handleAddToCart}
          disabled={!selectedVariant?.availableForSale || cartLoading}
        >
          {cartLoading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="cart-outline" size={20} color={Colors.white} />
              <Text style={styles.addToCartText}>
                {selectedVariant?.availableForSale ? t('product.addToCart') : t('product.outOfStock')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  errorText: { fontSize: FontSize.lg, color: Colors.textSecondary, marginTop: Spacing.md },
  productImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.85, backgroundColor: Colors.surface },
  imageDots: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.md, position: 'absolute', bottom: Spacing.md, left: 0, right: 0 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary, width: 18 },
  discountBadge: { position: 'absolute', top: Spacing.lg, left: Spacing.lg, backgroundColor: Colors.sale, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.md },
  discountBadgeText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
  info: { padding: Spacing.lg },
  vendor: { fontSize: FontSize.sm, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text, marginTop: Spacing.xs, lineHeight: 30 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, gap: Spacing.sm },
  price: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.primary },
  comparePrice: { fontSize: FontSize.lg, color: Colors.textLight, textDecorationLine: 'line-through' },
  saleBadge: { backgroundColor: Colors.sale, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  saleBadgeText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '700' },
  variantSection: { marginTop: Spacing.xl },
  variantLabel: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  variantOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  variantOption: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  variantOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  variantOptionDisabled: { opacity: 0.4 },
  variantOptionText: { fontSize: FontSize.md, color: Colors.text, fontWeight: '500' },
  variantOptionTextActive: { color: Colors.primary, fontWeight: '600' },
  variantOptionTextDisabled: { textDecorationLine: 'line-through' },
  quantityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xl },
  quantityLabel: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  deliveryInfo: { marginTop: Spacing.xl, backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: BorderRadius.lg, gap: Spacing.md },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  deliveryText: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  tabs: { flexDirection: 'row', marginTop: Spacing.xxl, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { paddingVertical: Spacing.md, marginRight: Spacing.xl },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: Colors.primary, fontWeight: '600' },
  tabContent: { marginTop: Spacing.lg },
  descriptionText: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 24 },
  stickyFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  footerPrice: { flex: 1 },
  footerTotal: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.primary },
  footerQty: { fontSize: FontSize.xs, color: Colors.textSecondary },
  addToCartButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg },
  addToCartDisabled: { backgroundColor: Colors.textLight },
  addToCartText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  relatedSection: { marginTop: Spacing.xxl, paddingHorizontal: Spacing.lg },
  relatedTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
});
