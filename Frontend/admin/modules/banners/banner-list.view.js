import { BannerService } from '../../services/banner.service.js';
import { Toast } from '../../components/ui/Toast.js';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.js';

export const BannerListView = {
  banners: [],
  filteredBanners: [],
  selectedType: 'all',

  async render() {
    try {
      const data = await BannerService.list();
      this.banners = data.results || [];
      this.filteredBanners = [...this.banners];
    } catch (e) {
      console.error(e);
      this.banners = [];
      this.filteredBanners = [];
    }

    const total = this.banners.length;
    const active = this.banners.filter(b => b.is_active).length;
    const heroCount = this.banners.filter(b => b.type === 'hero').length;

    return `
      <div class="space-y-6">
        <!-- Encabezado Principal -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">
                Marketing Visual
              </span>
              <span class="text-xs text-gray-400">/</span>
              <span class="text-xs font-semibold text-gray-500">Página Principal</span>
            </div>
            <h1 class="text-2xl font-bold text-deep-obsidian font-display">Banners y Avisos de Portada</h1>
            <p class="text-sm text-gray-500">Administre los anuncios principales, promociones de temporada y avisos que ven los clientes al entrar a la tienda.</p>
          </div>
          <div>
            <button id="btn-open-create-banner" class="inline-flex items-center gap-2 bg-electric-blue text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm">
              <span class="material-symbols-outlined text-base">add_photo_alternate</span>
              + Nuevo Banner / Aviso
            </button>
          </div>
        </div>

        <!-- KPIs Resumen -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Banners</p>
              <p class="text-2xl font-bold text-deep-obsidian mt-0.5">${total}</p>
              <p class="text-[11px] text-gray-400">Diseños registrados</p>
            </div>
            <div class="p-2.5 bg-blue-50 text-electric-blue rounded-xl">
              <span class="material-symbols-outlined text-xl">view_carousel</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Banners Activos</p>
              <p class="text-2xl font-bold text-emerald-600 mt-0.5" id="kpi-active-banners">${active}</p>
              <p class="text-[11px] text-gray-400">Visibles en la web</p>
            </div>
            <div class="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <span class="material-symbols-outlined text-xl">visibility</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Banners Hero Principales</p>
              <p class="text-2xl font-bold text-purple-600 mt-0.5">${heroCount}</p>
              <p class="text-[11px] text-gray-400">Slider superior de inicio</p>
            </div>
            <div class="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <span class="material-symbols-outlined text-xl">featured_video</span>
            </div>
          </div>
        </div>

        <!-- Barra de Búsqueda y Filtros -->
        <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="relative flex-1">
            <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none">search</span>
            <input 
              type="text" 
              id="banner-search-input" 
              placeholder="Buscar banner por título, subtítulo o etiqueta..." 
              class="w-full pl-11 pr-10 py-2.5 bg-slate-surface border border-slate-border rounded-lg text-sm text-deep-obsidian placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:bg-white transition"
            />
          </div>
          <div class="flex items-center gap-2">
            <select id="banner-type-filter" class="px-3 py-2.5 bg-slate-surface border border-slate-border rounded-lg text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-electric-blue cursor-pointer">
              <option value="all">Todos los formatos</option>
              <option value="hero">Banner Principal (Hero)</option>
              <option value="top_bar">Aviso Superior (Cintillo)</option>
              <option value="promo_card">Banner de Sección</option>
            </select>
          </div>
        </div>

        <!-- Lista de Banners -->
        <div id="banners-container" class="grid grid-cols-1 md:grid-cols-2 gap-5">
          ${this.renderCards(this.filteredBanners)}
        </div>
      </div>

      <!-- Modal Crear / Editar Banner -->
      <dialog id="modal-banner-form" class="rounded-2xl border border-slate-border shadow-2xl p-6 max-w-xl w-full backdrop:bg-slate-900/50">
        <form id="form-banner" class="space-y-4">
          <div class="flex items-center justify-between border-b border-slate-border pb-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-electric-blue text-xl">ad_units</span>
              <h3 id="modal-banner-title" class="font-bold text-lg text-deep-obsidian font-display">Nuevo Banner / Aviso</h3>
            </div>
            <button type="button" id="btn-close-banner-modal" class="text-gray-400 hover:text-gray-600 p-1 rounded-full">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <input type="hidden" id="banner-edit-id" />

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Título -->
            <div class="sm:col-span-2 space-y-1">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Título Principal *</label>
              <input type="text" id="input-banner-title" required class="w-full px-3 py-2 border border-slate-border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Ej: Mes de la Línea Blanca" />
            </div>

            <!-- Subtítulo / Descripción -->
            <div class="sm:col-span-2 space-y-1">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Subtítulo / Mensaje Promocional *</label>
              <textarea id="input-banner-subtitle" rows="2" required class="w-full px-3 py-2 border border-slate-border rounded-xl text-xs focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Ej: Las mejores marcas en refrigeración con asesoría directa por WhatsApp..."></textarea>
            </div>

            <!-- Etiqueta / Tag -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Etiqueta Destacada</label>
              <input type="text" id="input-banner-tag" class="w-full px-3 py-2 border border-slate-border rounded-xl text-xs focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Ej: Temporada Especial" />
            </div>

            <!-- Tipo de Formato -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Tipo de Banner *</label>
              <select id="input-banner-type" class="w-full px-3 py-2 border border-slate-border rounded-xl text-xs bg-white font-semibold focus:ring-2 focus:ring-electric-blue outline-none cursor-pointer">
                <option value="hero">Banner Principal (Hero Slider)</option>
                <option value="top_bar">Aviso Superior (Cintillo de Texto)</option>
                <option value="promo_card">Banner Promocional de Sección</option>
              </select>
            </div>

            <!-- URL de Imagen -->
            <div class="sm:col-span-2 space-y-1" id="group-banner-image">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">URL de la Imagen de Fondo</label>
              <input type="url" id="input-banner-image" class="w-full px-3 py-2 border border-slate-border rounded-xl text-xs font-mono focus:ring-2 focus:ring-electric-blue outline-none" placeholder="https://images.unsplash.com/..." />
            </div>

            <!-- Texto del Botón -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Texto del Botón</label>
              <input type="text" id="input-banner-cta-text" class="w-full px-3 py-2 border border-slate-border rounded-xl text-xs focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Ej: Ver Promociones" />
            </div>

            <!-- Enlace / Destino -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Enlace del Botón</label>
              <input type="text" id="input-banner-cta-link" class="w-full px-3 py-2 border border-slate-border rounded-xl text-xs font-mono focus:ring-2 focus:ring-electric-blue outline-none" placeholder="#/promotions" />
            </div>

            <!-- Estado Activo -->
            <div class="sm:col-span-2 flex items-center gap-2 pt-2">
              <input type="checkbox" id="input-banner-active" checked class="w-4 h-4 text-electric-blue rounded border-gray-300" />
              <label for="input-banner-active" class="text-xs font-bold text-gray-700 cursor-pointer">
                Publicar y mostrar de inmediato en la tienda
              </label>
            </div>
          </div>

          <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-border">
            <button type="button" id="btn-cancel-banner" class="px-4 py-2 border border-slate-border text-gray-600 rounded-lg text-xs font-bold hover:bg-slate-surface transition">
              Cancelar
            </button>
            <button type="submit" class="px-5 py-2 bg-electric-blue hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
              <span class="material-symbols-outlined text-sm">save</span>
              Guardar Banner
            </button>
          </div>
        </form>
      </dialog>
    `;
  },

  renderCards(banners) {
    if (!banners || banners.length === 0) {
      return `
        <div class="col-span-full bg-white p-12 rounded-2xl border border-slate-border text-center">
          <span class="material-symbols-outlined text-4xl text-gray-300 block mb-2">view_carousel</span>
          <p class="font-bold text-sm text-gray-700">No se encontraron banners o avisos</p>
          <p class="text-xs text-gray-400 mt-1">Crea un nuevo banner para promocionar ofertas y novedades.</p>
        </div>
      `;
    }

    return banners.map(b => {
      const typeLabel = b.type === 'hero' 
        ? 'Hero Principal' 
        : (b.type === 'top_bar' ? 'Aviso Superior' : 'Sección');
      const typeBadgeClass = b.type === 'hero' 
        ? 'bg-purple-100 text-purple-800 border-purple-200' 
        : (b.type === 'top_bar' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-blue-100 text-blue-800 border-blue-200');

      return `
        <div class="bg-white rounded-2xl border border-slate-border shadow-sm overflow-hidden flex flex-col justify-between group hover:border-blue-300 transition">
          ${b.image_url ? `
            <div class="relative h-40 w-full overflow-hidden bg-slate-900">
              <img src="${b.image_url}" alt="${b.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <span class="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${typeBadgeClass} border">
                ${typeLabel}
              </span>
              ${b.tag ? `
                <span class="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 text-gray-800 backdrop-blur-sm shadow-sm">
                  ${b.tag}
                </span>
              ` : ''}
              <div class="absolute bottom-3 left-3 right-3 text-white">
                <h3 class="font-display font-bold text-base leading-tight">${b.title}</h3>
              </div>
            </div>
          ` : `
            <div class="p-4 bg-gradient-to-r ${b.bg_gradient || 'from-amber-600 to-orange-600'} text-white relative">
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/20 border border-white/30">
                  ${typeLabel}
                </span>
                ${b.tag ? `<span class="text-[10px] font-bold bg-black/20 px-2 py-0.5 rounded">${b.tag}</span>` : ''}
              </div>
              <h3 class="font-display font-bold text-base leading-tight">${b.title}</h3>
            </div>
          `}

          <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
            <p class="text-xs text-gray-600 line-clamp-2 leading-relaxed">${b.subtitle || 'Sin descripción'}</p>

            <div class="flex items-center justify-between pt-3 border-t border-slate-border text-xs">
              <div class="flex items-center gap-2">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    data-action="toggle-banner-status" 
                    data-id="${b.id}" 
                    class="sr-only peer" 
                    ${b.is_active ? 'checked' : ''}
                  />
                  <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
                <span class="text-[11px] font-bold ${b.is_active ? 'text-emerald-700' : 'text-gray-400'}">
                  ${b.is_active ? 'Activo' : 'Pausado'}
                </span>
              </div>

              <div class="flex items-center gap-1">
                <button data-action="edit-banner" data-id="${b.id}" class="p-1.5 text-gray-500 hover:text-electric-blue hover:bg-blue-50 rounded-lg transition" title="Editar banner">
                  <span class="material-symbols-outlined text-lg">edit</span>
                </button>
                <button data-action="delete-banner" data-id="${b.id}" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar banner">
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  filter() {
    const search = document.getElementById('banner-search-input')?.value.toLowerCase().trim() || '';
    const type = document.getElementById('banner-type-filter')?.value || 'all';
    const container = document.getElementById('banners-container');

    this.filteredBanners = this.banners.filter(b => {
      const matchSearch = !search || 
        (b.title || '').toLowerCase().includes(search) || 
        (b.subtitle || '').toLowerCase().includes(search) || 
        (b.tag || '').toLowerCase().includes(search);
      const matchType = type === 'all' || b.type === type;
      return matchSearch && matchType;
    });

    if (container) container.innerHTML = this.renderCards(this.filteredBanners);
  },

  bindEvents() {
    const searchInput = document.getElementById('banner-search-input');
    const typeFilter = document.getElementById('banner-type-filter');
    const modal = document.getElementById('modal-banner-form');
    const form = document.getElementById('form-banner');
    const btnOpenCreate = document.getElementById('btn-open-create-banner');
    const btnCloseModal = document.getElementById('btn-close-banner-modal');
    const btnCancelModal = document.getElementById('btn-cancel-banner');

    searchInput?.addEventListener('input', () => this.filter());
    typeFilter?.addEventListener('change', () => this.filter());

    btnOpenCreate?.addEventListener('click', () => {
      form?.reset();
      document.getElementById('banner-edit-id').value = '';
      document.getElementById('modal-banner-title').textContent = 'Nuevo Banner / Aviso';
      document.getElementById('input-banner-active').checked = true;
      modal?.showModal();
    });

    btnCloseModal?.addEventListener('click', () => modal?.close());
    btnCancelModal?.addEventListener('click', () => modal?.close());

    // Switch de estado Activar/Pausar
    document.addEventListener('change', async (e) => {
      const toggle = e.target.closest('[data-action="toggle-banner-status"]');
      if (toggle) {
        const id = toggle.dataset.id;
        const active = toggle.checked;
        try {
          await BannerService.toggleActive(id, active);
          Toast.show(`Banner ${active ? 'activado' : 'pausado'} con éxito`, 'success');
          const b = this.banners.find(item => item.id == id);
          if (b) b.is_active = active;
          const kpi = document.getElementById('kpi-active-banners');
          if (kpi) kpi.textContent = this.banners.filter(x => x.is_active).length;
          this.filter();
        } catch (err) {
          console.error(err);
          toggle.checked = !active;
          Toast.show('Error al actualizar estado del banner', 'error');
        }
      }
    });

    // Acciones Editar / Eliminar
    document.addEventListener('click', async (e) => {
      const btnEdit = e.target.closest('[data-action="edit-banner"]');
      if (btnEdit) {
        const id = btnEdit.dataset.id;
        const banner = this.banners.find(b => b.id == id);
        if (banner) {
          document.getElementById('banner-edit-id').value = banner.id;
          document.getElementById('input-banner-title').value = banner.title || '';
          document.getElementById('input-banner-subtitle').value = banner.subtitle || '';
          document.getElementById('input-banner-tag').value = banner.tag || '';
          document.getElementById('input-banner-type').value = banner.type || 'hero';
          document.getElementById('input-banner-image').value = banner.image_url || '';
          document.getElementById('input-banner-cta-text').value = banner.cta_text || '';
          document.getElementById('input-banner-cta-link').value = banner.cta_link || '';
          document.getElementById('input-banner-active').checked = Boolean(banner.is_active);
          document.getElementById('modal-banner-title').textContent = 'Editar Banner / Aviso';
          modal?.showModal();
        }
        return;
      }

      const btnDelete = e.target.closest('[data-action="delete-banner"]');
      if (btnDelete) {
        const id = btnDelete.dataset.id;
        const confirmed = await ConfirmDialog.show({
          title: 'Eliminar Banner',
          message: '¿Está seguro de eliminar este banner? No volverá a mostrarse en la página principal.',
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
          type: 'danger'
        });
        if (confirmed) {
          try {
            await BannerService.delete(id);
            Toast.show('Banner eliminado correctamente', 'success');
            this.banners = this.banners.filter(b => b.id != id);
            this.filter();
          } catch (err) {
            console.error(err);
            Toast.show('Error al eliminar banner', 'error');
          }
        }
      }
    });

    // Guardar / Actualizar
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('banner-edit-id').value;
      const payload = {
        title: document.getElementById('input-banner-title').value.trim(),
        subtitle: document.getElementById('input-banner-subtitle').value.trim(),
        tag: document.getElementById('input-banner-tag').value.trim(),
        type: document.getElementById('input-banner-type').value,
        image_url: document.getElementById('input-banner-image').value.trim(),
        cta_text: document.getElementById('input-banner-cta-text').value.trim(),
        cta_link: document.getElementById('input-banner-cta-link').value.trim(),
        is_active: document.getElementById('input-banner-active').checked
      };

      try {
        if (id) {
          await BannerService.update(id, payload);
          Toast.show('Banner actualizado correctamente', 'success');
        } else {
          await BannerService.create(payload);
          Toast.show('Banner creado y publicado con éxito', 'success');
        }
        modal?.close();
        const refreshed = await BannerService.list();
        this.banners = refreshed.results || [];
        this.filter();
      } catch (err) {
        console.error(err);
        Toast.show('Error al guardar el banner', 'error');
      }
    });
  }
};
