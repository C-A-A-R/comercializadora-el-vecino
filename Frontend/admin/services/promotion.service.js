import { api } from '../../js/api.js';
import { CONFIG } from '../../js/config.js';
import { PROMOTIONS_MOCK } from './mocks/promotions.mock.js';

export const PromotionService = {
  async list(filters = {}) {
    if (CONFIG.USE_MOCKS) {
      return this._filterMock(PROMOTIONS_MOCK, filters);
    }
    try {
      const query = new URLSearchParams(filters).toString();
      return await api.get(`/promotions/discounted-promotions/?${query}`);
    } catch (err) {
      console.warn('[PromotionService] Backend no disponible, usando mocks', err);
      return this._filterMock(PROMOTIONS_MOCK, filters);
    }
  },

  async getById(id) {
    if (CONFIG.USE_MOCKS) {
      const item = PROMOTIONS_MOCK.find(p => p.id === Number(id));
      if (!item) throw new Error('Promoción no encontrada');
      return item;
    }
    return await api.get(`/promotions/discounted-promotions/${id}/`);
  },

  async create(data) {
    if (CONFIG.USE_MOCKS) {
      const newPromo = { id: Date.now(), ...data };
      PROMOTIONS_MOCK.unshift(newPromo);
      return newPromo;
    }
    return await api.post('/promotions/discounted-promotions/', data);
  },

  async toggleActive(id, isActive) {
    if (CONFIG.USE_MOCKS) {
      const item = PROMOTIONS_MOCK.find(p => p.id === Number(id));
      if (item) item.is_active = isActive;
      return item;
    }
    return await api.patch(`/promotions/discounted-promotions/${id}/`, { is_active: isActive });
  },

  _filterMock(data, filters) {
    let result = [...data];
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(term) || p.product.name.toLowerCase().includes(term));
    }
    if (filters.status) {
      const now = new Date();
      result = result.filter(p => {
        const start = new Date(p.start_date);
        const end = new Date(p.end_date);
        if (filters.status === 'active') return p.is_active && now >= start && now <= end;
        if (filters.status === 'pending') return p.is_active && now < start;
        if (filters.status === 'expired') return !p.is_active || now > end;
        return true;
      });
    }
    return { count: result.length, results: result };
  }
};