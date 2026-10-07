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
  selectedComboForWhatsapp: null,

  // Datos de Promociones
  allPromotions: [],
  promotions: [],
  promoFilter: '',
  selectedPromoForWhatsapp: null,
  selectedDaysToRenew: 30,

  async render() {
    try {
      const [combosData, promosData] = await Promise.all([
        ComboService.list(),
        PromotionService.list()
      ]);
      this.allCombos = combosData.results || [];
      this.combos = [...this.allCombos];
      this.selectedComboForWhatsapp = this.allCombos[0] || null;

      this.allPromotions = promosData.results || [];
      this.promotions = [...this.allPromotions];
      this.selectedPromoForWhatsapp = this.allPromotions[0] || null;
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
            <p class="text-sm text-gray-500">Gestione los paquetes de productos, campañas promocionales y consultas automatizadas de WhatsApp.</p>
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
              <p class="text-[11px] text-gray-400">Paquetes para cotización</p>
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

          <!-- Automatización de WhatsApp para Combos -->
          <div class="bg-white rounded-2xl border border-slate-border p-6 shadow-sm space-y-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-border pb-4">
              <div>
                <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-whatsapp-green border border-green-200 mb-1">
                  <span class="material-symbols-outlined text-sm">chat</span>
                  Consulta de Combos por WhatsApp
                </div>
                <h2 class="font-display text-xl font-bold text-deep-obsidian">Personalización de Mensaje para Combos</h2>
                <p class="text-xs text-gray-500">Configure la plantilla del mensaje con el que el cliente solicitará cotización del combo al pulsar el botón de WhatsApp.</p>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-gray-600">Seleccionar Combo:</span>
                <select id="hub-whatsapp-combo-select" class="px-3 py-2 bg-slate-surface border border-slate-border rounded-lg text-xs font-bold text-deep-obsidian focus:ring-2 focus:ring-electric-blue outline-none cursor-pointer">
                  ${this.allCombos.map(c => `
                    <option value="${c.id}" ${this.selectedComboForWhatsapp?.id === c.id ? 'selected' : ''}>
                      ${c.name} (${c.sku || 'CMB-' + c.id})
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div class="lg:col-span-7 space-y-4">
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Plantilla del Mensaje
                  </label>
                  <div class="flex flex-wrap items-center gap-1.5 mb-2">
                    <span class="text-[11px] text-gray-500 font-medium">Insertar variable:</span>
                    <button type="button" data-insert-combo="{nombre_combo}" class="tag-btn text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-electric-blue hover:bg-blue-100 rounded border border-blue-200 transition">
                      {nombre_combo}
                    </button>
                    <button type="button" data-insert-combo="{sku_combo}" class="tag-btn text-[11px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded border border-purple-200 transition">
                      {sku_combo}
                    </button>
                    <button type="button" data-insert-combo="{items}" class="tag-btn text-[11px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded border border-amber-200 transition">
                      {items}
                    </button>
                  </div>

                  <textarea 
                    id="hub-whatsapp-template-input" 
                    rows="4" 
                    class="w-full p-3 bg-slate-surface border border-slate-border rounded-xl text-xs text-deep-obsidian leading-relaxed focus:bg-white focus:ring-2 focus:ring-electric-blue outline-none transition"
                    placeholder="Escribe la plantilla del mensaje de WhatsApp..."
                  >${this.getEffectiveWhatsappTemplate(this.selectedComboForWhatsapp)}</textarea>
                </div>

                <div class="flex flex-wrap items-center gap-3 pt-2">
                  <button id="btn-save-hub-whatsapp" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm">
                    <span class="material-symbols-outlined text-base">save</span>
                    Guardar Mensaje Combo
                  </button>
                  <button id="btn-test-hub-whatsapp" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-lg text-xs font-bold transition flex items-center gap-2 border border-slate-border">
                    <span class="material-symbols-outlined text-base text-whatsapp-green">open_in_new</span>
                    Probar en WhatsApp Web
                  </button>
                </div>
              </div>

              <!-- Vista Previa WhatsApp -->
              <div class="lg:col-span-5 bg-[#EFEAE2] p-4 rounded-2xl border border-amber-200/50 shadow-inner space-y-3">
                <div class="flex items-center justify-between pb-2 border-b border-amber-300/40">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-whatsapp-green text-white flex items-center justify-center text-xs font-bold">
                      <span class="material-symbols-outlined text-sm">support_agent</span>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-gray-900 leading-none">Comercializadora El Vecino</p>
                      <p class="text-[10px] text-emerald-700 font-semibold leading-tight">En línea para cotizaciones</p>
                    </div>
                  </div>
                  <span class="text-[10px] text-gray-500 font-medium">Vista Previa</span>
                </div>

                <div class="flex justify-end">
                  <div class="max-w-[90%] bg-[#E7FFDB] p-3 rounded-2xl rounded-tr-none shadow-sm text-xs text-gray-800 space-y-1.5 border border-green-200">
                    <p id="hub-whatsapp-preview-text" class="whitespace-pre-line leading-relaxed text-[11px] text-gray-800">
                      ${this.buildPreviewMessage(this.selectedComboForWhatsapp)}
                    </p>
                    <div class="flex items-center justify-end gap-1 text-[9px] text-gray-500 font-medium pt-1">
                      <span>12:45 p. m.</span>
                      <span class="material-symbols-outlined text-xs text-blue-500">done_all</span>
                    </div>
                  </div>
                </div>
              </div>
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

          <!-- Automatización de WhatsApp para Promociones -->
          <div class="bg-white rounded-2xl border border-slate-border p-6 shadow-sm space-y-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-border pb-4">
              <div>
                <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-whatsapp-green border border-green-200 mb-1">
                  <span class="material-symbols-outlined text-sm">chat</span>
                  Consulta de Promociones por WhatsApp
                </div>
                <h2 class="font-display text-xl font-bold text-deep-obsidian">Personalización de Mensaje para Promociones</h2>
                <p class="text-xs text-gray-500">Configure la plantilla del mensaje con el que el cliente solicitará asesoría y cotización sobre una promoción específica.</p>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-gray-600">Seleccionar Promoción:</span>
                <select id="hub-whatsapp-promo-select" class="px-3 py-2 bg-slate-surface border border-slate-border rounded-lg text-xs font-bold text-deep-obsidian focus:ring-2 focus:ring-electric-blue outline-none cursor-pointer">
                  ${this.allPromotions.map(p => `
                    <option value="${p.id}" ${this.selectedPromoForWhatsapp?.id === p.id ? 'selected' : ''}>
                      ${p.name} (${p.product?.name || 'Producto'})
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div class="lg:col-span-7 space-y-4">
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Plantilla del Mensaje de la Promoción
                  </label>
                  <div class="flex flex-wrap items-center gap-1.5 mb-2">
                    <span class="text-[11px] text-gray-500 font-medium">Insertar variable:</span>
                    <button type="button" data-insert-promo="{nombre_promo}" class="tag-btn text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-electric-blue hover:bg-blue-100 rounded border border-blue-200 transition">
                      {nombre_promo}
                    </button>
                    <button type="button" data-insert-promo="{producto}" class="tag-btn text-[11px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded border border-purple-200 transition">
                      {producto}
                    </button>
                    <button type="button" data-insert-promo="{beneficio}" class="tag-btn text-[11px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded border border-emerald-200 transition">
                      {beneficio}
                    </button>
                    <button type="button" data-insert-promo="{vigencia}" class="tag-btn text-[11px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded border border-amber-200 transition">
                      {vigencia}
                    </button>
                  </div>

                  <textarea 
                    id="hub-whatsapp-promo-template-input" 
                    rows="4" 
                    class="w-full p-3 bg-slate-surface border border-slate-border rounded-xl text-xs text-deep-obsidian leading-relaxed focus:bg-white focus:ring-2 focus:ring-electric-blue outline-none transition"
                    placeholder="Escriba la plantilla del mensaje de WhatsApp para esta promoción..."
                  >${this.getEffectivePromoWhatsappTemplate(this.selectedPromoForWhatsapp)}</textarea>
                </div>

                <div class="flex flex-wrap items-center gap-3 pt-2">
                  <button id="btn-save-hub-promo-whatsapp" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm">
                    <span class="material-symbols-outlined text-base">save</span>
                    Guardar Mensaje Promoción
                  </button>
                  <button id="btn-test-hub-promo-whatsapp" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-lg text-xs font-bold transition flex items-center gap-2 border border-slate-border">
                    <span class="material-symbols-outlined text-base text-whatsapp-green">open_in_new</span>
                    Probar en WhatsApp Web
                  </button>
                </div>
              </div>

              <!-- Vista Previa WhatsApp Promoción -->
              <div class="lg:col-span-5 bg-[#EFEAE2] p-4 rounded-2xl border border-amber-200/50 shadow-inner space-y-3">
                <div class="flex items-center justify-between pb-2 border-b border-amber-300/40">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-whatsapp-green text-white flex items-center justify-center text-xs font-bold">
                      <span class="material-symbols-outlined text-sm">support_agent</span>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-gray-900 leading-none">Comercializadora El Vecino</p>
                      <p class="text-[10px] text-emerald-700 font-semibold leading-tight">En línea para cotizaciones</p>
                    </div>
                  </div>
                  <span class="text-[10px] text-gray-500 font-medium">Vista Previa</span>
                </div>

                <div class="flex justify-end">
                  <div class="max-w-[90%] bg-[#E7FFDB] p-3 rounded-2xl rounded-tr-none shadow-sm text-xs text-gray-800 space-y-1.5 border border-green-200">
                    <p id="hub-whatsapp-promo-preview-text" class="whitespace-pre-line leading-relaxed text-[11px] text-gray-800">
                      ${this.buildPromoPreviewMessage(this.selectedPromoForWhatsapp)}
                    </p>
                    <div class="flex items-center justify-end gap-1 text-[9px] text-gray-500 font-medium pt-1">
                      <span>12:45 p. m.</span>
                      <span class="material-symbols-outlined text-xs text-blue-500">done_all</span>
                    </div>
                  </div>
                </div>
              </div>
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
              <button data-action="select-hub-whatsapp" data-id="${combo.id}" class="p-1.5 text-gray-500 hover:text-whatsapp-green hover:bg-green-50 rounded-lg transition" title="Configurar mensaje WhatsApp">
                <span class="material-symbols-outlined text-lg">chat</span>
              </button>
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
          <!-- 1. Promoción -->
          <td class="px-5 py-4">
            <div class="space-y-0.5">
              <p class="font-bold text-deep-obsidian text-sm">${promo.name}</p>
              <p class="text-xs text-gray-500 line-clamp-1">${promo.description || 'Promoción especial'}</p>
            </div>
          </td>

          <!-- 2. Producto Asociado -->
          <td class="px-5 py-4 font-semibold text-gray-800 text-xs">
            ${prodName}
          </td>

          <!-- 3. Vigencia -->
          <td class="px-5 py-4 whitespace-nowrap">
            <div class="space-y-1">
              <div class="flex items-center gap-1.5 text-xs text-gray-700">
                <span class="material-symbols-outlined text-sm text-gray-400">calendar_today</span>
                <span>${startStr} → ${endStr}</span>
              </div>
              <div>${vigenciaBadge}</div>
            </div>
          </td>

          <!-- 4. Estado (Pausar / Activar Switch Toggle) -->
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

          <!-- 5. Acciones (WhatsApp / Poner en Vigencia / Eliminar) -->
          <td class="px-5 py-4 whitespace-nowrap text-right">
            <div class="flex items-center justify-end gap-1">
              <!-- Botón Configurar WhatsApp -->
              <button 
                data-action="select-hub-promo-whatsapp" 
                data-id="${promo.id}" 
                class="p-1.5 text-gray-500 hover:text-whatsapp-green hover:bg-green-50 rounded-lg transition" 
                title="Configurar mensaje de WhatsApp para esta promoción"
              >
                <span class="material-symbols-outlined text-lg">chat</span>
              </button>

              <!-- Botón Poner en Vigencia / Renovar -->
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

              <!-- Botón Eliminar -->
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

  getEffectiveWhatsappTemplate(combo) {
    if (combo?.whatsapp_message) return combo.whatsapp_message;
    return 'Hola equipo de ventas EL VECINO. Me interesa consultar disponibilidad y cotizar el combo *{nombre_combo}* (Ref: {sku_combo}). ¿Me podrían brindar más información?';
  },

  buildPreviewMessage(combo) {
    if (!combo) return 'Seleccione un combo para visualizar el mensaje procesado.';
    const template = this.getEffectiveWhatsappTemplate(combo);
    const sku = combo.sku || `CMB-${combo.id}`;
    const itemsSummary = (combo.items || [])
      .map(i => `${i.quantity}x ${i.product?.name || 'Producto'}`)
      .join(', ');

    return template
      .replace(/{nombre_combo}/g, combo.name || '')
      .replace(/{sku_combo}/g, sku)
      .replace(/{items}/g, itemsSummary || '');
  },

  getEffectivePromoWhatsappTemplate(promo) {
    if (promo?.whatsapp_message) return promo.whatsapp_message;
    return 'Hola Comercializadora El Vecino. Me gustaría consultar y cotizar la promoción *{nombre_promo}* para el producto *{producto}* ({beneficio}). ¿Tienen unidades disponibles?';
  },

  buildPromoPreviewMessage(promo) {
    if (!promo) return 'Seleccione una promoción para visualizar el mensaje procesado.';
    const template = this.getEffectivePromoWhatsappTemplate(promo);
    const prodName = promo.product?.name || promo.product_name || 'Producto';
    const benefit = promo.benefit_type || 'Promoción Especial';
    const validez = promo.end_date ? `Válido hasta ${new Date(promo.end_date).toLocaleDateString()}` : 'Por tiempo limitado';

    return template
      .replace(/{nombre_promo}/g, promo.name || '')
      .replace(/{producto}/g, prodName)
      .replace(/{beneficio}/g, benefit)
      .replace(/{vigencia}/g, validez);
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
    // 1. Selector de Pestaña Principal (Combos vs Promociones)
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

    // 2. Buscador y Subpestañas de Combos
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

    // 3. Buscador y Filtro de Promociones
    document.getElementById('hub-promo-search')?.addEventListener('input', () => this.filterPromos());
    document.getElementById('hub-promo-status-filter')?.addEventListener('change', () => this.filterPromos());

    // 4. Toggle Estado Combo (Pausar / Activar)
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

      // Toggle Estado Promoción (Pausar / Activar)
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

    // 5. Configurar WhatsApp Combo & Eliminar Combo
    document.addEventListener('click', async (e) => {
      const btnWa = e.target.closest('[data-action="select-hub-whatsapp"]');
      if (btnWa) {
        const id = btnWa.dataset.id;
        const selected = this.allCombos.find(c => c.id == id);
        if (selected) {
          this.selectedComboForWhatsapp = selected;
          const selectDropdown = document.getElementById('hub-whatsapp-combo-select');
          if (selectDropdown) selectDropdown.value = id;
          this.updateWhatsappSection();
          document.getElementById('hub-whatsapp-template-input')?.scrollIntoView({ behavior: 'smooth' });
          Toast.show(`Configurando mensaje para combo: ${selected.name}`, 'info');
        }
        return;
      }

      const btnPromoWa = e.target.closest('[data-action="select-hub-promo-whatsapp"]');
      if (btnPromoWa) {
        const id = btnPromoWa.dataset.id;
        const selected = this.allPromotions.find(p => p.id == id);
        if (selected) {
          this.selectedPromoForWhatsapp = selected;
          const selectDropdown = document.getElementById('hub-whatsapp-promo-select');
          if (selectDropdown) selectDropdown.value = id;
          this.updatePromoWhatsappSection();
          document.getElementById('hub-whatsapp-promo-template-input')?.scrollIntoView({ behavior: 'smooth' });
          Toast.show(`Configurando mensaje para promoción: ${selected.name}`, 'info');
        }
        return;
      }

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

      // 6. Eliminar Promoción
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

      // 7. Abrir Modal de Poner en Vigencia / Renovar
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

    // 8. Manejo del Modal de Renovación / Poner en Vigencia
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

        // Actualizar datos
        const refreshed = await PromotionService.list();
        this.allPromotions = refreshed.results || [];
        this.filterPromos();
      } catch (err) {
        console.error(err);
        Toast.show('Error al poner en vigencia la promoción', 'error');
      }
    });

    // 9. Selector de Combo en WhatsApp
    document.getElementById('hub-whatsapp-combo-select')?.addEventListener('change', (e) => {
      const id = e.target.value;
      this.selectedComboForWhatsapp = this.allCombos.find(c => c.id == id) || null;
      this.updateWhatsappSection();
    });

    // 10. Insertar Tags en WhatsApp Combo
    document.querySelectorAll('[data-insert-combo]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tag = e.currentTarget.dataset.insertCombo;
        const textarea = document.getElementById('hub-whatsapp-template-input');
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const val = textarea.value;
          textarea.value = val.substring(0, start) + tag + val.substring(end);
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = start + tag.length;
          this.updateWhatsappPreview();
        }
      });
    });

    document.getElementById('hub-whatsapp-template-input')?.addEventListener('input', () => {
      this.updateWhatsappPreview();
    });

    document.getElementById('btn-save-hub-whatsapp')?.addEventListener('click', async () => {
      if (!this.selectedComboForWhatsapp) return;
      const msg = document.getElementById('hub-whatsapp-template-input')?.value.trim();
      try {
        await ComboService.updateWhatsappTemplate(this.selectedComboForWhatsapp.id, msg);
        this.selectedComboForWhatsapp.whatsapp_message = msg;
        Toast.show('Mensaje de WhatsApp para combo guardado con éxito', 'success');
      } catch (err) {
        console.error(err);
        Toast.show('Error al guardar mensaje', 'error');
      }
    });

    document.getElementById('btn-test-hub-whatsapp')?.addEventListener('click', () => {
      if (!this.selectedComboForWhatsapp) return;
      const previewText = document.getElementById('hub-whatsapp-preview-text')?.innerText || '';
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(previewText)}`;
      window.open(url, '_blank');
    });

    // 11. Selector de Promoción en WhatsApp
    document.getElementById('hub-whatsapp-promo-select')?.addEventListener('change', (e) => {
      const id = e.target.value;
      this.selectedPromoForWhatsapp = this.allPromotions.find(p => p.id == id) || null;
      this.updatePromoWhatsappSection();
    });

    // 12. Insertar Tags en WhatsApp Promoción
    document.querySelectorAll('[data-insert-promo]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tag = e.currentTarget.dataset.insertPromo;
        const textarea = document.getElementById('hub-whatsapp-promo-template-input');
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const val = textarea.value;
          textarea.value = val.substring(0, start) + tag + val.substring(end);
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = start + tag.length;
          this.updatePromoWhatsappPreview();
        }
      });
    });

    document.getElementById('hub-whatsapp-promo-template-input')?.addEventListener('input', () => {
      this.updatePromoWhatsappPreview();
    });

    document.getElementById('btn-save-hub-promo-whatsapp')?.addEventListener('click', async () => {
      if (!this.selectedPromoForWhatsapp) return;
      const msg = document.getElementById('hub-whatsapp-promo-template-input')?.value.trim();
      try {
        await PromotionService.updateWhatsappTemplate(this.selectedPromoForWhatsapp.id, msg);
        this.selectedPromoForWhatsapp.whatsapp_message = msg;
        Toast.show('Mensaje de WhatsApp para promoción guardado con éxito', 'success');
      } catch (err) {
        console.error(err);
        Toast.show('Error al guardar mensaje de promoción', 'error');
      }
    });

    document.getElementById('btn-test-hub-promo-whatsapp')?.addEventListener('click', () => {
      if (!this.selectedPromoForWhatsapp) return;
      const previewText = document.getElementById('hub-whatsapp-promo-preview-text')?.innerText || '';
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(previewText)}`;
      window.open(url, '_blank');
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
  },

  updateWhatsappSection() {
    const input = document.getElementById('hub-whatsapp-template-input');
    if (input) {
      input.value = this.getEffectiveWhatsappTemplate(this.selectedComboForWhatsapp);
    }
    this.updateWhatsappPreview();
  },

  updateWhatsappPreview() {
    const input = document.getElementById('hub-whatsapp-template-input');
    const previewEl = document.getElementById('hub-whatsapp-preview-text');
    if (!previewEl || !this.selectedComboForWhatsapp) return;

    const template = input?.value || '';
    const sku = this.selectedComboForWhatsapp.sku || `CMB-${this.selectedComboForWhatsapp.id}`;
    const itemsSummary = (this.selectedComboForWhatsapp.items || [])
      .map(i => `${i.quantity}x ${i.product?.name || 'Producto'}`)
      .join(', ');

    previewEl.textContent = template
      .replace(/{nombre_combo}/g, this.selectedComboForWhatsapp.name || '')
      .replace(/{sku_combo}/g, sku)
      .replace(/{items}/g, itemsSummary || '');
  },

  updatePromoWhatsappSection() {
    const input = document.getElementById('hub-whatsapp-promo-template-input');
    if (input) {
      input.value = this.getEffectivePromoWhatsappTemplate(this.selectedPromoForWhatsapp);
    }
    this.updatePromoWhatsappPreview();
  },

  updatePromoWhatsappPreview() {
    const input = document.getElementById('hub-whatsapp-promo-template-input');
    const previewEl = document.getElementById('hub-whatsapp-promo-preview-text');
    if (!previewEl || !this.selectedPromoForWhatsapp) return;

    const template = input?.value || '';
    const prodName = this.selectedPromoForWhatsapp.product?.name || this.selectedPromoForWhatsapp.product_name || 'Producto';
    const benefit = this.selectedPromoForWhatsapp.benefit_type || 'Promoción Especial';
    const validez = this.selectedPromoForWhatsapp.end_date 
      ? `Válido hasta ${new Date(this.selectedPromoForWhatsapp.end_date).toLocaleDateString()}` 
      : 'Por tiempo limitado';

    previewEl.textContent = template
      .replace(/{nombre_promo}/g, this.selectedPromoForWhatsapp.name || '')
      .replace(/{producto}/g, prodName)
      .replace(/{beneficio}/g, benefit)
      .replace(/{vigencia}/g, validez);
  }
};
