import { CONFIG } from '../../js/config.js';
import { DASHBOARD_MOCK } from './mocks/dashboard.mock.js';

const CACHE_KEY = 'ev_dashboard_snapshot';

export const DashboardService = {
  async getSummary() {
    if (CONFIG?.USE_MOCKS) {
      return { data: DASHBOARD_MOCK, isOffline: false };
    }

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/dashboard/summary/`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('ev_auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al consultar el dashboard');

      const data = await response.json();
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      return { data, isOffline: false };
    } catch (error) {
      console.warn('[DashboardService] Error de red. Intentando recuperar caché local:', error);
      const cached = localStorage.getItem(CACHE_KEY);

      if (cached) {
        const { data } = JSON.parse(cached);
        return { data, isOffline: true };
      }

      console.warn('[DashboardService] Usando fallback MOCK por falta de conexión.');
      return { data: DASHBOARD_MOCK, isOffline: true };
    }
  }
};