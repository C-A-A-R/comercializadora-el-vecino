/**
 * storage.js - LocalStorage abstraction with domain methods and reactive event bus
 */

const Storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null || item === undefined) return defaultValue;
      return JSON.parse(item);
    } catch (e) {
      console.warn(`[Storage] Error parsing key "${key}":`, e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[Storage] Error saving key "${key}":`, e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`[Storage] Error removing key "${key}":`, e);
      return false;
    }
  },

  // JWT Token Management
  getToken() {
    const key = window.CONFIG?.STORAGE_KEYS?.JWT_TOKEN || 'el_vecino_jwt_token';
    return this.get(key, null);
  },

  setToken(token) {
    const key = window.CONFIG?.STORAGE_KEYS?.JWT_TOKEN || 'el_vecino_jwt_token';
    const result = this.set(key, token);
    window.dispatchEvent(new CustomEvent('auth:token_changed', { detail: { token } }));
    return result;
  },

  removeToken() {
    const key = window.CONFIG?.STORAGE_KEYS?.JWT_TOKEN || 'el_vecino_jwt_token';
    const result = this.remove(key);
    window.dispatchEvent(new CustomEvent('auth:token_changed', { detail: { token: null } }));
    return result;
  },

  // User Session Management
  getUser() {
    const key = window.CONFIG?.STORAGE_KEYS?.USER_DATA || 'el_vecino_user';
    return this.get(key, null);
  },

  setUser(user) {
    const key = window.CONFIG?.STORAGE_KEYS?.USER_DATA || 'el_vecino_user';
    const result = this.set(key, user);
    window.dispatchEvent(new CustomEvent('auth:user_changed', { detail: { user } }));
    return result;
  },

  removeUser() {
    const key = window.CONFIG?.STORAGE_KEYS?.USER_DATA || 'el_vecino_user';
    const result = this.remove(key);
    window.dispatchEvent(new CustomEvent('auth:user_changed', { detail: { user: null } }));
    return result;
  },

  // Cart / Quotation Management
  getCart() {
    const key = window.CONFIG?.STORAGE_KEYS?.CART || 'el_vecino_cart';
    return this.get(key, []);
  },

  saveCart(cart) {
    const key = window.CONFIG?.STORAGE_KEYS?.CART || 'el_vecino_cart';
    const result = this.set(key, cart);
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
    return result;
  },

  addToCart(product, quantity = 1) {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        sku: product.sku || '',
        name: product.name,
        price: product.price || 0,
        image: product.image || '',
        category: product.category || '',
        quantity: Math.max(1, quantity)
      });
    }

    this.saveCart(cart);
    return cart;
  },

  updateCartQty(productId, quantity) {
    let cart = this.getCart();
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }
    const item = cart.find(i => i.id === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCart(cart);
    }
    return cart;
  },

  removeFromCart(productId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.id !== productId);
    this.saveCart(cart);
    return cart;
  },

  clearCart() {
    return this.saveCart([]);
  },

  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  },

  getCartTotal() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
  },

  // Favorites
  getFavorites() {
    const key = window.CONFIG?.STORAGE_KEYS?.FAVORITES || 'el_vecino_favorites';
    return this.get(key, []);
  },

  toggleFavorite(productId) {
    const key = window.CONFIG?.STORAGE_KEYS?.FAVORITES || 'el_vecino_favorites';
    let favs = this.getFavorites();
    const index = favs.indexOf(productId);
    let isFav = false;

    if (index > -1) {
      favs.splice(index, 1);
    } else {
      favs.push(productId);
      isFav = true;
    }

    this.set(key, favs);
    window.dispatchEvent(new CustomEvent('favorites:updated', { detail: { favorites: favs, productId, isFav } }));
    return isFav;
  },

  isFavorite(productId) {
    const favs = this.getFavorites();
    return favs.includes(productId);
  },

  // Products Cache / Persistence
  getProducts() {
    const key = window.CONFIG?.STORAGE_KEYS?.PRODUCTS_CACHE || 'el_vecino_products_cache';
    const cached = this.get(key, null);
    if (!cached || !Array.isArray(cached) || cached.length === 0) {
      const initial = window.CONFIG?.INITIAL_PRODUCTS || [];
      this.set(key, initial);
      return initial;
    }
    return cached;
  },

  saveProducts(products) {
    const key = window.CONFIG?.STORAGE_KEYS?.PRODUCTS_CACHE || 'el_vecino_products_cache';
    return this.set(key, products);
  }
};

if (typeof window !== 'undefined') {
  window.Storage = Storage;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
