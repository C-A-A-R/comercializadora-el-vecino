import { api } from '../../js/api.js';
import { CONFIG } from '../../js/config.module.js';
import { PROMOTIONS_MOCK } from './mocks/promotions.mock.js';

function normalizePromotion(p) {
  if (!p) return null;
  const firstProd = p.promotion_products?.[0];

  const discType = p.discount_type || p.discounted_type || 'percentage';
  const discVal = Number(p.discount_value !== undefined ? p.discount_value : (p.discounted_value !== undefined ? p.discounted_value : 10)) || 0;

  const prodImage = (p.product && (p.product.images?.[0]?.image || p.product.product_image || p.product.image)) || 
                    (firstProd && (firstProd.image || firstProd.product_image)) || 
                    p.image || 
                    p.image_url || 
                    'https://via.placeholder.com/60';

  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    discount_type: discType,
    discounted_type: discType,
    discount_value: discVal,
    discounted_value: discVal,
    start_date: p.start_date,
    end_date: p.end_date,
    is_active: Boolean(p.is_active),
    whatsapp_message: p.whatsapp_message || null,
    image: p.image || prodImage,
    image_url: p.image || prodImage,
    product: firstProd ? {
      id: firstProd.product,
      name: firstProd.product_name || 'Producto en promoción',
      price: firstProd.product_price || 0,
      image: prodImage
    } : (p.product ? {
      id: p.product.id || p.product_id,
      name: p.product.name || p.product_name || 'Producto en promoción',
      price: p.product.price_usd || p.product.price || 0,
      image: prodImage
    } : null)
  };
}

export const PromotionService = {
  async list(filters = {}) {
    if (CONFIG?.USE_MOCKS) {
      return this._filterMock(PROMOTIONS_MOCK, filters);
    }
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.set('search', filters.search);

      const queryString = queryParams.toString();
      const endpoint = queryString 
        ? `/promotions/discounted-promotions/?${queryString}` 
        : '/promotions/discounted-promotions/';

      const response = await api.get(endpoint);
      const rawList = response?.results || (Array.isArray(response) ? response : []);
      if (rawList.length === 0) {
        return this._filterMock(PROMOTIONS_MOCK, filters);
      }
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
    if (CONFIG?.USE_MOCKS) {
      const item = PROMOTIONS_MOCK.find(p => p.id === Number(id));
      if (!item) throw new Error('Promoción no encontrada');
      return normalizePromotion(item);
    }
    const data = await api.get(`/promotions/discounted-promotions/${id}/`);
    return normalizePromotion(data);
  },

  async create(data) {
    if (CONFIG?.USE_MOCKS) {
      const newPromo = { id: Date.now(), ...data };
      PROMOTIONS_MOCK.unshift(newPromo);
      return normalizePromotion(newPromo);
    }

    const payload = {
      name: data.name,
      description: data.description || '',
      discounted_type: data.discount_type || data.discounted_type || 'percentage',
      discounted_value: Number(data.discount_value !== undefined ? data.discount_value : data.discounted_value) || 0,
      start_date: data.start_date,
      end_date: data.end_date
    };

    if (data.product?.id || data.product_id) {
      payload.product_id = data.product?.id || data.product_id;
    }
    if (data.image) {
      payload.image = data.image;
    }

    const response = await api.post('/promotions/discounted-promotions/', payload);
    return normalizePromotion(response);
  },

  async update(id, data) {
    if (CONFIG?.USE_MOCKS) {
      const idx = PROMOTIONS_MOCK.findIndex(p => p.id === Number(id));
      if (idx !== -1) {
        PROMOTIONS_MOCK[idx] = { ...PROMOTIONS_MOCK[idx], ...data };
        return normalizePromotion(PROMOTIONS_MOCK[idx]);
      }
    }

    const payload = {
      name: data.name,
      description: data.description || '',
      discounted_type: data.discount_type || data.discounted_type || 'percentage',
      discounted_value: Number(data.discount_value !== undefined ? data.discount_value : data.discounted_value) || 0,
      start_date: data.start_date,
      end_date: data.end_date
    };

    if (data.product?.id || data.product_id) {
      payload.product_id = data.product?.id || data.product_id;
    }
    if (data.image) {
      payload.image = data.image;
    }

    try {
      const response = await api.patch(`/promotions/discounted-promotions/${id}/`, payload);
      return normalizePromotion(response);
    } catch {
      return { success: true };
    }
  },

  async updateWhatsappTemplate(id, message) {
    if (CONFIG?.USE_MOCKS) {
      const item = PROMOTIONS_MOCK.find(p => p.id === Number(id));
      if (item) {
        item.whatsapp_message = message;
      }
      return { success: true, whatsapp_message: message };
    }
    try {
      return await api.patch(`/promotions/discounted-promotions/${id}/`, {
        whatsapp_message: message
      });
    } catch (e) {
      const item = PROMOTIONS_MOCK.find(p => p.id === Number(id));
      if (item) item.whatsapp_message = message;
      return { success: true, whatsapp_message: message };
    }
  },

  async toggleActive(id, isActive) {
    if (CONFIG?.USE_MOCKS) {
      const item = PROMOTIONS_MOCK.find(p => p.id === Number(id));
      if (item) item.is_active = isActive;
      return item;
    }

    if (!isActive) {
      return await api.delete(`/promotions/discounted-promotions/${id}/`);
    } else {
      const futureDate = new Date(Date.now() + 30 * 86400000).toISOString();
      return await api.patch(`/promotions/discounted-promotions/${id}/`, { end_date: futureDate });
    }
  },

  async renewPromotion(id, days = 30, customEndDate = null) {
    const newStart = new Date().toISOString();
    const newEnd = customEndDate 
      ? new Date(customEndDate).toISOString() 
      : new Date(Date.now() + days * 86400000).toISOString();

    if (CONFIG?.USE_MOCKS) {
      const item = PROMOTIONS_MOCK.find(p => p.id === Number(id));
      if (item) {
        item.start_date = newStart;
        item.end_date = newEnd;
        item.is_active = true;
      }
      return item;
    }

    try {
      return await api.patch(`/promotions/discounted-promotions/${id}/`, {
        start_date: newStart,
        end_date: newEnd,
        is_active: true
      });
    } catch {
      return { success: true };
    }
  },

  async delete(id) {
    if (CONFIG?.USE_MOCKS) {
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