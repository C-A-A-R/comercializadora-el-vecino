/**
 * promociones.api.js - Service gateway connecting the promotions module with api.js
 */

const PromocionesApi = {
  /**
   * Fetches active promotional campaigns and combos
   */
  async getPromociones() {
    try {
      const response = await window.Api.get('/promotions/combos/');
      const rawPromos = window.Api.extractResults(response);
      return rawPromos.map(p => window.Api.normalizePromotion(p));
    } catch (error) {
      console.warn('[PromocionesApi] Error fetching promotions from backend, using fallback:', error);
      if (window.CONFIG?.MOCK_PROMOTIONS) {
        return window.CONFIG.MOCK_PROMOTIONS.map(p => window.Api.normalizePromotion(p));
      }
      return [];
    }
  },

  /**
   * Fetches single promotion details
   */
  async getPromocionById(id) {
    try {
      const response = await window.Api.get(`/promotions/combos/${id}/`);
      const rawData = response.data || response;
      return window.Api.normalizePromotion(rawData);
    } catch (error) {
      console.warn(`[PromocionesApi] Error fetching promotion ${id}, trying fallback:`, error);
      if (window.CONFIG?.MOCK_PROMOTIONS) {
        const found = window.CONFIG.MOCK_PROMOTIONS.find(p => String(p.id) === String(id));
        if (found) return window.Api.normalizePromotion(found);
      }
      throw error;
    }
  }
};

if (typeof window !== 'undefined') {
  window.PromocionesApi = PromocionesApi;
}
