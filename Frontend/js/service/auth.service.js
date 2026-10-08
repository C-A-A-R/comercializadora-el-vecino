/**
 * auth.service.js - Authentication service managing JWT tokens, session lifecycle, and role authorization.
 */

const AuthService = {
  /**
   * Utility to decode payload from a standard JWT token (base64url)
   */
  parseJwt(token) {
    if (!token || typeof token !== 'string') return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.warn('[AuthService] Error decodificando JWT:', err);
      return null;
    }
  },

  /**
   * Checks if a valid, unexpired token exists
   */
  isAuthenticated() {
    const token = window.Storage?.getToken() || window.Api?.getToken();
    if (!token) return false;

    const payload = this.parseJwt(token);
    if (!payload) return false;

    if (payload.exp) {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (payload.exp < nowInSeconds) {
        console.warn('[AuthService] Token JWT ha expirado.');
        this.logout();
        return false;
      }
    }
    return true;
  },

  /**
   * Returns current user data
   */
  getCurrentUser() {
    return window.Storage?.getUser() || null;
  },

  /**
   * Returns current JWT token string
   */
  getToken() {
    return window.Storage?.getToken() || null;
  },

  /**
   * Checks user role (e.g. 'admin', 'asesor', 'cliente')
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  },

  /**
   * Logs in a user, saves token & user profile
   */
  async login(identifier, password) {
    try {
      const payload = {
        username: identifier,
        email: identifier,
        identifier: identifier,
        password
      };

      const response = await window.Api.post('/auth/login', payload);

      if (response && (response.token || response.access)) {
        const token = response.token || response.access;

        // Extraer usuario de la respuesta o del JWT
        let user = response.user;
        if (!user) {
          const jwtData = this.parseJwt(token);
          user = {
            id: jwtData?.id || jwtData?.user_id || jwtData?.sub,
            username: jwtData?.username || identifier,
            name: jwtData?.name || identifier.split('@')[0],
            email: jwtData?.email || identifier,
            role: jwtData?.role || (jwtData?.is_staff || jwtData?.is_superuser ? 'admin' : 'cliente')
          };
        }

        // Guardar token y usuario en storage general
        if (window.Storage) {
          window.Storage.setToken(token);
          window.Storage.setUser(user);
        }

        // Sincronizar llaves para el panel admin (AuthGuard)
        try {
          localStorage.setItem('ev_admin_token', token);
          localStorage.setItem('ev_admin_user', JSON.stringify(user));
          sessionStorage.setItem('ev_admin_token', token);
          sessionStorage.setItem('ev_admin_user', JSON.stringify(user));
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user_info', JSON.stringify(user));
          localStorage.setItem('el_vecino_jwt_token', token);
          localStorage.setItem('el_vecino_user', JSON.stringify(user));
        } catch (e) {
          console.warn('[AuthService] Error sincronizando llaves de sesión:', e);
        }

        window.dispatchEvent(new CustomEvent('auth:login_success', { detail: { user, token } }));
        return { success: true, user, token };
      } else {
        throw new Error(response?.message || 'Respuesta de autenticación inválida');
      }
    } catch (err) {
      console.error('[AuthService] Error en login:', err);
      throw err;
    }
  },

  /**
   * Registers a new client
   */
  async register(userData) {
    try {
      const response = await window.Api.post('/auth/register', userData);
      if (response && response.token) {
        window.Storage.setToken(response.token);
        if (response.user) window.Storage.setUser(response.user);
      }
      return response;
    } catch (err) {
      console.error('[AuthService] Error en registro:', err);
      throw err;
    }
  },

  /**
   * Closes session and clears storage
   */
  logout() {
    if (window.Storage) {
      window.Storage.removeToken();
      window.Storage.removeUser();
    }
    try {
      localStorage.removeItem('ev_admin_token');
      localStorage.removeItem('ev_admin_user');
      sessionStorage.removeItem('ev_admin_token');
      sessionStorage.removeItem('ev_admin_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('el_vecino_jwt_token');
      localStorage.removeItem('el_vecino_user');
    } catch (e) {
      console.warn('[AuthService] Error limpiando storage:', e);
    }
    window.dispatchEvent(new CustomEvent('auth:logout', {}));
  }
};

if (typeof window !== 'undefined') {
  window.AuthService = AuthService;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthService;
}
