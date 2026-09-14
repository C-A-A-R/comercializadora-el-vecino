import { api } from '../../js/api.js';
import { CONFIG } from '../../js/config.js';
import { PRODUCTS_MOCK } from './mocks/products.mock.js';

function normalizeProduct(p) {
  if (!p) return null;
  const priceNum = Number(p.price) || 0;
  const priceUsd = p.price_usd ? Number(p.price_usd) : (priceNum ? Number((priceNum / 4200).toFixed(2)) : 0);
  const primaryCategory = (p.categories_detail && p.categories_detail.length > 0)
    ? { id: p.categories_detail[0].id, name: p.categories_detail[0].category_name }
    : (p.category_detail ? { id: p.category_detail.id, name: p.category_detail.category_name } : (p.category || { id: null, name: 'General' }));

  const mainImage = p.product_image 
    || (p.images && p.images[0]?.image)
    || (p.color_images && p.color_images[0]?.color_image)
    || (p.angle_images && p.angle_images[0]?.image)
    || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=400';

  return {
    id: p.id,
    name: p.product_name || p.name || 'Sin nombre',
    product_name: p.product_name || p.name || 'Sin nombre',
    brand: p.brand || 'El Vecino',
    model: p.model || p.capacity || 'Estándar',
    capacity: p.capacity || '',
    voltage: p.voltage || '110V',
    price: priceNum,
    price_cop: priceNum,
    price_usd: priceUsd,
    stock: p.stock !== undefined ? p.stock : 10,
    is_featured: Boolean(p.is_feature_product ?? p.is_featured),
    is_feature_product: Boolean(p.is_feature_product ?? p.is_featured),
    is_active: p.is_deleted !== undefined ? !p.is_deleted : (p.is_active !== undefined ? p.is_active : true),
    category: primaryCategory,
    category_id: (p.categories && p.categories[0]) || primaryCategory?.id || '',
    description: p.description || '',
    product_image: mainImage,
    images: [{ image: mainImage }],
    total_views: p.total_views || 0,
    ranking_score: p.ranking_score || 0
  };
}

export const ProductService = {
  async list(filters = {}) {
    if (CONFIG?.USE_MOCKS) {
      let filtered = [...PRODUCTS_MOCK];
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
      }
      if (filters.category) {
        filtered = filtered.filter(p => p.category.id === parseInt(filters.category, 10));
      }
      if (filters.is_active !== undefined) {
        filtered = filtered.filter(p => p.is_active === (filters.is_active === 'true'));
      }
      return { count: filtered.length, results: filtered.map(normalizeProduct) };
    }

    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.category) queryParams.set('category', filters.category);
      if (filters.is_featured !== undefined) queryParams.set('is_feature_product', filters.is_featured);

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/products/?${queryString}` : '/products/';
      const response = await api.get(endpoint);

      const rawList = response?.results || (Array.isArray(response) ? response : []);
      const results = rawList.map(normalizeProduct);

      return {
        count: response?.total_items || results.length,
        results
      };
    } catch (error) {
      console.warn('[ProductService] Error al conectar con el backend, usando fallback:', error);
      return { count: PRODUCTS_MOCK.length, results: PRODUCTS_MOCK.map(normalizeProduct) };
    }
  },

  async getById(id) {
    if (CONFIG?.USE_MOCKS) {
      const prod = PRODUCTS_MOCK.find(p => p.id === parseInt(id, 10) || p.id === id);
      return prod ? normalizeProduct(prod) : null;
    }

    try {
      const data = await api.get(`/products/${id}/`);
      return normalizeProduct(data);
    } catch (error) {
      console.error(`[ProductService] Error al obtener producto ${id}:`, error);
      return null;
    }
  },

  async save(data) {
    if (CONFIG?.USE_MOCKS) {
      if (data.id) {
        const idx = PRODUCTS_MOCK.findIndex(p => p.id === parseInt(data.id, 10));
        if (idx !== -1) PRODUCTS_MOCK[idx] = { ...PRODUCTS_MOCK[idx], ...data };
      } else {
        const newProduct = {
          id: Date.now(),
          ...data
        };
        PRODUCTS_MOCK.push(newProduct);
      }
      return { success: true };
    }

    const payload = {
      product_name: data.name || data.product_name,
      brand: data.brand || '',
      capacity: data.capacity || data.model || '',
      voltage: data.voltage || '110V',
      price: data.price !== undefined 
        ? Number(data.price) 
        : (data.price_usd ? Number(data.price_usd) * 4200 : 0),
      description: data.description || '',
      is_feature_product: Boolean(data.is_featured ?? data.is_feature_product)
    };

    if (data.category_id) {
      payload.categories = [parseInt(data.category_id, 10)];
    } else if (Array.isArray(data.categories)) {
      payload.categories = data.categories;
    }

    if (data.id) {
      return await api.patch(`/products/${data.id}/`, payload);
    } else {
      return await api.post('/products/', payload);
    }
  },

  async toggleFeatured(id, currentStatus) {
    if (CONFIG?.USE_MOCKS) {
      const prod = PRODUCTS_MOCK.find(p => p.id === id);
      if (prod) prod.is_featured = !currentStatus;
      return { success: true, is_featured: !currentStatus };
    }

    return await api.patch(`/products/${id}/`, {
      is_feature_product: !currentStatus
    });
  },

  async deactivate(id) {
    if (CONFIG?.USE_MOCKS) {
      const prod = PRODUCTS_MOCK.find(p => p.id === id);
      if (prod) prod.is_active = false;
      return { success: true };
    }

    // En Django BaseViewSet, DELETE aplica el borrado lógico seguro
    return await api.delete(`/products/${id}/`);
  }
};