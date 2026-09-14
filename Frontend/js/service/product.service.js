/**
 * product.service.js - Business service for product inventory and catalog operations
 */

const ProductService = {
  async getAll(filters = {}) {
    try {
      const response = await window.Api.get('/products', filters);
      let products = response.data || response || [];

      // Si vienen filtros locales en modo mock
      if (filters.category && filters.category !== 'all') {
        products = products.filter(p => p.category === filters.category);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        products = products.filter(p =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      }
      if (filters.featuredOnly) {
        products = products.filter(p => p.featured === true);
      }

      return products;
    } catch (err) {
      console.warn('[ProductService] Fallback a caché local:', err);
      return window.Storage.getProducts();
    }
  },

  async getById(id) {
    try {
      const response = await window.Api.get(`/products/${id}`);
      if (response && response.data) return response.data;
      if (response && response.id) return response;
    } catch (err) {
      console.warn(`[ProductService] Buscando ${id} en caché local.`);
    }
    const local = window.Storage.getProducts();
    return local.find(p => p.id === id) || null;
  },

  async getFeatured() {
    return this.getAll({ featuredOnly: true });
  },

  async getCategories() {
    try {
      const response = await window.Api.get('/categories');
      return response.data || response || window.CONFIG.CATEGORIES;
    } catch (err) {
      return window.CONFIG?.CATEGORIES || [];
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
