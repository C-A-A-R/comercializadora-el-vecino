import { CONFIG } from '../../js/config.js';
import { CATEGORIES_MOCK, PRODUCT_TYPES_MOCK } from './mocks/categories.mock.js';

export const CategoryService = {
  // --- CATEGORÍAS ---
  async listCategories() {
    if (CONFIG?.USE_MOCKS) {
      return { count: CATEGORIES_MOCK.length, results: [...CATEGORIES_MOCK] };
    }
    const response = await fetch(`${CONFIG.API_BASE_URL}/categories/`, {
      headers: { 'Authorization': `Bearer ${sessionStorage.getItem('ev_auth_token')}` }
    });
    return await response.json();
  },

  async saveCategory(data) {
    if (CONFIG?.USE_MOCKS) {
      if (data.id) {
        const idx = CATEGORIES_MOCK.findIndex(c => c.id === parseInt(data.id, 10));
        if (idx !== -1) CATEGORIES_MOCK[idx] = { ...CATEGORIES_MOCK[idx], ...data };
      } else {
        const newCat = {
          id: Date.now(),
          name: data.name,
          slug: data.name.toLowerCase().replace(/\s+/g, '-'),
          description: data.description || '',
          is_active: true,
          product_types: []
        };
        CATEGORIES_MOCK.push(newCat);
      }
      return { success: true };
    }

    const method = data.id ? 'PUT' : 'POST';
    const url = data.id 
      ? `${CONFIG.API_BASE_URL}/categories/${data.id}/` 
      : `${CONFIG.API_BASE_URL}/categories/`;

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('ev_auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },

  // --- TIPOS DE PRODUCTO ---
  async listProductTypes() {
    if (CONFIG?.USE_MOCKS) {
      return { count: PRODUCT_TYPES_MOCK.length, results: [...PRODUCT_TYPES_MOCK] };
    }
    const response = await fetch(`${CONFIG.API_BASE_URL}/product-types/`, {
      headers: { 'Authorization': `Bearer ${sessionStorage.getItem('ev_auth_token')}` }
    });
    return await response.json();
  },

  async saveProductType(data) {
    if (CONFIG?.USE_MOCKS) {
      if (data.id) {
        const idx = PRODUCT_TYPES_MOCK.findIndex(t => t.id === parseInt(data.id, 10));
        if (idx !== -1) PRODUCT_TYPES_MOCK[idx] = { ...PRODUCT_TYPES_MOCK[idx], ...data };
      } else {
        const newType = {
          id: Date.now(),
          name: data.name,
          slug: data.name.toLowerCase().replace(/\s+/g, '-'),
          description: data.description || ''
        };
        PRODUCT_TYPES_MOCK.push(newType);
      }
      return { success: true };
    }

    const method = data.id ? 'PUT' : 'POST';
    const url = data.id 
      ? `${CONFIG.API_BASE_URL}/product-types/${data.id}/` 
      : `${CONFIG.API_BASE_URL}/product-types/`;

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('ev_auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
};