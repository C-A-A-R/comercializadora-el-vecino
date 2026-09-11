import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { Product } from "../types/product";

/**
 * Hook reutilizable para consultar productos desde el backend.
 * Permite pasar filtros o parámetros de búsqueda y devuelve la data normalizada.
 */
export function useProducts(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const { data } = await api.get<Product[] | { results: Product[] }>("/products/", { params });
      return Array.isArray(data) ? data : data.results;
    },
  });
}
