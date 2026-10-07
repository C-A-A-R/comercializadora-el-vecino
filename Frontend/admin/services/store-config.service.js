import { api } from '../../js/api.js';
import { CONFIG } from '../../js/config.js';

const STORAGE_KEY = 'el_vecino_store_settings';

const DEFAULT_SETTINGS = {
  whatsapp_number: '+57 312 456 7890',
  whatsapp_welcome_message: '¡Hola! Bienvenidos a Comercializadora El Vecino. ¿En qué producto o combo de electrodomésticos te gustaría recibir asesoría y cotización hoy?',
  store_hours: 'Lunes a Sábado: 8:00 AM - 6:30 PM | Domingos y Festivos: 9:00 AM - 2:00 PM',
  store_address: 'Carrera 15 # 34-20, Centro Comercial El Mayorista, Local 102',
  store_city: 'Bucaramanga, Santander',
  social_instagram: 'https://instagram.com/comercializadoraelvecino',
  social_facebook: 'https://facebook.com/comercializadoraelvecino',
  social_tiktok: 'https://tiktok.com/@elvecino_electro',
  store_email: 'ventas@comercializadoraelvecino.com'
};

export const StoreConfigService = {
  getSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('[StoreConfigService] Error al leer configuración local:', e);
    }
    return { ...DEFAULT_SETTINGS };
  },

  async saveSettings(newSettings) {
    const merged = { ...this.getSettings(), ...newSettings };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.error('[StoreConfigService] Error al guardar en localStorage:', e);
    }

    if (!CONFIG.USE_MOCKS) {
      try {
        await api.post('/config/store/', merged);
      } catch (e) {
        console.warn('[StoreConfigService] No se pudo sincronizar con API remota:', e);
      }
    }

    return merged;
  }
};
