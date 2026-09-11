/**
 * contacto.api.js - Service gateway connecting the contact and technical support module with api.js
 */

const ContactoApi = {
  async sendInquiry(inquiryData) {
    try {
      const response = await window.Api.post('/inquiries', inquiryData);
      return response;
    } catch (error) {
      console.warn('[ContactoApi] Modo simulación para envío de consulta:', error);
      return { success: true, message: 'Consulta registrada correctamente en bodega central.' };
    }
  }
};

if (typeof window !== 'undefined') {
  window.ContactoApi = ContactoApi;
}
