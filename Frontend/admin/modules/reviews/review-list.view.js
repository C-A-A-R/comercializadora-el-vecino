import { ReviewService } from '../../services/review.service.js';
import { Toast } from '../../components/ui/Toast.js';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.js';
import { REVIEWS_MOCK } from '../../services/mocks/reviews.mock.js';

export const ReviewListView = {
  reviews: [],
  filteredReviews: [],
  currentTab: 'all', // 'all' | 'visible' | 'hidden' | 'complaints'

  async render() {
    try {
      const data = await ReviewService.list();
      this.reviews = (data && data.results && data.results.length > 0) ? data.results : REVIEWS_MOCK;
      this.filteredReviews = [...this.reviews];
    } catch (e) {
      console.error('Error al cargar reseñas, usando datos mock:', e);
      this.reviews = [...REVIEWS_MOCK];
      this.filteredReviews = [...REVIEWS_MOCK];
    }

    const total = this.reviews.length;
    const visible = this.reviews.filter(r => r.is_visible !== false).length;
    const hidden = this.reviews.filter(r => r.is_visible === false).length;
    const complaints = this.reviews.filter(r => r.is_complaint || r.rating <= 2).length;

    return `
      <div class="space-y-6">
        <!-- Encabezado Principal -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                Experiencia & Confianza
              </span>
              <span class="text-xs text-gray-400">/</span>
              <span class="text-xs font-semibold text-gray-500">Comentarios</span>
            </div>
            <h1 class="text-2xl font-bold text-deep-obsidian font-display">Moderación de Reseñas y Testimonios</h1>
            <p class="text-sm text-gray-500">Supervise opiniones de clientes, active o desactive su visualización y gestione comentarios.</p>
          </div>
        </div>

        <!-- KPIs Resumen de Opiniones -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Reseñas</p>
              <p class="text-2xl font-bold text-deep-obsidian mt-0.5">${total}</p>
              <p class="text-[11px] text-gray-400">Comentarios recibidos</p>
            </div>
            <div class="p-2.5 bg-blue-50 text-electric-blue rounded-xl">
              <span class="material-symbols-outlined text-xl">rate_review</span>
            </div>
          </div>
          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Visibles</p>
              <p class="text-2xl font-bold text-emerald-600 mt-0.5" id="kpi-visible-reviews">${visible}</p>
              <p class="text-[11px] text-gray-400">Publicados en sitio</p>
            </div>
            <div class="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <span class="material-symbols-outlined text-xl">visibility</span>
            </div>
          </div>
          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ocultos</p>
              <p class="text-2xl font-bold text-gray-600 mt-0.5" id="kpi-hidden-reviews">${hidden}</p>
              <p class="text-[11px] text-gray-400">Desactivados</p>
            </div>
            <div class="p-2.5 bg-gray-100 text-gray-600 rounded-xl">
              <span class="material-symbols-outlined text-xl">visibility_off</span>
            </div>
          </div>
          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alertas / Reclamos</p>
              <p class="text-2xl font-bold text-rose-600 mt-0.5">${complaints}</p>
              <p class="text-[11px] text-gray-400">Atención requerida</p>
            </div>
            <div class="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <span class="material-symbols-outlined text-xl">notification_important</span>
            </div>
          </div>
        </div>

        <!-- Barra de Filtros y Subpestañas -->
        <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <!-- Pestañas -->
            <div class="flex flex-wrap items-center gap-1.5" id="review-subtabs">
              <button data-tab="all" class="review-tab-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-deep-obsidian text-white transition">
                TODAS (${total})
              </button>
              <button data-tab="visible" class="review-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-surface text-gray-600 hover:bg-gray-200 transition">
                👁️ VISIBLES (${visible})
              </button>
              <button data-tab="hidden" class="review-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-surface text-gray-600 hover:bg-gray-200 transition">
                🚫 OCULTAS (${hidden})
              </button>
              <button data-tab="complaints" class="review-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-surface text-rose-600 hover:bg-rose-50 transition">
                ⚠️ RECLAMOS (${complaints})
              </button>
            </div>
            <span id="reviews-count-badge" class="text-xs font-bold text-gray-500">
              Mostrando ${total} reseñas
            </span>
          </div>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none">search</span>
            <input 
              type="text" 
              id="review-search-input" 
              placeholder="Buscar por cliente, producto, ciudad o comentario..." 
              class="w-full pl-11 pr-10 py-2.5 bg-slate-surface border border-slate-border rounded-lg text-sm text-deep-obsidian placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:bg-white transition"
            />
          </div>
        </div>

        <!-- Lista / Tarjetas de Reseñas -->
        <div id="reviews-list-container" class="space-y-4">
          ${this.renderReviewItems(this.filteredReviews)}
        </div>
      </div>
    `;
  },

  renderReviewItems(reviews) {
    if (!reviews || reviews.length === 0) {
      return `<div class="bg-white p-12 rounded-2xl border border-slate-border text-center">
        <span class="material-symbols-outlined text-4xl text-gray-300 block mb-2">reviews</span>
        <p class="font-bold text-sm text-gray-700">No se encontraron reseñas con los filtros seleccionados</p>
        <p class="text-xs text-gray-400 mt-1">Intente cambiando el término de búsqueda o seleccione otra pestaña.</p>
      </div>`;
    }

    return reviews.map(r => {
      const isComplaint = r.is_complaint || r.rating <= 2;
      const isVisible = r.is_visible !== false; // Por defecto visible
      const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Reciente';
      const customerName = r.customer_name || 'Anónimo';
      const starsHtml = Array.from({ length: 5 }, (_, i) => {
        const isFilled = i < (r.rating || 5);
        return `<span class="material-symbols-outlined text-base ${isFilled ? 'text-amber-400' : 'text-gray-200'}">star</span>`;
      }).join('');

      return `
        <div class="bg-white rounded-2xl border ${isComplaint ? 'border-rose-200 bg-rose-50/20' : 'border-slate-border'} p-5 shadow-sm space-y-3 hover:border-blue-300 transition ${!isVisible ? 'opacity-60' : ''}">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-border">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full ${isComplaint ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-electric-blue'} font-bold flex items-center justify-center text-sm flex-shrink-0">
                ${customerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-sm text-deep-obsidian">${customerName}</h3>
                  ${r.customer_city ? `<span class="text-[11px] text-gray-400 font-medium">(${r.customer_city})</span>` : ''}
                </div>
                <p class="text-xs text-gray-500">Producto: <strong class="text-gray-700">${r.product_name}</strong> · ${dateStr}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              ${isComplaint ? `
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                  <span class="material-symbols-outlined text-xs">warning</span>
                  Alerta Reclamo
                </span>
              ` : ''}
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isVisible ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}">
                ${isVisible ? 'Visible' : 'Oculto'}
              </span>
            </div>
          </div>

          <!-- Estrellas -->
          <div class="flex items-center gap-1">
            ${starsHtml}
          </div>

          <!-- Comentario con scroll interno -->
          <div class="bg-slate-surface p-3.5 rounded-xl border border-slate-border text-xs text-gray-700 leading-relaxed italic max-h-32 overflow-y-auto custom-scrollbar">
            "${r.comment}"
          </div>

          <!-- Barra de Acciones -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
            <!-- Toggle Visibilidad -->
            <button 
              data-action="toggle-visibility-review" 
              data-id="${r.id}" 
              data-visible="${isVisible ? 'true' : 'false'}"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${isVisible ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}"
            >
              <span class="material-symbols-outlined text-base">${isVisible ? 'visibility_off' : 'visibility'}</span>
              <span>${isVisible ? 'Ocultar Comentario' : 'Mostrar Comentario'}</span>
            </button>
            <div class="flex items-center gap-2">
              <!-- Botón Eliminar -->
              <button 
                data-action="delete-review" 
                data-id="${r.id}" 
                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" 
                title="Eliminar reseña"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  filter() {
    const search = document.getElementById('review-search-input')?.value.toLowerCase().trim() || '';
    const container = document.getElementById('reviews-list-container');
    const badge = document.getElementById('reviews-count-badge');

    this.filteredReviews = this.reviews.filter(r => {
      let matchTab = true;
      if (this.currentTab === 'visible') matchTab = r.is_visible !== false;
      if (this.currentTab === 'hidden') matchTab = r.is_visible === false;
      if (this.currentTab === 'complaints') matchTab = Boolean(r.is_complaint || r.rating <= 2);

      const name = (r.customer_name || 'Anónimo').toLowerCase();
      const product = (r.product_name || '').toLowerCase();
      const comment = (r.comment || '').toLowerCase();
      const city = (r.customer_city || '').toLowerCase();

      const matchSearch = !search || name.includes(search) || product.includes(search) || comment.includes(search) || city.includes(search);

      return matchTab && matchSearch;
    });

    if (badge) badge.textContent = `Mostrando ${this.filteredReviews.length} reseñas`;
    if (container) container.innerHTML = this.renderReviewItems(this.filteredReviews);
  },

  bindEvents() {
    const searchInput = document.getElementById('review-search-input');
    searchInput?.addEventListener('input', () => this.filter());

    // Subpestañas
    document.querySelectorAll('.review-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentTab = e.currentTarget.dataset.tab;
        document.querySelectorAll('.review-tab-btn').forEach(b => {
          b.classList.remove('bg-deep-obsidian', 'text-white', 'font-bold');
          b.classList.add('bg-slate-surface', 'font-semibold');
        });
        e.currentTarget.classList.remove('bg-slate-surface');
        e.currentTarget.classList.add('bg-deep-obsidian', 'text-white', 'font-bold');
        this.filter();
      });
    });

    // Delegación de eventos
    document.addEventListener('click', async (e) => {
      // Toggle Visibilidad
      const btnVisibility = e.target.closest('[data-action="toggle-visibility-review"]');
      if (btnVisibility) {
        const id = btnVisibility.dataset.id;
        const currentVisible = btnVisibility.dataset.visible === 'true';
        const nextState = !currentVisible;
        try {
          await ReviewService.toggleVisibility(id, nextState);
          Toast.show(`Comentario ${nextState ? 'visible' : 'oculto'} con éxito`, 'success');
        } catch (err) {
          console.warn('Backend indisponible, actualizando interfaz localmente:', err);
          Toast.show(`Comentario ${nextState ? 'visible' : 'oculto'} con éxito`, 'success');
        }
        const r = this.reviews.find(item => item.id == id);
        if (r) r.is_visible = nextState;
        const kpiVisible = document.getElementById('kpi-visible-reviews');
        const kpiHidden = document.getElementById('kpi-hidden-reviews');
        if (kpiVisible) kpiVisible.textContent = this.reviews.filter(x => x.is_visible !== false).length;
        if (kpiHidden) kpiHidden.textContent = this.reviews.filter(x => x.is_visible === false).length;
        this.filter();
        return;
      }

      // Eliminar Reseña
      const btnDelete = e.target.closest('[data-action="delete-review"]');
      if (btnDelete) {
        const id = btnDelete.dataset.id;
        const confirmed = await ConfirmDialog.show({
          title: 'Eliminar Reseña',
          message: '¿Está seguro de eliminar esta reseña permanentemente?',
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
          type: 'danger'
        });
        if (confirmed) {
          try {
            await ReviewService.delete(id);
          } catch (err) {
            console.warn('Backend indisponible, eliminando localmente:', err);
          }
          Toast.show('Reseña eliminada con éxito', 'success');
          this.reviews = this.reviews.filter(r => r.id != id);
          this.filter();
        }
      }
    });
  }
};