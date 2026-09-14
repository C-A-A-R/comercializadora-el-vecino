/**
 * destacados.api.js - Service gateway connecting the featured products module with api.js
 */

const DestacadosApi = {
  async getFeaturedProducts() {
    try {
      const response = await window.Api.get('/products', { featuredOnly: true });
      return response.data || response || [];
    } catch (error) {
      console.error('[DestacadosApi] Error fetching featured products:', error);
      throw error;
    }
  }
};

if (typeof window !== 'undefined') {
  window.DestacadosApi = DestacadosApi;
}
