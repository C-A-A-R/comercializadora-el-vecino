import { ReportService } from '../../services/report.service.js';
import { Toast } from '../../components/ui/Toast.js';

export const ReportView = {
  async render() {
    return `
      <div class="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-deep-obsidian font-display">Exportación de Reportes</h1>
          <p class="text-sm text-gray-500">Genera documentos PDF del catálogo oficial e inventarios en tiempo real.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Reporte de Catálogo -->
          <div class="bg-white p-6 rounded-xl border border-slate-border shadow-sm flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-electric-blue">
                <span class="material-symbols-outlined">menu_book</span>
              </div>
              <h3 class="font-bold text-lg text-deep-obsidian font-display">Catálogo de Productos PDF</h3>
              <p class="text-xs text-gray-500">Descarga la lista de productos activos con sus imágenes, precios y especificaciones técnicas.</p>
            </div>
            <button id="download-catalog-btn" class="w-full py-2.5 px-4 bg-electric-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-sm">download</span>
              <span>Exportar catálogo PDF</span>
            </button>
          </div>

          <!-- Reporte de Inventario -->
          <div class="bg-white p-6 rounded-xl border border-slate-border shadow-sm flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <span class="material-symbols-outlined">inventory_2</span>
              </div>
              <h3 class="font-bold text-lg text-deep-obsidian font-display">Reporte de Inventario PDF</h3>
              <p class="text-xs text-gray-500">Genera un informe detallado con el stock actual, niveles mínimos, SKU y valor total del inventario.</p>
            </div>
            <button id="download-inventory-btn" class="w-full py-2.5 px-4 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-sm">download</span>
              <span>Exportar inventario PDF</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    this._bindButton('download-catalog-btn', () => ReportService.downloadCatalogPdf(), 'Catálogo');
    this._bindButton('download-inventory-btn', () => ReportService.downloadInventoryPdf(), 'Inventario');
  },

  _bindButton(buttonId, downloadFn, label) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    btn.addEventListener('click', async () => {
      const originalContent = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `
        <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
        <span>Generando PDF...</span>
      `;

      try {
        await downloadFn();
        Toast.show({ message: `Reporte de ${label} descargado con éxito`, type: 'success' });
      } catch (err) {
        Toast.show({ message: `Error al generar PDF de ${label}. Intente de nuevo.`, type: 'error' });
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalContent;
      }
    });
  }
};