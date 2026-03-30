import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useRegionStore } from '../../stores/regionStore';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import i18n from '../../i18n';

function MenuItem({ icon, label, value, onPress, danger }: { icon: string; label: string; value?: string; onPress?: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={22} color={danger ? Colors.error : Colors.text} />
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
        {value && <Text style={styles.menuValue}>{value}</Text>}
      </View>
      {onPress && <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />}
    </TouchableOpacity>
  );
}

export default function AccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isLoggedIn, customer, logout } = useAuthStore();
  const { region, config: storeConfig, setRegion } = useRegionStore();
  const clearCart = useCartStore((s) => s.clearCart);
  const clearWishlist = useWishlistStore((s) => s.clear);
  const isArabic = i18n.language === 'ar';
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  const regions = [
    { key: 'jo' as const, flag: '\u{1F1EF}\u{1F1F4}', label: 'Jordan', labelAr: '\u0627\u0644\u0623\u0631\u062F\u0646', currency: 'JOD' },
    { key: 'eg' as const, flag: '\u{1F1EA}\u{1F1EC}', label: 'Egypt', labelAr: '\u0645\u0635\u0631', currency: 'EGP' },
  ];

  const handleRegionSelect = (newRegion: 'jo' | 'eg') => {
    if (newRegion === region) {
      setShowRegionPicker(false);
      return;
    }
    setShowRegionPicker(false);
    Alert.alert(
      isArabic ? '\u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0645\u0646\u0637\u0642\u0629' : 'Change Region',
      isArabic
        ? '\u0633\u064A\u062A\u0645 \u0645\u0633\u062D \u0627\u0644\u0633\u0644\u0629 \u0648\u0627\u0644\u0645\u0641\u0636\u0644\u0629. \u0645\u062A\u0627\u0628\u0639\u0629\u061F'
        : 'Your cart and wishlist will be cleared. Continue?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            await clearCart();
            clearWishlist();
            await setRegion(newRegion);
            router.replace('/(tabs)');
          },
        },
      ],
    );
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const openWhatsApp = () => {
    const message = isArabic ? 'مرحباً، أحتاج مساعدة' : 'Hi, I need help';
    const url = `https://wa.me/${storeConfig.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  const handleLogout = () => {
    Alert.alert(
      t('account.logout'),
      isArabic ? 'هل أنت متأكد؟' : 'Are you sure?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('account.logout'), style: 'destructive', onPress: logout },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile / Auth section */}
      {!isLoggedIn ? (
        <View style={styles.authSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.welcomeText}>{isArabic ? 'مرحباً بك' : 'Welcome'}</Text>
          <Text style={styles.authSubtext}>
            {isArabic ? 'سجل الدخول للوصول إلى طلباتك وعناوينك' : 'Sign in to access your orders and addresses'}
          </Text>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>{t('account.login')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerButtonText}>{t('account.register')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.profileSection}>
          <View style={styles.avatarCircleFilled}>
            <Text style={styles.avatarInitial}>
              {customer?.firstName?.[0]?.toUpperCase() ?? 'U'}
            </Text>
          </View>
          <Text style={styles.profileName}>
            {customer?.firstName} {customer?.lastName}
          </Text>
          <Text style={styles.profileEmail}>{customer?.email}</Text>
        </View>
      )}

      {/* Account menu */}
      {isLoggedIn && (
        <View style={styles.menuGroup}>
          <Text style={styles.menuGroupTitle}>{isArabic ? 'حسابي' : 'My Account'}</Text>
          <MenuItem icon="receipt-outline" label={t('account.orders')} />
          <MenuItem icon="location-outline" label={t('account.addresses')} />
          <MenuItem icon="person-outline" label={t('account.profile')} />
        </View>
      )}

      {/* Preferences */}
      <View style={styles.menuGroup}>
        <Text style={styles.menuGroupTitle}>{isArabic ? 'التفضيلات' : 'Preferences'}</Text>
        <MenuItem
          icon="globe-outline"
          label={isArabic ? 'المنطقة' : 'Region'}
          value={region === 'jo' ? '🇯🇴 Jordan (JOD)' : '🇪🇬 Egypt (EGP)'}
          onPress={() => setShowRegionPicker(true)}
        />
        <MenuItem
          icon="language-outline"
          label={t('account.language')}
          value={i18n.language === 'en' ? 'English' : 'العربية'}
          onPress={toggleLanguage}
        />
        <MenuItem icon="notifications-outline" label={t('account.notifications')} />
      </View>

      {/* Support */}
      <View style={styles.menuGroup}>
        <Text style={styles.menuGroupTitle}>{isArabic ? 'الدعم' : 'Support'}</Text>
        <MenuItem icon="logo-whatsapp" label={t('account.support')} onPress={openWhatsApp} />
        <MenuItem icon="document-text-outline" label={t('account.terms')} />
        <MenuItem icon="shield-outline" label={t('account.privacy')} />
      </View>

      {/* Logout */}
      {isLoggedIn && (
        <View style={styles.menuGroup}>
          <MenuItem icon="log-out-outline" label={t('account.logout')} onPress={handleLogout} danger />
        </View>
      )}

      <View style={{ height: Spacing.xxxl }} />

      {/* Region picker modal */}
      <Modal visible={showRegionPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowRegionPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isArabic ? 'اختر المنطقة' : 'Select Region'}</Text>
            {regions.map((r) => (
              <TouchableOpacity
                key={r.key}
                style={[styles.regionOption, r.key === region && styles.regionOptionActive]}
                onPress={() => handleRegionSelect(r.key)}
              >
                <Text style={styles.regionFlag}>{r.flag}</Text>
                <View style={styles.regionInfo}>
                  <Text style={[styles.regionLabel, r.key === region && styles.regionLabelActive]}>
                    {isArabic ? r.labelAr : r.label}
                  </Text>
                  <Text style={styles.regionCurrency}>{r.currency}</Text>
                </View>
                {r.key === region && (
                  <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  authSection: { alignItems: 'center', paddingVertical: Spacing.xxxl, paddingHorizontal: Spacing.lg, backgroundColor: Colors.white },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarCircleFilled: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.white },
  welcomeText: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text, marginTop: Spacing.lg },
  authSubtext: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center' },
  loginButton: { backgroundColor: Colors.primary, paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxxl, borderRadius: BorderRadius.lg, width: '100%', alignItems: 'center', marginTop: Spacing.xl },
  loginButtonText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  registerButton: { borderWidth: 1.5, borderColor: Colors.primary, paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxxl, borderRadius: BorderRadius.lg, width: '100%', alignItems: 'center', marginTop: Spacing.md },
  registerButtonText: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '700' },
  profileSection: { alignItems: 'center', paddingVertical: Spacing.xxl, backgroundColor: Colors.white },
  profileName: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginTop: Spacing.md },
  profileEmail: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  menuGroup: { marginTop: Spacing.md, backgroundColor: Colors.white },
  menuGroupTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  menuContent: { flex: 1, marginLeft: Spacing.md },
  menuLabel: { fontSize: FontSize.lg, color: Colors.text },
  menuLabelDanger: { color: Colors.error },
  menuValue: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: Spacing.xxl },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.lg },
  regionOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
  regionOptionActive: { backgroundColor: Colors.primaryLight },
  regionFlag: { fontSize: 28 },
  regionInfo: { flex: 1, marginLeft: Spacing.md },
  regionLabel: { fontSize: FontSize.lg, color: Colors.text, fontWeight: '500' },
  regionLabelActive: { color: Colors.primary, fontWeight: '700' },
  regionCurrency: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
});
