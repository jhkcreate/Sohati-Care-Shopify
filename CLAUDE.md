# SohatiCare Mobile App

## Key facts
- Expo SDK 54 + TypeScript + Expo Router (file-based navigation)
- React Native 0.81 with New Architecture enabled
- Two Shopify storefronts: JO (JOD) and EG (EGP)
- Runtime region switcher in Account page (swaps urql client, clears cart/wishlist)
- Production builds use STORE_REGION env var for separate app binaries
- Storefront API 2026-01 via urql GraphQL
- Checkout via Shopify hosted checkout (WebView using cart.checkoutUrl)
- Customer auth via Customer Account API (OAuth 2.0 + PKCE) — not yet implemented
- Languages: English + Arabic (full RTL via I18nManager.forceRTL + allowRTL)
- Primary color: #61b69f

## Storefront API credentials
- Jordan: domain=sohati-care-jordan.myshopify.com token=50d1c1a0fd0d479f1117bbb7a72880bc
- Egypt: domain=sohaticare-egypt.myshopify.com token=72b772cea137cd7a54e1185e9f481d7a

## Regional config
- Jordan 🇯🇴: JOD currency, free shipping at 30 JOD, 3 JOD delivery, default city Amman, bundle com.sohaticare.jo
- Egypt 🇪🇬: EGP currency, free shipping at 500 EGP, 50 EGP delivery, default city Cairo, bundle com.sohaticare.eg

## Architecture
- Region config: config/store.ts exports StoreConfig interface + formatPrice() + getDiscountPercent()
- Runtime region: stores/regionStore.ts manages active region, config, and urql client swap
- Static config: config/stores/jo.ts and config/stores/eg.ts
- Catalog data: config/catalog.ts has concerns, brands, shopCategories arrays
- GraphQL client: graphql/client.ts (static default), regionStore creates dynamic clients
- Homepage data: Single GET_HOMEPAGE_DATA query fetches all sections in one request

## Navigation (5 tabs)
1. Home — logo, announcement bar, value props, offers, concerns, promo banners, best sellers, brands, collection carousels, categories, new arrivals, WhatsApp CTA
2. Shop — search, brand filter chips, sort modal, product grid
3. Wishlist — saved products with WhatsApp share
4. Cart — line items, quantity controls, promo codes, free delivery progress, checkout
5. Account — login/register, region switcher (bottom sheet), language toggle, WhatsApp support

Plus: Product detail (image gallery, variants, quantity, tabs, related products), Collection (Shopify filters, sort), Checkout WebView

## Conventions
- All components in components/ directory
- All GraphQL in graphql/queries/ and graphql/mutations/
- All Zustand stores in stores/ directory
- Use region config from config/store.ts or useRegionStore — never hardcode region-specific values
- Currency formatting via formatPrice() which respects current app language (en/ar) and active region
- All user-facing strings go through i18n (i18n/en.json, i18n/ar.json) — never hardcode text
- Toast notifications via stores/toastStore.ts + components/Toast.tsx
- Products filtered with available_for_sale:true to exclude out-of-stock items
- Homepage promo banners are region-specific (different collections per country)
- No Lebanon region for now — only JO and EG

## Key files
- app/_layout.tsx — Root: SafeAreaProvider, urql Provider (dynamic from regionStore), Toast
- app/(tabs)/_layout.tsx — Tab navigator with cart/wishlist badges
- app/(tabs)/index.tsx — Homepage with all sections
- stores/regionStore.ts — Runtime region switching (persisted in AsyncStorage)
- config/store.ts — StoreConfig type, formatPrice(), setActiveRegionConfig()
- graphql/queries/homepage.ts — Single query for all homepage data
