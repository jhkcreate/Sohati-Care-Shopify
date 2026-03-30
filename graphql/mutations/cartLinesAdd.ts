import { gql } from 'urql';
import { CART_FRAGMENT } from '../queries/cart';

export const CART_LINES_ADD = gql`
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
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
