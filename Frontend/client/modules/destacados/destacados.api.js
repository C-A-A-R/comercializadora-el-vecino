/**
 * destacados.api.js - Service gateway connecting the featured products module with api.js
 */

const DestacadosApi = {
  async getFeaturedProducts() {
    try {
      let response = null;
      try {
        response = await window.Api.get('/products/featured');
      } catch (e) {
        // Fallback al endpoint de filtrado estándar
        response = await window.Api.get('/products', { is_feature_product: true });
      }

      const raw = window.Api?.extractResults ? window.Api.extractResults(response) : (response.results || response.data || response || []);
      const products = (Array.isArray(raw) ? raw : []).map(p => window.Api?.normalizeProduct ? window.Api.normalizeProduct(p) : p);
      return products;
    } catch (error) {
      console.error('[DestacadosApi] Error fetching featured products:', error);
      const fallback = window.CONFIG?.INITIAL_PRODUCTS || [];
      return fallback.filter(p => p.featured || p.is_feature_product).map(p => window.Api?.normalizeProduct ? window.Api.normalizeProduct(p) : p);
    }
  }
};

if (typeof window !== 'undefined') {
  window.DestacadosApi = DestacadosApi;
}
