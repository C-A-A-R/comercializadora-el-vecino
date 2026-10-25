import { ComboService } from '../../services/combo.service.js';
import { Toast } from '../../components/ui/Toast.js';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.js';

export const ComboListView = {
  allCombos: [],
  combos: [],
  currentTab: 'all',
  processingToggles: new Set(),

  async render() {
    const data = await ComboService.list();
    this.allCombos = data.results || [];
    this.combos = [...this.allCombos];

    const totalCount = this.allCombos.length;
    const activeCount = this.allCombos.filter(c => c.is_active).length;
    const pausedCount = this.allCombos.filter(c => !c.is_active).length;

    return `
      <div class="space-y-6">
        <!-- Encabezado Principal -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold uppercase tracking-wider text-electric-blue bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                Catálogo Promocional
              </span>
              <span class="text-xs text-gray-400">/</span>
              <span class="text-xs font-semibold text-gray-500">Gestión de Combos</span>
            </div>
            <h1 class="text-2xl font-bold text-deep-obsidian font-display">Combos & Paquetes Promocionales</h1>
            <p class="text-sm text-gray-500">Agrupa productos del catálogo en paquetes para promociones especiales.</p>
          </div>
          <div class="flex items-center gap-3">
            <a href="#/combos/new" class="inline-flex items-center gap-2 bg-electric-blue text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
              <span class="material-symbols-outlined text-lg">add</span>
              Crear Nuevo Combo
            </a>
          </div>
        </div>

        <!-- Tarjetas Rápidas de Resumen -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Combos</p>
              <p class="text-2xl font-bold text-deep-obsidian mt-0.5" id="kpi-total-combos">${totalCount}</p>
              <p class="text-[11px] text-gray-400">Registrados en catálogo</p>
            </div>
            <div class="p-2.5 bg-blue-50 text-electric-blue rounded-xl">
              <span class="material-symbols-outlined text-xl">package_2</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Combos Activos</p>
              <p class="text-2xl font-bold text-emerald-600 mt-0.5" id="kpi-active-combos">${activeCount}</p>
              <p class="text-[11px] text-gray-400">Publicados para consulta</p>
            </div>
            <div class="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <span class="material-symbols-outlined text-xl">check_circle</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Combos Pausados</p>
              <p class="text-2xl font-bold text-amber-600 mt-0.5" id="kpi-paused-combos">${pausedCount}</p>
              <p class="text-[11px] text-gray-400">Fuera de circulación</p>
            </div>
            <div class="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <span class="material-symbols-outlined text-xl">pause_circle</span>
            </div>
          </div>
        </div>

        <!-- Pestañas de Estado y Barra de Búsqueda -->
        <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-1.5" id="combo-tabs-container">
              <button data-tab="all" class="combo-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-deep-obsidian text-white transition">
                TODOS (${totalCount})
              </button>
              <button data-tab="active" class="combo-tab px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-surface text-gray-600 hover:bg-gray-200 transition">
                COMBOS ACTIVOS (${activeCount})
              </button>
              <button data-tab="paused" class="combo-tab px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-surface text-gray-600 hover:bg-gray-200 transition">
                COMBOS PAUSADOS (${pausedCount})
              </button>
            </div>

            <span id="combos-count-label" class="text-xs font-bold text-gray-500 whitespace-nowrap">
              Mostrando ${totalCount} de ${totalCount} combos
            </span>
          </div>

          <div class="relative">
            <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none">search</span>
            <input 
              type="text" 
              id="combo-search-input" 
              placeholder="Buscar combo por SKU, nombre o producto incluido..." 
              class="w-full pl-11 pr-10 py-2.5 bg-slate-surface border border-slate-border rounded-lg text-sm text-deep-obsidian placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:bg-white transition"
            />
            <button 
              id="combo-search-clear" 
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hidden p-1 rounded-full hover:bg-gray-100 transition"
              title="Limpiar búsqueda"
            >
              <span class="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>

        <!-- Tabla de Combos -->
        <div class="bg-white rounded-xl border border-slate-border shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-surface border-b border-slate-border text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th class="px-5 py-4 w-80">Combo e Identificador</th>
                  <th class="px-5 py-4">Productos Incluidos</th>
                  <th class="px-5 py-4 text-center w-36">Estado</th>
                  <th class="px-5 py-4 text-right w-28">Acciones</th>
                </tr>
              </thead>
              <tbody id="combos-table-body" class="divide-y divide-slate-border text-sm text-deep-obsidian">
                ${this.renderTableRows(this.combos)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  renderTableRows(combos) {
    if (!combos || combos.length === 0) {
      return `
        <tr>
          <td colspan="4" class="px-6 py-12 text-center text-gray-500">
            <span class="material-symbols-outlined text-4xl text-gray-300 block mb-2">search_off</span>
            <p class="font-bold text-sm text-gray-700">No se encontraron combos</p>
            <p class="text-xs text-gray-400 mt-1">Intenta con otro término o selecciona otra pestaña.</p>
          </td>
        </tr>
      `;
    }

    return combos.map(combo => {
      const imgUrl = combo.image_url || combo.image || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=200';
      const sku = combo.sku || `CMB-${String(combo.id).padStart(2, '0')}`;
      const items = combo.items || [];

      const itemsBadgesHtml = items.map(item => {
        const prod = item.product || {};
        const pName = prod.name || 'Producto';
        const pSku = prod.sku || `SKU-${prod.id || 'N/A'}`;
        const qty = item.quantity || 1;

        return `
          <div class="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-surface border border-slate-border rounded-lg text-xs hover:border-blue-300 transition" title="${pName}">
            <span class="w-4 h-4 rounded bg-blue-100 text-electric-blue text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              ${qty}x
            </span>
            <span class="font-medium text-deep-obsidian truncate max-w-[150px] text-[11px]">${pName}</span>
            <span class="text-[10px] text-gray-400 font-mono font-semibold">(${pSku})</span>
          </div>
        `;
      }).join('');

      return `
        <tr class="hover:bg-slate-surface/40 transition">
          <td class="px-5 py-4">
            <div class="flex items-start gap-3">
              <img src="${imgUrl}" alt="${combo.name}" class="w-14 h-14 object-cover rounded-xl border border-slate-border flex-shrink-0" />
              <div class="space-y-1 min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-100 text-gray-700 border border-gray-200">
                    ${sku}
                  </span>
                </div>
                <p class="font-bold text-deep-obsidian text-sm leading-tight truncate">${combo.name}</p>
                <p class="text-xs text-gray-500 line-clamp-1">${combo.description || 'Paquete promocional'}</p>
              </div>
            </div>
          </td>

          <td class="px-5 py-4">
            <div class="flex flex-wrap items-center gap-1.5 max-w-xl">
              ${itemsBadgesHtml || '<span class="text-xs text-gray-400">Sin productos vinculados</span>'}
            </div>
          </td>

          <td class="px-5 py-4 whitespace-nowrap text-center">
            <div class="flex flex-col items-center gap-1">
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  data-action="toggle-status" 
                  data-id="${combo.id}" 
                  class="sr-only peer" 
                  ${combo.is_active ? 'checked' : ''}
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <span class="text-[10px] font-bold status-label-${combo.id} ${combo.is_active ? 'text-emerald-700' : 'text-gray-400'}">
                ${combo.is_active ? 'Activo' : 'Pausado'}
              </span>
            </div>
          </td>

          <td class="px-5 py-4 whitespace-nowrap text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button 
                data-action="delete" 
                data-id="${combo.id}" 
                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" 
                title="Eliminar combo"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  filterCombos() {
    const searchInput = document.getElementById('combo-search-input');
    const clearBtn = document.getElementById('combo-search-clear');
    const tableBody = document.getElementById('combos-table-body');
    const countLabel = document.getElementById('combos-count-label');

    const query = (searchInput?.value || '').toLowerCase().trim();

    if (clearBtn) {
      clearBtn.classList.toggle('hidden', query.length === 0);
    }

    this.combos = this.allCombos.filter(combo => {
      let matchesTab = true;
      if (this.currentTab === 'active') {
        matchesTab = Boolean(combo.is_active);
      } else if (this.currentTab === 'paused') {
        matchesTab = !combo.is_active;
      }

      const name = (combo.name || '').toLowerCase();
      const sku = (combo.sku || '').toLowerCase();
      const desc = (combo.description || '').toLowerCase();
      const itemsMatch = (combo.items || []).some(i => {
        const pName = (i.product?.name || '').toLowerCase();
        const pSku = (i.product?.sku || '').toLowerCase();
        return pName.includes(query) || pSku.includes(query);
      });

      const matchesQuery = !query || name.includes(query) || sku.includes(query) || desc.includes(query) || itemsMatch;

      return matchesTab && matchesQuery;
    });

    if (countLabel) {
      countLabel.textContent = `Mostrando ${this.combos.length} de ${this.allCombos.length} combos`;
    }

    if (tableBody) {
      tableBody.innerHTML = this.renderTableRows(this.combos);
    }
  },

  async bindEvents() {
    const searchInput = document.getElementById('combo-search-input');
    const clearBtn = document.getElementById('combo-search-clear');
    const tableBody = document.getElementById('combos-table-body');

    searchInput?.addEventListener('input', () => this.filterCombos());
    clearBtn?.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      this.filterCombos();
    });

    document.querySelectorAll('.combo-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.currentTab = tab;

        document.querySelectorAll('.combo-tab').forEach(b => {
          b.classList.remove('bg-deep-obsidian', 'text-white', 'font-bold');
          b.classList.add('bg-slate-surface', 'text-gray-600', 'font-semibold');
        });
        e.currentTarget.classList.remove('bg-slate-surface', 'text-gray-600');
        e.currentTarget.classList.add('bg-deep-obsidian', 'text-white', 'font-bold');

        this.filterCombos();
      });
    });

    if (tableBody) {
      tableBody.onchange = null;
      tableBody.onchange = async (e) => {
        const toggle = e.target.closest('[data-action="toggle-status"]');
        if (!toggle) return;

        const id = toggle.dataset.id;
        if (this.processingToggles.has(id)) return;

        const newStatus = toggle.checked;
        this.processingToggles.add(id);
        toggle.disabled = true;

        try {
          await ComboService.toggleActive(id, newStatus);
          Toast.show(`Combo ${newStatus ? 'activado' : 'pausado'} con éxito`, 'success');

          const c = this.allCombos.find(item => item.id == id);
          if (c) c.is_active = newStatus;

          const activeCount = this.allCombos.filter(item => item.is_active).length;
          const pausedCount = this.allCombos.filter(item => !item.is_active).length;
          const kpiActive = document.getElementById('kpi-active-combos');
          const kpiPaused = document.getElementById('kpi-paused-combos');
          if (kpiActive) kpiActive.textContent = activeCount;
          if (kpiPaused) kpiPaused.textContent = pausedCount;

          const label = document.querySelector(`.status-label-${id}`);
          if (label) {
            label.textContent = newStatus ? 'Activo' : 'Pausado';
            label.className = `text-[10px] font-bold status-label-${id} ${newStatus ? 'text-emerald-700' : 'text-gray-400'}`;
          }
        } catch (err) {
          console.error(err);
          toggle.checked = !newStatus;
          Toast.show('Error al cambiar estado del combo', 'error');
        } finally {
          toggle.disabled = false;
          this.processingToggles.delete(id);
        }
      };
    }

    document.addEventListener('click', async (e) => {
      const btnDelete = e.target.closest('[data-action="delete"]');
      if (btnDelete) {
        const id = btnDelete.dataset.id;
        const confirmed = await ConfirmDialog.show({
          title: 'Eliminar Combo',
          message: '¿Está seguro de eliminar este paquete promocional? Esta acción no se puede deshacer.',
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
          type: 'danger'
        });

        if (confirmed) {
          try {
            await ComboService.delete(id);
            Toast.show('Combo eliminado con éxito', 'success');
            this.allCombos = this.allCombos.filter(c => c.id != id);
            this.filterCombos();
          } catch (err) {
            console.error(err);
            Toast.show('Error al eliminar combo', 'error');
          }
        }
      }
    });
  }
};