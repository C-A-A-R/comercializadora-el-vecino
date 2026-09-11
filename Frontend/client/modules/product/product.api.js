/**
 * product.api.js - Service gateway connecting the product module screens with api.js
 */

const ProductApi = {
  /**
   * Fetches products with optional category, search, and ordering filters
   */
  async getProducts(filters = {}) {
    try {
      const response = await window.Api.get('/products', filters);
      return response.data || response || [];
    } catch (error) {
      console.error('[ProductApi] Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Fetches single product technical specifications by ID
   */
  async getProductById(id) {
    try {
      const response = await window.Api.get(`/products/${id}`);
      return response.data || response;
    } catch (error) {
      console.error(`[ProductApi] Error fetching product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Fetches product categories list
   */
  async getCategories() {
    try {
      const response = await window.Api.get('/categories');
      return response.data || response || [];
    } catch (error) {
      console.error('[ProductApi] Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Fetches top-rated / featured products
   */
  async getFeatured() {
    try {
      const response = await window.Api.get('/products', { featuredOnly: true });
      return response.data || response || [];
    } catch (error) {
      console.error('[ProductApi] Error fetching featured products:', error);
      throw error;
    }
  }
};

if (typeof window !== 'undefined') {
  window.ProductApi = ProductApi;
}
