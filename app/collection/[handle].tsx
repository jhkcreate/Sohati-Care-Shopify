import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, Switch } from 'react-native';
import { useState, useMemo } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery } from 'urql';
import { Ionicons } from '@expo/vector-icons';
import { GET_COLLECTION } from '../../graphql/queries/collections';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { ProductCard } from '../../components/ProductCard';
import { formatPrice } from '../../config/store';
import i18n from '../../i18n';

type SortKey = 'BEST_SELLING' | 'PRICE' | 'CREATED';

const sortOptions = [
  { key: 'BEST_SELLING' as SortKey, reverse: false, en: 'Best Selling', ar: 'الأكثر مبيعاً' },
  { key: 'PRICE' as SortKey, reverse: false, en: 'Price: Low to High', ar: 'السعر: من الأقل' },
  { key: 'PRICE' as SortKey, reverse: true, en: 'Price: High to Low', ar: 'السعر: من الأعلى' },
  { key: 'CREATED' as SortKey, reverse: true, en: 'Newest', ar: 'الأحدث' },
];

export default function CollectionScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const isArabic = i18n.language === 'ar';

  const [sortIndex, setSortIndex] = useState(0);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [showSortModal, setShowSortModal] = useState(false);

  const sort = sortOptions[sortIndex];

  // Build Shopify product filters
  const filters = useMemo(() => {
    const f: Record<string, unknown>[] = [];
    if (inStockOnly) {
      f.push({ available: true });
    }
    return f.length > 0 ? f : undefined;
  }, [inStockOnly]);

  const [result] = useQuery({
    query: GET_COLLECTION,
    variables: { handle, first: 20, sortKey: sort.key, reverse: sort.reverse, filters },
  });

  const collection = result.data?.collection;
  const products = collection?.products?.nodes ?? [];
  const shopifyFilters = collection?.products?.filters ?? [];

  // Get availability counts from Shopify filters
  const availabilityFilter = shopifyFilters.find((f: { id: string }) => f.id === 'filter.v.availability');
  const inStockCount = availabilityFilter?.values?.find((v: { label: string }) => v.label === 'In stock')?.count ?? 0;
  const totalCount = availabilityFilter?.values?.reduce((sum: number, v: { count: number }) => sum + v.count, 0) ?? products.length;

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: collection?.title ?? handle ?? '' }} />
      <View style={styles.container}>
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
            ListHeaderComponent={
              <View style={styles.header}>
                {collection?.description ? (
                  <Text style={styles.description}>{collection.description}</Text>
                ) : null}

                {/* Filter + Sort bar */}
                <View style={styles.toolbar}>
                  <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
                    <Ionicons name="filter-outline" size={16} color={Colors.primary} />
                    <Text style={styles.filterButtonText}>{isArabic ? 'تصفية' : 'Filter'}</Text>
                    {inStockOnly && <View style={styles.filterDot} />}
                  </TouchableOpacity>

                  <Text style={styles.resultCount}>
                    {products.length} {isArabic ? 'منتج' : 'products'}
                  </Text>

                  <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortModal(true)}>
                    <Ionicons name="swap-vertical-outline" size={16} color={Colors.primary} />
                    <Text style={styles.sortText}>{isArabic ? sort.ar : sort.en}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            }
            renderItem={({ item }) => <ProductCard product={item} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="cube-outline" size={48} color={Colors.textLight} />
                <Text style={styles.emptyText}>{isArabic ? 'لا توجد منتجات' : 'No products found'}</Text>
                {inStockOnly && (
                  <TouchableOpacity onPress={() => setInStockOnly(false)}>
                    <Text style={styles.showAllLink}>{isArabic ? 'عرض جميع المنتجات' : 'Show all products'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}

        {/* Filter Modal */}
        <Modal visible={showFilterModal} transparent animationType="slide">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilterModal(false)}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{isArabic ? 'التصفية' : 'Filters'}</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              {/* Availability filter */}
              <View style={styles.filterRow}>
                <View style={styles.filterInfo}>
                  <Text style={styles.filterLabel}>{isArabic ? 'متوفر فقط' : 'In Stock Only'}</Text>
                  <Text style={styles.filterCount}>
                    {inStockCount} {isArabic ? 'من' : 'of'} {totalCount}
                  </Text>
                </View>
                <Switch
                  value={inStockOnly}
                  onValueChange={setInStockOnly}
                  trackColor={{ true: Colors.primary, false: Colors.border }}
                  thumbColor={Colors.white}
                />
              </View>

              <TouchableOpacity style={styles.applyButton} onPress={() => setShowFilterModal(false)}>
                <Text style={styles.applyButtonText}>{isArabic ? 'تطبيق' : 'Apply'}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Sort Modal */}
        <Modal visible={showSortModal} transparent animationType="slide">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSortModal(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{isArabic ? 'ترتيب حسب' : 'Sort by'}</Text>
              {sortOptions.map((option, index) => (
                <TouchableOpacity
                  key={`${option.key}-${option.reverse}`}
                  style={styles.sortOption}
                  onPress={() => { setSortIndex(index); setShowSortModal(false); }}
                >
                  <Text style={[styles.sortOptionText, index === sortIndex && styles.sortOptionActive]}>
                    {isArabic ? option.ar : option.en}
                  </Text>
                  {index === sortIndex && <Ionicons name="checkmark" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loader: { marginTop: Spacing.xxxl },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxxl },
  row: { justifyContent: 'space-between' },
  header: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.md },
  description: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.md, lineHeight: 22 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.surface, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  filterButtonText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  filterDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  resultCount: { fontSize: FontSize.sm, color: Colors.textSecondary },
  sortButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  sortText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: Spacing.xxxl, gap: Spacing.md },
  emptyText: { color: Colors.textSecondary, fontSize: FontSize.lg },
  showAllLink: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '600', marginTop: Spacing.sm },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: Spacing.xxl },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  filterInfo: { flex: 1 },
  filterLabel: { fontSize: FontSize.lg, color: Colors.text, fontWeight: '500' },
  filterCount: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  applyButton: { backgroundColor: Colors.primary, paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg, alignItems: 'center', marginTop: Spacing.xl },
  applyButtonText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  sortOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  sortOptionText: { fontSize: FontSize.lg, color: Colors.text },
  sortOptionActive: { color: Colors.primary, fontWeight: '600' },
});
