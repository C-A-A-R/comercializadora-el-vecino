import { CONFIG } from '../../js/config.js';
import { PRODUCTS_MOCK } from './mocks/products.mock.js';

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
      return { count: filtered.length, results: filtered };
    }

    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${CONFIG.API_BASE_URL}/products/?${query}`, {
      headers: { 'Authorization': `Bearer ${sessionStorage.getItem('ev_auth_token')}` }
    });
    return await response.json();
  },

  async toggleFeatured(id, currentStatus) {
    if (CONFIG?.USE_MOCKS) {
      const prod = PRODUCTS_MOCK.find(p => p.id === id);
      if (prod) prod.is_featured = !currentStatus;
      return { success: true, is_featured: !currentStatus };
    }
    const response = await fetch(`${CONFIG.API_BASE_URL}/products/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('ev_auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_featured: !currentStatus })
    });
    return await response.json();
  },

  async deactivate(id) {
    if (CONFIG?.USE_MOCKS) {
      const prod = PRODUCTS_MOCK.find(p => p.id === id);
      if (prod) prod.is_active = false; // Soft-delete (RN-10)
      return { success: true };
    }
    const response = await fetch(`${CONFIG.API_BASE_URL}/products/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('ev_auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_active: false })
    });
    return await response.json();
  }
};