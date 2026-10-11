/**
 * BASE DE DATOS DE PRODUCTOS Y COMBOS (VARIABLES JS)
 * Totalmente sin precios - Enfocado en cotización directa por WhatsApp y catálogo técnico.
 */

// Categorías disponibles
const CATEGORIES_DATA = [
  { id: "todas", name: "Todas las Líneas", icon: "grid_view", count: "18 Equipos" },
  { id: "refrigeracion", name: "Refrigeración", icon: "kitchen", count: "6 Equipos" },
  { id: "lavado", name: "Lavado & Secado", icon: "local_laundry_service", count: "4 Equipos" },
  { id: "climatizacion", name: "Climatización", icon: "mode_fan", count: "3 Equipos" },
  { id: "tv-audio", name: "Smart TV & Audio", icon: "tv", count: "5 Equipos" }
];

// Catálogo de Productos (Sin ningún precio)
const PRODUCTS_DATA = [
  {
    id: "prod-01",
    sku: "REF-LG-INSTA-601",
    name: "Nevera LG InstaView French Door 601L",
    category: "refrigeracion",
    brand: "LG Electronics",
    badge: "Alta Gama",
    badgeColor: "neon-cyan",
    featured: true,
    image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80",
    specs: [
      { label: "Capacidad", value: "601 Litros" },
      { label: "Tecnología", value: "InstaView Door-in-Door" },
      { label: "Compresor", value: "Linear Inverter (10 años garantía)" },
      { label: "Acabado", value: "Acero Titanio Mate" }
    ],
    summary: "Panel de cristal tintado Knock-On que se ilumina con 2 toques rápidos. Máxima eficiencia energética y conservación Multi Air Flow."
  },
  {
    id: "prod-02",
    sku: "LAV-SAM-SMART-22",
    name: "Lavadora Inteligente Samsung EcoBubble 22kg",
    category: "lavado",
    brand: "Samsung",
    badge: "Eco Inverter",
    badgeColor: "electric-blue",
    featured: true,
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80",
    specs: [
      { label: "Capacidad", value: "22 Kilogramos" },
      { label: "Motor", value: "Digital Inverter VRT Plus" },
      { label: "Conectividad", value: "WiFi SmartThings AI" },
      { label: "Ciclo Vapor", value: "Higienizante 99.9%" }
    ],
    summary: "Tecnología de burbujas activas para lavado profundo a baja temperatura y dispensador automático con calibración inteligente."
  },
  {
    id: "prod-03",
    sku: "TV-SAM-OLED-65",
    name: "Smart TV Samsung Neo QLED 65\" 4K Ultra HD",
    category: "tv-audio",
    brand: "Samsung",
    badge: "4K Master",
    badgeColor: "neon-magenta",
    featured: true,
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80",
    specs: [
      { label: "Pantalla", value: "65 Pulgadas Quantum Matrix" },
      { label: "Tasa Refresco", value: "144Hz VRR FreeSync" },
      { label: "Procesador", value: "Neural Quantum 4K AI" },
      { label: "Audio", value: "Dolby Atmos 60W OTS+" }
    ],
    summary: "Negros absolutos, contraste ilimitado y diseño ultrafino AirSlim sin bordes para cine en casa y gaming de última generación."
  },
  {
    id: "prod-04",
    sku: "AC-MIDEA-INV-18K",
    name: "Aire Acondicionado Split Inverter Midea 18,000 BTU",
    category: "climatizacion",
    brand: "Midea",
    badge: "Ahorro 70%",
    badgeColor: "neon-cyan",
    featured: true,
    image: "https://images.unsplash.com/photo-1614633833026-062040b28489?auto=format&fit=crop&w=800&q=80",
    specs: [
      { label: "Capacidad", value: "18,000 BTU / 220V" },
      { label: "Tecnología", value: "Quattro Full Inverter" },
      { label: "Refrigerante", value: "Ecológico R410A" },
      { label: "Filtro", value: "Dual Ionizador Anti-bacterial" }
    ],
    summary: "Enfriamiento ultrasilencioso en menos de 30 segundos con control mediante aplicación móvil y protección anticorrosiva Gold Fin."
  },
  {
    id: "prod-05",
    sku: "REF-WHIRL-SIDE-580",
    name: "Refrigerador Side by Side Whirlpool 580L Acero",
    category: "refrigeracion",
    brand: "Whirlpool",
    badge: "Mayor Capacidad",
    badgeColor: "electric-blue",
    featured: false,
    image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80",
    specs: [
      { label: "Capacidad", value: "580 Litros" },
      { label: "Dispensador", value: "Agua y Hielo filtrado exterior" },
      { label: "Control", value: "Touch Digital Exterior" },
      { label: "Tecnología", value: "6th Sense Temperature Control" }
    ],
    summary: "Distribución bilateral con cajones Humidity Controlled para preservar frutas y vegetales frescos hasta por el doble de tiempo."
  },
  {
    id: "prod-06",
    sku: "SEC-LG-HEAT-16",
    name: "Secadora Carga Frontal LG DUAL Inverter Heat Pump 16kg",
    category: "lavado",
    brand: "LG Electronics",
    badge: "Bomba de Calor",
    badgeColor: "neon-magenta",
    featured: false,
    image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80",
    specs: [
      { label: "Capacidad", value: "16 Kilogramos" },
      { label: "Sistema", value: "Bomba de Calor DUAL Inverter" },
      { label: "Cuidado", value: "Sensor Dry de humedad" },
      { label: "Auto-Limpieza", value: "Condensador automático" }
    ],
    summary: "Secado a baja temperatura que protege los tejidos más delicados ahorrando hasta 50% de consumo eléctrico."
  },
  {
    id: "prod-07",
    sku: "SND-SONY-BAR-700",
    name: "Barra de Sonido Sony High-Power 700W Dolby Atmos",
    category: "tv-audio",
    brand: "Sony",
    badge: "Audio Cinemático",
    badgeColor: "neon-cyan",
    featured: true,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    specs: [
      { label: "Potencia", value: "700W RMS" },
      { label: "Canales", value: "5.1.2 Canales con Subwoofer Inalámbrico" },
      { label: "Conectividad", value: "HDMI eARC, Bluetooth 5.2, Óptico" },
      { label: "Formato", value: "Dolby Atmos / DTS:X" }
    ],
    summary: "Inmersión acústica tridimensional envolvente para acompañar tu Smart TV con calibración acústica de sala."
  }
];

