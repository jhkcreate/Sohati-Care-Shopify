import { gql } from 'urql';

const PRODUCT_CARD_FRAGMENT = gql`
  fragment ProductCard on Product {
    id
    handle
    title
    vendor
    productType
    availableForSale
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      url
      altText
      width
      height
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
      }
    }
  }
`;

export const GET_PRODUCTS = gql`
  ${PRODUCT_CARD_FRAGMENT}
  query GetProducts($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...ProductCard
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      vendor
      productType
      description
      descriptionHtml
      availableForSale
      tags
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      media(first: 10) {
        nodes {
          ... on MediaImage {
            id
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
      variants(first: 50) {
        nodes {
          id
          title
          availableForSale
          quantityAvailable
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
      metafields(identifiers: [
        { namespace: "custom", key: "ingredients" },
        { namespace: "custom", key: "how_to_use" }
      ]) {
        key
        value
        type
      }
    }
  }
`;

export const SEARCH_PRODUCTS = gql`
  ${PRODUCT_CARD_FRAGMENT}
  query SearchProducts($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: PRODUCT) {
      nodes {
        ... on Product {
          ...ProductCard
        }
      }
    }
  }
`;
