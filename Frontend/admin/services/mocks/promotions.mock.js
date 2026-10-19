export const PROMOTIONS_MOCK = [
  {
    id: 1,
    name: "Semana Especial Neveras No Frost",
    description: "Campaña destacada para refrigeración con garantía extendida y obsequio para el hogar.",
    benefit_type: "Garantía Extendida",
    product: {
      id: 1,
      name: "Nevera Samsung 200L No Frost"
    },
    start_date: "2026-10-01T00:00:00Z",
    end_date: "2026-10-31T23:59:59Z",
    is_active: true,
    whatsapp_message: "Hola Comercializadora El Vecino. Me interesa cotizar la promoción *{nombre_promo}* para el producto *{producto}* con beneficio de {beneficio}. ¿Tienen disponibilidad inmediata?"
  },
  {
    id: 2,
    name: "Kit de Mangueras & Obsequio Lavado",
    description: "Incluye kit completo de mangueras de alta presión y asesoría técnica sin costo.",
    benefit_type: "Kit Obsequio",
    product: {
      id: 2,
      name: "Lavadora LG Smart Motion 13kg"
    },
    start_date: "2026-10-01T00:00:00Z",
    end_date: "2026-10-25T23:59:59Z",
    is_active: true,
    whatsapp_message: "Hola equipo de ventas El Vecino. Quisiera aprovechar la promoción *{nombre_promo}* para la *{producto}*. ¿Cómo es el proceso de entrega?"
  },
  {
    id: 3,
    name: "Campaña Cocina Inox de Temporada",
    description: "Promoción de fin de mes para estufa en acero inoxidable de alta durabilidad.",
    benefit_type: "Campaña Destacada",
    product: {
      id: 3,
      name: "Cocina Mabe 4 Puestos Inox"
    },
    start_date: "2026-08-01T00:00:00Z",
    end_date: "2026-08-31T23:59:59Z",
    is_active: false,
    whatsapp_message: "Hola El Vecino. Deseo consultar si aún está disponible la promoción *{nombre_promo}* para *{producto}*."
  },
  {
    id: 4,
    name: "Promoción Climatización Split",
    description: "Paquete de acondicionamiento de aire con soporte de unidad exterior incluido.",
    benefit_type: "Promoción Especial",
    product: {
      id: 4,
      name: "Aire Acondicionado Split 12000 BTU"
    },
    start_date: "2026-10-01T00:00:00Z",
    end_date: "2026-11-15T23:59:59Z",
    is_active: true,
    whatsapp_message: "Hola Comercializadora El Vecino. Me gustaría cotizar la oferta *{nombre_promo}* del producto *{producto}* ({beneficio})."
  }
];