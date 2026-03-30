import { gql } from 'urql';
import { CART_FRAGMENT } from '../queries/cart';

export const CART_LINES_UPDATE = gql`
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
`;
