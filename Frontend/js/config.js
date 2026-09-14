/**
 * config.js - Configuración global y catálogo semilla para Comercializadora El Vecino
 * Ubicación: Frontend/js/config.js
 */

export const CONFIG = {
  APP_NAME: 'EL VECINO',
  APP_TAGLINE: 'Electro & Hogar',
  WHATSAPP_PHONE: '573001234567',
  DEFAULT_ADVISOR: 'Terminal Bodega Central',
  API_BASE_URL: 'http://localhost:8000/api', // Ajustado a la base del backend Django
  USE_MOCKS: true,                           // Cambiar a false al conectar backend
  DEBUG: true,
  CURRENCY_LOCALE: 'es-CO',
  CURRENCY_CODE: 'COP',

  STORAGE_KEYS: {
    JWT_TOKEN: 'el_vecino_jwt_token',
    USER_DATA: 'el_vecino_user',
    CART: 'el_vecino_cart',
    FAVORITES: 'el_vecino_favorites',
    PRODUCTS_CACHE: 'el_vecino_products_cache'
  },

  ROLES: {
    ADMIN: 'admin',
    ADVISOR: 'asesor',
    CLIENT: 'cliente'
  },

  formatCurrency(value) {
    if (typeof value !== 'number') value = Number(value) || 0;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  },

  CATEGORIES: [
    {
      id: 'refrigeracion',
      name: 'Refrigeración',
      slug: 'refrigeracion',
      icon: 'kitchen',
      count: 38,
      description: 'Neveras Neofrost, Side by Side, French Door y congeladores industriales.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4BzSlYuos4wRZUD1h0A976CFR0pmPQ5rrTlpc40DhyI8HEsUcM02wOT1wyAxMVqLhQn8sZtskycGG9tCx1R083jQ_56nPalMk7SfLy6FLboAplkbMHseOamUo0Rj-ib1mxX1xB_pIEz8GCtYAkqFVTcwHOXxBjF8rjZOlIleqYOyJizVshIN3cX6MtIRvWD4aHkr0AZugiYhx2jRc7ZO7wWQvJrDr_6RKbRobyacg8KSlpNva16VWAA'
    },
    {
      id: 'smart-tvs-audio',
      name: 'Smart TVs & Audio',
      slug: 'smart-tvs-audio',
      icon: 'tv',
      count: 42,
      description: 'Pantallas OLED, QLED 4K/8K, barras de sonido Dolby Atmos y audio profesional.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeBL4fPXDkLGZzWfh6YUrdanBDk7Ch9ssyVTtPMMZclrImzdpEliJIHtorDnnaCtxZSpUzitLKx9601fsRkEI-xGpHfAaDPRZwHp-XEu5-2O2vdPcuPYq3BvW8PKlWd_npd5uULz3bdSDlNeQCozIj7G_NfWkv0deXAbCksn6bBO4ZpQ4xXvLwkWtFtdKnh7UVV_ZfYinIVsnOhcx5S60iVHHMmEWVj3YMtQIkaw13-I0aTSbDtu1Iqg'
    },
    {
      id: 'lavado-secado',
      name: 'Lavado & Secado',
      slug: 'lavado-secado',
      icon: 'local_laundry_service',
      count: 26,
      description: 'Torres de lavado inteligentes, lavadoras carga frontal/superior y secadoras a gas.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDx1q9S6Av-tDBuLVrI8_pSH4KN-w0zblvJgtZOz0ObFvrcVayRClJgQk1Eo5h3x5juq-taLxaK8vDgrvUiJi6wWmGgGxobjWTebpGaznzr8EiuasBbbfoPGXzOI37SX4dQfsxGBV-fv6zHRv96_zy2zB7JR9nrQzLey0cgwiFTHl7Dg7HESrvrygYEkPjMPCN6k_rV-bBeq8Dje9H_1rDzNrrG13ofgMxLa3wbdNagCWpcQzjLcA6bWQ'
    },
    {
      id: 'gaming-tech',
      name: 'Gaming & Tech',
      slug: 'gaming-tech',
      icon: 'sports_esports',
      count: 31,
      description: 'Consolas de última generación, periféricos pro, monitores gamers y portátiles.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLJntVL6Pq_cbVBEVCJWEVZzXRt6A47GkBPZ5jlPyC3O3HnhjO0I0l0i3AwwERE6lHELrK5asiRjtQNR5z74b3JCF5NG2qUxx3Mt4K5tyl6-zG8Q6KcT0rsA1eGVTXlbxZ3jTGHaXC9UsPQOQJlcXn6yIzst7I8wU7m6nAXqejg_RwB1sN0bclt9MnsjGr9uRcsMT8Du8eCnlaQkOD82_53uArbvdBGG8EKsu7x_Szafv2iRnyMAXSPQ'
    },
    {
      id: 'pequenos-electro',
      name: 'Pequeños Electro',
      slug: 'pequenos-electro',
      icon: 'blender',
      count: 24,
      description: 'Airfryers, cafeteras espresso, microondas Inverter y robots aspiradores.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhpbyTv8mEuDuQyUBieR0mEKwf0N5zfQlg4C4ijPPm4k26xY1caDe6mK9L7BFw9LTEvxNy7kyzLr7SkoKlJ_1YZ6LRn1m6GL3roHjkoRfiDf0AIGuNzMdP9AzZtOLuJZ2m0m7gkIuRE-W5F7djkur90h6L0O-jTeTfePXdu3zwOoLsnCZRCiRo3RwqZY3CpPSUg2XqV-TdQGTt7N_ms8JRrOGO5bamEDKpWrSMh1ieMDiqFGVZEBiH1g'
    }
  ],

  INITIAL_PRODUCTS: [
    {
      id: 'prod-001',
      sku: 'RS60T5200S9',
      name: 'Nevera French Door Samsung SpaceMax Bespoke 602L',
      category: 'refrigeracion',
      categoryName: 'Refrigeración',
      price: 5299000,
      originalPrice: 6199000,
      badge: 'LÍNEA BESPOKE CORE',
      status: 'Activo',
      featured: true,
      inStock: true,
      clicks: 342,
      specs: [
        'Capacidad total neta: 602 Litros',
        'Compresor Digital Inverter con 20 años de garantía',
        'Sistema Twin Cooling Plus™ de doble enfriamiento',
        'Acabado Glass Obsidian resistente a huellas'
      ],
      description: 'Tecnología Twin Cooling Plus™ con compresor Digital Inverter y acabado en cristal satinado de alta reflectividad arquitectónica.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4BzSlYuos4wRZUD1h0A976CFR0pmPQ5rrTlpc40DhyI8HEsUcM02wOT1wyAxMVqLhQn8sZtskycGG9tCx1R083jQ_56nPalMk7SfLy6FLboAplkbMHseOamUo0Rj-ib1mxX1xB_pIEz8GCtYAkqFVTcwHOXxBjF8rjZOlIleqYOyJizVshIN3cX6MtIRvWD4aHkr0AZugiYhx2jRc7ZO7wWQvJrDr_6RKbRobyacg8KSlpNva16VWAA',
      warranty: '3 Años Oficial + Factura Legal DIAN'
    },
    {
      id: 'prod-002',
      sku: 'OLED65C3PSA',
      name: 'Smart TV LG OLED 65" evo C3 4K AI ThinQ',
      category: 'smart-tvs-audio',
      categoryName: 'Smart TVs & Audio',
      price: 6499000,
      originalPrice: 7899000,
      badge: 'OLED EVO MASTER',
      status: 'Activo',
      featured: true,
      inStock: true,
      clicks: 289,
      specs: [
        'Panel OLED evo 4K 120Hz nativo',
        'Procesador α9 Gen6 AI 4K de alto rango dinámico',
        'Dolby Vision & Dolby Atmos integrado',
        '4 puertos HDMI 2.1 compatibles con G-Sync & FreeSync'
      ],
      description: 'El referente mundial en imagen cinematográfica y gaming ultra responsivo.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeBL4fPXDkLGZzWfh6YUrdanBDk7Ch9ssyVTtPMMZclrImzdpEliJIHtorDnnaCtxZSpUzitLKx9601fsRkEI-xGpHfAaDPRZwHp-XEu5-2O2vdPcuPYq3BvW8PKlWd_npd5uULz3bdSDlNeQCozIj7G_NfWkv0deXAbCksn6bBO4ZpQ4xXvLwkWtFtdKnh7UVV_ZfYinIVsnOhcx5S60iVHHMmEWVj3YMtQIkaw13-I0aTSbDtu1Iqg',
      warranty: '2 Años Directo con Marca LG'
    }
  ],

  PROMOTIONS: [
    {
      id: 'promo-001',
      title: 'Combo Dúo Cocina Chef Línea Blanca',
      category: 'HOGAR & ESTILO',
      badge: 'COMBO ESTRELLA DEL MES',
      stockNote: 'ÚLTIMAS 5 UNIDADES EN BODEGA',
      description: 'Paquete de alta gama: Nevera Samsung SpaceMax 602L + Microondas Panasonic Inverter.',
      originalPrice: 7198000,
      promoPrice: 5890000,
      saving: 1308000,
      active: true,
      whatsappMessage: '¡Hola EL VECINO! Me interesa adquirir el Combo Dúo Cocina Chef.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4BzSlYuos4wRZUD1h0A976CFR0pmPQ5rrTlpc40DhyI8HEsUcM02wOT1wyAxMVqLhQn8sZtskycGG9tCx1R083jQ_56nPalMk7SfLy6FLboAplkbMHseOamUo0Rj-ib1mxX1xB_pIEz8GCtYAkqFVTcwHOXxBjF8rjZOlIleqYOyJizVshIN3cX6MtIRvWD4aHkr0AZugiYhx2jRc7ZO7wWQvJrDr_6RKbRobyacg8KSlpNva16VWAA'
    }
  ],

  TIKTOK_REELS: []
};

// Auxiliares de formateo exportados individualmente
export const formatUSD = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
};

export const formatCOP = (amount) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount || 0);
};

// Vinculación global para scripts legacy
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}