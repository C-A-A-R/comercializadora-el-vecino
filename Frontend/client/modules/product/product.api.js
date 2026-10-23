/**
 * product.api.js - Service gateway connecting the product module screens with api.js
 * Arquitectura Híbrida: Combina inteligentemente la información del backend Django
 * con los datos estáticos del frontend (PRODUCTS_DATA, CATEGORIES_DATA).
 */

const ProductApi = {
  /**
   * Helper para normalizar identificadores y nombres para comparaciones tolerantes
   */
  _normalizeKey(val) {
    if (val === null || val === undefined) return '';
    return String(val)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  },

  /**
   * Obtiene la lista base de productos estáticos del frontend
   */
  getStaticProducts() {
    if (typeof PRODUCTS_DATA !== 'undefined' && Array.isArray(PRODUCTS_DATA)) {
      return PRODUCTS_DATA;
    }
    if (window.PRODUCTS_DATA && Array.isArray(window.PRODUCTS_DATA)) {
      return window.PRODUCTS_DATA;
    }
    if (window.CONFIG?.INITIAL_PRODUCTS && Array.isArray(window.CONFIG.INITIAL_PRODUCTS)) {
      return window.CONFIG.INITIAL_PRODUCTS;
    }
    return [];
  },

  /**
   * Obtiene la lista base de categorías estáticas del frontend
   */
  getStaticCategories() {
    if (typeof CATEGORIES_DATA !== 'undefined' && Array.isArray(CATEGORIES_DATA)) {
      return CATEGORIES_DATA;
    }
    if (window.CATEGORIES_DATA && Array.isArray(window.CATEGORIES_DATA)) {
      return window.CATEGORIES_DATA;
    }
    if (window.CONFIG?.CATEGORIES && Array.isArray(window.CONFIG.CATEGORIES)) {
      return window.CONFIG.CATEGORIES;
    }
    return [];
  },

  /**
   * Fusiona de forma híbrida productos de Backend y Frontend
   * Prioriza datos actualizados del backend y enriquece con especificaciones/imágenes del frontend
   */
  mergeProducts(backendList = [], staticList = []) {
    const normalize = (p) => (window.Api?.normalizeProduct ? window.Api.normalizeProduct(p) : p);
    const mergedMap = new Map();

    // 1. Cargar productos estáticos del frontend normalizados
    (staticList || []).forEach(item => {
      if (!item) return;
      const p = normalize(item);
      const keyId = String(p.id).toLowerCase();
      mergedMap.set(keyId, { ...p, _source: 'frontend' });
    });

    // 2. Fusionar / Enriquecer con productos del Backend
    (backendList || []).forEach(item => {
      if (!item) return;
      const bp = normalize(item);

      // Buscar si ya existe por ID exacto, por SKU o por similitud de nombre
      const keyId = String(bp.id).toLowerCase();
      const normName = this._normalizeKey(bp.name);
      const normSku = bp.sku ? this._normalizeKey(bp.sku) : '';

      let foundKey = null;
      if (mergedMap.has(keyId)) {
        foundKey = keyId;
      } else {
        for (const [k, existing] of mergedMap.entries()) {
          const exName = this._normalizeKey(existing.name);
          const exSku = existing.sku ? this._normalizeKey(existing.sku) : '';
          if ((normSku && exSku && normSku === exSku) || (normName && exName && normName === exName)) {
            foundKey = k;
            break;
          }
        }
      }

      if (foundKey) {
        // Enriquecer producto existente (datos dinámicos de backend + riqueza visual frontend)
        const existing = mergedMap.get(foundKey);
        const merged = {
          ...existing,
          ...bp,
          id: bp.id || existing.id,
          image: (bp.image && !bp.image.includes('placehold.co')) ? bp.image : (existing.image || bp.image),
          product_image: (bp.image && !bp.image.includes('placehold.co')) ? bp.image : (existing.image || bp.image),
          specs: (Array.isArray(bp.specs) && bp.specs.length > 0) ? bp.specs : (existing.specs || []),
          badge: bp.badge || existing.badge || (bp.is_feature_product ? 'LÍNEA DESTACADA' : ''),
          badgeColor: bp.badgeColor || existing.badgeColor || 'neon-cyan',
          _source: 'hybrid'
        };
        mergedMap.set(foundKey, merged);
      } else {
        // Nuevo producto proveniente exclusivamente del backend
        mergedMap.set(keyId, { ...bp, _source: 'backend' });
      }
    });

    return Array.from(mergedMap.values());
  },

  /**
   * Fusiona categorías de Backend y Frontend eliminando duplicados
   */
  mergeCategories(backendCats = [], staticCats = []) {
    const normalize = (c) => (window.Api?.normalizeCategory ? window.Api.normalizeCategory(c) : c);
    const catMap = new Map();

    // 1. Categorías del Frontend
    (staticCats || []).forEach(cat => {
      if (!cat) return;
      const c = normalize(cat);
      const normKey = this._normalizeKey(c.name || c.id);
      catMap.set(normKey, { ...c, _source: 'frontend' });
    });

    // 2. Categorías del Backend
    (backendCats || []).forEach(cat => {
      if (!cat) return;
      const bc = normalize(cat);
      const normKey = this._normalizeKey(bc.name || bc.category_name || bc.id);

      if (catMap.has(normKey)) {
        const existing = catMap.get(normKey);
        catMap.set(normKey, {
          ...existing,
          ...bc,
          id: existing.id || bc.id,
          name: existing.name || bc.name,
          icon: existing.icon || bc.icon || 'inventory_2',
          _source: 'hybrid'
        });
      } else {
        catMap.set(normKey, {
          ...bc,
          id: bc.id || normKey,
          name: bc.category_name || bc.name,
          icon: bc.icon || 'category',
          _source: 'backend'
        });
      }
    });

    const list = Array.from(catMap.values());
    // Asegurar que la opción "todas" quede en primer lugar si existe
    const todasIdx = list.findIndex(c => String(c.id).toLowerCase() === 'todas');
    if (todasIdx > 0) {
      const [todas] = list.splice(todasIdx, 1);
      list.unshift(todas);
    }
    return list;
  },

  /**
   * Consulta los productos combinando la API Django con el catálogo estático
   */
  async getProducts(filters = {}) {
    let backendProducts = [];
    try {
      if (window.Api && window.CONFIG?.API_BASE_URL) {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.is_feature_product || filters.featuredOnly) params.is_feature_product = true;
        if (filters.ordering) params.ordering = filters.ordering;

        const response = await window.Api.get('/products', params);
        backendProducts = window.Api?.extractResults ? window.Api.extractResults(response) : (response?.results || response?.data || response || []);
      }
    } catch (error) {
      console.warn('[ProductApi] API backend no disponible o error de red:', error.message);
    }

    const staticProducts = this.getStaticProducts();
    const merged = this.mergeProducts(backendProducts, staticProducts);

    // Guardar en Storage para disponibilidad reactiva del Navbar y Carrito
    if (window.Storage && typeof window.Storage.saveProducts === 'function' && merged.length > 0) {
      window.Storage.saveProducts(merged);
    }

    // Aplicar filtros locales de forma homogénea y completa
    let filtered = merged;

    if (filters.category && filters.category !== 'all' && filters.category !== 'todas') {
      const catTarget = this._normalizeKey(filters.category);
      filtered = filtered.filter(p => {
        const pCat = this._normalizeKey(p.category);
        const pCatName = this._normalizeKey(p.categoryName);
        const pCatSlug = this._normalizeKey(p.categorySlug);
        if (pCat === catTarget || pCatName === catTarget || pCatSlug === catTarget) return true;
        if (Array.isArray(p.categories) && p.categories.some(c => this._normalizeKey(c) === catTarget)) return true;
        if (Array.isArray(p.categories_detail)) {
          return p.categories_detail.some(cd =>
            this._normalizeKey(cd.id) === catTarget ||
            this._normalizeKey(cd.category_name) === catTarget ||
            this._normalizeKey(cd.slug) === catTarget
          );
        }
        return false;
      });
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter(p => {
        return (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.summary && p.summary.toLowerCase().includes(q)) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(q))
        );
      });
    }

    if (filters.featuredOnly || filters.is_feature_product) {
      filtered = filtered.filter(p => p.featured === true || p.is_feature_product === true);
    }

    if (filters.ordering) {
      if (filters.ordering === 'price_asc' || filters.ordering === 'price-asc') {
        filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      } else if (filters.ordering === 'price_desc' || filters.ordering === 'price-desc') {
        filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      } else if (filters.ordering === 'popular') {
        filtered.sort((a, b) => (Number(b.total_views || b.clicks) || 0) - (Number(a.total_views || a.clicks) || 0));
      }
    }

    return filtered;
  },

  /**
   * Obtiene la ficha técnica completa de un producto por ID buscando en Backend y Frontend
   */
  async getProductById(id) {
    if (!id) return null;
    let backendProduct = null;
    try {
      if (window.Api && window.CONFIG?.API_BASE_URL) {
        const response = await window.Api.get(`/products/${id}`);
        const raw = response?.data || response;
        if (raw && (raw.id || raw.product_name || raw.name)) {
          backendProduct = window.Api?.normalizeProduct ? window.Api.normalizeProduct(raw) : raw;
        }
      }
    } catch (error) {
      // Si el id es alfanumérico o el backend no lo tiene, continúa al fallback frontend
    }

    const staticProducts = this.getStaticProducts();
    const staticProduct = staticProducts.find(p =>
      String(p.id).toLowerCase() === String(id).toLowerCase() ||
      (p.sku && String(p.sku).toLowerCase() === String(id).toLowerCase())
    );

    if (backendProduct && staticProduct) {
      const merged = this.mergeProducts([backendProduct], [staticProduct]);
      return merged[0];
    }

    if (backendProduct) return backendProduct;
    if (staticProduct) return window.Api?.normalizeProduct ? window.Api.normalizeProduct(staticProduct) : staticProduct;

    // Buscar en la caché híbrida de Storage
    const cached = window.Storage?.getProducts() || [];
    const foundCached = cached.find(p => String(p.id).toLowerCase() === String(id).toLowerCase());
    return foundCached ? (window.Api?.normalizeProduct ? window.Api.normalizeProduct(foundCached) : foundCached) : null;
  },

  /**
   * Obtiene la lista combinada de categorías (Backend + Frontend)
   */
  async getCategories() {
    let backendCats = [];
    try {
      if (window.Api && window.CONFIG?.API_BASE_URL) {
        const response = await window.Api.get('/categories');
        backendCats = window.Api?.extractResults ? window.Api.extractResults(response) : (response?.results || response?.data || response || []);
      }
    } catch (error) {
      console.warn('[ProductApi] Categorías API offline, usando categorías locales:', error.message);
    }

    const staticCats = this.getStaticCategories();
    return this.mergeCategories(backendCats, staticCats);
  },

  /**
   * Obtiene productos destacados combinando Backend y Frontend
   */
  async getFeatured() {
    return this.getProducts({ featuredOnly: true });
  },

  /**
   * Registra una vista atómica del producto en el backend
   */
  async registerView(id) {
    try {
      if (window.Api && window.CONFIG?.API_BASE_URL) {
        return await window.Api.post(`/products/${id}/view`, {});
      }
    } catch (e) {
      console.warn(`[ProductApi] No se pudo registrar vista para ${id}:`, e.message);
    }
    return null;
  },

  /**
   * Obtiene reseñas clasificadas del backend para el producto
   */
  async getReviews(id) {
    try {
      if (window.Api && window.CONFIG?.API_BASE_URL) {
        const response = await window.Api.get(`/products/${id}/reviews`);
        const raw = window.Api?.extractResults ? window.Api.extractResults(response) : (response.results || response.data || response || []);
        return Array.isArray(raw) ? raw : [];
      }
    } catch (e) {
      console.warn(`[ProductApi] No se pudieron obtener reseñas de API para ${id}:`, e.message);
    }
    return [];
  },

  /**
   * Envía una nueva reseña al backend para análisis de sentimiento automático
   */
  async createReview(id, comment) {
    try {
      if (window.Api && window.CONFIG?.API_BASE_URL) {
        return await window.Api.post(`/products/${id}/reviews`, { comment });
      }
    } catch (e) {
      console.error(`[ProductApi] Error enviando reseña para ${id}:`, e);
      throw e;
    }
  }
};

if (typeof window !== 'undefined') {
  window.ProductApi = ProductApi;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductApi;
}
