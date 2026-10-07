import { ComboService } from '../../services/combo.service.js';
import { Toast } from '../../components/ui/Toast.js';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.js';

export const ComboListView = {
  allCombos: [],
  combos: [],
  currentTab: 'all',
  selectedComboForWhatsapp: null,

  async render() {
    const data = await ComboService.list();
    this.allCombos = data.results || [];
    this.combos = [...this.allCombos];
    this.selectedComboForWhatsapp = this.allCombos[0] || null;

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
            <p class="text-sm text-gray-500">Agrupa productos del catálogo en paquetes y configura el mensaje automático de cotización para WhatsApp.</p>
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
            <!-- Pestañas -->
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

            <!-- Contador -->
            <span id="combos-count-label" class="text-xs font-bold text-gray-500 whitespace-nowrap">
              Mostrando ${totalCount} de ${totalCount} combos
            </span>
          </div>

          <!-- Buscador en tiempo real -->
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

        <!-- Tabla de Combos con Desglose Visual de Productos -->
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

        <!-- SECCIÓN: Automatización de Mensaje para WhatsApp -->
        <div class="bg-white rounded-2xl border border-slate-border p-6 shadow-sm space-y-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-border pb-4">
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-whatsapp-green border border-green-200 mb-1">
                <span class="material-symbols-outlined text-sm">chat</span>
                Consulta de Combos por WhatsApp
              </div>
              <h2 class="font-display text-xl font-bold text-deep-obsidian">Personalización de Mensaje para WhatsApp</h2>
              <p class="text-xs text-gray-500">Configura el texto con el que el cliente solicitará información y cotización del combo al contactarte por WhatsApp.</p>
            </div>
            
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-gray-600">Seleccionar Combo:</span>
              <select id="whatsapp-combo-select" class="px-3 py-2 bg-slate-surface border border-slate-border rounded-lg text-xs font-bold text-deep-obsidian focus:ring-2 focus:ring-electric-blue outline-none cursor-pointer">
                ${this.allCombos.map(c => `
                  <option value="${c.id}" ${this.selectedComboForWhatsapp?.id === c.id ? 'selected' : ''}>
                    ${c.name} (${c.sku || 'CMB-' + c.id})
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <!-- Columna Izquierda: Editor de Plantilla Parametrizada -->
            <div class="lg:col-span-7 space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Plantilla del Mensaje
                </label>
                
                <!-- Chips de Variables Rápidas (Sin precios) -->
                <div class="flex flex-wrap items-center gap-1.5 mb-2">
                  <span class="text-[11px] text-gray-500 font-medium">Insertar variable:</span>
                  <button type="button" data-insert="{nombre_combo}" class="tag-btn text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-electric-blue hover:bg-blue-100 rounded border border-blue-200 transition">
                    {nombre_combo}
                  </button>
                  <button type="button" data-insert="{sku_combo}" class="tag-btn text-[11px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded border border-purple-200 transition">
                    {sku_combo}
                  </button>
                  <button type="button" data-insert="{items}" class="tag-btn text-[11px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded border border-amber-200 transition">
                    {items}
                  </button>
                </div>

                <textarea 
                  id="whatsapp-template-input" 
                  rows="4" 
                  class="w-full p-3 bg-slate-surface border border-slate-border rounded-xl text-xs text-deep-obsidian leading-relaxed focus:bg-white focus:ring-2 focus:ring-electric-blue outline-none transition"
                  placeholder="Escribe la plantilla del mensaje de WhatsApp..."
                >${this.getEffectiveWhatsappTemplate(this.selectedComboForWhatsapp)}</textarea>
                <p class="text-[11px] text-gray-400 mt-1">Los corchetes serán reemplazados automáticamente con el nombre y los productos del combo al pulsar en WhatsApp.</p>
              </div>

              <!-- Botones de Acción -->
              <div class="flex flex-wrap items-center gap-3 pt-2">
                <button id="btn-save-whatsapp-template" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm">
                  <span class="material-symbols-outlined text-base">save</span>
                  Guardar Mensaje
                </button>
                <button id="btn-test-whatsapp" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-lg text-xs font-bold transition flex items-center gap-2 border border-slate-border">
                  <span class="material-symbols-outlined text-base text-whatsapp-green">open_in_new</span>
                  Probar en WhatsApp Web
                </button>
              </div>
            </div>

            <!-- Columna Derecha: Vista Previa Dinámica -->
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

              <!-- Burbuja de Mensaje del Comprador -->
              <div class="flex justify-end">
                <div class="max-w-[90%] bg-[#E7FFDB] p-3 rounded-2xl rounded-tr-none shadow-sm text-xs text-gray-800 space-y-1.5 border border-green-200">
                  <p id="whatsapp-preview-text" class="whitespace-pre-line leading-relaxed text-[11px] text-gray-800">
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

      // Pastillas visuales de productos vinculados
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
          <!-- 1. Combo e Identificador (Sin Precios) -->
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

          <!-- 2. Productos Incluidos -->
          <td class="px-5 py-4">
            <div class="flex flex-wrap items-center gap-1.5 max-w-xl">
              ${itemsBadgesHtml || '<span class="text-xs text-gray-400">Sin productos vinculados</span>'}
            </div>
          </td>

          <!-- 3. Estado (Switch Toggle Activo/Pausado) -->
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
              <span class="text-[10px] font-bold ${combo.is_active ? 'text-emerald-700' : 'text-gray-400'}">
                ${combo.is_active ? 'Activo' : 'Pausado'}
              </span>
            </div>
          </td>

          <!-- 4. Acciones -->
          <td class="px-5 py-4 whitespace-nowrap text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button 
                data-action="select-whatsapp" 
                data-id="${combo.id}" 
                class="p-1.5 text-gray-500 hover:text-whatsapp-green hover:bg-green-50 rounded-lg transition" 
                title="Configurar mensaje de WhatsApp"
              >
                <span class="material-symbols-outlined text-lg">chat</span>
              </button>
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
      // Filtrado por Pestaña
      let matchesTab = true;
      if (this.currentTab === 'active') {
        matchesTab = Boolean(combo.is_active);
      } else if (this.currentTab === 'paused') {
        matchesTab = !combo.is_active;
      }

      // Filtrado por Texto
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
    // 1. Buscador en tiempo real
    const searchInput = document.getElementById('combo-search-input');
    const clearBtn = document.getElementById('combo-search-clear');

    searchInput?.addEventListener('input', () => this.filterCombos());
    clearBtn?.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      this.filterCombos();
    });

    // 2. Pestañas de estado
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

    // 3. Switch de Estado Activo/Pausado rápido
    document.addEventListener('change', async (e) => {
      const toggle = e.target.closest('[data-action="toggle-status"]');
      if (toggle) {
        const id = toggle.dataset.id;
        const newStatus = toggle.checked;
        try {
          await ComboService.toggleActive(id, newStatus);
          Toast.show(`Combo ${newStatus ? 'activado' : 'pausado'} con éxito`, 'success');
          
          // Actualizar en memoria local
          const c = this.allCombos.find(item => item.id == id);
          if (c) c.is_active = newStatus;
          
          // Actualizar KPIs
          const activeCount = this.allCombos.filter(item => item.is_active).length;
          const pausedCount = this.allCombos.filter(item => !item.is_active).length;
          const kpiActive = document.getElementById('kpi-active-combos');
          const kpiPaused = document.getElementById('kpi-paused-combos');
          if (kpiActive) kpiActive.textContent = activeCount;
          if (kpiPaused) kpiPaused.textContent = pausedCount;

          this.filterCombos();
        } catch (err) {
          console.error(err);
          toggle.checked = !newStatus;
          Toast.show('Error al cambiar estado del combo', 'error');
        }
      }
    });

    // 4. Acciones de Tabla (Seleccionar para WhatsApp y Eliminar)
    document.addEventListener('click', async (e) => {
      const btnSelectWa = e.target.closest('[data-action="select-whatsapp"]');
      if (btnSelectWa) {
        const id = btnSelectWa.dataset.id;
        const selected = this.allCombos.find(c => c.id == id);
        if (selected) {
          this.selectedComboForWhatsapp = selected;
          const selectDropdown = document.getElementById('whatsapp-combo-select');
          if (selectDropdown) selectDropdown.value = id;
          this.updateWhatsappSection();
          document.getElementById('whatsapp-template-input')?.scrollIntoView({ behavior: 'smooth' });
          Toast.show(`Configurando mensaje para: ${selected.name}`, 'info');
        }
        return;
      }

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

    // 5. Selector de combo en sección WhatsApp
    const waSelect = document.getElementById('whatsapp-combo-select');
    waSelect?.addEventListener('change', (e) => {
      const id = e.target.value;
      this.selectedComboForWhatsapp = this.allCombos.find(c => c.id == id) || null;
      this.updateWhatsappSection();
    });

    // 6. Chips de inserción de variables
    document.querySelectorAll('[data-insert]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tag = e.currentTarget.dataset.insert;
        const textarea = document.getElementById('whatsapp-template-input');
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

    // 7. Input en textarea de plantilla para actualizar preview en vivo
    const templateInput = document.getElementById('whatsapp-template-input');
    templateInput?.addEventListener('input', () => {
      this.updateWhatsappPreview();
    });

    // 8. Guardar Plantilla de WhatsApp
    document.getElementById('btn-save-whatsapp-template')?.addEventListener('click', async () => {
      if (!this.selectedComboForWhatsapp) return;
      const msg = document.getElementById('whatsapp-template-input')?.value.trim();
      try {
        await ComboService.updateWhatsappTemplate(this.selectedComboForWhatsapp.id, msg);
        this.selectedComboForWhatsapp.whatsapp_message = msg;
        Toast.show('Mensaje de consulta guardado con éxito', 'success');
      } catch (err) {
        console.error(err);
        Toast.show('Error al guardar el mensaje', 'error');
      }
    });

    // 9. Probar en WhatsApp Web
    document.getElementById('btn-test-whatsapp')?.addEventListener('click', () => {
      if (!this.selectedComboForWhatsapp) return;
      const previewText = document.getElementById('whatsapp-preview-text')?.innerText || '';
      const encoded = encodeURIComponent(previewText);
      const url = `https://api.whatsapp.com/send?text=${encoded}`;
      window.open(url, '_blank');
    });
  },

  updateWhatsappSection() {
    const templateInput = document.getElementById('whatsapp-template-input');
    if (templateInput) {
      templateInput.value = this.getEffectiveWhatsappTemplate(this.selectedComboForWhatsapp);
    }
    this.updateWhatsappPreview();
  },

  updateWhatsappPreview() {
    const templateInput = document.getElementById('whatsapp-template-input');
    const previewEl = document.getElementById('whatsapp-preview-text');
    if (!previewEl || !this.selectedComboForWhatsapp) return;

    const template = templateInput?.value || '';
    const sku = this.selectedComboForWhatsapp.sku || `CMB-${this.selectedComboForWhatsapp.id}`;
    const itemsSummary = (this.selectedComboForWhatsapp.items || [])
      .map(i => `${i.quantity}x ${i.product?.name || 'Producto'}`)
      .join(', ');

    const processed = template
      .replace(/{nombre_combo}/g, this.selectedComboForWhatsapp.name || '')
      .replace(/{sku_combo}/g, sku)
      .replace(/{items}/g, itemsSummary || '');

    previewEl.textContent = processed;
  }
};