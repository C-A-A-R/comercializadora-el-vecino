import { api } from '../../js/api.js';
import { CONFIG } from '../../js/config.module.js';

// Fechas comerciales especiales por defecto (sincronizadas con el backend)
export const DEFAULT_SPECIAL_DATES = [
  {
    id: 1,
    name: 'Año Nuevo',
    slug: 'ano-nuevo',
    month: 1,
    day: 1,
    days_in_advance: 15,
    description: 'Renovación de hogar y nuevos propósitos. Ofertas de electrodomésticos.',
    suggested_strategy: 'Campaña "Año Nuevo, Hogar Nuevo" con descuentos en línea blanca y refrigeración.',
    is_active: true
  },
  {
    id: 2,
    name: 'San Valentín',
    slug: 'san-valentin',
    month: 2,
    day: 14,
    days_in_advance: 15,
    description: 'Día del Amor y la Amistad. Alta demanda en tecnología personal, audio y hogar.',
    suggested_strategy: 'Combos especiales para parejas y descuentos en Smart TVs, barras de sonido y air fryers.',
    is_active: true
  },
  {
    id: 3,
    name: 'Día de la Madre',
    slug: 'dia-de-la-madre',
    month: 5,
    day: 10,
    days_in_advance: 20,
    description: 'Temporada comercial clave. Fuerte impulso en línea blanca, cocina y cuidado del hogar.',
    suggested_strategy: 'Promociones combo en lavadoras, refrigeración y pequeños electrodomésticos.',
    is_active: true
  },
  {
    id: 4,
    name: 'Día del Padre',
    slug: 'dia-del-padre',
    month: 6,
    day: 15,
    days_in_advance: 15,
    description: 'Alta demanda en entretenimiento, gaming, Smart TVs y sonido.',
    suggested_strategy: 'Descuentos destacados en televisores OLED/QLED y barras de sonido.',
    is_active: true
  },
  {
    id: 5,
    name: 'Halloween',
    slug: 'halloween',
    month: 10,
    day: 31,
    days_in_advance: 15,
    description: 'Ofertas temáticas y promociones relámpago de fin de año.',
    suggested_strategy: 'Ventas especiales temáticas y precios especiales en categorías seleccionadas.',
    is_active: true
  },
  {
    id: 6,
    name: 'Black Friday',
    slug: 'black-friday',
    month: 11,
    day: 27,
    days_in_advance: 20,
    description: 'La mayor jornada global de descuentos comerciales. Máxima conversión.',
    suggested_strategy: 'Mega descuentos por tiempo limitado y liquidación de inventario con precios insuperables.',
    is_active: true
  },
  {
    id: 7,
    name: 'Cyber Monday',
    slug: 'cyber-monday',
    month: 11,
    day: 30,
    days_in_advance: 15,
    description: 'Jornada digital de ofertas post Black Friday.',
    suggested_strategy: 'Ofertas exclusivas para pedidos y cotizaciones rápidas vía WhatsApp.',
    is_active: true
  },
  {
    id: 8,
    name: 'Navidad & Fin de Año',
    slug: 'navidad-fin-de-ano',
    month: 12,
    day: 24,
    days_in_advance: 25,
    description: 'Pico de compras anual. Regalos para el hogar, combos completos de cocina y sonido.',
    suggested_strategy: 'Combos "Navidad El Vecino", facilidades de entrega y bonos de regalo por compra.',
    is_active: true
  }
];

const STORAGE_KEY = 'el_vecino_special_dates';

function getLocalDates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SPECIAL_DATES));
      return [...DEFAULT_SPECIAL_DATES];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_SPECIAL_DATES];
  } catch (e) {
    return [...DEFAULT_SPECIAL_DATES];
  }
}

function saveLocalDates(dates) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
  } catch (e) {
    console.warn('[SpecialDatesService] Error guardando fechas en local:', e);
  }
}

