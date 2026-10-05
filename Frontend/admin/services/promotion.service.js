import { api } from '../../js/api.js';
import { CONFIG } from '../../js/config.js';
import { PROMOTIONS_MOCK } from './mocks/promotions.mock.js';

function normalizePromotion(p) {
  if (!p) return null;
  const firstProd = p.promotion_products?.[0];

  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    discount_type: p.discounted_type || 'percentage',
    discounted_type: p.discounted_type || 'percentage',
    value: Number(p.discounted_value) || 0,
    discounted_value: Number(p.discounted_value) || 0,
    start_date: p.start_date,
    end_date: p.end_date,
    is_active: Boolean(p.is_active),
    image: p.image || null,
    product: firstProd ? {
      id: firstProd.product,
      name: firstProd.product_name || 'Producto en promoción',
      original_price: Number(firstProd.original_price) || 0,
      promotional_price: Number(firstProd.promotional_price) || 0
    } : (p.product || null)
  };
}

export const PromotionService = {
  async list(filters = {}) {
    if (CONFIG.USE_MOCKS) {
      return this._filterMock(PROMOTIONS_MOCK, filters);
    }
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.discount_type) queryParams.set('discounted_type', filters.discount_type);

      const queryString = queryParams.toString();
      const endpoint = queryString 
        ? `/promotions/discounted-promotions/?${queryString}` 
        : '/promotions/discounted-promotions/';

      const response = await api.get(endpoint);
      const rawList = response?.results || (Array.isArray(response) ? response : []);
      let results = rawList.map(normalizePromotion);

      if (filters.status) {
        const now = new Date();
        results = results.filter(p => {
          const start = new Date(p.start_date);
          const end = new Date(p.end_date);
          if (filters.status === 'active') return p.is_active && now >= start && now <= end;
          if (filters.status === 'pending') return p.is_active && now < start;
          if (filters.status === 'expired') return !p.is_active || now > end;
          return true;
        });
      }

      return {
        count: response?.total_items || results.length,
        results
      };
    } catch (err) {
      console.warn('[PromotionService] Backend no disponible, usando mocks fallback:', err);
      return this._filterMock(PROMOTIONS_MOCK, filters);
    }
  },

  async getById(id) {
    if (CONFIG.USE_MOCKS) {
      const item = PROMOTIONS_MOCK.find(p => p.id === Number(id));
      if (!item) throw new Error('Promoción no encontrada');
      return normalizePromotion(item);
    }
    const data = await api.get(`/promotions/discounted-promotions/${id}/`);
    return normalizePromotion(data);
  },

  async create(data) {
    if (CONFIG.USE_MOCKS) {
      const newPromo = { id: Date.now(), ...data };
      PROMOTIONS_MOCK.unshift(newPromo);
      return newPromo;
    }

    const payload = {
      name: data.name,
      description: data.description || '',
      discounted_type: data.discount_type || data.discounted_type || 'percentage',
      discounted_value: data.value !== undefined ? data.value : data.discounted_value,
      start_date: data.start_date,
      end_date: data.end_date
    };

    if (data.product?.id || data.product_id) {
      payload.product_id = data.product?.id || data.product_id;
    }

    const response = await api.post('/promotions/discounted-promotions/', payload);
    return normalizePromotion(response);
  },

  async toggleActive(id, isActive) {
    if (CONFIG.USE_MOCKS) {
      const item = PROMOTIONS_MOCK.find(p => p.id === Number(id));
      if (item) item.is_active = isActive;
      return item;
    }

    if (!isActive) {
      // Soft-delete en backend para desactivar
      return await api.delete(`/promotions/discounted-promotions/${id}/`);
    } else {
      // Amplía fecha de fin para activar
      const futureDate = new Date(Date.now() + 30 * 86400000).toISOString();
      return await api.patch(`/promotions/discounted-promotions/${id}/`, { end_date: futureDate });
    }
  },

  async delete(id) {
    if (CONFIG.USE_MOCKS) {
      const idx = PROMOTIONS_MOCK.findIndex(p => p.id === Number(id));
      if (idx !== -1) PROMOTIONS_MOCK.splice(idx, 1);
      return { success: true };
    }
    return await api.delete(`/promotions/discounted-promotions/${id}/`);
  },

  _filterMock(data, filters) {
    let result = [...data];
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(term) || p.product?.name?.toLowerCase().includes(term));
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
    return { count: result.length, results: result.map(normalizePromotion) };
  }
};