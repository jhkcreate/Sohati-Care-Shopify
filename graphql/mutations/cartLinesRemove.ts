import { gql } from 'urql';
import { CART_FRAGMENT } from '../queries/cart';

export const CART_LINES_REMOVE = gql`
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
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
