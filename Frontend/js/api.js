/**
 * api.js - Centralized HTTP client with automatic JWT Bearer injection,
 * error handling, and transparent offline/mock fallback for development.
 */

const Api = {
  get baseUrl() {
    return window.CONFIG?.API_BASE_URL || '/api/v1';
  },

  getToken() {
    if (window.Storage && typeof window.Storage.getToken === 'function') {
      return window.Storage.getToken();
    }
    return localStorage.getItem('el_vecino_jwt_token');
  },

  setToken(token) {
    if (window.Storage && typeof window.Storage.setToken === 'function') {
      return window.Storage.setToken(token);
    }
    localStorage.setItem('el_vecino_jwt_token', token);
  },

  removeToken() {
    if (window.Storage && typeof window.Storage.removeToken === 'function') {
      return window.Storage.removeToken();
    }
    localStorage.removeItem('el_vecino_jwt_token');
  },

  /**
   * Builds request headers with JWT authorization and Content-Type
   */
  getHeaders(customHeaders = {}, endpoint = '') {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders
    };

    const isAuthEndpoint = typeof endpoint === 'string' && (endpoint.includes('/auth/login') || endpoint.includes('/auth/register'));
    const token = this.getToken();
    if (token && !isAuthEndpoint) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  },

  /**
   * Helper to build fully qualified URLs supporting Django REST Framework trailing slashes
   */
  buildUrl(endpoint) {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    const base = this.baseUrl.replace(/\/+$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const [pathname, search] = path.split('?');
    let normalizedPath = pathname;
    if (!normalizedPath.endsWith('/') && !normalizedPath.includes('.')) {
      normalizedPath += '/';
    }
    return `${base}${normalizedPath}${search ? `?${search}` : ''}`;
  },

  /**
   * Main request executor
   */
  async request(endpoint, options = {}) {
    const url = this.buildUrl(endpoint);
    const headers = this.getHeaders(options.headers, endpoint);

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);

      // Manejo de expiración o token inválido (401 Unauthorized)
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({ message: 'Credenciales inválidas o sesión expirada.' }));
        if (!endpoint.includes('/auth/login')) {
          console.warn('[Api] Sesión expirada o no autorizada (401).');
          this.removeToken();
          window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { url } }));
        }
        const err = new Error(errorData.message || 'Credenciales inválidas o sesión expirada.');
        err.isAuthError = true;
        throw err;
      }

      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({ message: 'No tienes permisos para realizar esta acción.' }));
        window.dispatchEvent(new CustomEvent('auth:forbidden', { detail: { url } }));
        const err = new Error(errorData.message || 'No tienes permisos para realizar esta acción.');
        err.isForbidden = true;
        throw err;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        const err = new Error(errorData.message || `Error del servidor: ${response.status}`);
        err.status = response.status;
        throw err;
      }

      // Si no hay contenido (ej: 204 No Content)
      if (response.status === 204) {
        return { success: true };
      }

      return await response.json();
    } catch (networkError) {
      if (networkError.isAuthError || networkError.isForbidden || networkError.status) {
        if (!window.CONFIG?.USE_MOCKS) {
          throw networkError;
        }
      }
      if (window.CONFIG?.USE_MOCKS) {
        console.info(`[Api] Modo mock activo o red caída en "${url}". Ejecutando fallback:`, networkError.message);
        return this.mockFallback(endpoint, config, networkError);
      }
      console.warn(`[Api] Falló la petición a "${url}":`, networkError.message);
      if (endpoint.includes('/auth/login')) {
        throw networkError;
      }
      // Fallback seguro de contingencia para catálogo
      return this.mockFallback(endpoint, config, networkError);
    }
  },

  async get(endpoint, params = {}, options = {}) {
    let url = endpoint;
    if (params && Object.keys(params).length > 0) {
      const query = new URLSearchParams(params).toString();
      url += (url.includes('?') ? '&' : '?') + query;
    }
    return this.request(url, { ...options, method: 'GET' });
  },

  /**
   * Helper para extraer lista de resultados de respuestas de DRF paginadas o directas
   */
  extractResults(response) {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.results)) return response.results;
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  /**
   * Normalizador universal de productos para asegurar compatibilidad backend Django <-> componentes UI
   */
  normalizeProduct(p) {
    if (!p) return null;
    const baseMedia = (window.CONFIG?.API_BASE_URL || 'http://localhost:8000/api').replace('/api', '');
    let img = p.product_image || p.image || '';
    if (img && img.startsWith('/media/')) {
      img = `${baseMedia}${img}`;
    }
    if (!img) img = 'https://placehold.co/400';

    const priceNum = typeof p.price === 'string' ? parseFloat(p.price) : (Number(p.price) || 0);
    const origPriceNum = p.originalPrice ? (typeof p.originalPrice === 'string' ? parseFloat(p.originalPrice) : Number(p.originalPrice)) : (priceNum ? Math.round(priceNum * 1.15) : null);

    let specs = Array.isArray(p.specs) ? p.specs : [];
    if (!specs.length && Array.isArray(p.features)) {
      specs = p.features.map(f => `${f.feature_name}: ${f.feature_value}`);
    }

    const firstCat = Array.isArray(p.categories_detail) && p.categories_detail.length ? p.categories_detail[0] : null;
    const catName = firstCat?.category_name || p.categoryName || p.category || 'Equipo';
    const catId = firstCat?.id || (Array.isArray(p.categories) && p.categories[0]) || p.category || '';

    return {
      ...p,
      id: p.id,
      name: p.product_name || p.name || 'Producto sin nombre',
      product_name: p.product_name || p.name,
      price: priceNum,
      originalPrice: origPriceNum,
      image: img,
      product_image: img,
      category: catId,
      categoryName: catName,
      specs: specs,
      badge: p.badge || (p.is_feature_product ? 'LÍNEA DESTACADA' : ''),
      featured: p.is_feature_product ?? p.featured ?? false,
      is_feature_product: p.is_feature_product ?? p.featured ?? false,
      inStock: p.inStock ?? true,
      clicks: p.total_views ?? p.clicks ?? 0,
      total_views: p.total_views ?? p.clicks ?? 0,
      description: p.description || '',
      warranty: p.warranty || 'Garantía Oficial Directa'
    };
  },

  /**
   * Normalizador universal de categorías
   */
  normalizeCategory(c) {
    if (!c) return null;
    const baseMedia = (window.CONFIG?.API_BASE_URL || 'http://localhost:8000/api').replace('/api', '');
    let img = c.category_image || c.image || '';
    if (img && img.startsWith('/media/')) {
      img = `${baseMedia}${img}`;
    }
    if (!img) img = 'https://placehold.co/400';

    return {
      ...c,
      id: c.id,
      name: c.category_name || c.name || 'Categoría',
      category_name: c.category_name || c.name,
      slug: c.id ? String(c.id) : (c.slug || ''),
      description: c.description || '',
      image: img,
      category_image: img,
      icon: c.icon || 'inventory_2',
      count: c.count || c.products_count || '10+'
    };
  },

  /**
   * Normalizador universal de promociones
   */
  normalizePromotion(pr) {
    if (!pr) return null;
    const baseMedia = (window.CONFIG?.API_BASE_URL || 'http://localhost:8000/api').replace('/api', '');
    let img = pr.image || '';
    if (img && img.startsWith('/media/')) {
      img = `${baseMedia}${img}`;
    }
    if (!img) img = 'https://placehold.co/400';

    const promoPrice = typeof pr.price === 'string' ? parseFloat(pr.price) : (Number(pr.promoPrice || pr.price) || 0);
    const origPrice = pr.original_total_price ? parseFloat(pr.original_total_price) : (pr.originalPrice ? parseFloat(pr.originalPrice) : Math.round(promoPrice * 1.2));
    const saving = pr.savings ? parseFloat(pr.savings) : (pr.saving ? parseFloat(pr.saving) : Math.max(0, origPrice - promoPrice));

    return {
      ...pr,
      id: pr.id,
      title: pr.name || pr.title || 'Combo Especial',
      name: pr.name || pr.title,
      description: pr.description || '',
      promoPrice: promoPrice,
      originalPrice: origPrice,
      saving: saving,
      badge: pr.badge || (pr.savings_percentage ? `${pr.savings_percentage}% AHORRO` : 'COMBO ESTRELLA'),
      category: pr.category || 'COMBO',
      stockNote: pr.stockNote || (pr.is_active ? 'STOCK DISPONIBLE EN BODEGA' : 'CONSULTAR VIGENCIA'),
      image: img
    };
  },

  async post(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async put(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  async patch(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  },

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },

  /**
   * Mock fallback inteligente para pruebas frontend offline
   */
  async mockFallback(endpoint, config, originalError) {
    const cleanPath = endpoint.split('?')[0].replace('/api/v1', '');
    const method = (config.method || 'GET').toUpperCase();

    // 1. Endpoint /auth/login
    if (cleanPath.includes('/auth/login') && method === 'POST') {
      const payload = JSON.parse(config.body || '{}');
      const email = payload.email || '';
      const isAdmin = email.includes('admin');
      const mockUser = {
        id: isAdmin ? 'usr-admin-01' : 'usr-cli-01',
        name: isAdmin ? 'Administrador Master' : 'Cliente Comercial',
        email: email || 'usuario@elvecino.com',
        role: isAdmin ? 'admin' : 'cliente'
      };

      // Generar JWT simulado válido
      const headerB64 = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payloadB64 = btoa(JSON.stringify({
        ...mockUser,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400 // 24h
      }));
      const mockJwt = `${headerB64}.${payloadB64}.simulated_signature_el_vecino`;

      return {
        success: true,
        token: mockJwt,
        user: mockUser,
        message: 'Autenticación exitosa (modo local)'
      };
    }

    if (cleanPath.includes('/dashboard') || cleanPath.includes('/stats')) {
      const products = window.Storage?.getProducts() || window.CONFIG?.INITIAL_PRODUCTS || [];
      
      return {
        success: true,
        data: {
          total_productos: products.length || 18,
          stock_critico: 3,
          clics_whatsapp: 142,
          valor_catalogo_usd: 1250.00,
          tasa_cambio: 4100,
          top_viewed: [
            { name: 'Nevera Mabe 19 Pies', price_usd: 450.00, views: 89 },
            { name: 'Lavadora Samsung 15kg', price_usd: 380.00, views: 64 },
            { name: 'Televisor LG 55" 4K', price_usd: 420.00, views: 51 }
          ]
        }
      };
    }

    // 2. Endpoint /products
    if (cleanPath.includes('/products')) {
      const products = window.Storage?.getProducts() || window.CONFIG?.INITIAL_PRODUCTS || [];

      // Detalle de producto /products/:id
      const idMatch = cleanPath.match(/\/products\/([^/?]+)/);
      if (idMatch && method === 'GET') {
        const prod = products.find(p => p.id === idMatch[1]);
        if (prod) return { success: true, data: prod };
      }

      // Listado general
      if (method === 'GET') {
        return { success: true, data: products, total: products.length };
      }

      // Creación
      if (method === 'POST') {
        const newProd = { id: 'prod-' + Date.now(), ...JSON.parse(config.body || '{}') };
        products.unshift(newProd);
        window.Storage?.saveProducts(products);
        return { success: true, data: newProd, message: 'Producto creado localmente' };
      }
    }

    // 3. Endpoint /promociones
    if (cleanPath.includes('/promociones')) {
      return {
        success: true,
        data: window.CONFIG?.PROMOTIONS || []
      };
    }

    // 4. Endpoint /categories
    if (cleanPath.includes('/categories')) {
      return {
        success: true,
        data: window.CONFIG?.CATEGORIES || []
      };
    }

    // Default fallback
    return {
      success: true,
      data: null,
      fallback: true,
      info: 'Respuesta simulada offline'
    };
  }
};

if (typeof window !== 'undefined') {
  window.Api = Api;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Api;
}

// ES Module exports para compatibilidad con import { api } o import Api
export { Api as api, Api };
export default Api;
