export const COMBOS_MOCK = [
  {
    id: 1,
    name: "Combo Cocina Integral",
    sku: "CMB-COC-01",
    description: "Equipamiento completo para cocina con refrigeración No Frost, estufa en acero inoxidable y microondas con grill.",
    image_url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600",
    whatsapp_message: "Hola equipo EL VECINO. Me interesa consultar disponibilidad y cotizar el combo *{nombre_combo}* (Ref: {sku_combo}). ¿Me podrían brindar más información?",
    start_date: "2026-09-01T00:00:00Z",
    end_date: "2026-12-31T23:59:59Z",
    is_active: true,
    items: [
      {
        product: { id: 1, name: "Nevera Samsung 200L No Frost", sku: "RT20K5030S8" },
        quantity: 1
      },
      {
        product: { id: 3, name: "Cocina Mabe 4 Puestos Inox", sku: "EM5120FX0" },
        quantity: 1
      },
      {
        product: { id: 10, name: "Horno Microondas Grill Samsung", sku: "MG23J5133AM" },
        quantity: 1
      }
    ]
  },
  {
    id: 2,
    name: "Combo Sala de Cine en Casa",
    sku: "CMB-CIN-02",
    description: "Paquete de entretenimiento con Smart TV UHD 4K, barra de sonido surround y soporte articulado para instalación.",
    image_url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=600",
    whatsapp_message: "Hola equipo EL VECINO. Quisiera consultar disponibilidad y cotizar el *{nombre_combo}* (Ref: {sku_combo}).",
    start_date: "2026-09-01T00:00:00Z",
    end_date: "2026-12-31T23:59:59Z",
    is_active: true,
    items: [
      {
        product: { id: 20, name: "Smart TV 55 Pulgadas UHD 4K", sku: "TV55-UHD" },
        quantity: 1
      },
      {
        product: { id: 21, name: "Soundbar 3.1 Dolby Surround", sku: "SND-31BT" },
        quantity: 1
      },
      {
        product: { id: 22, name: "Soporte de Pared Articulado", sku: "SOP-ART" },
        quantity: 1
      }
    ]
  },
  {
    id: 3,
    name: "Combo Centro de Lavado",
    sku: "CMB-LAV-03",
    description: "Dúo eficiente de lavadora de alta capacidad y secadora automática de ropa para el hogar.",
    image_url: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=600",
    whatsapp_message: "Buenas tardes EL VECINO. Deseo consultar disponibilidad del combo de lavado *{nombre_combo}* ({sku_combo}).",
    start_date: "2026-09-01T00:00:00Z",
    end_date: "2026-12-31T23:59:59Z",
    is_active: true,
    items: [
      {
        product: { id: 2, name: "Lavadora LG Smart Motion 13kg", sku: "WT13WSB" },
        quantity: 1
      },
      {
        product: { id: 23, name: "Secadora Automática 12kg Frontal", sku: "SEC-12KG" },
        quantity: 1
      }
    ]
  },
  {
    id: 4,
    name: "Combo Climatización Integral",
    sku: "CMB-CLM-04",
    description: "Aire acondicionado Split 12000 BTU de bajo consumo con kit de tubería y soporte para instalación.",
    image_url: "https://images.unsplash.com/photo-1614633833026-0820552978b6?auto=format&fit=crop&q=80&w=600",
    whatsapp_message: "Hola Comercializadora El Vecino. Solicito cotización del *{nombre_combo}* (Ref: {sku_combo}).",
    start_date: "2026-09-01T00:00:00Z",
    end_date: "2026-12-31T23:59:59Z",
    is_active: false,
    items: [
      {
        product: { id: 4, name: "Aire Acondicionado Split 12000 BTU", sku: "MMI12CDBW" },
        quantity: 1
      },
      {
        product: { id: 27, name: "Soporte de Unidad Externa Pro", sku: "SOP-CLIM" },
        quantity: 1
      }
    ]
  }
];