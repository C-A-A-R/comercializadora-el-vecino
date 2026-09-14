/**
 * tiktok.api.js - Service gateway connecting the TikTok showcase module with api.js
 */

const TiktokApi = {
  async getReels() {
    try {
      const response = await window.Api.get('/tiktok/reels');
      return response.data || response || window.CONFIG?.TIKTOK_REELS || [];
    } catch (error) {
      console.warn('[TiktokApi] Fallback a reels de configuración:', error);
      return window.CONFIG?.TIKTOK_REELS || [];
    }
  }
};

if (typeof window !== 'undefined') {
  window.TiktokApi = TiktokApi;
}
