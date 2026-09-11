/**
 * order.service.js - Quotation builder and WhatsApp direct connection service
 */

const OrderService = {
  get phone() {
    return window.CONFIG?.WHATSAPP_PHONE || '573001234567';
  },

  /**
   * Generates a structured, professional WhatsApp message from cart items
   */
  buildWhatsAppQuoteUrl(cartItems = [], customerNote = '') {
    if (!cartItems || cartItems.length === 0) {
      return `https://wa.me/${this.phone}?text=${encodeURIComponent('¡Hola EL VECINO! Deseo solicitar información sobre su catálogo de electrodomésticos y tecnología.')}`;
    }

    let message = `🏢 *SOLICITUD DE COTIZACIÓN COMERCIAL*\n`;
    message += `*Comercializadora EL VECINO — Electro & Hogar*\n`;
    message += `──────────────────────\n\n`;
    message += `Hola, deseo cotizar disponibilidad inmediata y despacho para los siguientes equipos:\n\n`;

    let total = 0;
    cartItems.forEach((item, index) => {
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      total += itemTotal;
      const formattedPrice = window.CONFIG.formatCurrency(item.price);
      message += `*${index + 1}. ${item.name}*\n`;
      if (item.sku) message += `   • *SKU:* ${item.sku}\n`;
      message += `   • *Cantidad:* ${item.quantity || 1} un.\n`;
      if (item.price) message += `   • *Ref. Unidad:* ${formattedPrice}\n`;
      message += `\n`;
    });

    message += `──────────────────────\n`;
    if (total > 0) {
      message += `💰 *Subtotal Estimado:* ${window.CONFIG.formatCurrency(total)}\n`;
    }
    message += `📦 *Modalidad:* Despacho Directo Bodega\n`;

    if (customerNote && customerNote.trim().length > 0) {
      message += `\n📝 *Nota / Requerimiento Especial:*\n"${customerNote.trim()}"\n`;
    }

    message += `\nQuedo atento a confirmación de stock, factura legal y tiempo de entrega. ¡Gracias!`;

    const encoded = encodeURIComponent(message);
    return `https://wa.me/${this.phone}?text=${encoded}`;
  },

  /**
   * Single product direct WhatsApp quote link
   */
  buildDirectProductQuoteUrl(product, quantity = 1, customNote = '') {
    const phone = this.phone;
    let message = `¡Hola EL VECINO! Deseo cotizar disponibilidad y tiempo de entrega para:\n\n`;
    message += `📌 *${product.name}*\n`;
    if (product.sku) message += `• *SKU:* ${product.sku}\n`;
    if (product.price) message += `• *Precio Ref.:* ${window.CONFIG.formatCurrency(product.price)}\n`;
    message += `• *Cantidad:* ${quantity} unidad(es)\n`;
    if (customNote) message += `• *Consulta:* ${customNote}\n`;
    message += `\n¿Tienen entrega inmediata y garantía oficial?`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  },

  /**
   * Promotions direct WhatsApp quote link
   */
  buildPromoQuoteUrl(promo) {
    const text = promo.whatsappMessage || `¡Hola EL VECINO! Me interesa el "${promo.title}". ¿Tienen disponibilidad y despacho inmediato?`;
    return `https://wa.me/${this.phone}?text=${encodeURIComponent(text)}`;
  }
};

if (typeof window !== 'undefined') {
  window.OrderService = OrderService;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OrderService;
}
