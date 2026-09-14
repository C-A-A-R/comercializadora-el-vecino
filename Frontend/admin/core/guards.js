import { STORAGE_KEYS, ROLES } from './constants.js';

export const AuthGuard = {
  isAuthenticated() {
    const token = 
      sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || 
      localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
      sessionStorage.getItem('auth_token') ||
      localStorage.getItem('auth_token') ||
      sessionStorage.getItem('el_vecino_jwt_token') ||
      localStorage.getItem('el_vecino_jwt_token');

    return Boolean(token && token !== 'null' && token !== 'undefined');
  },

  getUser() {
    const rawUser = 
      sessionStorage.getItem(STORAGE_KEYS.USER_DATA) || 
      localStorage.getItem(STORAGE_KEYS.USER_DATA) ||
      sessionStorage.getItem('user_info') ||
      localStorage.getItem('user_info') ||
      sessionStorage.getItem('el_vecino_user') ||
      localStorage.getItem('el_vecino_user');

    if (!rawUser || rawUser === 'null' || rawUser === 'undefined') return null;

    try {
      if (typeof rawUser === 'object') return rawUser;
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
  },

  checkAccess(requiredRole = ROLES.ADMIN) {
    if (!this.isAuthenticated()) {
      console.warn('[AuthGuard] Usuario no autenticado. Redirigiendo a login...');
      const redirectUrl = window.location.pathname.includes('/Frontend/')
        ? window.location.pathname.replace(/\/admin\/.*$/, '/loguin.html?redirect=admin')
        : '../loguin.html?redirect=admin';
      window.location.href = redirectUrl;
      return false;
    }

    const user = this.getUser();
    const isAdmin = user && (user.role === 'admin' || user.role === 'ADMIN' || Boolean(user.is_staff) || Boolean(user.is_superuser));

    if (requiredRole === 'admin' || requiredRole === ROLES.ADMIN) {
      if (!isAdmin) {
        console.warn('[AuthGuard] Acceso denegado: El usuario no posee permisos de administrador.', user);
        const redirectUrl = window.location.pathname.includes('/Frontend/')
          ? window.location.pathname.replace(/\/admin\/.*$/, '/loguin.html?error=unauthorized')
          : '../loguin.html?error=unauthorized';
        window.location.href = redirectUrl;
        return false;
      }
    } else if (requiredRole && user?.role && user.role !== requiredRole) {
      console.warn(`[AuthGuard] Rol requerido "${requiredRole}" no coincide con "${user?.role}".`);
      return false;
    }

    return true;
  }
};