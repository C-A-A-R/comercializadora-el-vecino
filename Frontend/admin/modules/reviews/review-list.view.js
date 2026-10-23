import { ReviewService } from '../../services/review.service.js';
import { ProductService } from '../../services/product.service.js';
import { Toast } from '../../components/ui/Toast.js';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.js';
import { Switch } from '../../components/ui/Switch.js';
import { REVIEWS_MOCK } from '../../services/mocks/reviews.mock.js';

export const ReviewListView = {
  reviews: [],
  filteredReviews: [],
  currentTab: 'all', // 'all' | 'complaints' | 'conformity' | 'visible'

  async render() {
    try {
      const data = await ReviewService.list();
      this.reviews = (data && data.results && data.results.length > 0) ? data.results : REVIEWS_MOCK;
    } catch (e) {
      console.error('Error al cargar reseñas, usando datos mock:', e);
      this.reviews = [...REVIEWS_MOCK];
    }

    // Normalizar estados iniciales de reclamo y visibilidad
    this.reviews.forEach(r => {
      if (r.is_complaint === undefined) {
        r.is_complaint = (r.rating <= 2);
      }
      if (r.is_visible === undefined) {
        // Regla: si es reclamo no se visualiza por defecto
        r.is_visible = !r.is_complaint && r.status !== 'hidden';
      }
    });

    this.filteredReviews = [...this.reviews];

    const total = this.reviews.length;
    const complaints = this.reviews.filter(r => r.is_complaint).length;
    const conformity = this.reviews.filter(r => !r.is_complaint).length;
    const visibleCount = this.reviews.filter(r => r.is_visible).length;
    const positive = this.reviews.filter(r => r.rating >= 4).length;
    const satisfactionRate = total > 0 ? Math.round((positive / total) * 100) : 100;

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
            <p class="text-sm text-gray-500">Supervise opiniones de clientes, gestione la visibilidad en el catálogo y atienda reclamos o conformidades.</p>
          </div>
        </div>

        <!-- KPIs Resumen de Opiniones -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Satisfacción</p>
              <p class="text-2xl font-bold text-emerald-600 mt-0.5" id="kpi-satisfaction-reviews">${satisfactionRate}%</p>
              <p class="text-[11px] text-gray-400">${positive} de ${total} positivas</p>
            </div>
            <div class="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <span class="material-symbols-outlined text-xl">sentiment_very_satisfied</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Reseñas</p>
              <p class="text-2xl font-bold text-deep-obsidian mt-0.5" id="kpi-total-reviews">${total}</p>
              <p class="text-[11px] text-gray-400">Clientes verificados</p>
            </div>
            <div class="p-2.5 bg-blue-50 text-electric-blue rounded-xl">
              <span class="material-symbols-outlined text-xl">rate_review</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Visibles en Catálogo</p>
              <p class="text-2xl font-bold text-emerald-600 mt-0.5" id="kpi-visible-reviews">${visibleCount}</p>
              <p class="text-[11px] text-gray-400">Comentarios publicados</p>
            </div>
            <div class="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <span class="material-symbols-outlined text-xl">visibility</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alertas / Reclamos</p>
              <p class="text-2xl font-bold text-rose-600 mt-0.5" id="kpi-complaints-reviews">${complaints}</p>
              <p class="text-[11px] text-gray-400">Ocultos automáticamente</p>
            </div>
            <div class="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <span class="material-symbols-outlined text-xl">notification_important</span>
            </div>
          </div>
        </div>

        <!-- Barra de Filtros y Subpestañas -->
        <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-1.5" id="review-subtabs">
              <button data-tab="all" class="review-tab-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-deep-obsidian text-white transition">
                TODAS (${total})
              </button>
              <button data-tab="complaints" class="review-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-surface text-rose-600 hover:bg-rose-50 transition">
                ⚠️ RECLAMOS (${complaints})
              </button>
              <button data-tab="conformity" class="review-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-surface text-emerald-700 hover:bg-emerald-50 transition">
                ✅ CONFORMIDAD (${conformity})
              </button>
              <button data-tab="visible" class="review-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-surface text-gray-700 hover:bg-gray-200 transition">
                👁️ VISIBLES (${visibleCount})
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
      const isComplaint = Boolean(r.is_complaint);
      const isVisible = Boolean(r.is_visible);
      const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Reciente';

      return `
        <div class="bg-white rounded-2xl border ${isComplaint ? 'border-rose-200 bg-rose-50/20' : 'border-slate-border'} p-5 shadow-sm space-y-3 hover:border-blue-300 transition" id="review-card-${r.id}">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-border">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full ${isComplaint ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-electric-blue'} font-bold flex items-center justify-center text-sm flex-shrink-0">
                ${(r.customer_name || 'C').charAt(0)}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-sm text-deep-obsidian">${r.customer_name}</h3>
                  ${r.customer_city ? `<span class="text-[11px] text-gray-400 font-medium">(${r.customer_city})</span>` : ''}
                </div>
                <div class="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                  <span>Producto: <strong class="text-gray-700">${r.product_name}</strong></span>
                  <span>· ${dateStr}</span>
                  <button 
                    data-action="toggle-product-visibility-review" 
                    data-product-id="${r.product_id}" 
                    data-product-name="${r.product_name}" 
                    class="inline-flex items-center gap-1 text-[11px] font-semibold text-electric-blue hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition ml-1"
                    title="Gestionar si este producto se muestra o se esconde en el catálogo público"
                  >
                    <span class="material-symbols-outlined text-xs">storefront</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              ${isComplaint ? `
                <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">warning</span>
                  Alerta Reclamo
                </span>
              ` : `
                <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">check_circle</span>
                  Conformidad
                </span>
              `}
            </div>
          </div>

          <!-- COMENTARIO CON SCROLL INTERNO (ALTURA MÁXIMA FIJA) -->
          <div class="bg-slate-surface p-3.5 rounded-xl border border-slate-border text-xs text-gray-700 leading-relaxed italic max-h-32 overflow-y-auto custom-scrollbar">
            "${r.comment}"
          </div>

          <!-- Barra de Acciones y Controles -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
            <!-- Switch para Mostrar/Ocultar Comentario -->
            <div class="flex items-center gap-2">
              ${Switch.render({
        dataAction: 'toggle-review-visibility',
        dataId: r.id,
        checked: isVisible,
        label: isVisible ? 'Visible en catálogo' : 'Oculto del catálogo',
        labelClass: `text-xs font-bold ${isVisible ? 'text-emerald-700' : 'text-gray-500'}`
      })}
            </div>

            <!-- Botones de Acción: Reclamo/Conformidad y Eliminar -->
            <div class="flex items-center gap-2">
              ${isComplaint ? `
                <button 
                  data-action="toggle-review-complaint" 
                  data-id="${r.id}" 
                  data-target="conformity"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition shadow-sm"
                  title="Cambiar este comentario a estado de Conformidad"
                >
                  <span class="material-symbols-outlined text-base text-emerald-600">thumb_up</span>
                  <span>Marcar como Conformidad</span>
                </button>
              ` : `
                <button 
                  data-action="toggle-review-complaint" 
                  data-id="${r.id}" 
                  data-target="complaint"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition shadow-sm"
                  title="Marcar este comentario como Reclamo (se ocultará automáticamente del catálogo)"
                >
                  <span class="material-symbols-outlined text-base text-rose-600">report_problem</span>
                  <span>Marcar como Reclamo</span>
                </button>
              `}

              <button 
                data-action="delete-review" 
                data-id="${r.id}" 
                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" 
                title="Eliminar reseña permanentemente"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  updateKpis() {
    const total = this.reviews.length;
    const complaints = this.reviews.filter(r => r.is_complaint).length;
    const conformity = this.reviews.filter(r => !r.is_complaint).length;
    const visibleCount = this.reviews.filter(r => r.is_visible).length;
    const positive = this.reviews.filter(r => r.rating >= 4).length;
    const satisfactionRate = total > 0 ? Math.round((positive / total) * 100) : 100;

    const kpiSatisfaction = document.getElementById('kpi-satisfaction-reviews');
    const kpiTotal = document.getElementById('kpi-total-reviews');
    const kpiVisible = document.getElementById('kpi-visible-reviews');
    const kpiComplaints = document.getElementById('kpi-complaints-reviews');

    if (kpiSatisfaction) kpiSatisfaction.textContent = `${satisfactionRate}%`;
    if (kpiTotal) kpiTotal.textContent = total;
    if (kpiVisible) kpiVisible.textContent = visibleCount;
    if (kpiComplaints) kpiComplaints.textContent = complaints;

    const btnAll = document.querySelector('[data-tab="all"]');
    const btnComplaints = document.querySelector('[data-tab="complaints"]');
    const btnConformity = document.querySelector('[data-tab="conformity"]');
    const btnVisible = document.querySelector('[data-tab="visible"]');

    if (btnAll) btnAll.textContent = `TODAS (${total})`;
    if (btnComplaints) btnComplaints.textContent = `⚠️ RECLAMOS (${complaints})`;
    if (btnConformity) btnConformity.textContent = `✅ CONFORMIDAD (${conformity})`;
    if (btnVisible) btnVisible.textContent = `👁️ VISIBLES (${visibleCount})`;
  },

  filter() {
    const search = document.getElementById('review-search-input')?.value.toLowerCase().trim() || '';
    const container = document.getElementById('reviews-list-container');
    const badge = document.getElementById('reviews-count-badge');

    this.filteredReviews = this.reviews.filter(r => {
      let matchTab = true;
      if (this.currentTab === 'complaints') matchTab = Boolean(r.is_complaint);
      if (this.currentTab === 'conformity') matchTab = !r.is_complaint;
      if (this.currentTab === 'visible') matchTab = Boolean(r.is_visible);

      const name = (r.customer_name || '').toLowerCase();
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

    if (this.documentEventsBound) return;
    this.documentEventsBound = true;

    // Delegación de eventos global
    document.addEventListener('click', async (e) => {
      // 1. Switch para mostrar u ocultar comentario (con confirmación)
      const switchBtn = e.target.closest('[data-action="toggle-review-visibility"]');
      if (switchBtn) {
        e.preventDefault();
        const id = switchBtn.dataset.id;
        const r = this.reviews.find(item => item.id == id);
        if (!r) return;

        const currentState = Boolean(r.is_visible);
        const nextState = !currentState;

        const confirmed = await ConfirmDialog.show({
          title: nextState ? 'Mostrar Comentario en Catálogo' : 'Ocultar Comentario del Catálogo',
          message: nextState
            ? '¿Está seguro de publicar y hacer visible este comentario en el catálogo web para todos los clientes?'
            : '¿Está seguro de ocultar este comentario? Dejará de mostrarse públicamente en el catálogo web.',
          confirmText: nextState ? 'Mostrar comentario' : 'Ocultar comentario',
          cancelText: 'Cancelar',
          type: nextState ? 'primary' : 'danger'
        });

        if (confirmed) {
          try {
            await ReviewService.toggleVisibility(id, nextState);
          } catch (err) {
            console.warn('Backend indisponible, actualizando interfaz localmente:', err);
          }
          r.is_visible = nextState;
          r.status = nextState ? 'approved' : 'hidden';
          Toast.show(nextState ? 'Comentario visible en el catálogo' : 'Comentario ocultado del catálogo', 'success');
          this.updateKpis();
          this.filter();
        }
        return;
      }

      // 2. Marcar como Reclamo o Conformidad
      // Si se marca como reclamo: automáticamente pasa a no ser visualizado
      const btnComplaint = e.target.closest('[data-action="toggle-review-complaint"]');
      if (btnComplaint) {
        const id = btnComplaint.dataset.id;
        const targetType = btnComplaint.dataset.target; // 'complaint' | 'conformity'
        const r = this.reviews.find(item => item.id == id);
        if (!r) return;

        if (targetType === 'complaint') {
          const confirmed = await ConfirmDialog.show({
            title: 'Marcar Comentario como Reclamo',
            message: '¿Está seguro de marcar este comentario como reclamo? Pasará automáticamente a no ser visualizado en el catálogo público.',
            confirmText: 'Marcar como Reclamo',
            cancelText: 'Cancelar',
            type: 'danger'
          });

          if (!confirmed) return;

          try {
            await ReviewService.toggleComplaint(id, true);
          } catch (err) {
            console.warn('Backend indisponible, actualizando localmente:', err);
          }
          r.is_complaint = true;
          r.is_visible = false; // AUTOMÁTICAMENTE PASA A NO SER VISUALIZADO
          r.status = 'hidden';
          Toast.show('Comentario marcado como Reclamo y ocultado automáticamente del catálogo.', 'warning');
        } else {
          const confirmed = await ConfirmDialog.show({
            title: 'Marcar Comentario como Conformidad',
            message: '¿Desea cambiar este comentario a estado de Conformidad? El testimonio volverá a estar habilitado para el catálogo público.',
            confirmText: 'Marcar como Conformidad',
            cancelText: 'Cancelar',
            type: 'primary'
          });

          if (!confirmed) return;

          try {
            await ReviewService.toggleComplaint(id, false);
          } catch (err) {
            console.warn('Backend indisponible, actualizando localmente:', err);
          }
          r.is_complaint = false;
          r.is_visible = true; // Al ser conformidad se habilita para visualización
          r.status = 'approved';
          Toast.show('Comentario marcado como Conformidad y habilitado en el catálogo.', 'success');
        }

        this.updateKpis();
        this.filter();
        return;
      }

      // 3. Confirmación para Mostrar o Esconder un Producto asociado al comentario
      const btnProdToggle = e.target.closest('[data-action="toggle-product-visibility-review"]');
      if (btnProdToggle) {
        const productId = btnProdToggle.dataset.productId;
        const productName = btnProdToggle.dataset.productName || 'este producto';

        let currentActive = true;
        try {
          const prod = await ProductService.getById(productId);
          if (prod && prod.is_active !== undefined) {
            currentActive = prod.is_active;
          }
        } catch (err) {
          console.warn('No se pudo verificar estado del producto, asumiendo activo:', err);
        }

        const nextActive = !currentActive;
        const confirmed = await ConfirmDialog.show({
          title: nextActive ? 'Mostrar Producto en el Catálogo' : 'Esconder Producto del Catálogo',
          message: nextActive
            ? `¿Está seguro de mostrar "${productName}" en el catálogo público? Volverá a estar visible para todos los clientes.`
            : `¿Está seguro de esconder "${productName}" del catálogo público? No se eliminará pero los clientes no podrán verlo en el catálogo.`,
          confirmText: nextActive ? 'Mostrar producto' : 'Esconder producto',
          cancelText: 'Cancelar',
          type: nextActive ? 'primary' : 'danger'
        });

        if (confirmed) {
          try {
            await ProductService.toggleActive(productId, nextActive);
            Toast.show(`Producto "${productName}" ${nextActive ? 'mostrado' : 'escondido'} con éxito en el catálogo`, 'success');
          } catch (err) {
            console.error('Error al actualizar visibilidad de producto:', err);
            Toast.show('Error al cambiar la visibilidad del producto', 'error');
          }
        }
        return;
      }

      // 4. Eliminar Reseña
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
          this.updateKpis();
          this.filter();
        }
      }
    });
  }
};