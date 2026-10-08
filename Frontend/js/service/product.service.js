/**
 * product.service.js - Business service for product inventory and catalog operations
 */

const ProductService = {
  async getAll(filters = {}) {
    try {
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
      const rawProducts = window.Api?.extractResults ? window.Api.extractResults(response) : (response.results || response.data || response || []);
      const products = rawProducts.map(p => window.Api?.normalizeProduct ? window.Api.normalizeProduct(p) : p);
      return products;
    } catch (err) {
      console.warn('[ProductService] Fallback a caché local:', err);
      const cached = window.Storage?.getProducts() || [];
      return cached.map(p => window.Api?.normalizeProduct ? window.Api.normalizeProduct(p) : p);
    }
  },

  async getById(id) {
    try {
      const response = await window.Api.get(`/products/${id}`);
      const raw = response.data || response;
      if (raw && (raw.id || raw.product_name || raw.name)) {
        return window.Api?.normalizeProduct ? window.Api.normalizeProduct(raw) : raw;
      }
    } catch (err) {
      console.warn(`[ProductService] Buscando ${id} en caché local.`);
    }
    const local = window.Storage?.getProducts() || [];
    const found = local.find(p => String(p.id) === String(id)) || null;
    return found ? (window.Api?.normalizeProduct ? window.Api.normalizeProduct(found) : found) : null;
  },

  async getFeatured() {
    try {
      const response = await window.Api.get('/products/featured');
      const raw = window.Api?.extractResults ? window.Api.extractResults(response) : (response.results || response.data || response || []);
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map(p => window.Api?.normalizeProduct ? window.Api.normalizeProduct(p) : p);
      }
    } catch (e) {
      console.warn('[ProductService] Fallback al listado con filtro is_feature_product:', e);
    }
    return this.getAll({ featuredOnly: true });
  },

  async getCategories() {
    try {
      const response = await window.Api.get('/categories');
      const raw = window.Api?.extractResults ? window.Api.extractResults(response) : (response.results || response.data || response || []);
      return raw.map(c => window.Api?.normalizeCategory ? window.Api.normalizeCategory(c) : c);
    } catch (err) {
      const fallbackCats = window.CONFIG?.CATEGORIES || [];
      return fallbackCats.map(c => window.Api?.normalizeCategory ? window.Api.normalizeCategory(c) : c);
    }
  },

  async create(productData) {
    const response = await window.Api.post('/products', productData);
    // Sincronizar en caché local
    const local = window.Storage.getProducts();
    const created = response.data || { id: 'prod-' + Date.now(), ...productData };
    local.unshift(created);
    window.Storage.saveProducts(local);
    window.dispatchEvent(new CustomEvent('catalog:changed', { detail: { action: 'create', product: created } }));
    return created;
  },

  async update(id, productData) {
    const response = await window.Api.put(`/products/${id}`, productData);
    const local = window.Storage.getProducts();
    const index = local.findIndex(p => p.id === id);
    if (index > -1) {
      local[index] = { ...local[index], ...productData };
      window.Storage.saveProducts(local);
    }
    window.dispatchEvent(new CustomEvent('catalog:changed', { detail: { action: 'update', id } }));
    return response.data || local[index];
  },

  async delete(id) {
    const response = await window.Api.delete(`/products/${id}`);
    let local = window.Storage.getProducts();
    local = local.filter(p => p.id !== id);
    window.Storage.saveProducts(local);
    window.dispatchEvent(new CustomEvent('catalog:changed', { detail: { action: 'delete', id } }));
    return response;
  },

  async toggleFeatured(id) {
    const product = await this.getById(id);
    if (product) {
      return this.update(id, { featured: !product.featured });
    }
    return null;
  }
};

if (typeof window !== 'undefined') {
  window.ProductService = ProductService;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductService;
}
