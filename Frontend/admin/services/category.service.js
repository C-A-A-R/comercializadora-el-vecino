import { api } from '../../js/api.js';
import { CONFIG } from '../../js/config.js';
import { CATEGORIES_MOCK, PRODUCT_TYPES_MOCK } from './mocks/categories.mock.js';

export const CategoryService = {
  // --- CATEGORÍAS ---
  async listCategories() {
    if (CONFIG?.USE_MOCKS) {
      return { count: CATEGORIES_MOCK.length, results: [...CATEGORIES_MOCK] };
    }
    try {
      const response = await api.get('/categories/');
      const rawResults = response?.results || (Array.isArray(response) ? response : []);
      const results = rawResults.map(c => ({
        id: c.id,
        name: c.category_name || c.name || '',
        category_name: c.category_name || c.name || '',
        slug: (c.category_name || c.name || '').toLowerCase().replace(/\s+/g, '-'),
        description: c.description || '',
        category_image: c.category_image || null,
        created_at: c.created_at || '',
        is_active: !c.is_deleted
      }));
      return {
        count: response?.total_items || results.length,
        results
      };
    } catch (error) {
      console.warn('[CategoryService] Error al listar categorías del backend, usando mock fallback:', error);
      return { count: CATEGORIES_MOCK.length, results: [...CATEGORIES_MOCK] };
    }
  },

  async saveCategory(data) {
    if (CONFIG?.USE_MOCKS) {
      if (data.id) {
        const idx = CATEGORIES_MOCK.findIndex(c => c.id === parseInt(data.id, 10));
        if (idx !== -1) CATEGORIES_MOCK[idx] = { ...CATEGORIES_MOCK[idx], ...data };
      } else {
        const newCat = {
          id: Date.now(),
          name: data.name || data.category_name,
          category_name: data.name || data.category_name,
          slug: (data.name || data.category_name).toLowerCase().replace(/\s+/g, '-'),
          description: data.description || '',
          is_active: true
        };
        CATEGORIES_MOCK.push(newCat);
      }
      return { success: true };
    }

    const payload = {
      category_name: data.category_name || data.name,
      description: data.description || ''
    };

    if (data.id) {
      return await api.patch(`/categories/${data.id}/`, payload);
    } else {
      return await api.post('/categories/', payload);
    }
  },

  async deleteCategory(id) {
    if (CONFIG?.USE_MOCKS) {
      const idx = CATEGORIES_MOCK.findIndex(c => c.id === parseInt(id, 10));
      if (idx !== -1) CATEGORIES_MOCK.splice(idx, 1);
      return { success: true };
    }
    return await api.delete(`/categories/${id}/`);
  },

  // --- TIPOS DE PRODUCTO (Obsoleto en Backend - mantenido por retrocompatibilidad de interfaz) ---
  async listProductTypes() {
    if (CONFIG?.USE_MOCKS) {
      return { count: PRODUCT_TYPES_MOCK.length, results: [...PRODUCT_TYPES_MOCK] };
    }
    // Entidad consolidada dentro de Categorías en Django
    return { count: 0, results: [] };
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
    return { success: true };
  }
};