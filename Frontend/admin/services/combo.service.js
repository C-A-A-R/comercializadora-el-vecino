import { api } from '../../js/api.js';
import { CONFIG } from '../../js/config.js';
import { COMBOS_MOCK } from './mocks/combos.mock.js';

export const ComboService = {
  async list(filters = {}) {
    if (CONFIG.USE_MOCKS) {
      return this._filterMock(COMBOS_MOCK, filters);
    }
    try {
      const query = new URLSearchParams(filters).toString();
      return await api.get(`/promotions/combos/?${query}`);
    } catch (err) {
      console.warn('[ComboService] Backend no disponible, usando mocks', err);
      return this._filterMock(COMBOS_MOCK, filters);
    }
  },

  async getById(id) {
    if (CONFIG.USE_MOCKS) {
      const combo = COMBOS_MOCK.find(c => c.id === Number(id));
      if (!combo) throw new Error('Combo no encontrado');
      return combo;
    }
    return await api.get(`/promotions/combos/${id}/`);
  },

  async create(data) {
    if (CONFIG.USE_MOCKS) {
      const newCombo = { id: Date.now(), ...data };
      COMBOS_MOCK.unshift(newCombo);
      return newCombo;
    }
    return await api.post('/promotions/combos/', data);
  },

  async toggleActive(id, isActive) {
    if (CONFIG.USE_MOCKS) {
      const item = COMBOS_MOCK.find(c => c.id === Number(id));
      if (item) item.is_active = isActive;
      return item;
    }
    return await api.patch(`/promotions/combos/${id}/`, { is_active: isActive });
  },

  _filterMock(data, filters) {
    let result = [...data];
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(term));
    }
    return { count: result.length, results: result };
  }
};