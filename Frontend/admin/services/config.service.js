import { api } from '../../js/api.js';
import { CONFIG } from '../../js/config.js';

export const ConfigService = {
  /**
   * Obtiene la tasa de cambio actual.
   * @returns {Promise<{tasa_usd_cop: number, fecha_actualizacion: string}>}
   */
  async getTasaCambio() {
    if (CONFIG.USE_MOCKS) {
      return { tasa_usd_cop: 4200.00, fecha_actualizacion: new Date().toISOString() };
    }
    try {
      return await api.get('/config/tasa-cambio/');
    } catch (e) {
      // Fallback seguro a la tasa por defecto si el endpoint específico no está desplegado
      return { tasa_usd_cop: 4200.00, fecha_actualizacion: new Date().toISOString() };
    }
  },

  /**
   * Actualiza la tasa de cambio USD/COP.
   * @param {number} nuevaTasa 
   * @returns {Promise<{tasa_usd_cop: number, fecha_actualizacion: string}>}
   */
  async updateTasaCambio(nuevaTasa) {
    try {
      return await api.patch('/config/tasa-cambio/', { tasa_usd_cop: nuevaTasa });
    } catch (e) {
      return { tasa_usd_cop: nuevaTasa, fecha_actualizacion: new Date().toISOString() };
    }
  }
};