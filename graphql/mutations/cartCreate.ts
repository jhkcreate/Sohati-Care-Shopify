import { gql } from 'urql';
import { CART_FRAGMENT } from '../queries/cart';

export const CART_CREATE = gql`
  ${CART_FRAGMENT}
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
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
