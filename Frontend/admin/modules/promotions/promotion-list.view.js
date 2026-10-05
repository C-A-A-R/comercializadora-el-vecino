import { PromotionService } from '../../services/promotion.service.js';
import { PromotionCalculator } from './promotions.calculator.js';
import { Toast } from '../../components/ui/Toast.js';

export const PromotionListView = {
  async render() {
    return `
      <div class="space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-deep-obsidian font-display">Gestión de Promociones</h1>
            <p class="text-sm text-gray-500">Administración de descuentos y vigencias promocionales</p>
          </div>
          <a href="#/promotions/new" class="inline-flex items-center gap-2 bg-electric-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            <span class="material-symbols-outlined text-sm">add</span> Nueva Promoción
          </a>
        </div>

        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-border flex flex-wrap gap-4 items-center justify-between">
          <div class="flex items-center gap-2 flex-1 min-w-[240px]">
            <span class="material-symbols-outlined text-gray-400">search</span>
            <input type="text" id="promo-search" placeholder="Buscar por nombre o producto..." class="w-full bg-transparent border-none focus:outline-none text-sm" />
          </div>
          <select id="promo-status-filter" class="border border-slate-border rounded-lg px-3 py-1.5 text-sm bg-white">
            <option value="">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="pending">Pendientes</option>
            <option value="expired">Vencidas / Inactivas</option>
          </select>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-border overflow-hidden">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-surface text-gray-600 font-medium border-b border-slate-border">
              <tr>
                <th class="p-4">Promoción</th>
                <th class="p-4">Producto</th>
                <th class="p-4">Descuento</th>
                <th class="p-4">Vigencia</th>
                <th class="p-4">Estado</th>
                <th class="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody id="promo-table-body" class="divide-y divide-slate-border">
              <tr><td colspan="6" class="p-4 text-center text-gray-500">Cargando promociones...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async bindEvents() {
    await this.loadPromotions();

    document.getElementById('promo-search')?.addEventListener('input', () => this.loadPromotions());
    document.getElementById('promo-status-filter')?.addEventListener('change', () => this.loadPromotions());
  },

  async loadPromotions() {
    const tbody = document.getElementById('promo-table-body');
    const search = document.getElementById('promo-search')?.value || '';
    const status = document.getElementById('promo-status-filter')?.value || '';

    try {
      const data = await PromotionService.list({ search, status });
      if (!data.results || data.results.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">No se encontraron promociones registrados.</td></tr>`;
        return;
      }

      tbody.innerHTML = data.results.map(promo => {
        const badge = PromotionCalculator.getStatusBadge(promo.start_date, promo.end_date, promo.is_active);
        const discountText = promo.discount_type === 'percentage' ? `${promo.value}%` : `$${promo.value} USD`;
        const start = new Date(promo.start_date).toLocaleDateString();
        const end = new Date(promo.end_date).toLocaleDateString();

        return `
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="p-4 font-semibold text-deep-obsidian">${promo.name}</td>
            <td class="p-4 text-gray-700">${promo.product?.name || 'N/A'}</td>
            <td class="p-4 font-medium text-neon-magenta">${discountText}</td>
            <td class="p-4 text-xs text-gray-500">${start} - ${end}</td>
            <td class="p-4">${badge}</td>
            <td class="p-4 text-right space-x-2">
              <button data-toggle-id="${promo.id}" data-active="${promo.is_active}" class="text-xs px-2.5 py-1 rounded border border-slate-border hover:bg-slate-100 font-medium">
                ${promo.is_active ? 'Desactivar' : 'Activar'}
              </button>
              <button data-delete-id="${promo.id}" class="text-xs px-2.5 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 font-medium">
                Eliminar
              </button>
            </td>
          </tr>
        `;
      }).join('');

      this.bindTableActions();
    } catch (err) {
      console.error(err);
      Toast.show('Error al cargar promociones', 'error');
    }
  },

  bindTableActions() {
    document.querySelectorAll('[data-toggle-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-toggle-id');
        const currentActive = e.target.getAttribute('data-active') === 'true';
        try {
          await PromotionService.toggleActive(id, !currentActive);
          Toast.show(`Promoción ${!currentActive ? 'activada' : 'desactivada'} con éxito`, 'success');
          await this.loadPromotions();
        } catch (err) {
          console.error(err);
          Toast.show('No se pudo cambiar el estado de la promoción', 'error');
        }
      });
    });

    document.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-delete-id');
        if (!confirm('¿Desea eliminar permanentemente esta promoción?')) return;
        try {
          await PromotionService.delete(id);
          Toast.show('Promoción eliminada con éxito', 'success');
          await this.loadPromotions();
        } catch (err) {
          console.error(err);
          Toast.show('No se pudo eliminar la promoción', 'error');
        }
      });
    });
  }
};