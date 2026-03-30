import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../stores/cartStore';
import { storeConfig, formatPrice } from '../config/store';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { EmptyState } from '../components/EmptyState';
import { QuantityStepper } from '../components/QuantityStepper';
import i18n from '../i18n';

export default function CartScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const isArabic = i18n.language === 'ar';
  const [promoCode, setPromoCode] = useState('');

  const { lines, cost, totalQuantity, checkoutUrl, discountCodes, loading, error, updateQuantity, removeItem, applyDiscount } = useCartStore();

  if (lines.length === 0 && !loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, headerTitle: t('cart.title') }} />
        <EmptyState
          icon="cart-outline"
          title={t('cart.empty')}
          subtitle={t('cart.emptyDescription')}
          actionLabel={t('cart.shopNow')}
          onAction={() => router.back()}
        />
      </>
    );
  }

  const subtotal = parseFloat(cost?.subtotalAmount?.amount ?? '0');
  const meetsThreshold = subtotal >= storeConfig.freeShippingThreshold;
  const deliveryFee = meetsThreshold ? 0 : storeConfig.shippingFee;
  const remaining = storeConfig.freeShippingThreshold - subtotal;
  const progressPercent = Math.min((subtotal / storeConfig.freeShippingThreshold) * 100, 100);
  const appliedDiscount = discountCodes?.find((d) => d.applicable);

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      applyDiscount(promoCode.trim());
    }
  };

  const confirmRemove = (lineId: string, productName: string) => {
    Alert.alert(
      isArabic ? 'إزالة المنتج' : 'Remove Item',
      isArabic ? `هل تريد إزالة ${productName}؟` : `Remove ${productName} from cart?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => removeItem(lineId) },
      ],
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: `${t('cart.title')} (${totalQuantity})` }} />
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Free delivery progress */}
          <View style={styles.progressBanner}>
            {meetsThreshold ? (
              <View style={styles.progressRow}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.progressSuccess}>{t('cart.freeDeliveryReached')}</Text>
              </View>
            ) : (
              <>
                <Text style={styles.progressText}>
                  {t('cart.freeDeliveryProgress', { remaining: formatPrice(remaining) })}
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>
              </>
            )}
          </View>

          {/* Cart items */}
          {lines.map((line) => (
            <View key={line.id} style={styles.lineItem}>
              <TouchableOpacity onPress={() => router.push(`/product/${line.merchandise.product.handle}`)}>
                {line.merchandise.image ? (
                  <Image source={{ uri: line.merchandise.image.url }} style={styles.lineImage} contentFit="cover" />
                ) : (
                  <View style={[styles.lineImage, styles.lineImagePlaceholder]}>
                    <Ionicons name="image-outline" size={24} color={Colors.textLight} />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.lineInfo}>
                <Text style={styles.lineVendor}>{line.merchandise.product.vendor}</Text>
                <Text style={styles.lineName} numberOfLines={2}>{line.merchandise.product.title}</Text>
                {line.merchandise.selectedOptions
                  .filter((o) => o.value !== 'Default Title')
                  .map((o) => (
                    <Text key={o.name} style={styles.lineOption}>{o.name}: {o.value}</Text>
                  ))}

                <View style={styles.lineBottom}>
                  <QuantityStepper
                    quantity={line.quantity}
                    onIncrement={() => updateQuantity(line.id, line.quantity + 1)}
                    onDecrement={() => {
                      if (line.quantity <= 1) {
                        confirmRemove(line.id, line.merchandise.product.title);
                      } else {
                        updateQuantity(line.id, line.quantity - 1);
                      }
                    }}
                    min={0}
                  />
                  <Text style={styles.linePrice}>{formatPrice(line.cost.totalAmount.amount)}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => confirmRemove(line.id, line.merchandise.product.title)}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Promo code */}
          <View style={styles.promoSection}>
            <Text style={styles.promoLabel}>{t('cart.promoCode')}</Text>
            <View style={styles.promoRow}>
              <TextInput
                style={styles.promoInput}
                placeholder={isArabic ? 'أدخل رمز الخصم' : 'Enter code'}
                value={promoCode}
                onChangeText={setPromoCode}
                placeholderTextColor={Colors.textLight}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.promoButton} onPress={handleApplyPromo}>
                <Text style={styles.promoButtonText}>{t('cart.apply')}</Text>
              </TouchableOpacity>
            </View>
            {appliedDiscount && (
              <View style={styles.appliedDiscount}>
                <Ionicons name="pricetag" size={14} color={Colors.success} />
                <Text style={styles.appliedDiscountText}>{appliedDiscount.code}</Text>
              </View>
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        </ScrollView>

        {/* Order summary + checkout */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.delivery')}</Text>
            <Text style={[styles.summaryValue, meetsThreshold && styles.freeText]}>
              {meetsThreshold ? t('cart.free') : formatPrice(deliveryFee)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('cart.total')}</Text>
            <Text style={styles.totalValue}>{formatPrice(subtotal + deliveryFee)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
            onPress={() => {
              if (checkoutUrl) {
                router.push({ pathname: '/checkout', params: { url: checkoutUrl } });
              }
            }}
            disabled={loading || !checkoutUrl}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.checkoutButtonText}>{t('cart.checkout')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  progressBanner: { backgroundColor: Colors.primaryLight, padding: Spacing.lg, margin: Spacing.lg, borderRadius: BorderRadius.lg },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progressSuccess: { color: Colors.success, fontWeight: '600', fontSize: FontSize.md },
  progressText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.sm },
  progressBar: { height: 6, backgroundColor: 'rgba(15,110,86,0.15)', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },
  lineItem: { flexDirection: 'row', padding: Spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  lineImage: { width: 80, height: 80, borderRadius: BorderRadius.md, backgroundColor: Colors.surface },
  lineImagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  lineInfo: { flex: 1, marginLeft: Spacing.md },
  lineVendor: { fontSize: FontSize.xs, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  lineName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginTop: 2 },
  lineOption: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  lineBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.md },
  linePrice: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary },
  removeButton: { padding: Spacing.sm, alignSelf: 'flex-start' },
  promoSection: { padding: Spacing.lg },
  promoLabel: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  promoRow: { flexDirection: 'row', gap: Spacing.sm },
  promoInput: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSize.md, color: Colors.text },
  promoButton: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  promoButtonText: { color: Colors.white, fontWeight: '600', fontSize: FontSize.md },
  appliedDiscount: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.sm },
  appliedDiscountText: { color: Colors.success, fontWeight: '600', fontSize: FontSize.sm },
  errorText: { color: Colors.error, fontSize: FontSize.sm, marginTop: Spacing.sm },
  summary: { padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white, paddingBottom: Spacing.xxxl },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  summaryLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.md, color: Colors.text, fontWeight: '500' },
  freeText: { color: Colors.success, fontWeight: '700' },
  totalRow: { marginTop: Spacing.sm, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  totalLabel: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  totalValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary },
  checkoutButton: { backgroundColor: Colors.primary, paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg, alignItems: 'center', marginTop: Spacing.lg },
  checkoutButtonDisabled: { opacity: 0.6 },
  checkoutButtonText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
});
