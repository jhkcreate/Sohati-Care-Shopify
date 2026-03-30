import { gql } from 'urql';

export const CART_FRAGMENT = gql`
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    lines(first: 100) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            image {
              url
              altText
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            product {
              handle
              title
              vendor
            }
            selectedOptions {
              name
              value
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          compareAtAmountPerQuantity {
            amount
            currencyCode
          }
        }
      }
    }
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    discountCodes {
      code
      applicable
    }
  }
`;

export const GET_CART = gql`
  ${CART_FRAGMENT}
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }
`;
