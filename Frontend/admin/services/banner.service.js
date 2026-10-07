import { api } from '../../js/api.js';
import { CONFIG } from '../../js/config.js';
import { BANNERS_MOCK } from './mocks/banners.mock.js';

let localBanners = [...BANNERS_MOCK];

export const BannerService = {
  async list() {
    if (CONFIG.USE_MOCKS) {
      return { results: [...localBanners] };
    }
    try {
      return await api.get('/banners/');
    } catch (e) {
      console.warn('[BannerService] API no disponible, usando mocks:', e);
      return { results: [...localBanners] };
    }
  },

  async create(bannerData) {
    if (CONFIG.USE_MOCKS) {
      const newBanner = {
        id: Date.now(),
        ...bannerData,
        order: localBanners.length + 1,
        created_at: new Date().toISOString()
      };
      localBanners.unshift(newBanner);
      return newBanner;
    }
    try {
      return await api.post('/banners/', bannerData);
    } catch (e) {
      console.warn('[BannerService] API falló, persistiendo localmente:', e);
      const newBanner = {
        id: Date.now(),
        ...bannerData,
        order: localBanners.length + 1,
        created_at: new Date().toISOString()
      };
      localBanners.unshift(newBanner);
      return newBanner;
    }
  },

  async update(id, bannerData) {
    if (CONFIG.USE_MOCKS) {
      const idx = localBanners.findIndex(b => b.id == id);
      if (idx !== -1) {
        localBanners[idx] = { ...localBanners[idx], ...bannerData };
        return localBanners[idx];
      }
      return null;
    }
    try {
      return await api.put(`/banners/${id}/`, bannerData);
    } catch (e) {
      const idx = localBanners.findIndex(b => b.id == id);
      if (idx !== -1) {
        localBanners[idx] = { ...localBanners[idx], ...bannerData };
        return localBanners[idx];
      }
      return null;
    }
  },

  async toggleActive(id, isActive) {
    return this.update(id, { is_active: isActive });
  },

  async delete(id) {
    if (CONFIG.USE_MOCKS) {
      localBanners = localBanners.filter(b => b.id != id);
      return { success: true };
    }
    try {
      return await api.delete(`/banners/${id}/`);
    } catch (e) {
      localBanners = localBanners.filter(b => b.id != id);
      return { success: true };
    }
  }
};
