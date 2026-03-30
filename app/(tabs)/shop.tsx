import { View, Text, StyleSheet, TextInput, FlatList, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useQuery } from 'urql';
import { Ionicons } from '@expo/vector-icons';
import { GET_PRODUCTS } from '../../graphql/queries/products';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { ProductCard } from '../../components/ProductCard';
import { brands, shopCategories } from '../../config/catalog';
import i18n from '../../i18n';

type SortKey = 'BEST_SELLING' | 'PRICE' | 'CREATED_AT';

interface SortOption {
  key: SortKey;
  reverse: boolean;
  labelEn: string;
  labelAr: string;
}

const sortOptions: SortOption[] = [
  { key: 'BEST_SELLING', reverse: false, labelEn: 'Best Selling', labelAr: 'الأكثر مبيعاً' },
  { key: 'PRICE', reverse: false, labelEn: 'Price: Low to High', labelAr: 'السعر: من الأقل' },
  { key: 'PRICE', reverse: true, labelEn: 'Price: High to Low', labelAr: 'السعر: من الأعلى' },
  { key: 'CREATED_AT', reverse: true, labelEn: 'Newest', labelAr: 'الأحدث' },
];

export default function ShopScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const isArabic = i18n.language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortIndex, setSortIndex] = useState(0);
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const sort = sortOptions[sortIndex];

  const queryString = [
    'available_for_sale:true',
    debouncedQuery || undefined,
    selectedBrand ? `vendor:"${selectedBrand}"` : undefined,
  ].filter(Boolean).join(' ');

  const [result] = useQuery({
    query: GET_PRODUCTS,
    variables: {
      first: 20,
      query: queryString,
      sortKey: sort.key,
      reverse: sort.reverse,
    },
  });

  const products = (result.data?.products?.nodes ?? []).filter(
    (p: { priceRange: { minVariantPrice: { amount: string } } }) => parseFloat(p.priceRange.minVariantPrice.amount) > 0
  );
  const pageInfo = result.data?.products?.pageInfo;

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    // Simple debounce
    setTimeout(() => setDebouncedQuery(text), 300);
  }, []);

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('shop.search')}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={Colors.textLight}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setDebouncedQuery(''); }}>
              <Ionicons name="close-circle" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Brand filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, !selectedBrand && styles.filterChipActive]}
          onPress={() => setSelectedBrand(null)}
        >
          <Text style={[styles.filterChipText, !selectedBrand && styles.filterChipTextActive]}>
            {isArabic ? 'الكل' : 'All'}
          </Text>
        </TouchableOpacity>
        {brands.map((item) => (
          <TouchableOpacity
            key={item.handle}
            style={[styles.filterChip, selectedBrand === item.name && styles.filterChipActive]}
            onPress={() => setSelectedBrand(selectedBrand === item.name ? null : item.name)}
          >
            <Text style={[styles.filterChipText, selectedBrand === item.name && styles.filterChipTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort bar */}
      <View style={styles.sortBar}>
        <Text style={styles.resultCount}>
          {products.length} {isArabic ? 'منتج' : 'products'}
        </Text>
        <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortModal(true)}>
          <Ionicons name="swap-vertical-outline" size={18} color={Colors.primary} />
          <Text style={styles.sortButtonText}>
            {isArabic ? sort.labelAr : sort.labelEn}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Product grid */}
      {result.fetching && products.length === 0 ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard product={item} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>{t('shop.noResults')}</Text>
            </View>
          }
          ListFooterComponent={
            result.fetching ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ padding: Spacing.lg }} />
            ) : null
          }
        />
      )}

      {/* Sort modal */}
      <Modal visible={showSortModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSortModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('shop.sortBy')}</Text>
            {sortOptions.map((option, index) => (
              <TouchableOpacity
                key={`${option.key}-${option.reverse}`}
                style={[styles.modalOption, index === sortIndex && styles.modalOptionActive]}
                onPress={() => { setSortIndex(index); setShowSortModal(false); }}
              >
                <Text style={[styles.modalOptionText, index === sortIndex && styles.modalOptionTextActive]}>
                  {isArabic ? option.labelAr : option.labelEn}
                </Text>
                {index === sortIndex && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  filterContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    height: 60,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  resultCount: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sortButtonText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  loader: {
    marginTop: Spacing.xxxl,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  row: {
    justifyContent: 'space-between',
  },
  empty: {
    alignItems: 'center',
    marginTop: Spacing.xxxl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xxl,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  modalOptionActive: {},
  modalOptionText: {
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  modalOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
