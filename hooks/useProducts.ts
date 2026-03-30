import { useQuery } from 'urql';
import { GET_PRODUCTS, GET_PRODUCT, SEARCH_PRODUCTS } from '../graphql/queries/products';
import { GET_COLLECTIONS, GET_COLLECTION } from '../graphql/queries/collections';

export function useProducts(variables: { first: number; query?: string; sortKey?: string; reverse?: boolean; after?: string }) {
  return useQuery({ query: GET_PRODUCTS, variables });
}

export function useProduct(handle: string) {
  return useQuery({ query: GET_PRODUCT, variables: { handle } });
}

export function useSearchProducts(query: string, first = 20) {
  return useQuery({ query: SEARCH_PRODUCTS, variables: { query, first }, pause: !query });
}

export function useCollections(first = 20) {
  return useQuery({ query: GET_COLLECTIONS, variables: { first } });
}

export function useCollection(handle: string, variables: { first: number; sortKey?: string; reverse?: boolean; after?: string }) {
  return useQuery({ query: GET_COLLECTION, variables: { handle, ...variables } });
}
