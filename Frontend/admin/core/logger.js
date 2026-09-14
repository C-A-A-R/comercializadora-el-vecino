/**
 * Ubicación: core/logger.js
 * Descripción: Wrapper para manejo seguro e independiente de logs del cliente.
 */
import { CONFIG } from '../js/config.js';

export const logger = {
  info(message, data = null) {
    if (CONFIG.DEBUG) {
      console.log(`[INFO] [${new Date().toISOString()}] ${message}`, data || '');
    }
  },

  warn(message, data = null) {
    if (CONFIG.DEBUG) {
      console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, data || '');
    }
  },

  error(message, error = null) {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, error || '');
  }
};