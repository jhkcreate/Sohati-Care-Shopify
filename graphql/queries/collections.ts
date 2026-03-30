import { gql } from 'urql';

export const GET_COLLECTIONS = gql`
  query GetCollections($first: Int!) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
        description
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

export const GET_COLLECTION = gql`
  query GetCollection($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $filters: [ProductFilter!]) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
      }
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
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
      }
    }
  }
`;
