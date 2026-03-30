import { gql } from 'urql';
import { CART_FRAGMENT } from '../queries/cart';

export const CART_DISCOUNT_CODES_UPDATE = gql`
  ${CART_FRAGMENT}
  mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
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
