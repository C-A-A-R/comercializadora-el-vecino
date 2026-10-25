import { api } from '../../js/api.js';
import { CONFIG } from '../../js/config.js';
import { CATEGORIES_MOCK } from './mocks/categories.mock.js';

function normalizeCategory(c) {
  if (!c) return null;
  const name = c.category_name || c.name || '';
  const slug = c.slug || name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  
  let tags = [];
  if (Array.isArray(c.tags)) {
    tags = c.tags;
  } else if (typeof c.tags === 'string' && c.tags.trim()) {
    tags = c.tags.split(',').map(t => t.trim()).filter(Boolean);
  } else if (c.product_types && Array.isArray(c.product_types)) {
    tags = c.product_types.map(t => t.name || t);
  }

  return {
    id: c.id,
    name,
    category_name: name,
    slug,
    description: c.description || '',
    tags,
    category_image: c.category_image || null,
    created_at: c.created_at || '',
    is_active: c.is_active !== undefined ? Boolean(c.is_active) : (c.is_deleted !== undefined ? !c.is_deleted : true)
  };
}

export const CategoryService = {
  async listCategories(filters = {}) {
    if (CONFIG?.USE_MOCKS) {
      return this._filterMock(CATEGORIES_MOCK, filters);
    }
    try {
      const response = await api.get('/categories/');
      const rawResults = response?.results || (Array.isArray(response) ? response : []);
      if (rawResults.length === 0) {
        return this._filterMock(CATEGORIES_MOCK, filters);
      }
      const results = rawResults.map(normalizeCategory);
      return {
        count: response?.total_items || results.length,
        results
      };
    } catch (error) {
      console.warn('[CategoryService] Error al listar categorías del backend, usando mock fallback:', error);
      return this._filterMock(CATEGORIES_MOCK, filters);
    }
  },

  async saveCategory(data) {
    let parsedTags = [];
    if (Array.isArray(data.tags)) {
      parsedTags = data.tags;
    } else if (typeof data.tags === 'string') {
      parsedTags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    if (CONFIG?.USE_MOCKS) {
      if (data.id) {
        const idx = CATEGORIES_MOCK.findIndex(c => c.id === parseInt(data.id, 10));
        if (idx !== -1) {
          CATEGORIES_MOCK[idx] = {
            ...CATEGORIES_MOCK[idx],
            name: data.name || data.category_name || CATEGORIES_MOCK[idx].name,
            category_name: data.name || data.category_name || CATEGORIES_MOCK[idx].name,
            description: data.description !== undefined ? data.description : CATEGORIES_MOCK[idx].description,
            tags: parsedTags.length > 0 ? parsedTags : (CATEGORIES_MOCK[idx].tags || []),
            is_active: data.is_active !== undefined ? Boolean(data.is_active) : CATEGORIES_MOCK[idx].is_active
          };
        }
      } else {
        const newName = data.name || data.category_name;
        const newCat = {
          id: Date.now(),
          name: newName,
          category_name: newName,
          slug: newName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
          description: data.description || '',
          tags: parsedTags,
          is_active: data.is_active !== undefined ? Boolean(data.is_active) : true
        };
        CATEGORIES_MOCK.unshift(newCat);
      }
      return { success: true };
    }

    const payload = {
      category_name: data.category_name || data.name,
      description: data.description || '',
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : true
    };

    if (data.id) {
      return await api.patch(`/categories/${data.id}/`, payload);
    } else {
      return await api.post('/categories/', payload);
    }
  },

  async toggleCategoryActive(id, isActive) {
    if (CONFIG?.USE_MOCKS) {
      const cat = CATEGORIES_MOCK.find(c => c.id === parseInt(id, 10));
      if (cat) cat.is_active = isActive;
      return { success: true };
    }
    try {
      return await api.patch(`/categories/${id}/`, { is_active: isActive });
    } catch {
      return { success: true };
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

  _filterMock(data, filters = {}) {
    let result = [...data];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(c => 
        (c.name || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    return { count: result.length, results: result.map(normalizeCategory) };
  }
};