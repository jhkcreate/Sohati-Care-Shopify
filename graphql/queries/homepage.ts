import { gql } from 'urql';

// Single query to fetch all homepage data in one request
export const GET_HOMEPAGE_DATA = gql`
  query GetHomepageData {
    bestSellers: products(first: 10, query: "available_for_sale:true", sortKey: BEST_SELLING) {
      nodes {
        id
        handle
        title
        vendor
        availableForSale
        priceRange {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
        compareAtPriceRange {
          minVariantPrice { amount currencyCode }
        }
        featuredImage { url altText }
        variants(first: 1) {
          nodes { id availableForSale }
        }
      }
    }
    newArrivals: products(first: 10, query: "available_for_sale:true", sortKey: CREATED_AT, reverse: true) {
      nodes {
        id
        handle
        title
        vendor
        availableForSale
        priceRange {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
        compareAtPriceRange {
          minVariantPrice { amount currencyCode }
        }
        featuredImage { url altText }
        variants(first: 1) {
          nodes { id availableForSale }
        }
      }
    }
    onSale: products(first: 10, query: "available_for_sale:true", sortKey: PRICE, reverse: true) {
      nodes {
        id
        handle
        title
        vendor
        availableForSale
        priceRange {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
        compareAtPriceRange {
          minVariantPrice { amount currencyCode }
        }
        featuredImage { url altText }
        variants(first: 1) {
          nodes { id availableForSale }
        }
      }
    }
    acne: collection(handle: "acne") {
      products(first: 6, filters: [{ available: true }]) {
        nodes {
          id handle title vendor availableForSale
          priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
          compareAtPriceRange { minVariantPrice { amount currencyCode } }
          featuredImage { url altText }
          variants(first: 1) { nodes { id availableForSale } }
        }
      }
    }
    antiAging: collection(handle: "anti-aging") {
      products(first: 6, filters: [{ available: true }]) {
        nodes {
          id handle title vendor availableForSale
          priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
          compareAtPriceRange { minVariantPrice { amount currencyCode } }
          featuredImage { url altText }
          variants(first: 1) { nodes { id availableForSale } }
        }
      }
    }
    suncare: collection(handle: "face-sunscreen") {
      products(first: 6, filters: [{ available: true }]) {
        nodes {
          id handle title vendor availableForSale
          priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
          compareAtPriceRange { minVariantPrice { amount currencyCode } }
          featuredImage { url altText }
          variants(first: 1) { nodes { id availableForSale } }
        }
      }
    }
    hyperpigmentation: collection(handle: "face-hyperpigmentation") {
      products(first: 6, filters: [{ available: true }]) {
        nodes {
          id handle title vendor availableForSale
          priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
          compareAtPriceRange { minVariantPrice { amount currencyCode } }
          featuredImage { url altText }
          variants(first: 1) { nodes { id availableForSale } }
        }
      }
    }
  }
`;
