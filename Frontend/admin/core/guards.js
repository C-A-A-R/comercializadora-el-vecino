import { STORAGE_KEYS, ROLES } from './constants.js';

export const AuthGuard = {
  isAuthenticated() {
    // Busca la clave de constants.js o cualquiera de los tokens guardados por AuthService
    const token = 
      sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || 
      localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
      sessionStorage.getItem('auth_token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('el_vecino_jwt_token');

    return Boolean(token);
  },

  getUser() {
    // Corrige USER_INFO por USER_DATA y añade fallbacks para auth.service
    const rawUser = 
      sessionStorage.getItem(STORAGE_KEYS.USER_DATA) || 
      localStorage.getItem(STORAGE_KEYS.USER_DATA) ||
      sessionStorage.getItem('user_info') ||
      localStorage.getItem('user_info') ||
      localStorage.getItem('el_vecino_user');

    try {
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  },

  checkAccess(requiredRole = ROLES.ADMIN) {
    if (!this.isAuthenticated()) {
      // Redirección absoluta considerando la estructura completa del proyecto
      window.location.href = '/comercializadora-el-vecino/Frontend/loguin.html?redirect=admin';
      return false;
    }

    const user = this.getUser();
    if (requiredRole && user?.role && user.role !== requiredRole) {
      return false;
    }

    return true;
  }
};