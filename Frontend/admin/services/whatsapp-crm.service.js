export const WhatsAppService = {
  async getMetrics() {
    return {
      activeLeads: 18,
      avgResponseTime: '8 min',
      conversionRate: '34%',
      pipelineValueUSD: 3450.00
    };
  },

  async getLeads() {
    return [
      {
        id: 'wa-01',
        customerName: 'Carlos Mendoza',
        phone: '+58 414 1234567',
        status: 'NEW', // NEW, IN_TALKS, CLOSED, LOST
        productInterest: 'Nevera Samsung 400L',
        origin: 'Catálogo Web',
        lastMessage: 'Buenas noches, ¿tienen disponibilidad e instalación inmediata?',
        timeAgo: 'Hace 5 min',
        estimatedValue: 450.00
      },
      {
        id: 'wa-02',
        customerName: 'María Rodríguez',
        phone: '+58 424 7654321',
        status: 'IN_TALKS',
        productInterest: 'Combo Lavado Mabe',
        origin: 'Reel Instagram',
        lastMessage: '¿Aceptan transferencia en bolívares al cambio del día?',
        timeAgo: 'Hace 20 min',
        estimatedValue: 620.00
      },
      {
        id: 'wa-03',
        customerName: 'Inversiones Rubio C.A.',
        phone: '+58 412 9876543',
        status: 'CLOSED',
        productInterest: 'Lote Express 5 Congeladores',
        origin: 'Botón B2B',
        lastMessage: 'Pago enviado. En espera de la guía de despacho.',
        timeAgo: 'Hace 2 horas',
        estimatedValue: 1800.00
      }
    ];
  },

  async updateLeadStatus(id, newStatus) {
    console.log(`[WhatsAppService] Actualizando lead ${id} a estado: ${newStatus}`);
    return { success: true };
  }
};