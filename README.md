# SohatiCare Mobile App

Cross-platform React Native mobile app for [SohatiCare](https://sohaticare.com), a dermo-cosmetic e-commerce brand operating two Shopify storefronts (Jordan and Egypt).

## Tech Stack

- **Framework:** React Native 0.81 via Expo SDK 54
- **Language:** TypeScript (strict)
- **Navigation:** Expo Router (file-based)
- **State:** Zustand
- **API:** Shopify Storefront API 2026-01 via urql (GraphQL)
- **i18n:** react-i18next (English + Arabic RTL)
- **Build:** EAS Build + EAS Submit

## Getting Started

```bash
# Install dependencies
npm install

# Run on Android (requires Android Studio)
npx expo run:android

# Run on iOS (requires Mac + Xcode)
npx expo run:ios

# Switch region (default: Jordan)
EXPO_PUBLIC_STORE_REGION=eg npx expo run:android
```

## Project Structure

```
app/                    # Expo Router screens
  (tabs)/               # Bottom tab screens (Home, Shop, Wishlist, Cart, Account)
  product/[handle].tsx  # Product detail page
  collection/[handle].tsx # Collection page with filters
  cart.tsx              # Cart modal
  checkout.tsx          # Shopify hosted checkout WebView
components/             # Reusable UI components
config/                 # Regional config (JO/EG) + catalog data
  stores/jo.ts          # Jordan config
  stores/eg.ts          # Egypt config
  store.ts              # Config resolver + formatPrice()
  catalog.ts            # Concerns, brands, categories
graphql/                # urql client + Storefront API queries/mutations
stores/                 # Zustand state (cart, wishlist, auth, region, toast)
i18n/                   # English + Arabic translations
constants/              # Theme (colors, spacing, typography)
```

## Regional Storefronts

| | Jordan | Egypt |
|---|---|---|
| Domain | sohati-care-jordan.myshopify.com | sohaticare-egypt.myshopify.com |
| Currency | JOD | EGP |
| Free Shipping | 30 JOD | 500 EGP |
| Delivery Fee | 3 JOD | 50 EGP |
| Bundle ID | com.sohaticare.jo | com.sohaticare.eg |

Region can be switched at runtime via Account > Region, or set at build time via `STORE_REGION` env var for separate app binaries.

## Features

- Product browsing with search, brand filters, and sort
- Product detail with image gallery, variant selector, and related products
- Cart with quantity controls, promo codes, and free delivery progress
- Wishlist with WhatsApp share
- Shopify hosted checkout (PCI compliant)
- Runtime region switcher (Jordan/Egypt)
- English + Arabic with full RTL support
- Toast notifications on add-to-cart

## Build for Production

```bash
# Jordan
eas build --profile production-jo --platform all

# Egypt
eas build --profile production-eg --platform all
```
