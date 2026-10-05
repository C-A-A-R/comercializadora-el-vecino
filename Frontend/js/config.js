/**
 * CONFIGURACIÓN GLOBAL - EL VECINO
 * Variables generales de la aplicación para fácil edición.
 */
const CONFIG = {
  storeName: "EL VECINO",
  tagline: "Electro & Hogar • Bodega Mayorista",
  description: "Distribución directa de electrodomésticos y tecnología de alta gama sin intermediarios.",
  
  // WhatsApp oficial (puedes cambiar este número libremente)
  whatsappNumber: "584120000000",
  
  // Plantillas de mensajes WhatsApp dinámicos
  whatsappTemplates: {
    generalQuote: "¡Hola El Vecino! Quisiera solicitar una cotización y consultar disponibilidad de inventario.",
    productQuote: (productName, sku) => `¡Hola El Vecino! Me interesa cotizar el producto: *${productName}* (SKU: ${sku}). ¿Tienen disponibilidad en bodega y detalles de despacho?`,
    comboQuote: (comboName, sku, includes) => `¡Hola El Vecino! Deseo cotizar el *${comboName}* (SKU: ${sku}), que incluye: ${includes}. ¿Me pueden enviar cotización directa a mi WhatsApp?`,
    b2bQuote: "¡Hola El Vecino! Soy comprador mayorista / corporativo y deseo cotizar lote de equipos para proyecto."
  },

  // Redes y enlaces de contacto
  social: {
    tiktok: "https://tiktok.com/@elvecino_electro",
    instagram: "https://instagram.com/elvecino_electro",
    facebook: "https://facebook.com/elvecino.electro"
  },

  // Beneficios de bodega
  benefits: [
    { icon: "local_shipping", title: "Flete Bonificado", subtitle: "En combos seleccionados" },
    { icon: "verified_user", title: "Garantía de Fábrica", subtitle: "Hasta 10 años en motor" },
    { icon: "bolt", title: "Respuesta < 5 min", subtitle: "Asesoría técnica directa" },
    { icon: "warehouse", title: "Directo de Bodega", subtitle: "Sin intermediarios" }
  ]
};