// PUBLICACIONES DE COMBOS Y PAQUETES PROMOCIONALES (Sin precios)
const COMBOS_DATA = [
  {
    id: "combo-01",
    sku: "COMBO-CHEF-MASTER",
    title: "Combo Dúo Cocina Chef Master",
    tagline: "Equipamiento Culinario Completo",
    badge: "Combo Estrella del Mes",
    badgeColor: "neon-magenta",
    bonification: "Microondas Inverter 42L Bonificado 100%",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80",
    items: [
      {
        type: "Equipo Principal",
        icon: "kitchen",
        name: "Nevera LG InstaView French Door 601L",
        detail: "Panel de Cristal Tintado Knock-On, Compresor Linear Inverter, 10 años de garantía."
      },
      {
        type: "Item Bonificado",
        icon: "microwave",
        name: "Microondas Smart Inverter LG 42L Grill",
        detail: "Descongelado uniforme, recubrimiento EasyClean antibacteriano 99.9%."
      },
      {
        type: "Beneficio Logístico",
        icon: "local_shipping",
        name: "Flete & Subida a Domicilio Bonificado",
        detail: "Entrega con cuadrilla técnica especializada y revisión de sellos en sitio."
      }
    ],
    guarantee: "10 años en compresor + 1 año en microondas",
    summary: "Revoluciona tu espacio culinario en un solo despacho mayorista sellado de fábrica."
  },
  {
    id: "combo-02",
    sku: "COMBO-LAVANDERIA-PRO",
    title: "Torre Dúo Lavandería Inteligente AI",
    tagline: "Cuidado Total Textil & Ahorro Energético",
    badge: "Pack Dúo Inverter",
    badgeColor: "neon-cyan",
    bonification: "Kit de Apilamiento + Regulador Protector Industrial",
    image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1000&q=80",
    items: [
      {
        type: "Lavado",
        icon: "local_laundry_service",
        name: "Lavadora Samsung Front Load 22kg EcoBubble",
        detail: "Ciclo Sanitizante de Vapor, Inteligencia Artificial de dosificación."
      },
      {
        type: "Secado",
        icon: "dry",
        name: "Secadora Carga Frontal Samsung 22kg Sensor Dry",
        detail: "Secado por sensor que previene el desgaste térmico de las fibras."
      },
      {
        type: "Accesorios Bonificados",
        icon: "build",
        name: "Kit de Fijación Vertical + Regulador de Voltaje",
        detail: "Ahorra espacio con soporte vertical y protege los motores contra picos."
      }
    ],
    guarantee: "Garantía oficial Samsung de fábrica",
    summary: "La solución definitiva de lavandería para alto volumen familiar con ultra bajo consumo de agua y energía."
  },
  {
    id: "combo-03",
    sku: "COMBO-CLIMA-TOTAL",
    title: "Pack Climatización Total Hogar (3 Ambientes)",
    tagline: "Confort Térmico Completo en Todo el Inmueble",
    badge: "Lote Climatización",
    badgeColor: "electric-blue",
    bonification: "Kits de Tubería de Cobre de 4m por cada unidad",
    image: "https://images.unsplash.com/photo-1614633833026-062040b28489?auto=format&fit=crop&w=1000&q=80",
    items: [
      {
        type: "Área Social / Sala",
        icon: "mode_fan",
        name: "1x Split Inverter Midea 18,000 BTU 220V",
        detail: "Enfriamiento potente y silencioso con ionizador de aire."
      },
      {
        type: "Habitaciones / Dormitorios",
        icon: "bed",
        name: "2x Split Inverter Midea 12,000 BTU 220V",
        detail: "Modo Sleep ultra silencioso 21dB y bajo consumo nocturno."
      },
      {
        type: "Inclusiones Técnicas",
        icon: "cable",
        name: "3x Kits de Instalación Cobre Original 4 Metros",
        detail: "Tubería de cobre puro aislada, cables de interconexión y manguera de desagüe."
      }
    ],
    guarantee: "5 años en compresores Inverter",
    summary: "El combo más cotizado para equipar casas, apartamentos y oficinas de forma integral con alta eficiencia."
  },
  {
    id: "combo-04",
    sku: "COMBO-CINE-4K-MASTER",
    title: "Combo Cine en Casa 4K + Audio Envolvente",
    tagline: "Experiencia Audiovisual de Gran Formato",
    badge: "Entretenimiento Máximo",
    badgeColor: "neon-cyan",
    bonification: "Soporte de Pared Basculante Reforzado + Cable HDMI 2.1 Ultra High Speed",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1000&q=80",
    items: [
      {
        type: "Pantalla Master",
        icon: "tv",
        name: "Smart TV Samsung Neo QLED 65\" 4K 144Hz",
        detail: "Tecnología Quantum Matrix, Dolby Atmos y procesador Neural AI."
      },
      {
        type: "Sonido Inmersivo",
        icon: "speaker",
        name: "Barra de Sonido Sony 700W RMS con Subwoofer",
        detail: "5.1.2 Canales con soporte Dolby Atmos inalámbrico."
      },
      {
        type: "Accesorios Pro",
        icon: "construction",
        name: "Soporte de Pared Heavy Duty hasta 85\" + HDMI 8K",
        detail: "Listo para montaje profesional con cable de alta tasa de transferencia."
      }
    ],
    guarantee: "1 año de garantía directa de marca",
    summary: "Transforma tu sala o cuarto de entretenimiento en una sala de cine de calidad profesional."
  }
];

