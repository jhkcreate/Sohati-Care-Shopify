import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useQuery } from 'urql';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice } from '../../config/store';
import { useRegionStore } from '../../stores/regionStore';
import { concerns, brands, shopCategories } from '../../config/catalog';
import { GET_HOMEPAGE_DATA } from '../../graphql/queries/homepage';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { ProductCard } from '../../components/ProductCard';
import { useCartStore } from '../../stores/cartStore';
import i18n from '../../i18n';

const SCREEN_WIDTH = Dimensions.get('window').width;

function SectionHeader({ title, onViewAll }: { title: string; onViewAll?: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>{t('home.viewAll')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProductCarousel({ products, emptyMessage }: { products: any[]; emptyMessage?: string }) {
  if (products.length === 0) {
    return emptyMessage ? (
      <View style={styles.emptyCarousel}>
        <Text style={styles.emptyCarouselText}>{emptyMessage}</Text>
      </View>
    ) : null;
  }
  return (
    <FlatList
      data={products}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.productScroll}
      renderItem={({ item }) => (
        <View style={styles.productCardWrapper}>
          <ProductCard product={item as any} />
        </View>
      )}
    />
  );
}

function PromoBanner({ color, icon, title, subtitle, onPress }: {
  color: string; icon: string; title: string; subtitle: string; onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.promoBanner, { backgroundColor: color }]} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={28} color={Colors.white} />
      <View style={styles.promoBannerText}>
        <Text style={styles.promoBannerTitle}>{title}</Text>
        <Text style={styles.promoBannerSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.white} />
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const totalQuantity = useCartStore((s) => s.totalQuantity);
  const { config: storeConfig } = useRegionStore();
  const isArabic = i18n.language === 'ar';
  const insets = useSafeAreaInsets();

  const [result] = useQuery({ query: GET_HOMEPAGE_DATA });

  const bestSellers = result.data?.bestSellers?.nodes ?? [];
  const newArrivals = result.data?.newArrivals?.nodes ?? [];
  const onSale = (result.data?.onSale?.nodes ?? []).filter((p: { compareAtPriceRange?: { minVariantPrice?: { amount: string } }; priceRange: { minVariantPrice: { amount: string } } }) => {
    const cp = parseFloat(p.compareAtPriceRange?.minVariantPrice?.amount ?? '0');
    const pr = parseFloat(p.priceRange.minVariantPrice.amount);
    return cp > pr && pr > 0;
  });
  const acneProducts = result.data?.acne?.products?.nodes ?? [];
  const antiAgingProducts = result.data?.antiAging?.products?.nodes ?? [];
  const suncareProducts = result.data?.suncare?.products?.nodes ?? [];
  const hyperpigmentationProducts = result.data?.hyperpigmentation?.products?.nodes ?? [];

  const loading = result.fetching;

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../../assets/logo.png')} style={styles.logoImage} contentFit="contain" />
        <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/(tabs)/cart')}>
          <Ionicons name="cart-outline" size={26} color={Colors.text} />
          {totalQuantity > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalQuantity}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Announcement bar */}
      <View style={styles.announcementBar}>
        <Text style={styles.announcementText}>
          {isArabic
            ? `منتجات أصلية  •  توصيل ${formatPrice(storeConfig.shippingFee)}  •  توصيل مجاني فوق ${formatPrice(storeConfig.freeShippingThreshold)}`
            : `AUTHENTIC PRODUCTS  •  DELIVERY ${formatPrice(storeConfig.shippingFee)}  •  FREE OVER ${formatPrice(storeConfig.freeShippingThreshold)}`
          }
        </Text>
      </View>

      {/* Value props */}
      <View style={styles.valueProps}>
        <View style={styles.valueProp}>
          <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
          <Text style={styles.valuePropText}>{isArabic ? 'منتجات أصلية' : 'Authentic Products'}</Text>
        </View>
        <View style={styles.valuePropDivider} />
        <View style={styles.valueProp}>
          <Ionicons name="chatbubbles-outline" size={20} color={Colors.primary} />
          <Text style={styles.valuePropText}>{isArabic ? 'استشارات متخصصة' : 'Expert Consultations'}</Text>
        </View>
        <View style={styles.valuePropDivider} />
        <View style={styles.valueProp}>
          <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
          <Text style={styles.valuePropText}>{isArabic ? 'إرجاع سهل' : 'Easy Returns'}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: Spacing.xxxl * 2 }} />
      ) : (
        <>
          {/* Sale / Special Offers */}
          {onSale.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title={isArabic ? 'عروض خاصة' : 'Special Offers'} onViewAll={() => router.push('/(tabs)/shop')} />
              <ProductCarousel products={onSale} />
            </View>
          )}

          {/* Shop by Concern */}
          <View style={styles.section}>
            <SectionHeader title={t('home.shopByConcern')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {concerns.map((concern) => (
                <TouchableOpacity
                  key={concern.handle}
                  style={styles.concernItem}
                  onPress={() => router.push(`/collection/${concern.handle}`)}
                >
                  <View style={styles.concernIcon}>
                    <Ionicons name={concern.icon as keyof typeof Ionicons.glyphMap} size={24} color={Colors.primary} />
                  </View>
                  <Text style={styles.concernText} numberOfLines={2}>
                    {isArabic ? concern.titleAr : concern.titleEn}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Promo banners — region specific */}
          <View style={styles.promoSection}>
            {storeConfig.region === 'jo' ? (
              <>
                <PromoBanner
                  color="#61b69f"
                  icon="sparkles"
                  title={isArabic ? 'عروض فيشي و لاروش' : 'Vichy & La Roche-Posay'}
                  subtitle={isArabic ? 'عادوا من جديد!' : 'Back in Stock!'}
                  onPress={() => router.push('/collection/vichy')}
                />
                <PromoBanner
                  color="#4a7fb5"
                  icon="water"
                  title={isArabic ? 'يوسيرين' : 'Eucerin Range'}
                  subtitle={isArabic ? 'حماية وترطيب مثالي' : 'Perfect protection & hydration'}
                  onPress={() => router.push('/collection/eucerin')}
                />
                <PromoBanner
                  color="#e8a87c"
                  icon="sunny"
                  title={isArabic ? 'واقي الشمس' : 'Sun Protection'}
                  subtitle={isArabic ? 'احمي بشرتك هذا الصيف' : 'Protect your skin this summer'}
                  onPress={() => router.push('/collection/face-sunscreen')}
                />
              </>
            ) : (
              <>
                <PromoBanner
                  color="#61b69f"
                  icon="leaf"
                  title={isArabic ? 'ماتريسكين' : 'Matriskin'}
                  subtitle={isArabic ? 'اكتشفي مجموعة العناية' : 'Discover the skincare range'}
                  onPress={() => router.push('/collection/matriskin')}
                />
                <PromoBanner
                  color="#d4a574"
                  icon="happy"
                  title={isArabic ? 'موستيلا' : 'Mustela Baby'}
                  subtitle={isArabic ? 'عادت من جديد!' : 'Back in Stock!'}
                  onPress={() => router.push('/collection/baby-care')}
                />
                <PromoBanner
                  color="#4a7fb5"
                  icon="water"
                  title={isArabic ? 'أفين' : 'Eau Thermale Avene'}
                  subtitle={isArabic ? 'عروض حصرية' : 'Exclusive offers'}
                  onPress={() => router.push('/collection/eau-thermal-avene')}
                />
              </>
            )}
          </View>

          {/* Best Sellers */}
          <View style={styles.section}>
            <SectionHeader title={isArabic ? 'الأكثر مبيعاً' : 'Our Preferred Products'} onViewAll={() => router.push('/(tabs)/shop')} />
            <ProductCarousel products={bestSellers.filter((p: { priceRange: { minVariantPrice: { amount: string } } }) => parseFloat(p.priceRange.minVariantPrice.amount) > 0)} />
          </View>

          {/* Featured Brands */}
          <View style={styles.section}>
            <SectionHeader title={t('home.featuredBrands')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {brands.map((brand) => (
                <TouchableOpacity
                  key={brand.handle}
                  style={styles.brandItem}
                  onPress={() => router.push(`/collection/${brand.handle}`)}
                >
                  {brand.imageUrl ? (
                    <Image source={{ uri: brand.imageUrl }} style={styles.brandImage} contentFit="contain" />
                  ) : (
                    <View style={[styles.brandImage, styles.brandPlaceholder]}>
                      <Text style={styles.brandPlaceholderText}>{brand.name[0]}</Text>
                    </View>
                  )}
                  <Text style={styles.brandName} numberOfLines={1}>{brand.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Acne collection */}
          {acneProducts.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title={isArabic ? 'حب الشباب' : 'Acne Care'} onViewAll={() => router.push('/collection/acne')} />
              <ProductCarousel products={acneProducts} />
            </View>
          )}

          {/* Anti-Aging collection */}
          {antiAgingProducts.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title={isArabic ? 'مقاومة الشيخوخة' : 'Anti-Aging'} onViewAll={() => router.push('/collection/anti-aging')} />
              <ProductCarousel products={antiAgingProducts} />
            </View>
          )}

          {/* Suncare collection */}
          {suncareProducts.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title={isArabic ? 'واقي الشمس' : 'Sun Protection'} onViewAll={() => router.push('/collection/face-sunscreen')} />
              <ProductCarousel products={suncareProducts} />
            </View>
          )}

          {/* Hyperpigmentation collection */}
          {hyperpigmentationProducts.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title={isArabic ? 'تفتيح البشرة' : 'Hyperpigmentation'} onViewAll={() => router.push('/collection/face-hyperpigmentation')} />
              <ProductCarousel products={hyperpigmentationProducts} />
            </View>
          )}

          {/* Categories Grid */}
          <View style={styles.section}>
            <SectionHeader title={isArabic ? 'الفئات الشائعة' : 'Popular Categories'} />
            <View style={styles.categoryGrid}>
              {shopCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.handle}
                  style={styles.categoryItem}
                  onPress={() => router.push(`/collection/${cat.handle}`)}
                >
                  <View style={styles.categoryIcon}>
                    <Ionicons name={cat.icon as keyof typeof Ionicons.glyphMap} size={28} color={Colors.primary} />
                  </View>
                  <Text style={styles.categoryText} numberOfLines={2}>
                    {isArabic ? cat.titleAr : cat.titleEn}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* New Arrivals */}
          <View style={styles.section}>
            <SectionHeader title={isArabic ? 'وصل حديثاً' : 'New Arrivals'} />
            <ProductCarousel products={newArrivals.filter((p: { priceRange: { minVariantPrice: { amount: string } } }) => parseFloat(p.priceRange.minVariantPrice.amount) > 0)} />
          </View>

          {/* WhatsApp banner */}
          <TouchableOpacity
            style={styles.whatsappBanner}
            onPress={() => {
              const msg = isArabic ? 'مرحباً، أحتاج مساعدة' : 'Hi, I need help';
              const url = `https://wa.me/${storeConfig.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(msg)}`;
              require('react-native').Linking.openURL(url);
            }}
          >
            <Ionicons name="logo-whatsapp" size={24} color={Colors.white} />
            <View style={styles.whatsappText}>
              <Text style={styles.whatsappTitle}>{isArabic ? 'تحتاج مساعدة؟' : 'Need Help?'}</Text>
              <Text style={styles.whatsappSubtitle}>{isArabic ? 'تواصل معنا عبر واتساب' : 'Chat with us on WhatsApp'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        </>
      )}

      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  logoImage: { height: 36, width: 140 },
  cartButton: { position: 'relative', padding: Spacing.xs },
  cartBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: Colors.sale, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  cartBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  announcementBar: { backgroundColor: Colors.primary, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, alignItems: 'center' },
  announcementText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '600', textAlign: 'center', letterSpacing: 0.3 },
  valueProps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.sm },
  valueProp: { alignItems: 'center', gap: Spacing.xs, flex: 1 },
  valuePropText: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', fontWeight: '500' },
  valuePropDivider: { width: 1, height: 30, backgroundColor: Colors.border },
  section: { marginTop: Spacing.xxl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  viewAll: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  horizontalScroll: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  concernItem: { alignItems: 'center', width: 80 },
  concernIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  concernText: { fontSize: FontSize.xs, color: Colors.text, textAlign: 'center', fontWeight: '500' },
  promoSection: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl, gap: Spacing.md },
  promoBanner: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: BorderRadius.lg, gap: Spacing.md },
  promoBannerText: { flex: 1 },
  promoBannerTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  promoBannerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.sm, marginTop: 2 },
  brandItem: { alignItems: 'center', width: 100 },
  brandImage: { width: 80, height: 50, borderRadius: BorderRadius.md, backgroundColor: Colors.surface },
  brandPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  brandPlaceholderText: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.primary },
  brandName: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center', fontWeight: '500' },
  productScroll: { paddingHorizontal: Spacing.md },
  productCardWrapper: { width: (SCREEN_WIDTH - Spacing.md * 3) / 2, marginHorizontal: Spacing.xs },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.md },
  categoryItem: { width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md * 3) / 4, alignItems: 'center' },
  categoryIcon: { width: 56, height: 56, borderRadius: BorderRadius.lg, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  categoryText: { fontSize: FontSize.xs, color: Colors.text, textAlign: 'center', fontWeight: '500' },
  emptyCarousel: { height: 80, alignItems: 'center', justifyContent: 'center' },
  emptyCarouselText: { color: Colors.textLight, fontSize: FontSize.md },
  whatsappBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#25D366', marginHorizontal: Spacing.lg, marginTop: Spacing.xxl, padding: Spacing.lg, borderRadius: BorderRadius.lg, gap: Spacing.md },
  whatsappText: { flex: 1 },
  whatsappTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  whatsappSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.sm, marginTop: 2 },
});
