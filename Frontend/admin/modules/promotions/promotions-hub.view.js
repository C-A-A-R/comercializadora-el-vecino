import { ComboService } from '../../services/combo.service.js';
import { PromotionService } from '../../services/promotion.service.js';
import { Toast } from '../../components/ui/Toast.js';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.js';

export const PromotionsHubView = {
  activeMainTab: 'combos', // 'combos' | 'promotions'
  
  // Datos de Combos
  allCombos: [],
  combos: [],
  comboTab: 'all',

  // Datos de Promociones
  allPromotions: [],
  promotions: [],
  promoFilter: '',
  selectedDaysToRenew: 30,

  async render() {
    try {
      const [combosData, promosData] = await Promise.all([
        ComboService.list(),
        PromotionService.list()
      ]);
      this.allCombos = combosData.results || [];
      this.combos = [...this.allCombos];

      this.allPromotions = promosData.results || [];
      this.promotions = [...this.allPromotions];
    } catch (err) {
      console.error('[PromotionsHubView] Error al cargar datos:', err);
      this.allCombos = [];
      this.combos = [];
      this.allPromotions = [];
      this.promotions = [];
    }

    const totalCombos = this.allCombos.length;
    const activeCombos = this.allCombos.filter(c => c.is_active).length;
    const totalPromos = this.allPromotions.length;
    const activePromos = this.allPromotions.filter(p => p.is_active).length;
    const totalOffers = totalCombos + totalPromos;

    return `
      <div class="space-y-6">
        <!-- Encabezado Principal y Acciones -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold uppercase tracking-wider text-electric-blue bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                Catálogo Promocional
              </span>
              <span class="text-xs text-gray-400">/</span>
              <span class="text-xs font-semibold text-gray-500">Ofertas & Paquetes</span>
            </div>
            <h1 class="text-2xl font-bold text-deep-obsidian font-display">Promociones & Combos</h1>
            <p class="text-sm text-gray-500">Gestione los paquetes de productos y campañas promocionales del sistema.</p>
          </div>
          <div class="flex flex-wrap items-center gap-2.5">
            <a href="#/combos/new" class="inline-flex items-center gap-1.5 bg-electric-blue text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition shadow-sm">
              <span class="material-symbols-outlined text-base">package_2</span>
              + Armar Nuevo Combo
            </a>
            <a href="#/promotions/new" class="inline-flex items-center gap-1.5 bg-slate-800 text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-black transition shadow-sm">
              <span class="material-symbols-outlined text-base">sell</span>
              + Nueva Promoción
            </a>
          </div>
        </div>

        <!-- Tarjetas Rápidas de Resumen -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Ofertas</p>
              <p class="text-2xl font-bold text-deep-obsidian mt-0.5">${totalOffers}</p>
              <p class="text-[11px] text-gray-400">${totalCombos} combos · ${totalPromos} promociones</p>
            </div>
            <div class="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <span class="material-symbols-outlined text-xl">auto_awesome_motion</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Combos Activos</p>
              <p class="text-2xl font-bold text-emerald-600 mt-0.5" id="kpi-hub-active-combos">${activeCombos}</p>
              <p class="text-[11px] text-gray-400">Paquetes disponibles</p>
            </div>
            <div class="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <span class="material-symbols-outlined text-xl">package_2</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Promociones Activas</p>
              <p class="text-2xl font-bold text-blue-600 mt-0.5" id="kpi-hub-active-promos">${activePromos}</p>
              <p class="text-[11px] text-gray-400">Campañas vigentes</p>
            </div>
            <div class="p-2.5 bg-blue-50 text-electric-blue rounded-xl">
              <span class="material-symbols-outlined text-xl">sell</span>
            </div>
          </div>
        </div>

        <!-- Selector Principal de Pestañas (Combos vs Promociones) -->
        <div class="flex items-center gap-2 border-b border-slate-border pb-px">
          <button 
            id="tab-btn-combos" 
            class="main-hub-tab flex items-center gap-2 px-5 py-3 border-b-2 font-display text-sm font-bold transition ${this.activeMainTab === 'combos' ? 'border-electric-blue text-electric-blue bg-blue-50/50 rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-800'}"
          >
            <span class="material-symbols-outlined text-lg">package_2</span>
            <span>Paquetes & Combos (${totalCombos})</span>
          </button>
          <button 
            id="tab-btn-promos" 
            class="main-hub-tab flex items-center gap-2 px-5 py-3 border-b-2 font-display text-sm font-bold transition ${this.activeMainTab === 'promotions' ? 'border-electric-blue text-electric-blue bg-blue-50/50 rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-800'}"
          >
            <span class="material-symbols-outlined text-lg">sell</span>
            <span>Promociones de Productos (${totalPromos})</span>
          </button>
        </div>

        <!-- CONTENIDO TAB 1: COMBOS & PAQUETES -->
        <div id="hub-combos-section" class="${this.activeMainTab === 'combos' ? 'space-y-6' : 'hidden space-y-6'}">
          <!-- Filtros de Combos -->
          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex flex-wrap items-center gap-1.5" id="hub-combo-subtabs">
                <button data-combo-tab="all" class="combo-subtab px-3 py-1.5 rounded-lg text-xs font-bold bg-deep-obsidian text-white transition">
                  TODOS (${totalCombos})
                </button>
                <button data-combo-tab="active" class="combo-subtab px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-surface text-gray-600 hover:bg-gray-200 transition">
                  COMBOS ACTIVOS (${activeCombos})
                </button>
                <button data-combo-tab="paused" class="combo-subtab px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-surface text-gray-600 hover:bg-gray-200 transition">
                  PAUSADOS (${totalCombos - activeCombos})
                </button>
              </div>
              <span id="hub-combos-count" class="text-xs font-bold text-gray-500">
                Mostrando ${totalCombos} combos
              </span>
            </div>

            <!-- Buscador de Combos -->
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none">search</span>
              <input 
                type="text" 
                id="hub-combo-search" 
                placeholder="Buscar combo por SKU, nombre o producto incluido..." 
                class="w-full pl-11 pr-10 py-2.5 bg-slate-surface border border-slate-border rounded-lg text-sm text-deep-obsidian placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:bg-white transition"
              />
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
                <tbody id="hub-combos-table-body" class="divide-y divide-slate-border text-sm text-deep-obsidian">
                  ${this.renderCombosRows(this.combos)}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- CONTENIDO TAB 2: PROMOCIONES DE PRODUCTOS -->
        <div id="hub-promos-section" class="${this.activeMainTab === 'promotions' ? 'space-y-6' : 'hidden space-y-6'}">
          <!-- Filtros de Promociones -->
          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="relative flex-1">
              <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none">search</span>
              <input 
                type="text" 
                id="hub-promo-search" 
                placeholder="Buscar promoción por nombre o producto..." 
                class="w-full pl-11 pr-10 py-2.5 bg-slate-surface border border-slate-border rounded-lg text-sm text-deep-obsidian placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:bg-white transition"
              />
            </div>
            <select id="hub-promo-status-filter" class="px-3 py-2.5 bg-slate-surface border border-slate-border rounded-lg text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-electric-blue cursor-pointer">
              <option value="">Todas las promociones</option>
              <option value="active">Activas / Vigentes</option>
              <option value="pending">Próximas</option>
              <option value="expired">Pausadas / Vencidas</option>
            </select>
          </div>

          <!-- Tabla de Promociones -->
          <div class="bg-white rounded-xl border border-slate-border shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-surface border-b border-slate-border text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th class="px-5 py-4 w-72">Promoción</th>
                    <th class="px-5 py-4 min-w-[200px]">Producto Asociado</th>
                    <th class="px-5 py-4 w-52">Vigencia</th>
                    <th class="px-5 py-4 text-center w-32">Estado</th>
                    <th class="px-5 py-4 text-right w-44">Acciones</th>
                  </tr>
                </thead>
                <tbody id="hub-promos-table-body" class="divide-y divide-slate-border text-sm text-deep-obsidian">
                  ${this.renderPromosRows(this.promotions)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Rápido: Poner en Vigencia / Renovar Promoción -->
      <dialog id="modal-renew-promo" class="rounded-2xl border border-slate-border shadow-2xl p-6 max-w-md w-full backdrop:bg-slate-900/50">
        <form id="form-renew-promo" class="space-y-4">
          <div class="flex items-center justify-between border-b border-slate-border pb-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-electric-blue text-xl">event_repeat</span>
              <h3 class="font-bold text-lg text-deep-obsidian font-display">Poner en Vigencia</h3>
            </div>
            <button type="button" id="btn-close-renew-modal" class="text-gray-400 hover:text-gray-600 p-1 rounded-full">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <input type="hidden" id="renew-promo-id">

          <div class="bg-slate-surface p-3 rounded-xl border border-slate-border">
            <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Promoción</p>
            <p id="renew-promo-name" class="font-bold text-sm text-deep-obsidian mt-0.5">-</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Extender Vigencia Por:</label>
            <div class="grid grid-cols-3 gap-2">
              <button type="button" data-days="15" class="renew-days-btn py-2 px-3 text-xs font-bold rounded-xl border border-slate-border text-gray-700 hover:bg-blue-50 transition">
                +15 Días
              </button>
              <button type="button" data-days="30" class="renew-days-btn py-2 px-3 text-xs font-bold rounded-xl border-2 border-electric-blue bg-blue-50 text-electric-blue transition">
                +30 Días
              </button>
              <button type="button" data-days="60" class="renew-days-btn py-2 px-3 text-xs font-bold rounded-xl border border-slate-border text-gray-700 hover:bg-blue-50 transition">
                +60 Días
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">O Seleccionar Fecha de Fin:</label>
            <input type="datetime-local" id="renew-custom-end" class="w-full px-3 py-2 border border-slate-border rounded-xl text-xs font-medium focus:ring-2 focus:ring-electric-blue outline-none">
          </div>

          <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-border">
            <button type="button" id="btn-cancel-renew" class="px-4 py-2 border border-slate-border text-gray-600 rounded-lg text-xs font-bold hover:bg-slate-surface transition">
              Cancelar
            </button>
            <button type="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
              <span class="material-symbols-outlined text-sm">check_circle</span>
              Activar en Vigencia
            </button>
          </div>
        </form>
      </dialog>
    `;
  },

  renderCombosRows(combos) {
    if (!combos || combos.length === 0) {
      return `
        <tr>
          <td colspan="4" class="px-6 py-12 text-center text-gray-500">
            <span class="material-symbols-outlined text-4xl text-gray-300 block mb-2">search_off</span>
            <p class="font-bold text-sm text-gray-700">No se encontraron combos</p>
            <p class="text-xs text-gray-400 mt-1">Intente con otro término o cree un nuevo combo.</p>
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
                <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-100 text-gray-700 border border-gray-200">
                  ${sku}
                </span>
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
                  data-action="toggle-hub-combo-status" 
                  data-id="${combo.id}" 
                  class="sr-only peer" 
                  ${combo.is_active ? 'checked' : ''}
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <span class="text-[10px] font-bold ${combo.is_active ? 'text-emerald-700' : 'text-gray-400'}">
                ${combo.is_active ? 'Activo' : 'Pausado'}
              </span>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button data-action="delete-hub-combo" data-id="${combo.id}" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar combo">
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderPromosRows(promotions) {
    if (!promotions || promotions.length === 0) {
      return `
        <tr>
          <td colspan="5" class="px-6 py-12 text-center text-gray-500">
            <span class="material-symbols-outlined text-4xl text-gray-300 block mb-2">sell</span>
            <p class="font-bold text-sm text-gray-700">No hay promociones registradas</p>
            <p class="text-xs text-gray-400 mt-1">Cree una nueva promoción para destacar productos individuales.</p>
          </td>
        </tr>
      `;
    }

    const now = new Date();

    return promotions.map(promo => {
      const prodName = promo.product?.name || promo.product_name || 'Producto en promoción';
      const start = promo.start_date ? new Date(promo.start_date) : null;
      const end = promo.end_date ? new Date(promo.end_date) : null;

      const isExpired = end && now > end;
      const isPending = start && now < start;

      let vigenciaBadge = `<span class="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Vigente</span>`;
      if (isExpired) {
        vigenciaBadge = `<span class="text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">Vencida</span>`;
      } else if (isPending) {
        vigenciaBadge = `<span class="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Próxima</span>`;
      } else if (!promo.is_active) {
        vigenciaBadge = `<span class="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Pausada</span>`;
      }

      const startStr = start ? start.toLocaleDateString() : '-';
      const endStr = end ? end.toLocaleDateString() : '-';

      return `
        <tr class="hover:bg-slate-surface/40 transition">
          <td class="px-5 py-4">
            <div class="space-y-0.5">
              <p class="font-bold text-deep-obsidian text-sm">${promo.name}</p>
              <p class="text-xs text-gray-500 line-clamp-1">${promo.description || 'Promoción especial'}</p>
            </div>
          </td>
          <td class="px-5 py-4 font-semibold text-gray-800 text-xs">
            ${prodName}
          </td>
          <td class="px-5 py-4 whitespace-nowrap">
            <div class="space-y-1">
              <div class="flex items-center gap-1.5 text-xs text-gray-700">
                <span class="material-symbols-outlined text-sm text-gray-400">calendar_today</span>
                <span>${startStr} → ${endStr}</span>
              </div>
              <div>${vigenciaBadge}</div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-center">
            <div class="flex flex-col items-center gap-1">
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  data-action="toggle-hub-promo-status" 
                  data-id="${promo.id}" 
                  class="sr-only peer" 
                  ${promo.is_active ? 'checked' : ''}
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <span class="text-[10px] font-bold ${promo.is_active ? 'text-emerald-700' : 'text-gray-400'}">
                ${promo.is_active ? 'Activa' : 'Pausada'}
              </span>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-right">
            <div class="flex items-center justify-end gap-1">
              <button 
                data-action="renew-hub-promo" 
                data-id="${promo.id}" 
                data-name="${promo.name}" 
                class="px-2.5 py-1 text-xs font-bold text-electric-blue bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition flex items-center gap-1" 
                title="Poner en vigencia / Extender fecha"
              >
                <span class="material-symbols-outlined text-sm">event_repeat</span>
                <span>Vigencia</span>
              </button>
              <button 
                data-action="delete-hub-promo" 
                data-id="${promo.id}" 
                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" 
                title="Eliminar promoción"
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
    const search = document.getElementById('hub-combo-search')?.value.toLowerCase().trim() || '';
    const tableBody = document.getElementById('hub-combos-table-body');
    const countLabel = document.getElementById('hub-combos-count');

    this.combos = this.allCombos.filter(combo => {
      let matchesTab = true;
      if (this.comboTab === 'active') matchesTab = Boolean(combo.is_active);
      if (this.comboTab === 'paused') matchesTab = !combo.is_active;

      const name = (combo.name || '').toLowerCase();
      const sku = (combo.sku || '').toLowerCase();
      const desc = (combo.description || '').toLowerCase();
      const itemsMatch = (combo.items || []).some(i => {
        const pName = (i.product?.name || '').toLowerCase();
        const pSku = (i.product?.sku || '').toLowerCase();
        return pName.includes(search) || pSku.includes(search);
      });

      const matchesQuery = !search || name.includes(search) || sku.includes(search) || desc.includes(search) || itemsMatch;
      return matchesTab && matchesQuery;
    });

    if (countLabel) countLabel.textContent = `Mostrando ${this.combos.length} combos`;
    if (tableBody) tableBody.innerHTML = this.renderCombosRows(this.combos);
  },

  filterPromos() {
    const search = document.getElementById('hub-promo-search')?.value.toLowerCase().trim() || '';
    const status = document.getElementById('hub-promo-status-filter')?.value || '';
    const tableBody = document.getElementById('hub-promos-table-body');

    this.promotions = this.allPromotions.filter(p => {
      const name = (p.name || '').toLowerCase();
      const prodName = (p.product?.name || p.product_name || '').toLowerCase();
      const matchesSearch = !search || name.includes(search) || prodName.includes(search);

      let matchesStatus = true;
      const now = new Date();
      const start = p.start_date ? new Date(p.start_date) : null;
      const end = p.end_date ? new Date(p.end_date) : null;

      if (status === 'active') {
        matchesStatus = p.is_active && (!start || now >= start) && (!end || now <= end);
      } else if (status === 'pending') {
        matchesStatus = p.is_active && start && now < start;
      } else if (status === 'expired') {
        matchesStatus = !p.is_active || (end && now > end);
      }

      return matchesSearch && matchesStatus;
    });

    if (tableBody) tableBody.innerHTML = this.renderPromosRows(this.promotions);
  },

  bindEvents() {
    const btnTabCombos = document.getElementById('tab-btn-combos');
    const btnTabPromos = document.getElementById('tab-btn-promos');
    const sectionCombos = document.getElementById('hub-combos-section');
    const sectionPromos = document.getElementById('hub-promos-section');

    btnTabCombos?.addEventListener('click', () => {
      this.activeMainTab = 'combos';
      btnTabCombos.classList.add('border-electric-blue', 'text-electric-blue', 'bg-blue-50/50', 'rounded-t-xl');
      btnTabCombos.classList.remove('border-transparent', 'text-gray-500');
      btnTabPromos.classList.remove('border-electric-blue', 'text-electric-blue', 'bg-blue-50/50', 'rounded-t-xl');
      btnTabPromos.classList.add('border-transparent', 'text-gray-500');

      sectionCombos?.classList.remove('hidden');
      sectionPromos?.classList.add('hidden');
    });

    btnTabPromos?.addEventListener('click', () => {
      this.activeMainTab = 'promotions';
      btnTabPromos.classList.add('border-electric-blue', 'text-electric-blue', 'bg-blue-50/50', 'rounded-t-xl');
      btnTabPromos.classList.remove('border-transparent', 'text-gray-500');
      btnTabCombos.classList.remove('border-electric-blue', 'text-electric-blue', 'bg-blue-50/50', 'rounded-t-xl');
      btnTabCombos.classList.add('border-transparent', 'text-gray-500');

      sectionPromos?.classList.remove('hidden');
      sectionCombos?.classList.add('hidden');
    });

    const comboSearch = document.getElementById('hub-combo-search');
    comboSearch?.addEventListener('input', () => this.filterCombos());

    document.querySelectorAll('.combo-subtab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.comboTab = e.currentTarget.dataset.comboTab;
        document.querySelectorAll('.combo-subtab').forEach(b => {
          b.classList.remove('bg-deep-obsidian', 'text-white', 'font-bold');
          b.classList.add('bg-slate-surface', 'text-gray-600', 'font-semibold');
        });
        e.currentTarget.classList.remove('bg-slate-surface', 'text-gray-600');
        e.currentTarget.classList.add('bg-deep-obsidian', 'text-white', 'font-bold');
        this.filterCombos();
      });
    });

    document.getElementById('hub-promo-search')?.addEventListener('input', () => this.filterPromos());
    document.getElementById('hub-promo-status-filter')?.addEventListener('change', () => this.filterPromos());

    document.addEventListener('change', async (e) => {
      const toggleCombo = e.target.closest('[data-action="toggle-hub-combo-status"]');
      if (toggleCombo) {
        const id = toggleCombo.dataset.id;
        const newStatus = toggleCombo.checked;
        try {
          await ComboService.toggleActive(id, newStatus);
          Toast.show(`Combo ${newStatus ? 'activado' : 'pausado'} con éxito`, 'success');
          const c = this.allCombos.find(item => item.id == id);
          if (c) c.is_active = newStatus;
          this.filterCombos();
        } catch (err) {
          console.error(err);
          toggleCombo.checked = !newStatus;
          Toast.show('Error al cambiar estado del combo', 'error');
        }
        return;
      }

      const togglePromo = e.target.closest('[data-action="toggle-hub-promo-status"]');
      if (togglePromo) {
        const id = togglePromo.dataset.id;
        const newStatus = togglePromo.checked;
        try {
          await PromotionService.toggleActive(id, newStatus);
          Toast.show(`Promoción ${newStatus ? 'activada' : 'pausada'} con éxito`, 'success');
          const p = this.allPromotions.find(item => item.id == id);
          if (p) p.is_active = newStatus;

          const activeCount = this.allPromotions.filter(item => item.is_active).length;
          const kpiActive = document.getElementById('kpi-hub-active-promos');
          if (kpiActive) kpiActive.textContent = activeCount;

          this.filterPromos();
        } catch (err) {
          console.error(err);
          togglePromo.checked = !newStatus;
          Toast.show('Error al cambiar estado de la promoción', 'error');
        }
      }
    });

    document.addEventListener('click', async (e) => {
      const btnDelCombo = e.target.closest('[data-action="delete-hub-combo"]');
      if (btnDelCombo) {
        const id = btnDelCombo.dataset.id;
        const confirmed = await ConfirmDialog.show({
          title: 'Eliminar Combo',
          message: '¿Está seguro de eliminar este combo promocional?',
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
        return;
      }

      const btnDelPromo = e.target.closest('[data-action="delete-hub-promo"]');
      if (btnDelPromo) {
        const id = btnDelPromo.dataset.id;
        const confirmed = await ConfirmDialog.show({
          title: 'Eliminar Promoción',
          message: '¿Está seguro de eliminar esta promoción? Dejará de estar vigente en el catálogo.',
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
          type: 'danger'
        });
        if (confirmed) {
          try {
            await PromotionService.delete(id);
            Toast.show('Promoción eliminada con éxito', 'success');
            this.allPromotions = this.allPromotions.filter(p => p.id != id);
            this.filterPromos();
          } catch (err) {
            console.error(err);
            Toast.show('Error al eliminar promoción', 'error');
          }
        }
        return;
      }

      const btnRenew = e.target.closest('[data-action="renew-hub-promo"]');
      if (btnRenew) {
        const id = btnRenew.dataset.id;
        const name = btnRenew.dataset.name;
        const modal = document.getElementById('modal-renew-promo');
        if (modal) {
          document.getElementById('renew-promo-id').value = id;
          document.getElementById('renew-promo-name').textContent = name;
          this.selectedDaysToRenew = 30;
          this.updateRenewModalState();
          modal.showModal();
        }
      }
    });

    const modalRenew = document.getElementById('modal-renew-promo');
    const btnCloseRenew = document.getElementById('btn-close-renew-modal');
    const btnCancelRenew = document.getElementById('btn-cancel-renew');
    const formRenew = document.getElementById('form-renew-promo');

    btnCloseRenew?.addEventListener('click', () => modalRenew?.close());
    btnCancelRenew?.addEventListener('click', () => modalRenew?.close());

    document.querySelectorAll('.renew-days-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectedDaysToRenew = Number(e.currentTarget.dataset.days);
        this.updateRenewModalState();
      });
    });

    formRenew?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('renew-promo-id')?.value;
      const customEnd = document.getElementById('renew-custom-end')?.value;

      try {
        await PromotionService.renewPromotion(id, this.selectedDaysToRenew, customEnd || null);
        Toast.show('Promoción reactivada y puesta en vigencia', 'success');
        modalRenew?.close();

        const refreshed = await PromotionService.list();
        this.allPromotions = refreshed.results || [];
        this.filterPromos();
      } catch (err) {
        console.error(err);
        Toast.show('Error al poner en vigencia la promoción', 'error');
      }
    });
  },

  updateRenewModalState() {
    document.querySelectorAll('.renew-days-btn').forEach(b => {
      const days = Number(b.dataset.days);
      if (days === this.selectedDaysToRenew) {
        b.className = 'renew-days-btn py-2 px-3 text-xs font-bold rounded-xl border-2 border-electric-blue bg-blue-50 text-electric-blue transition';
      } else {
        b.className = 'renew-days-btn py-2 px-3 text-xs font-bold rounded-xl border border-slate-border text-gray-700 hover:bg-blue-50 transition';
      }
    });

    const customInput = document.getElementById('renew-custom-end');
    if (customInput) {
      const future = new Date(Date.now() + this.selectedDaysToRenew * 86400000);
      customInput.value = future.toISOString().slice(0, 16);
    }
  }
};