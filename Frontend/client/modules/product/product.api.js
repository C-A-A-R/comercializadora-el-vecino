/**
 * product.api.js - Service gateway connecting the product module screens with api.js
 */

const ProductApi = {
  /**
   * Fetches products with optional category, search, and ordering filters
   */
  async getProducts(filters = {}) {
    let prods = [];
    try {
      if (window.Api && window.CONFIG?.API_BASE_URL) {
        const params = {};
        if (filters.category && filters.category !== 'all') {
          params.category = filters.category;
        }
        if (filters.search) {
          params.search = filters.search;
        }
        if (filters.featuredOnly || filters.is_feature_product) {
          params.is_feature_product = true;
        }
        if (filters.ordering) {
          params.ordering = filters.ordering;
        }

        const response = await window.Api.get('/products', params);
        const raw = window.Api?.extractResults ? window.Api.extractResults(response) : (response?.results || response?.data || response || []);
        if (Array.isArray(raw) && raw.length > 0) {
          prods = raw;
        }
      }
    } catch (error) {
      console.warn('[ProductApi] API offline o inaccesible:', error);
    }

    if (!prods || prods.length === 0) {
      prods = window.CONFIG?.INITIAL_PRODUCTS || window.PRODUCTS_DATA || [];
    }

    return prods.map(p => window.Api?.normalizeProduct ? window.Api.normalizeProduct(p) : p);
  },

  /**
   * Fetches single product technical specifications by ID
   */
  async getProductById(id) {
    try {
      if (window.Api && window.CONFIG?.API_BASE_URL) {
        const response = await window.Api.get(`/products/${id}`);
        const raw = response?.data || response;
        if (raw && (raw.id || raw.product_name || raw.name)) {
          return window.Api?.normalizeProduct ? window.Api.normalizeProduct(raw) : raw;
        }
      }
    } catch (error) {
      console.warn(`[ProductApi] Fallback de producto ${id}:`, error);
    }
    const all = window.CONFIG?.INITIAL_PRODUCTS || window.PRODUCTS_DATA || [];
    const found = all.find(p => String(p.id) === String(id));
    return found ? (window.Api?.normalizeProduct ? window.Api.normalizeProduct(found) : found) : null;
  },

  /**
   * Fetches product categories list
   */
  async getCategories() {
    let cats = [];
    try {
      if (window.Api && window.CONFIG?.API_BASE_URL) {
        const response = await window.Api.get('/categories');
        const raw = window.Api?.extractResults ? window.Api.extractResults(response) : (response?.results || response?.data || response || []);
        if (Array.isArray(raw) && raw.length > 0) {
          cats = raw;
        }
      }
    } catch (error) {
      console.warn('[ProductApi] Categorías API offline:', error);
    }

    if (!cats || cats.length === 0) {
      cats = window.CONFIG?.CATEGORIES || window.CATEGORIES_DATA || [];
    }

    return cats.map(c => window.Api?.normalizeCategory ? window.Api.normalizeCategory(c) : c);
  },

  /**
   * Fetches top-rated / featured products
   */
  async getFeatured() {
    try {
      let response = null;
      try {
        response = await window.Api.get('/products/featured');
      } catch (e) {
        response = await window.Api.get('/products', { is_feature_product: true });
      }
      const raw = window.Api?.extractResults ? window.Api.extractResults(response) : (response.results || response.data || response || []);
      return (Array.isArray(raw) ? raw : []).map(p => window.Api?.normalizeProduct ? window.Api.normalizeProduct(p) : p);
    } catch (error) {
      console.error('[ProductApi] Error fetching featured products:', error);
      const fallback = window.CONFIG?.INITIAL_PRODUCTS || [];
      return fallback.filter(p => p.featured || p.is_feature_product).map(p => window.Api?.normalizeProduct ? window.Api.normalizeProduct(p) : p);
    }
  },

  /**
   * Registra una vista atómica del producto en el backend
   */
  async registerView(id) {
    try {
      return await window.Api.post(`/products/${id}/view`, {});
    } catch (e) {
      console.warn(`[ProductApi] No se pudo registrar vista atómica para ${id}:`, e);
      return null;
    }
  },

  /**
   * Obtiene reseñas clasificadas del backend para el producto
   */
  async getReviews(id) {
    try {
      const response = await window.Api.get(`/products/${id}/reviews`);
      const raw = window.Api?.extractResults ? window.Api.extractResults(response) : (response.results || response.data || response || []);
      return Array.isArray(raw) ? raw : [];
    } catch (e) {
      console.warn(`[ProductApi] No se pudieron obtener reseñas de API para ${id}:`, e);
      return [];
    }
  },

  /**
   * Envía una nueva reseña al backend para análisis de sentimiento automático
   */
  async createReview(id, comment) {
    try {
      return await window.Api.post(`/products/${id}/reviews`, { comment });
    } catch (e) {
      console.error(`[ProductApi] Error enviando reseña para ${id}:`, e);
      throw e;
    }
  }
};

if (typeof window !== 'undefined') {
  window.ProductApi = ProductApi;
}
