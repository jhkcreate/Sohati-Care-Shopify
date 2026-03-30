import { View, StyleSheet, Dimensions, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useState, useRef, useCallback } from 'react';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;

interface Banner {
  id: string;
  imageUrl: string;
  altText?: string;
}

interface Props {
  banners: Banner[];
  onBannerPress?: (banner: Banner) => void;
}

export function BannerCarousel({ banners }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<Banner>>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  if (banners.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={styles.bannerWrapper}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.bannerImage}
              contentFit="cover"
              transition={300}
            />
          </View>
        )}
      />
      {banners.length > 1 && (
        <View style={styles.dots}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  bannerWrapper: {
    width: SCREEN_WIDTH,
    paddingHorizontal: Spacing.lg,
  },
  bannerImage: {
    width: BANNER_WIDTH,
    height: BANNER_WIDTH * 0.45,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 18,
  },
});
