/**
 * Ubicación: services/config.service.js
 * Descripción: Servicio centralizado para la tasa de cambio USD -> COP.
 * Cumple con SPEC-011 y la arquitectura de 4 capas.
 */
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
    return await api.get('/config/tasa-cambio/');
  },

  /**
   * Actualiza la tasa de cambio USD/COP.
   * @param {number} nuevaTasa 
   * @returns {Promise<{tasa_usd_cop: number, fecha_actualizacion: string}>}
   */
  async updateTasaCambio(nuevaTasa) {
    return await api.patch('/config/tasa-cambio/', { tasa_usd_cop: nuevaTasa });
  }
};