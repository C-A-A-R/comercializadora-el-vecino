import { CONFIG } from '../../js/config.js';

export const ReportService = {
  async downloadReport(endpoint, defaultFilename) {
    if (CONFIG.USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const dummyBlob = new Blob(["%PDF-1.4 Mock PDF Content"], { type: "application/pdf" });
      this._triggerDownload(dummyBlob, defaultFilename);
      return;
    }

    const token = localStorage.getItem('el_vecino_jwt_token') 
      || sessionStorage.getItem('ev_admin_token') 
      || localStorage.getItem('ev_admin_token');

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${CONFIG.API_BASE_URL}/${endpoint}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Error en descarga de reporte: HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = defaultFilename;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    this._triggerDownload(blob, filename);
  },

  async downloadCatalogPdf() {
    const today = new Date().toISOString().split('T')[0];
    return this.downloadReport('catalog/export-pdf/', `catalogo_el_vecino_${today}.pdf`);
  },

  async downloadInventoryPdf() {
    const today = new Date().toISOString().split('T')[0];
    return this.downloadReport('catalog/export-pdf/', `inventario_el_vecino_${today}.pdf`);
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