// Vídeo Catálogo (Estilo TikTok / Reels)
const TIKTOK_DATA = [
  {
    id: "vid-01",
    title: "Nevera LG InstaView Knock-On en Bodega",
    sku: "REF-LG-INSTA-601",
    author: "@elvecino_bodega",
    views: "48.5K",
    likes: "3.2K",
    comments: "142",
    tag: "Prueba en Vivo",
    videoThumbnail: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=600&q=80",
    description: "¿Cómo funciona el Knock-On de la InstaView? Probamos el sensor de proximidad y espacio interior en lote recién llegado."
  },
  {
    id: "vid-02",
    title: "Combo Dúo Lavado y Secado Samsung AI",
    sku: "COMBO-LAVANDERIA-PRO",
    author: "@elvecino_bodega",
    views: "64.1K",
    likes: "5.8K",
    comments: "289",
    tag: "Combo Unboxing",
    videoThumbnail: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80",
    description: "Desembalamos la torre de lavado y secado Samsung de 22kg. Mira cómo apilarla y conectar con SmartThings."
  },
  {
    id: "vid-03",
    title: "Comparativa Split Inverter 12k vs 18k BTU",
    sku: "AC-MIDEA-INV-18K",
    author: "@elvecino_bodega",
    views: "92.0K",
    likes: "7.4K",
    comments: "411",
    tag: "Guía Técnica",
    videoThumbnail: "https://images.unsplash.com/photo-1614633833026-062040b28489?auto=format&fit=crop&w=600&q=80",
    description: "¿Qué capacidad necesitas para tu habitación o sala? Te explicamos el cálculo de BTU en 60 segundos."
  }
];
