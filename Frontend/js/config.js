/**
 * config.js - Configuración global y catálogo semilla para Comercializadora El Vecino
 * Ubicación: Frontend/js/config.js
 */

const CONFIG = {
  storeName: 'EL VECINO',
  APP_NAME: 'EL VECINO',
  APP_TAGLINE: 'Electro & Hogar',
  whatsappNumber: '584129227264',
  WHATSAPP_PHONE: '584129227264',
  DEFAULT_ADVISOR: 'Terminal Bodega Central',
  API_BASE_URL: 'http://localhost:8000/api', // Base API del backend Django
  USE_MOCKS: false,                          // Desactiva mocks para conectar con backend real Django
  DEBUG: true,
  CURRENCY_LOCALE: 'es-VE',
  CURRENCY_CODE: 'USD',

  // Plantillas de mensajes WhatsApp dinámicos
  whatsappTemplates: {
    generalQuote: "¡Hola El Vecino! Quisiera solicitar una cotización general de los electrodomésticos disponibles en bodega.",
    productQuote: (productName, sku) => `¡Hola Comercializadora El Vecino! Estoy interesado en cotizar el siguiente producto:\n\n📦 *${productName}*\n🔖 *SKU:* ${sku || 'N/A'}\n\n¿Tienen disponibilidad para entrega o despacho?`,
    comboQuote: (comboTitle, sku, includes) => `¡Hola Comercializadora El Vecino! Me interesa la siguiente promoción especial:\n\n🔥 *${comboTitle}*\n🔖 *SKU:* ${sku || 'N/A'}\n📋 *Incluye:* ${includes || 'Equipos seleccionados'}\n\n¿Está disponible actualmente?`
  },

  // Beneficios de bodega
  benefits: [
    { icon: "local_shipping", title: "Flete Bonificado", subtitle: "En combos seleccionados" },
    { icon: "verified_user", title: "Garantía de Fábrica", subtitle: "Hasta 10 años en motor" },
    { icon: "bolt", title: "Respuesta < 5 min", subtitle: "Asesoría técnica directa" },
    { icon: "warehouse", title: "Directo de Bodega", subtitle: "Sin intermediarios" }
  ],

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

    resolveAsset(assetPath) {
    if (!assetPath) return '';
    if (assetPath.startsWith('http://') || assetPath.startsWith('https://') || assetPath.startsWith('data:')) {
      return assetPath;
    }
    const clean = assetPath.replace(/^\.?\//, '');
    const pathname = (typeof window !== 'undefined' ? (window.location.pathname || '') : '').replace(/\\/g, '/');
    if (pathname.includes('/client/modules/')) {
      return `../../../${clean}`;
    }
    if (pathname.includes('/admin/')) {
      return `../../${clean}`;
    }
    return `./${clean}`;
  },

  formatCurrency(value) {
    if (typeof value !== 'number') value = Number(value) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
      image: 'assets/images/products/prod_ai_2.webp'
    },
    {
      id: 'smart-tvs-audio',
      name: 'Smart TVs & Audio',
      slug: 'smart-tvs-audio',
      icon: 'tv',
      count: 42,
      description: 'Pantallas OLED, QLED 4K/8K, barras de sonido Dolby Atmos y audio profesional.',
      image: 'assets/images/products/prod_ai_7.webp'
    },
    {
      id: 'lavado-secado',
      name: 'Lavado & Secado',
      slug: 'lavado-secado',
      icon: 'local_laundry_service',
      count: 26,
      description: 'Torres de lavado inteligentes, lavadoras carga frontal/superior y secadoras a gas.',
      image: 'assets/images/products/prod_ai_8.webp'
    },
    {
      id: 'gaming-tech',
      name: 'Gaming & Tech',
      slug: 'gaming-tech',
      icon: 'sports_esports',
      count: 31,
      description: 'Consolas de última generación, periféricos pro, monitores gamers y portátiles.',
      image: 'assets/images/products/prod_ai_3.webp'
    },
    {
      id: 'pequenos-electro',
      name: 'Pequeños Electro',
      slug: 'pequenos-electro',
      icon: 'blender',
      count: 24,
      description: 'Airfryers, cafeteras espresso, microondas Inverter y robots aspiradores.',
      image: 'assets/images/products/prod_ai_1.webp'
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
      image: 'assets/images/products/prod_ai_2.webp',
      warranty: 'Respaldo Certificado: Factura Legal y Garantía Oficial Directa'
    },
    {
      id: 'prod-002',
      sku: 'OLED65C3PSA',
      name: 'Smart TV LG OLED 65" evo C3 4K AI ThinQ',
      category: 'smart-tvs-audio',
      categoryName: 'Smart TVs & Audio',
      price: 6499000,
      originalPrice: 7899000,
      badge: 'PANTALLA OLED 4K PREMIUM',
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
      image: 'assets/images/products/prod_ai_7.webp',
      warranty: '2 Años Directo con Marca LG'
    },
    {
      id: 'prod-003',
      sku: 'WT22VT6',
      name: 'Lavadora Inteligente LG 22kg TurboWash 3D & AI DD',
      category: 'lavado-secado',
      categoryName: 'Lavado & Secado',
      price: 3499000,
      originalPrice: 4199000,
      badge: 'TURBOWASH 3D',
      status: 'Activo',
      featured: false,
      inStock: true,
      clicks: 112,
      specs: [
        'Capacidad industrial de 22 Kilogramos',
        'Motor LG Inverter Direct Drive de alta durabilidad',
        'Tecnología 6 Motion DD con sensado automático de telas',
        'Conectividad Wi-Fi vía LG ThinQ para monitoreo remoto'
      ],
      description: 'Lavado rápido y eficiente que reduce el desgaste de prendas hasta un 18% mediante inteligencia artificial de censado de carga.',
      image: 'assets/images/products/prod_ai_8.webp',
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
      badge: 'MEJOR PRODUCTO GAMER',
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
      image: 'assets/images/products/prod_ai_3.webp',
      warranty: '1 Año Oficial Directo de Fábrica'
    },
    {
      id: 'prod-005',
      sku: 'NN-ST65L',
      name: 'Microondas Panasonic Inverter 32L Cyclonic Wave',
      category: 'pequenos-electro',
      categoryName: 'Pequeños Electro',
      price: 849000,
      originalPrice: 999000,
      badge: 'LINEA DE COCCIÓN PREMIUM',
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
      image: 'assets/images/products/prod_ai_1.webp',
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
      image: 'assets/images/products/prod_ai_6.webp',
      warranty: '2 Años de Garantía con Factura Legal'
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
      image: 'assets/images/products/prod_ai_2.webp'
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
      image: 'assets/images/products/prod_ai_7.webp'
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
      image: 'assets/images/products/prod_ai_3.webp'
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
      thumbnail: 'assets/images/products/prod_ai_6.webp'
    },
    {
      id: 'reel-02',
      title: 'Probando el panel OLED LG evo C3 a 120Hz con PS5',
      views: '24.1K',
      author: '@elvecinocolombia',
      likes: '8.4K',
      productId: 'prod-002',
      thumbnail: 'assets/images/products/prod_ai_4.webp'
    },
    {
      id: 'reel-03',
      title: 'Unboxing PS5 Slim 1TB: ¿Vale la pena renovar?',
      views: '35.9K',
      author: '@elvecinocolombia',
      likes: '12.3K',
      productId: 'prod-004',
      thumbnail: 'assets/images/products/prod_ai_5.webp'
    }
  ]
};

// Auxiliares de formateo numérico y de moneda
const formatUSD = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
};

const formatCOP = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);
};

// Vinculación global para scripts estándar del navegador
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
  window.formatUSD = formatUSD;
  window.formatCOP = formatCOP;
}

if (typeof globalThis !== 'undefined') {
  globalThis.CONFIG = CONFIG;
  globalThis.formatUSD = formatUSD;
  globalThis.formatCOP = formatCOP;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, formatUSD, formatCOP };
}