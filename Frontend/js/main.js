/**
 * main.js - Application orchestrator and shared component bootstrap
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando Comercializadora El Vecino App...');

  // 1. Inicializar sistema de Toasts
  if (window.Toast) {
    window.Toast.init();
  }

  // 2. Inicializar Modal de Carrito / Cotización
  if (window.CartModal) {
    window.CartModal.init();
  }

  // 3. Manejar respuestas no autorizadas globales (401)
  window.addEventListener('auth:unauthorized', () => {
    if (window.Toast) {
      window.Toast.warning('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'Sesión requerida');
    }
  });

  // 4. Manejar permisos denegados (403)
  window.addEventListener('auth:forbidden', () => {
    if (window.Toast) {
      window.Toast.error('No tienes permisos suficientes para realizar esta acción.', 'Acceso denegado');
    }
  });
});
