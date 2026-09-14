import { api } from '../../js/api.js';
import { CONFIG } from '../../js/config.js';
import { COMBOS_MOCK } from './mocks/combos.mock.js';

function normalizeCombo(c) {
  if (!c) return null;
  const priceCop = Number(c.price || c.price_combo_cop) || 0;
  const priceUsd = c.price_combo_usd !== undefined 
    ? Number(c.price_combo_usd) 
    : (priceCop ? Number((priceCop / 4200).toFixed(2)) : 0);

  const rawProducts = c.combo_products || c.items || [];
  const items = rawProducts.map(item => {
    const prod = item.product && typeof item.product === 'object' ? item.product : null;
    const prodId = prod ? prod.id : item.product;
    const prodName = prod ? (prod.name || prod.product_name) : (item.product_name || 'Producto');
    const prodPriceCop = Number(prod ? prod.price : item.product_price) || 0;
    const prodPriceUsd = prodPriceCop ? Number((prodPriceCop / 4200).toFixed(2)) : 0;

    return {
      product: {
        id: prodId,
        name: prodName,
        price_cop: prodPriceCop,
        price_usd: prodPriceUsd
      },
      quantity: Number(item.quantity) || 1
    };
  });

  return {
    id: c.id,
    name: c.name,
    description: c.description || '',
    price: priceCop,
    price_combo_cop: priceCop,
    price_combo_usd: priceUsd,
    start_date: c.start_date,
    end_date: c.end_date,
    is_active: Boolean(c.is_active),
    image: c.image || c.image_url || null,
    image_url: c.image || c.image_url || '',
    items,
    original_total_price: Number(c.original_total_price) || 0,
    savings: Number(c.savings) || 0,
    savings_percentage: Number(c.savings_percentage) || 0
  };
}

export const ComboService = {
  async list(filters = {}) {
    if (CONFIG.USE_MOCKS) {
      return this._filterMock(COMBOS_MOCK, filters);
    }
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.set('search', filters.search);

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/promotions/combos/?${queryString}` : '/promotions/combos/';

      const response = await api.get(endpoint);
      const rawList = response?.results || (Array.isArray(response) ? response : []);
      const results = rawList.map(normalizeCombo);

      return {
        count: response?.total_items || results.length,
        results
      };
    } catch (err) {
      console.warn('[ComboService] Backend no disponible, usando mocks fallback', err);
      return this._filterMock(COMBOS_MOCK, filters);
    }
  },

  async getById(id) {
    if (CONFIG.USE_MOCKS) {
      const combo = COMBOS_MOCK.find(c => c.id === Number(id));
      if (!combo) throw new Error('Combo no encontrado');
      return normalizeCombo(combo);
    }
    const data = await api.get(`/promotions/combos/${id}/`);
    return normalizeCombo(data);
  },

  async create(data) {
    if (CONFIG.USE_MOCKS) {
      const newCombo = { id: Date.now(), ...data };
      COMBOS_MOCK.unshift(newCombo);
      return normalizeCombo(newCombo);
    }

    const price = data.price !== undefined 
      ? Number(data.price) 
      : (data.price_combo_usd ? Number(data.price_combo_usd) * 4200 : 0);

    const payload = {
      name: data.name,
      description: data.description || '',
      price,
      start_date: data.start_date || new Date().toISOString(),
      end_date: data.end_date || null,
      items: data.items || []
    };

    const response = await api.post('/promotions/combos/', payload);
    return normalizeCombo(response);
  },

  async toggleActive(id, isActive) {
    if (CONFIG.USE_MOCKS) {
      const item = COMBOS_MOCK.find(c => c.id === Number(id));
      if (item) item.is_active = isActive;
      return item;
    }

    if (!isActive) {
      return await api.delete(`/promotions/combos/${id}/`);
    } else {
      const futureDate = new Date(Date.now() + 30 * 86400000).toISOString();
      return await api.patch(`/promotions/combos/${id}/`, { end_date: futureDate });
    }
  },

  async delete(id) {
    if (CONFIG.USE_MOCKS) {
      const idx = COMBOS_MOCK.findIndex(c => c.id === Number(id));
      if (idx !== -1) COMBOS_MOCK.splice(idx, 1);
      return { success: true };
    }
    return await api.delete(`/promotions/combos/${id}/`);
  },

  _filterMock(data, filters) {
    let result = [...data];
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(term));
    }
    return { count: result.length, results: result.map(normalizeCombo) };
  }
};