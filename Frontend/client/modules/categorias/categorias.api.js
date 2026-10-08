/**
 * categorias.api.js - Service gateway connecting the categories module with api.js
 */

const CategoriasApi = {
  async getCategories() {
    try {
      const response = await window.Api.get('/categories');
      const raw = window.Api?.extractResults ? window.Api.extractResults(response) : (response.results || response.data || response || []);
      return raw.map(c => window.Api?.normalizeCategory ? window.Api.normalizeCategory(c) : c);
    } catch (error) {
      console.error('[CategoriasApi] Error fetching categories:', error);
      const fallback = window.CONFIG?.CATEGORIES || [];
      return fallback.map(c => window.Api?.normalizeCategory ? window.Api.normalizeCategory(c) : c);
    }
  },

  async getProductsByCategory(categoryId) {
    try {
      const response = await window.Api.get('/products', { category: categoryId });
      const raw = window.Api?.extractResults ? window.Api.extractResults(response) : (response.results || response.data || response || []);
      return raw.map(p => window.Api?.normalizeProduct ? window.Api.normalizeProduct(p) : p);
    } catch (error) {
      console.error(`[CategoriasApi] Error fetching products for ${categoryId}:`, error);
      throw error;
    }
  }
};

if (typeof window !== 'undefined') {
  window.CategoriasApi = CategoriasApi;
}
