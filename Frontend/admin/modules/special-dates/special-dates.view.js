import { SpecialDatesService } from '../../services/special-dates.service.js';
import { Toast } from '../../components/ui/Toast.js';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.js';

export const SpecialDatesView = {
  allDates: [],
  filteredDates: [],
  editingId: null,

  async render() {
    this.allDates = await SpecialDatesService.list();
    this.filteredDates = [...this.allDates];

    const totalCount = this.allDates.length;
    const approachingCount = this.allDates.filter(d => d.is_approaching).length;
    const nextEvent = this.allDates.length > 0 ? this.allDates[0] : null;

    return `
      <div class="space-y-6">
        <!-- Encabezado Principal -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                Automatización Comercial
              </span>
              <span class="text-xs text-gray-400">/</span>
              <span class="text-xs font-semibold text-gray-500">Recordatorios</span>
            </div>
            <h1 class="text-2xl font-bold text-deep-obsidian font-display">Fechas Comerciales & Recordatorios</h1>
            <p class="text-sm text-gray-500">Administre las temporadas clave del año para recibir avisos automáticos con días de anticipación.</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button 
              id="btn-evaluate-all" 
              type="button" 
              class="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-border cursor-pointer shadow-xs"
            >
              <span class="material-symbols-outlined text-base">sync</span>
              <span>Evaluar Alertas Ahora</span>
            </button>
            <button 
              id="btn-open-create-modal" 
              type="button" 
              class="px-4 py-2.5 bg-electric-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">add</span>
              <span>Nueva Fecha Especial</span>
            </button>
          </div>
        </div>

        <!-- Tarjetas de Resumen KPI -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Próximo Evento</p>
              <p class="text-lg font-bold text-deep-obsidian mt-0.5 truncate max-w-[180px]">
                ${nextEvent ? nextEvent.name : 'Sin eventos'}
              </p>
              <p class="text-[11px] font-bold ${nextEvent && nextEvent.is_approaching ? 'text-amber-600' : 'text-gray-400'}">
                ${nextEvent ? `En ${nextEvent.days_until} días (${nextEvent.day}/${nextEvent.month})` : '-'}
              </p>
            </div>
            <div class="p-2.5 bg-purple-50 text-purple-700 rounded-xl flex-shrink-0">
              <span class="material-symbols-outlined text-xl">event_upcoming</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alertas de Temporada</p>
              <p class="text-2xl font-bold text-amber-600 mt-0.5">${approachingCount}</p>
              <p class="text-[11px] text-gray-400">Dentro de la ventana de aviso</p>
            </div>
            <div class="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <span class="material-symbols-outlined text-xl">notification_important</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Registradas</p>
              <p class="text-2xl font-bold text-deep-obsidian mt-0.5">${totalCount}</p>
              <p class="text-[11px] text-gray-400">Fechas comerciales en el sistema</p>
            </div>
            <div class="p-2.5 bg-blue-50 text-electric-blue rounded-xl">
              <span class="material-symbols-outlined text-xl">calendar_month</span>
            </div>
          </div>
        </div>

        <!-- Filtros y Búsqueda -->
        <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="relative flex-1 w-full">
            <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none">search</span>
            <input 
              type="text" 
              id="search-special-dates" 
              placeholder="Buscar por nombre, mes o estrategia comercial..." 
              class="w-full pl-11 pr-4 py-2.5 bg-slate-surface border border-slate-border rounded-lg text-sm text-deep-obsidian placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:bg-white transition"
            />
          </div>
          <span class="text-xs font-bold text-gray-500 whitespace-nowrap" id="count-label">
            ${totalCount} fechas configuradas
          </span>
        </div>

        <!-- Tabla de Fechas Especiales -->
        <div class="bg-white rounded-xl border border-slate-border shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr class="bg-slate-surface border-b border-slate-border text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th class="px-5 py-3.5">Temporada Comercial</th>
                  <th class="px-5 py-3.5">Fecha Fija</th>
                  <th class="px-5 py-3.5">Próxima Ocurrencia</th>
                  <th class="px-5 py-3.5">Anticipación de Alerta</th>
                  <th class="px-5 py-3.5 text-center">Estado</th>
                  <th class="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody id="special-dates-table-body" class="divide-y divide-slate-100 text-sm">
                ${this.renderTableRows(this.filteredDates)}
              </tbody>
            </table>
          </div>
        </div>

        <!-- MODAL PARA CREAR / EDITAR FECHA COMERCIAL -->
        <div id="modal-date" class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 hidden">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-border w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div class="p-5 border-b border-slate-border flex items-center justify-between bg-slate-50">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-electric-blue text-xl">event</span>
                <h3 id="modal-title" class="font-display font-bold text-base text-deep-obsidian">Nueva Fecha Comercial</h3>
              </div>
              <button type="button" id="btn-close-modal" class="text-gray-400 hover:text-gray-700 p-1 rounded-lg">
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form id="form-special-date" class="p-6 space-y-4">
              <input type="hidden" id="input-date-id" value="">

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre del Evento Comercial *</label>
                <input 
                  type="text" 
                  id="input-date-name" 
                  required 
                  placeholder="Ej: Día del Amor y la Amistad, Aniversario..." 
                  class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Mes *</label>
                  <select id="input-date-month" required class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm bg-white focus:ring-2 focus:ring-electric-blue outline-none">
                    <option value="1">Enero (01)</option>
                    <option value="2">Febrero (02)</option>
                    <option value="3">Marzo (03)</option>
                    <option value="4">Abril (04)</option>
                    <option value="5">Mayo (05)</option>
                    <option value="6">Junio (06)</option>
                    <option value="7">Julio (07)</option>
                    <option value="8">Agosto (08)</option>
                    <option value="9">Septiembre (09)</option>
                    <option value="10">Octubre (10)</option>
                    <option value="11">Noviembre (11)</option>
                    <option value="12">Diciembre (12)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Día del Mes *</label>
                  <input 
                    type="number" 
                    id="input-date-day" 
                    required 
                    min="1" 
                    max="31" 
                    placeholder="1-31" 
                    class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Días de Anticipación para el Aviso *</label>
                <div class="flex items-center gap-2">
                  <input 
                    type="number" 
                    id="input-date-advance" 
                    required 
                    min="1" 
                    max="90" 
                    value="15" 
                    class="w-32 px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none"
                  />
                  <span class="text-xs text-gray-500">días antes de la fecha</span>
                </div>
                <p class="text-[11px] text-gray-400 mt-1">El sistema emitirá el aviso en la campana y generará la alerta comercial.</p>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Estrategia Comercial Sugerida</label>
                <input 
                  type="text" 
                  id="input-date-strategy" 
                  placeholder="Ej: Combos de cocina, 15% en pantallas Smart..." 
                  class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción / Notas Adicionales</label>
                <textarea 
                  id="input-date-desc" 
                  rows="2" 
                  placeholder="Detalles de la campaña de temporada..." 
                  class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none"
                ></textarea>
              </div>

              <div class="pt-2">
                <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input type="checkbox" id="input-date-active" checked class="w-4 h-4 text-electric-blue rounded border-gray-300">
                  <span>Temporada Activa para Notificaciones</span>
                </label>
              </div>

              <div class="pt-4 border-t border-slate-border flex justify-end gap-2">
                <button type="button" id="btn-cancel-modal" class="px-4 py-2 border border-slate-border text-gray-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition">
                  Cancelar
                </button>
                <button type="submit" class="px-5 py-2 bg-electric-blue hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm">
                  Guardar Fecha
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  renderTableRows(dates) {
    if (!dates || dates.length === 0) {
      return `
        <tr>
          <td colspan="6" class="p-8 text-center text-gray-400 text-xs">
            No se encontraron fechas comerciales especiales con ese criterio.
          </td>
        </tr>
      `;
    }

    const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    return dates.map(d => {
      const isApproaching = d.is_approaching;
      const daysUntil = d.days_until;

      return `
        <tr class="hover:bg-slate-50/70 transition">
          <td class="px-5 py-4">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex flex-col items-center justify-center font-bold flex-shrink-0 border border-purple-100">
                <span class="text-[9px] uppercase leading-none font-semibold text-purple-600">${monthNames[d.month] || d.month}</span>
                <span class="text-sm font-black leading-tight">${d.day}</span>
              </div>
              <div class="space-y-0.5 min-w-0">
                <p class="font-bold text-sm text-deep-obsidian leading-tight">${d.name}</p>
                <p class="text-xs text-gray-500 line-clamp-1">${d.suggested_strategy || d.description || 'Temporada anual'}</p>
              </div>
            </div>
          </td>

          <td class="px-5 py-4 whitespace-nowrap">
            <span class="px-2.5 py-1 bg-slate-100 text-gray-700 rounded-lg text-xs font-mono font-bold">
              ${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}
            </span>
          </td>

          <td class="px-5 py-4 whitespace-nowrap">
            <div class="space-y-1">
              <span class="text-xs text-gray-700 font-medium">${d.next_occurrence_formatted}</span>
              <div>
                ${isApproaching ? `
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                    <span class="material-symbols-outlined text-[12px]">warning</span>
                    ¡Faltan ${daysUntil} días!
                  </span>
                ` : `
                  <span class="text-[11px] text-gray-400 font-medium">
                    En ${daysUntil} días
                  </span>
                `}
              </div>
            </div>
          </td>

          <td class="px-5 py-4 whitespace-nowrap">
            <span class="text-xs font-semibold text-gray-700">
              ${d.days_in_advance} días antes
            </span>
          </td>

          <td class="px-5 py-4 whitespace-nowrap text-center">
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                data-action="toggle-date-status" 
                data-id="${d.id}" 
                class="sr-only peer" 
                ${d.is_active ? 'checked' : ''}
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </td>

          <td class="px-5 py-4 whitespace-nowrap text-right space-x-1">
            <button 
              data-action="test-alert" 
              data-id="${d.id}" 
              class="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition" 
              title="Disparar alerta de prueba"
            >
              <span class="material-symbols-outlined text-lg">notifications_active</span>
            </button>
            <button 
              data-action="edit-date" 
              data-id="${d.id}" 
              class="p-1.5 text-gray-500 hover:text-electric-blue hover:bg-blue-50 rounded-lg transition" 
              title="Editar fecha especial"
            >
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>
            <button 
              data-action="delete-date" 
              data-id="${d.id}" 
              class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" 
              title="Eliminar fecha especial"
            >
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  bindEvents() {
    const searchInput = document.getElementById('search-special-dates');
    searchInput?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        this.filteredDates = [...this.allDates];
      } else {
        this.filteredDates = this.allDates.filter(d => 
          d.name.toLowerCase().includes(q) || 
          (d.suggested_strategy && d.suggested_strategy.toLowerCase().includes(q)) ||
          `${d.day}/${d.month}`.includes(q)
        );
      }
      const tbody = document.getElementById('special-dates-table-body');
      if (tbody) tbody.innerHTML = this.renderTableRows(this.filteredDates);
      const countLabel = document.getElementById('count-label');
      if (countLabel) countLabel.textContent = `${this.filteredDates.length} fechas encontradas`;
    });

    // Evaluar todas las alertas bajo demanda
    document.getElementById('btn-evaluate-all')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span> Evaluando...';
      await SpecialDatesService.checkNow();
      this.allDates = await SpecialDatesService.list();
      this.filteredDates = [...this.allDates];
      const tbody = document.getElementById('special-dates-table-body');
      if (tbody) tbody.innerHTML = this.renderTableRows(this.filteredDates);
      Toast.show('Evaluación de fechas comerciales completada con éxito', 'success');
      btn.innerHTML = '<span class="material-symbols-outlined text-sm">check</span> Al día';
      setTimeout(() => {
        btn.innerHTML = '<span class="material-symbols-outlined text-base">sync</span><span>Evaluar Alertas Ahora</span>';
      }, 2000);
    });

    // Abrir Modal de Creación
    const modal = document.getElementById('modal-date');
    const form = document.getElementById('form-special-date');

    const openModal = (dateData = null) => {
      form.reset();
      if (dateData) {
        document.getElementById('modal-title').textContent = 'Editar Fecha Especial';
        document.getElementById('input-date-id').value = dateData.id;
        document.getElementById('input-date-name').value = dateData.name;
        document.getElementById('input-date-month').value = dateData.month;
        document.getElementById('input-date-day').value = dateData.day;
        document.getElementById('input-date-advance').value = dateData.days_in_advance;
        document.getElementById('input-date-strategy').value = dateData.suggested_strategy || '';
        document.getElementById('input-date-desc').value = dateData.description || '';
        document.getElementById('input-date-active').checked = Boolean(dateData.is_active);
      } else {
        document.getElementById('modal-title').textContent = 'Nueva Fecha Especial';
        document.getElementById('input-date-id').value = '';
        document.getElementById('input-date-active').checked = true;
      }
      modal.classList.remove('hidden');
    };

    const closeModal = () => {
      modal.classList.add('hidden');
    };

    document.getElementById('btn-open-create-modal')?.addEventListener('click', () => openModal());
    document.getElementById('btn-close-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-modal')?.addEventListener('click', closeModal);

    // Guardar fecha comercial
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('input-date-id').value;
      const data = {
        id: id || undefined,
        name: document.getElementById('input-date-name').value.trim(),
        month: document.getElementById('input-date-month').value,
        day: document.getElementById('input-date-day').value,
        days_in_advance: document.getElementById('input-date-advance').value,
        suggested_strategy: document.getElementById('input-date-strategy').value.trim(),
        description: document.getElementById('input-date-desc').value.trim(),
        is_active: document.getElementById('input-date-active').checked
      };

      try {
        await SpecialDatesService.save(data);
        Toast.show(`Fecha comercial "${data.name}" guardada con éxito`, 'success');
        closeModal();
        this.allDates = await SpecialDatesService.list();
        this.filteredDates = [...this.allDates];
        const tbody = document.getElementById('special-dates-table-body');
        if (tbody) tbody.innerHTML = this.renderTableRows(this.filteredDates);
      } catch (err) {
        Toast.show('Error al guardar la fecha especial', 'error');
      }
    });

    // Delegación de eventos en tabla
    document.getElementById('special-dates-table-body')?.addEventListener('click', async (e) => {
      // Toggle estado activo
      const toggle = e.target.closest('[data-action="toggle-date-status"]');
      if (toggle) {
        const id = toggle.dataset.id;
        const isChecked = toggle.checked;
        await SpecialDatesService.toggleActive(id, isChecked);
        const item = this.allDates.find(d => String(d.id) === String(id));
        if (item) item.is_active = isChecked;
        Toast.show(`Temporada ${isChecked ? 'activada' : 'pausada'} con éxito`, 'info');
        return;
      }

      // Probar alerta
      const btnTest = e.target.closest('[data-action="test-alert"]');
      if (btnTest) {
        const id = btnTest.dataset.id;
        const item = this.allDates.find(d => String(d.id) === String(id));
        if (item) {
          Toast.show(`Alerta generada para "${item.name}": Faltan ${item.days_until} días`, 'info');
        }
        return;
      }

      // Editar
      const btnEdit = e.target.closest('[data-action="edit-date"]');
      if (btnEdit) {
        const id = btnEdit.dataset.id;
        const item = this.allDates.find(d => String(d.id) === String(id));
        if (item) openModal(item);
        return;
      }

      // Eliminar
      const btnDel = e.target.closest('[data-action="delete-date"]');
      if (btnDel) {
        const id = btnDel.dataset.id;
        const item = this.allDates.find(d => String(d.id) === String(id));
        if (!item) return;

        const confirmed = await ConfirmDialog.show({
          title: 'Eliminar Fecha Especial',
          message: `¿Está seguro de eliminar la temporada comercial "${item.name}"? Ya no se emitirán recordatorios ni avisos para esta fecha.`,
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
          type: 'danger'
        });

        if (confirmed) {
          await SpecialDatesService.delete(id);
          this.allDates = this.allDates.filter(d => String(d.id) !== String(id));
          this.filteredDates = this.filteredDates.filter(d => String(d.id) !== String(id));
          const tbody = document.getElementById('special-dates-table-body');
          if (tbody) tbody.innerHTML = this.renderTableRows(this.filteredDates);
          Toast.show('Fecha especial eliminada con éxito', 'success');
        }
      }
    });
  }
};

