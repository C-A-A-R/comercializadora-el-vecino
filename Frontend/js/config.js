/**
 * config.js - Global configuration and seed catalog for Comercializadora El Vecino
 */

const CONFIG = {
  APP_NAME: 'EL VECINO',
  APP_TAGLINE: 'Electro & Hogar',
  WHATSAPP_PHONE: '573001234567', // Reemplazar con el número oficial de atención
  DEFAULT_ADVISOR: 'Terminal Bodega Central',
  API_BASE_URL: '/api/v1',
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
      description: 'Tecnología Twin Cooling Plus™ con compresor Digital Inverter y acabado en cristal satinado de alta reflectividad arquitectónica. Cubre espacios premium con máxima conservación.',
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
      description: 'El referente mundial en imagen cinematográfica y gaming ultra responsivo. Negros absolutos y brillo repotenciado con Light Boosting Algorithm.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeBL4fPXDkLGZzWfh6YUrdanBDk7Ch9ssyVTtPMMZclrImzdpEliJIHtorDnnaCtxZSpUzitLKx9601fsRkEI-xGpHfAaDPRZwHp-XEu5-2O2vdPcuPYq3BvW8PKlWd_npd5uULz3bdSDlNeQCozIj7G_NfWkv0deXAbCksn6bBO4ZpQ4xXvLwkWtFtdKnh7UVV_ZfYinIVsnOhcx5S60iVHHMmEWVj3YMtQIkaw13-I0aTSbDtu1Iqg',
      warranty: '2 Años Directo con Marca LG'
    },
    {
      id: 'prod-003',
      sku: 'WT22VT6',
      name: 'Lavadora Inteligente LG 22kg TurboWash 3D & AI DD',
      category: 'lavado-secado',
      categoryName: 'Lavado & Secado',
      price: 3199000,
      originalPrice: 3899000,
      badge: 'TURBOWASH 3D',
      status: 'Activo',
      featured: true,
      inStock: true,
      clicks: 195,
      specs: [
        'Carga masiva de 22 Kilogramos',
        'Motor AI DD con protección de tejidos',
        'TurboWash™ 3D: ciclo completo en 39 minutos',
        'Tina en 100% acero inoxidable quirúrgico'
      ],
      description: 'Potencia industrial para el hogar. Detecta automáticamente peso y suavidad de las prendas para optimizar agua, energía y detergente.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDx1q9S6Av-tDBuLVrI8_pSH4KN-w0zblvJgtZOz0ObFvrcVayRClJgQk1Eo5h3x5juq-taLxaK8vDgrvUiJi6wWmGgGxobjWTebpGaznzr8EiuasBbbfoPGXzOI37SX4dQfsxGBV-fv6zHRv96_zy2zB7JR9nrQzLey0cgwiFTHl7Dg7HESrvrygYEkPjMPCN6k_rV-bBeq8Dje9H_1rDzNrrG13ofgMxLa3wbdNagCWpcQzjLcA6bWQ',
      warranty: '10 Años en Motor Smart Inverter'
    },
    {
      id: 'prod-004',
      sku: 'CFI-2015',
      name: 'Consola Sony PlayStation 5 Slim 1TB + Control DualSense',
      category: 'gaming-tech',
      categoryName: 'Gaming & Tech',
      price: 2499000,
      originalPrice: 2899000,
      badge: 'TOP VENTAS GAMER',
      status: 'Activo',
      featured: true,
      inStock: true,
      clicks: 178,
      specs: [
        'Almacenamiento ultra rápido SSD 1TB NVMe',
        'Audio 3D Tempest y gatillos adaptativos',
        'Trazado de rayos y soporte hasta 120 FPS en 4K',
        'Diseño un 30% más compacto y ligero'
      ],
      description: 'Edición oficial sellada con lector de disco Blu-ray Ultra HD. Compatible con todo el ecosistema de juegos PlayStation 5 y PlayStation 4.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLJntVL6Pq_cbVBEVCJWEVZzXRt6A47GkBPZ5jlPyC3O3HnhjO0I0l0i3AwwERE6lHELrK5asiRjtQNR5z74b3JCF5NG2qUxx3Mt4K5tyl6-zG8Q6KcT0rsA1eGVTXlbxZ3jTGHaXC9UsPQOQJlcXn6yIzst7I8wU7m6nAXqejg_RwB1sN0bclt9MnsjGr9uRcsMT8Du8eCnlaQkOD82_53uArbvdBGG8EKsu7x_Szafv2iRnyMAXSPQ',
      warranty: '1 Año Oficial Directo Sony Colombia'
    },
    {
      id: 'prod-005',
      sku: 'NN-ST65L',
      name: 'Microondas Panasonic Inverter 32L Cyclonic Wave',
      category: 'pequenos-electro',
      categoryName: 'Pequeños Electro',
      price: 849000,
      originalPrice: 999000,
      badge: 'INVERTER TECH',
      status: 'Activo',
      featured: false,
      inStock: true,
      clicks: 63,
      specs: [
        'Capacidad espaciosa de 32 Litros',
        'Potencia de cocción continua Inverter 1100W',
        'Sensor Genius automático de temperatura',
        'Diseño minimalista frontal con panel touch'
      ],
      description: 'Cocción y descongelado uniforme sin resecar los alimentos gracias al flujo continuo de microondas Inverter de precisión.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhpbyTv8mEuDuQyUBieR0mEKwf0N5zfQlg4C4ijPPm4k26xY1caDe6mK9L7BFw9LTEvxNy7kyzLr7SkoKlJ_1YZ6LRn1m6GL3roHjkoRfiDf0AIGuNzMdP9AzZtOLuJZ2m0m7gkIuRE-W5F7djkur90h6L0O-jTeTfePXdu3zwOoLsnCZRCiRo3RwqZY3CpPSUg2XqV-TdQGTt7N_ms8JRrOGO5bamEDKpWrSMh1ieMDiqFGVZEBiH1g',
      warranty: '1 Año Garantía de Fábrica'
    },
    {
      id: 'prod-006',
      sku: 'XIAOMI-13T-256',
      name: 'Smartphone Xiaomi 13T 256GB Óptica Leica 50MP 144Hz',
      category: 'gaming-tech',
      categoryName: 'Gaming & Tech',
      price: 2199000,
      originalPrice: 2599000,
      badge: 'CÁMARA LEICA PRO',
      status: 'Activo',
      featured: true,
      inStock: true,
      clicks: 144,
      specs: [
        'Sistema de cámaras co-diseñado con Leica',
        'Pantalla CrystalRes AMOLED de 144Hz',
        'Carga Turbo rápida de 67W (5000 mAh)',
        'Resistencia al agua y polvo IP68'
      ],
      description: 'Fotografía profesional de nivel insignia y rendimiento Snapdragon fluido para multitasking y captura de video en 4K.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJhUDV6weDKxxuqy-9W-sqkfg6uGb6vtSk-O0FFqnx8eJ2unkozm60gZ3bmO3qCvv11WPqO1SqdJHfI1fiY9RmJH9SjbGzMJSGusZ1I4nPgxIu9wV9tEaE0TTVbJ4xAI1kLIzZTmLgwJMqTjF19PXjryuE0ebTcHi8BUmPxeSh4bddK4D_SPoqHCzzPo-v7GCHKwi7qQGtrClu1hTnEpLeADcJSO6hdjpsbVLkGC7RAEwBaohAjhVCPQ',
      warranty: '2 Años con Factura y Homologación CRC'
    }
  ],

  PROMOTIONS: [
    {
      id: 'promo-001',
      title: 'Combo Dúo Cocina Chef Línea Blanca',
      category: 'HOGAR & ESTILO',
      badge: 'COMBO ESTRELLA DEL MES',
      stockNote: 'ÚLTIMAS 5 UNIDADES EN BODEGA',
      description: 'Paquete de alta gama: Nevera Samsung SpaceMax 602L + Microondas Panasonic Inverter con despacho prioritario y kit de instalación sin costo.',
      originalPrice: 7198000,
      promoPrice: 5890000,
      saving: 1308000,
      active: true,
      whatsappMessage: '¡Hola EL VECINO! Me interesa adquirir el Combo Dúo Cocina Chef (Nevera Samsung SpaceMax + Microondas Inverter). ¿Tienen disponibilidad y despacho inmediato?',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4BzSlYuos4wRZUD1h0A976CFR0pmPQ5rrTlpc40DhyI8HEsUcM02wOT1wyAxMVqLhQn8sZtskycGG9tCx1R083jQ_56nPalMk7SfLy6FLboAplkbMHseOamUo0Rj-ib1mxX1xB_pIEz8GCtYAkqFVTcwHOXxBjF8rjZOlIleqYOyJizVshIN3cX6MtIRvWD4aHkr0AZugiYhx2jRc7ZO7wWQvJrDr_6RKbRobyacg8KSlpNva16VWAA'
    },
    {
      id: 'promo-002',
      title: 'Especial Cine en Casa Pantallas 4K OLED',
      category: 'ENTRETENIMIENTO',
      badge: 'DESCUENTO CINEFILO',
      stockNote: '8 PANTALLAS DISPONIBLES',
      description: 'Smart TV LG OLED 65" evo C3 con soporte de pared multidireccional premium de regalo y calibración de fábrica certificada.',
      originalPrice: 7899000,
      promoPrice: 6499000,
      saving: 1400000,
      active: true,
      whatsappMessage: '¡Hola! Deseo cotizar disponibilidad del Especial Pantallas 4K con la LG OLED 65" evo C3 y confirmar cobertura de envío.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeBL4fPXDkLGZzWfh6YUrdanBDk7Ch9ssyVTtPMMZclrImzdpEliJIHtorDnnaCtxZSpUzitLKx9601fsRkEI-xGpHfAaDPRZwHp-XEu5-2O2vdPcuPYq3BvW8PKlWd_npd5uULz3bdSDlNeQCozIj7G_NfWkv0deXAbCksn6bBO4ZpQ4xXvLwkWtFtdKnh7UVV_ZfYinIVsnOhcx5S60iVHHMmEWVj3YMtQIkaw13-I0aTSbDtu1Iqg'
    },
    {
      id: 'promo-003',
      title: 'Temporada Gamer Pro PS5 Slim + Juego Exclusivo',
      category: 'TEMPORADA TECH',
      badge: 'PACK GAMER SELLADO',
      stockNote: '12 CONSOLAS EN STOCK',
      description: 'Consola Sony PlayStation 5 Slim 1TB con DualSense inalámbrico adicional incluido y entrega inmediata en ciudades principales.',
      originalPrice: 3299000,
      promoPrice: 2799000,
      saving: 500000,
      active: true,
      whatsappMessage: '¡Hola EL VECINO! Quisiera apartar el Pack Temporada Gamer Pro con la consola PS5 Slim 1TB. ¿Qué medios de pago reciben?',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLJntVL6Pq_cbVBEVCJWEVZzXRt6A47GkBPZ5jlPyC3O3HnhjO0I0l0i3AwwERE6lHELrK5asiRjtQNR5z74b3JCF5NG2qUxx3Mt4K5tyl6-zG8Q6KcT0rsA1eGVTXlbxZ3jTGHaXC9UsPQOQJlcXn6yIzst7I8wU7m6nAXqejg_RwB1sN0bclt9MnsjGr9uRcsMT8Du8eCnlaQkOD82_53uArbvdBGG8EKsu7x_Szafv2iRnyMAXSPQ'
    }
  ],

  TIKTOK_REELS: [
    {
      id: 'reel-01',
      title: 'Review a fondo: Nevera Samsung SpaceMax Bespoke',
      views: '12.4K',
      author: '@elvecinocolombia',
      likes: '3.8K',
      productId: 'prod-001',
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJhUDV6weDKxxuqy-9W-sqkfg6uGb6vtSk-O0FFqnx8eJ2unkozm60gZ3bmO3qCvv11WPqO1SqdJHfI1fiY9RmJH9SjbGzMJSGusZ1I4nPgxIu9wV9tEaE0TTVbJ4xAI1kLIzZTmLgwJMqTjF19PXjryuE0ebTcHi8BUmPxeSh4bddK4D_SPoqHCzzPo-v7GCHKwi7qQGtrClu1hTnEpLeADcJSO6hdjpsbVLkGC7RAEwBaohAjhVCPQ'
    },
    {
      id: 'reel-02',
      title: 'Probando el panel OLED LG evo C3 a 120Hz con PS5',
      views: '24.1K',
      author: '@elvecinocolombia',
      likes: '8.4K',
      productId: 'prod-002',
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTkDgQ3H7ngH4us6kFfgvC35UGTI08qCmt9r6-MH1EprjcXblrHq-mdj3s2ttDjsLY1e7QxC96GBCFP3WLEHDseF-XpKuxuOhlPGYwAZKhciBB5vDz_JiOOFnYqRQX2CkAc4SIzzZOnAkymVzkGIVxj67ZVR8uyPyVitwl3zPNme1kYUim7gaJmwC2fKgyJf-Aljj22xsghoiziH_HpECXfO-Z9L4KFhN0GGQTRxGLWwo_M3WEzgJjOg'
    },
    {
      id: 'reel-03',
      title: 'Unboxing PS5 Slim 1TB: ¿Vale la pena renovar?',
      views: '35.9K',
      author: '@elvecinocolombia',
      likes: '12.3K',
      productId: 'prod-004',
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDrVTzGN2YkqXvj04Ub-YL1AWVu_1m6eQqi3Zd71XHqfX_gOiLIFTA0b7srm2V5luoDtj5sPK0Vpi-EwUhoDQHubnRJS5Dnbh12yyInDv7aiHvmVK4pY0mJ44Dc3rtRGh3EIKSP0qh9hVuZtp3CLo_qPRVUv2ckseHN_7A8wMLEuEWW333WWtx3blz5VqtcwHSxNlIKJ_K5PX4Z4iaCresU3qtotZfpbyv8ld-5wZrOY26ofqOE52SOA'
    }
  ]
};

// Exportar globalmente para scripts tradicionales y módulos ES
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
