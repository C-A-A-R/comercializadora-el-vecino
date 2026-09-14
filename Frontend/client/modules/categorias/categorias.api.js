/**
 * categorias.api.js - Service gateway connecting the categories module with api.js
 */

const CategoriasApi = {
  async getCategories() {
    try {
      const response = await window.Api.get('/categories');
      return response.data || response || [];
    } catch (error) {
      console.error('[CategoriasApi] Error fetching categories:', error);
      throw error;
    }
  },

  async getProductsByCategory(categorySlug) {
    try {
      const response = await window.Api.get('/products', { category: categorySlug });
      return response.data || response || [];
    } catch (error) {
      console.error(`[CategoriasApi] Error fetching products for ${categorySlug}:`, error);
      throw error;
    }
  }
};

if (typeof window !== 'undefined') {
  window.CategoriasApi = CategoriasApi;
}
