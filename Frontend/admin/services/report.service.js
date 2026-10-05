import { api } from '../../js/api.js';
import { CONFIG } from '../../js/config.js';

export const ReportService = {
  async downloadReport(endpoint, defaultFilename) {
    if (CONFIG.USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const dummyBlob = new Blob(["%PDF-1.4 Mock PDF Content"], { type: "application/pdf" });
      this._triggerDownload(dummyBlob, defaultFilename);
      return;
    }

    const response = await api.getBlob(`/reports/${endpoint}/`);
    const contentDisposition = response.headers?.get('Content-Disposition');
    let filename = defaultFilename;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    this._triggerDownload(response.data, filename);
  },

  async downloadCatalogPdf() {
    const today = new Date().toISOString().split('T')[0];
    return this.downloadReport('catalog-pdf', `catalogo_${today}.pdf`);
  },

  async downloadInventoryPdf() {
    const today = new Date().toISOString().split('T')[0];
    return this.downloadReport('inventory-pdf', `inventario_${today}.pdf`);
  },

  _triggerDownload(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};