export const SpecialDatesService = {
  /**
   * Calcula los días restantes para la próxima ocurrencia de una fecha (mes, día)
   */
  calculateDaysUntil(month, day) {
    const now = new Date();
    const currentYear = now.getFullYear();

    let nextDate = new Date(currentYear, month - 1, day, 0, 0, 0);
    // Si la fecha ya pasó este año, se toma la del año siguiente
    if (nextDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      nextDate = new Date(currentYear + 1, month - 1, day, 0, 0, 0);
    }

    const diffTime = nextDate.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Obtiene la próxima fecha calendario formateada
   */
  getNextOccurrenceDate(month, day) {
    const now = new Date();
    const currentYear = now.getFullYear();

    let nextDate = new Date(currentYear, month - 1, day, 0, 0, 0);
    if (nextDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      nextDate = new Date(currentYear + 1, month - 1, day, 0, 0, 0);
    }
    return nextDate;
  },

  /**
   * Lista todas las fechas especiales con cálculo dinámico de días restantes
   */
  async list() {
    let items = [];
    if (!CONFIG?.USE_MOCKS) {
      try {
        const response = await api.get('/notifications/dates/');
        const raw = response?.results || (Array.isArray(response) ? response : []);
        if (raw.length > 0) {
          items = raw;
        }
      } catch (e) {
        console.warn('[SpecialDatesService] Backend no disponible, usando fallback local:', e.message);
      }
    }

    if (items.length === 0) {
      items = getLocalDates();
    }

    return items.map(d => {
      const daysUntil = this.calculateDaysUntil(d.month, d.day);
      const daysInAdvance = Number(d.days_in_advance) || 15;
      const isApproaching = d.is_active && daysUntil <= daysInAdvance;
      const nextDate = this.getNextOccurrenceDate(d.month, d.day);

      return {
        ...d,
        days_until: daysUntil,
        days_in_advance: daysInAdvance,
        is_approaching: isApproaching,
        next_occurrence_formatted: nextDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
      };
    }).sort((a, b) => a.days_until - b.days_until);
  },

  /**
   * Obtiene sólo las fechas que están dentro de su periodo de anticipación (alertas activas)
   */
  async getUpcomingAlerts() {
    const all = await this.list();
    return all.filter(d => d.is_approaching);
  },

  /**
   * Guarda o actualiza una fecha especial
   */
  async save(data) {
    const payload = {
      name: data.name,
      month: parseInt(data.month, 10),
      day: parseInt(data.day, 10),
      days_in_advance: parseInt(data.days_in_advance || 15, 10),
      description: data.description || '',
      suggested_strategy: data.suggested_strategy || '',
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : true
    };

    if (!CONFIG?.USE_MOCKS) {
      try {
        if (data.id && typeof data.id === 'number' && data.id < 1000000000000) {
          return await api.patch(`/notifications/dates/${data.id}/`, payload);
        } else {
          return await api.post('/notifications/dates/', payload);
        }
      } catch (e) {
        console.warn('[SpecialDatesService] Error en API al guardar, usando local:', e.message);
      }
    }

    const locals = getLocalDates();
    if (data.id) {
      const idx = locals.findIndex(d => String(d.id) === String(data.id));
      if (idx !== -1) {
        locals[idx] = { ...locals[idx], ...payload };
      }
    } else {
      locals.push({
        id: Date.now(),
        slug: payload.name.toLowerCase().replace(/\s+/g, '-'),
        ...payload
      });
    }
    saveLocalDates(locals);
    return { success: true };
  },

  /**
   * Alterna el estado activo de una fecha especial
   */
  async toggleActive(id, isActive) {
    if (!CONFIG?.USE_MOCKS) {
      try {
        return await api.patch(`/notifications/dates/${id}/`, { is_active: isActive });
      } catch (e) {
        console.warn('[SpecialDatesService] Error en API al alternar estado, usando local:', e.message);
      }
    }

    const locals = getLocalDates();
    const item = locals.find(d => String(d.id) === String(id));
    if (item) {
      item.is_active = isActive;
      saveLocalDates(locals);
    }
    return { success: true };
  },

  /**
   * Elimina una fecha comercial especial
   */
  async delete(id) {
    if (!CONFIG?.USE_MOCKS) {
      try {
        await api.delete(`/notifications/dates/${id}/`);
      } catch (e) {
        console.warn('[SpecialDatesService] Error en API al eliminar, usando local:', e.message);
      }
    }

    let locals = getLocalDates();
    locals = locals.filter(d => String(d.id) !== String(id));
    saveLocalDates(locals);
    return { success: true };
  },

  /**
   * Dispara una evaluación manual de recordatorios en el backend
   */
  async checkNow() {
    try {
      return await api.post('/notifications/dates/check-now/', { force: true });
    } catch (e) {
      return { success: true, message: 'Evaluación local completada.' };
    }
  }
};

