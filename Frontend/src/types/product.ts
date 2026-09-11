/**
 * Modelo de datos principal para un producto en el catálogo.
 * Representa la estructura más útil del backend para renderizar cards, fichas o
 * listados sin depender de propiedades no necesarias en la interfaz pública.
 */
export interface Product {
  id: number;
  product_name: string;
  brand?: string;
  description?: string;
  product_image?: string;
  price?: number | string;
  capacity?: string;
  voltage?: string;
  is_feature_product?: boolean;
  ranking_score?: number;
}
