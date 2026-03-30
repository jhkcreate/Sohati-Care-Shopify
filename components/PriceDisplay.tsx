import { View, Text, StyleSheet } from 'react-native';
import { formatPrice } from '../config/store';
import { Colors, FontSize, Spacing } from '../constants/theme';
import { useTranslation } from 'react-i18next';

interface Props {
  price: string;
  compareAtPrice?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceDisplay({ price, compareAtPrice, size = 'md' }: Props) {
  const { t } = useTranslation();
  const hasDiscount = compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price);
  const discountPercent = hasDiscount
    ? Math.round(((parseFloat(compareAtPrice!) - parseFloat(price)) / parseFloat(compareAtPrice!)) * 100)
    : 0;

  const fontSize = size === 'sm' ? FontSize.sm : size === 'lg' ? FontSize.xl : FontSize.md;

  return (
    <View style={styles.container}>
      <Text style={[styles.price, { fontSize }]}>{formatPrice(price)}</Text>
      {hasDiscount && (
        <>
          <Text style={[styles.comparePrice, { fontSize: fontSize - 2 }]}>
            {formatPrice(compareAtPrice!)}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('common.off', { percent: discountPercent })}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  price: {
    fontWeight: '700',
    color: Colors.primary,
  },
  comparePrice: {
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  badge: {
    backgroundColor: Colors.sale,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
