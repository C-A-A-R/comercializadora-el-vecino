/**
 * Ubicación: core/constants.js
 * Descripción: Constantes de configuración global del panel administrativo.
 */

export const ROLES = {
  ADMIN: 'admin',
  ASESOR: 'asesor',
  CLIENTE: 'cliente'
};

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

export const IMAGE_ANGLES = [
  { id: 'frontal', label: 'Vista Frontal' },
  { id: 'lateral', label: 'Vista Lateral' },
  { id: 'posterior', label: 'Vista Posterior' },
  { id: 'detalle', label: 'Detalle / Acercamiento' },
  { id: 'interior', label: 'Vista Interior' }
];

export const PROMOTION_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed'
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ev_admin_token',
  USER_DATA: 'ev_admin_user',
  THEME: 'ev_admin_theme'
};

export const DEFAULT_PAGINATION = {
  PAGE_SIZE: 10,
  INITIAL_PAGE: 1
};

export const STOCK_THRESHOLD_CRITICAL = 5;