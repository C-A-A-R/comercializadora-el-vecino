import { ComboService } from '../../services/combo.service.js';
import { ComboBuilder } from './combo.builder.js';
import { Toast } from '../../components/ui/Toast.js';

export const ComboListView = {
  async render() {
    return `
      <div class="space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-deep-obsidian font-display">Armador de Combos</h1>
            <p class="text-sm text-gray-500">Agrupa productos y configura ofertas de paquete</p>
          </div>
          <a href="#/combos/new" class="inline-flex items-center gap-2 bg-electric-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            <span class="material-symbols-outlined text-sm">add</span> Crear Nuevo Combo
          </a>
        </div>

        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-border flex items-center gap-2">
          <span class="material-symbols-outlined text-gray-400">search</span>
          <input type="text" id="combo-search" placeholder="Buscar combo por nombre..." class="w-full bg-transparent border-none focus:outline-none text-sm" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="combos-grid">
          <p class="col-span-full text-center text-gray-500 py-8">Cargando combos...</p>
        </div>
      </div>
    `;
  },

  async bindEvents() {
    await this.loadCombos();
    document.getElementById('combo-search')?.addEventListener('input', () => this.loadCombos());
  },

  async loadCombos() {
    const grid = document.getElementById('combos-grid');
    const search = document.getElementById('combo-search')?.value || '';

    try {
      const data = await ComboService.list({ search });
      if (!data.results || data.results.length === 0) {
        grid.innerHTML = `<div class="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl border border-slate-border">No hay combos registrados.</div>`;
        return;
      }

      grid.innerHTML = data.results.map(combo => {
        const calc = ComboBuilder.calculateTotals(combo.items, combo.price_combo_usd);
        const productsSummary = combo.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ');

        return `
          <div class="bg-white border border-slate-border rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div class="space-y-3">
              ${combo.image_url ? `<img src="${combo.image_url}" alt="${combo.name}" class="w-full h-36 object-cover rounded-lg border border-slate-border" />` : ''}
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-bold text-lg text-deep-obsidian font-display">${combo.name}</h3>
                <span class="px-2 py-0.5 text-xs font-bold rounded ${combo.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}">
                  ${combo.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p class="text-xs text-gray-500 line-clamp-2">${combo.description}</p>
              <div class="text-xs bg-slate-surface p-2 rounded text-gray-700">
                <span class="font-semibold block text-gray-900">Incluye:</span> ${productsSummary}
              </div>
            </div>

            <div class="pt-3 border-t border-slate-border space-y-2">
              <div class="flex justify-between items-baseline text-xs">
                <span class="text-gray-400 line-through">${calc.regularTotalUsdFormatted} USD</span>
                <span class="font-bold text-neon-magenta">Ahorro: ${calc.savedUsdFormatted} (${calc.savedPercentage})</span>
              </div>
              <div class="flex justify-between items-baseline">
                <span class="text-xs font-medium text-gray-500">Precio Combo:</span>
                <div class="text-right">
                  <span class="text-lg font-bold text-electric-blue">${calc.offerPriceUsdFormatted} USD</span>
                  <span class="block text-xs text-gray-400">${calc.offerPriceCopFormatted}</span>
                </div>
              </div>
              <button data-toggle-id="${combo.id}" data-active="${combo.is_active}" class="w-full mt-2 py-1.5 text-xs border border-slate-border rounded-lg hover:bg-slate-50 font-medium">
                ${combo.is_active ? 'Desactivar Combo' : 'Activar Combo'}
              </button>
            </div>
          </div>
        `;
      }).join('');

      this.bindCardActions();
    } catch (err) {
      Toast.show({ message: 'Error al cargar la lista de combos', type: 'error' });
    }
  },

  bindCardActions() {
    document.querySelectorAll('[data-toggle-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-toggle-id');
        const currentActive = e.target.getAttribute('data-active') === 'true';
        try {
          await ComboService.toggleActive(id, !currentActive);
          Toast.show({ message: `Estado del combo actualizado`, type: 'success' });
          await this.loadCombos();
        } catch (err) {
          Toast.show({ message: 'No se pudo actualizar el estado', type: 'error' });
        }
      });
    });
  }
};