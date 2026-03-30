// Static catalog structure derived from Shopify collections
// These map to real collection handles in the Shopify stores

export interface ConcernCategory {
  handle: string;
  titleEn: string;
  titleAr: string;
  icon: string; // Ionicons name
}

export interface BrandItem {
  handle: string;
  name: string;
  imageUrl?: string;
}

export interface ShopCategory {
  handle: string;
  titleEn: string;
  titleAr: string;
  icon: string;
}

export const concerns: ConcernCategory[] = [
  { handle: 'acne', titleEn: 'Acne', titleAr: 'حب الشباب', icon: 'water-outline' },
  { handle: 'anti-aging', titleEn: 'Anti-Aging', titleAr: 'مقاومة الشيخوخة', icon: 'sparkles-outline' },
  { handle: 'hair-loss', titleEn: 'Hair Loss', titleAr: 'تساقط الشعر', icon: 'cut-outline' },
  { handle: 'dry-skin', titleEn: 'Dry Skin', titleAr: 'البشرة الجافة', icon: 'leaf-outline' },
  { handle: 'eczema-and-atopy', titleEn: 'Eczema', titleAr: 'الأكزيما', icon: 'bandage-outline' },
  { handle: 'uneven-skin-tone', titleEn: 'Uneven Tone', titleAr: 'تفاوت لون البشرة', icon: 'color-palette-outline' },
  { handle: 'dark-spots', titleEn: 'Dark Spots', titleAr: 'البقع الداكنة', icon: 'ellipse-outline' },
  { handle: 'scars-and-burns', titleEn: 'Scars & Burns', titleAr: 'الندوب والحروق', icon: 'medkit-outline' },
  { handle: 'baby-care', titleEn: 'Baby Care', titleAr: 'العناية بالطفل', icon: 'happy-outline' },
  { handle: 'eye-puffiness-and-dark-circles', titleEn: 'Dark Circles', titleAr: 'الهالات السوداء', icon: 'eye-outline' },
];

export const brands: BrandItem[] = [
  { handle: 'la-roche-posay', name: 'La Roche-Posay', imageUrl: 'https://cdn.shopify.com/s/files/1/0242/1109/5648/collections/LRP_logo.png?v=1583498702' },
  { handle: 'eau-thermal-avene', name: 'Avène', imageUrl: 'https://cdn.shopify.com/s/files/1/0242/1109/5648/collections/Eau_Thermal_PNG_600x600_1150faa6-5f58-425e-aebe-767a436ce4d0.png?v=1583420673' },
  { handle: 'vichy', name: 'Vichy', imageUrl: 'https://cdn.shopify.com/s/files/1/0242/1109/5648/collections/vichy.png?v=1589793956' },
  { handle: 'eucerin', name: 'Eucerin', imageUrl: 'https://cdn.shopify.com/s/files/1/0242/1109/5648/collections/eucerin_800x400_c13e7913-9922-491a-a0dc-36a1ea3b99c5.jpg?v=1583494212' },
  { handle: 'ducray', name: 'Ducray', imageUrl: 'https://cdn.shopify.com/s/files/1/0242/1109/5648/collections/ducray.png?v=1586337204' },
  { handle: 'uriage', name: 'Uriage', imageUrl: 'https://cdn.shopify.com/s/files/1/0242/1109/5648/collections/uriage.jpg?v=1583492633' },
  { handle: 'matriskin', name: 'Matriskin', imageUrl: 'https://cdn.shopify.com/s/files/1/0242/1109/5648/collections/matriskin_logo.jpg?v=1583496173' },
];

export const shopCategories: ShopCategory[] = [
  { handle: 'face-moisturizer', titleEn: 'Face Moisturizers', titleAr: 'مرطبات الوجه', icon: 'water-outline' },
  { handle: 'cleansers-make-up-remover', titleEn: 'Cleansers', titleAr: 'المنظفات', icon: 'sparkles-outline' },
  { handle: 'face-sunscreen', titleEn: 'Face Sunscreen', titleAr: 'واقي شمس للوجه', icon: 'sunny-outline' },
  { handle: 'sunscreen', titleEn: 'Body Sunscreen', titleAr: 'واقي شمس للجسم', icon: 'body-outline' },
  { handle: 'anti-aging-serums', titleEn: 'Serums', titleAr: 'السيروم', icon: 'flask-outline' },
  { handle: 'anti-hair-loss-shampoos', titleEn: 'Hair Care', titleAr: 'العناية بالشعر', icon: 'cut-outline' },
  { handle: 'body-moisturisers', titleEn: 'Body Care', titleAr: 'العناية بالجسم', icon: 'fitness-outline' },
  { handle: 'antiperspirants', titleEn: 'Antiperspirants', titleAr: 'مزيلات العرق', icon: 'shield-outline' },
  { handle: 'medical-foundation', titleEn: 'Makeup', titleAr: 'المكياج', icon: 'brush-outline' },
  { handle: 'baby-care', titleEn: 'Baby Care', titleAr: 'العناية بالطفل', icon: 'happy-outline' },
  { handle: 'hand-care', titleEn: 'Hand Care', titleAr: 'العناية باليدين', icon: 'hand-left-outline' },
  { handle: 'shower-gels', titleEn: 'Shower Gels', titleAr: 'جل الاستحمام', icon: 'rainy-outline' },
];
