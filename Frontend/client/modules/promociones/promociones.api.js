/**
 * promociones.api.js - Service gateway connecting the promotions module with api.js
 */

const PromocionesApi = {
  /**
   * Fetches active promotional campaigns and combos
   */
  async getPromociones() {
    try {
      const response = await window.Api.get('/promociones');
      return response.data || response || [];
    } catch (error) {
      console.error('[PromocionesApi] Error fetching promotions:', error);
      throw error;
    }
  },

  /**
   * Fetches single promotion details
   */
  async getPromocionById(id) {
    try {
      const response = await window.Api.get(`/promociones/${id}`);
      return response.data || response;
    } catch (error) {
      console.error(`[PromocionesApi] Error fetching promotion ${id}:`, error);
      throw error;
    }
  }
};

if (typeof window !== 'undefined') {
  window.PromocionesApi = PromocionesApi;
}
