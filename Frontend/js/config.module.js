/**
 * config.module.js - ES Module bridge para Frontend/admin y módulos ESM
 * Comercializadora EL VECINO
 * Permite imports estáticos nombrados (CONFIG, formatUSD, formatCOP) en módulos ES
 * manteniendo Frontend/js/config.js como script clásico 100% compatible con el navegador.
 */

import './config.js';

export const CONFIG = (typeof window !== 'undefined' ? window.CONFIG : null) || (typeof globalThis !== 'undefined' ? globalThis.CONFIG : null);
export const formatUSD = (typeof window !== 'undefined' ? window.formatUSD : null) || ((amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0));
export const formatCOP = (typeof window !== 'undefined' ? window.formatCOP : null) || ((amount) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount || 0));

export default CONFIG;
