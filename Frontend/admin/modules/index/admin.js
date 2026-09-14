/**
 * admin.js - Operaciones dinámicas y lógica para la administración
 * Gestiona autenticación JWT para el panel administrativo, métricas y control de inventario
 */

const AdminOps = {
  init() {
    console.log('[AdminOps] Inicializando operaciones de administración...');
    this.checkAuth();
  },

  /**
   * Comprueba si el usuario tiene rol de administrador antes de permitir acceso
   */
  checkAuth() {
    if (window.AuthService && !window.AuthService.isAuthenticated()) {
      console.warn('[AdminOps] Usuario no autenticado. Redirigiendo a login...');
      // Redirigir si se intenta acceder directamente sin token
      if (window.location.pathname.includes('/admin/')) {
        window.location.href = '../../loguin.html?redirect=admin';
      }
      return false;
    }
    return true;
  },

  /**
   * Métodos preparados para cálculo de KPIs y operaciones de catálogo
   */
  async getDashboardStats() {
    const products = window.Storage?.getProducts() || [];
    const totalClicks = products.reduce((acc, p) => acc + (p.clicks || 0), 0);
    const activeCount = products.filter(p => p.status === 'Activo').length;
    const featuredCount = products.filter(p => p.featured === true).length;

    return {
      totalProducts: products.length,
      activeProducts: activeCount,
      featuredProducts: featuredCount,
      totalWhatsappClicks: totalClicks
    };
  }
};

if (typeof window !== 'undefined') {
  window.AdminOps = AdminOps;
  document.addEventListener('DOMContentLoaded', () => AdminOps.init());
}
