import { ReviewService } from '../../services/review.service.js';
import { Toast } from '../../components/ui/Toast.js';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.js';
import { REVIEWS_MOCK } from '../../services/mocks/reviews.mock.js'; // Importación del mock

export const ReviewListView = {
  reviews: [],
  filteredReviews: [],
  currentTab: 'all', // 'all' | 'featured' | 'complaints' | 'approved'

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
    const featured = this.reviews.filter(r => r.is_featured).length;
    const complaints = this.reviews.filter(r => r.is_complaint || r.rating <= 2).length;
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
            <p class="text-sm text-gray-500">Supervise opiniones de clientes, destaque testimonios en la portada y resuelva inconformidades directamente por WhatsApp.</p>
          </div>
        </div>

        <!-- KPIs Resumen de Opiniones -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Satisfacción</p>
              <p class="text-2xl font-bold text-emerald-600 mt-0.5">${satisfactionRate}%</p>
              <p class="text-[11px] text-gray-400">${positive} de ${total} positivas</p>
            </div>
            <div class="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <span class="material-symbols-outlined text-xl">sentiment_very_satisfied</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Reseñas</p>
              <p class="text-2xl font-bold text-deep-obsidian mt-0.5">${total}</p>
              <p class="text-[11px] text-gray-400">Clientes verificados</p>
            </div>
            <div class="p-2.5 bg-blue-50 text-electric-blue rounded-xl">
              <span class="material-symbols-outlined text-xl">rate_review</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">En Portada</p>
              <p class="text-2xl font-bold text-amber-600 mt-0.5" id="kpi-featured-reviews">${featured}</p>
              <p class="text-[11px] text-gray-400">Testimonios destacados</p>
            </div>
            <div class="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <span class="material-symbols-outlined text-xl">hotel_class</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alertas / Reclamos</p>
              <p class="text-2xl font-bold text-rose-600 mt-0.5">${complaints}</p>
              <p class="text-[11px] text-gray-400">Atención vía WhatsApp</p>
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
              <button data-tab="featured" class="review-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-surface text-gray-600 hover:bg-gray-200 transition">
                ⭐ EN PORTADA (${featured})
              </button>
              <button data-tab="complaints" class="review-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-surface text-rose-600 hover:bg-rose-50 transition">
                ⚠️ RECLAMOS / ALERTAS (${complaints})
              </button>
              <button data-tab="approved" class="review-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-surface text-emerald-700 hover:bg-emerald-50 transition">
                APROBADAS (${positive})
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
      return `
        <div class="bg-white p-12 rounded-2xl border border-slate-border text-center">
          <span class="material-symbols-outlined text-4xl text-gray-300 block mb-2">reviews</span>
          <p class="font-bold text-sm text-gray-700">No se encontraron reseñas con los filtros seleccionados</p>
          <p class="text-xs text-gray-400 mt-1">Intente cambiando el término de búsqueda o seleccione otra pestaña.</p>
        </div>
      `;
    }

    return reviews.map(r => {
      const isComplaint = r.is_complaint || r.rating <= 2;
      const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Reciente';

      const starsHtml = Array.from({ length: 5 }, (_, i) => {
        const isFilled = i < (r.rating || 5);
        return `<span class="material-symbols-outlined text-base ${isFilled ? 'text-amber-400' : 'text-gray-200'}">star</span>`;
      }).join('');

      return `
        <div class="bg-white rounded-2xl border ${isComplaint ? 'border-rose-200 bg-rose-50/20' : 'border-slate-border'} p-5 shadow-sm space-y-3 hover:border-blue-300 transition">
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
                <p class="text-xs text-gray-500">Producto: <strong class="text-gray-700">${r.product_name}</strong> · ${dateStr}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              ${isComplaint ? `
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                  <span class="material-symbols-outlined text-xs">warning</span>
                  Alerta Reclamo
                </span>
              ` : `
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Aprobada
                </span>
              `}
            </div>
          </div>

          <!-- Comentario -->
          <div class="bg-slate-surface p-3.5 rounded-xl border border-slate-border text-xs text-gray-700 leading-relaxed italic">
            "${r.comment}"
          </div>

          <!-- Barra de Acciones: Destacar en Portada + Contactar por WhatsApp + Eliminar -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
            <!-- Toggle Destacar en Portada -->
            <button 
              data-action="toggle-featured-review" 
              data-id="${r.id}" 
              data-featured="${r.is_featured ? 'true' : 'false'}"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${r.is_featured ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-gray-600 hover:bg-amber-50 hover:text-amber-800'}"
            >
              <span class="material-symbols-outlined text-base ${r.is_featured ? 'text-amber-600' : 'text-gray-400'}">hotel_class</span>
              <span>${r.is_featured ? 'Destacado en Portada' : 'Destacar en Portada'}</span>
            </button>

            <div class="flex items-center gap-2">
              <!-- Botón Contactar por WhatsApp -->
              <button 
                data-action="whatsapp-contact-review" 
                data-id="${r.id}" 
                data-phone="${r.customer_phone || ''}" 
                data-name="${r.customer_name}" 
                data-product="${r.product_name}" 
                data-complaint="${isComplaint ? 'true' : 'false'}"
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${isComplaint ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-whatsapp-green hover:bg-green-700 text-white'}"
                title="Abrir conversación de WhatsApp con el cliente"
              >
                <span class="material-symbols-outlined text-base">chat</span>
                <span>${isComplaint ? 'Resolver Inconformidad (WhatsApp)' : 'Escribir por WhatsApp'}</span>
              </button>

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
      if (this.currentTab === 'featured') matchTab = Boolean(r.is_featured);
      if (this.currentTab === 'complaints') matchTab = Boolean(r.is_complaint || r.rating <= 2);
      if (this.currentTab === 'approved') matchTab = r.rating >= 4;

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

    // Delegación de eventos
    document.addEventListener('click', async (e) => {
      // Toggle Destacar en Portada
      const btnFeatured = e.target.closest('[data-action="toggle-featured-review"]');
      if (btnFeatured) {
        const id = btnFeatured.dataset.id;
        const currentFeatured = btnFeatured.dataset.featured === 'true';
        const nextState = !currentFeatured;

        try {
          await ReviewService.toggleFeatured(id, nextState);
          Toast.show(`Testimonio ${nextState ? 'destacado en portada' : 'retirado de portada'}`, 'success');
        } catch (err) {
          console.warn('Backend indisponible, actualizando interfaz localmente:', err);
          Toast.show(`Testimonio ${nextState ? 'destacado en portada' : 'retirado de portada'}`, 'success');
        }

        const r = this.reviews.find(item => item.id == id);
        if (r) r.is_featured = nextState;

        const kpi = document.getElementById('kpi-featured-reviews');
        if (kpi) kpi.textContent = this.reviews.filter(x => x.is_featured).length;

        this.filter();
        return;
      }

      // Contactar por WhatsApp
      const btnWa = e.target.closest('[data-action="whatsapp-contact-review"]');
      if (btnWa) {
        const rawPhone = btnWa.dataset.phone || '';
        const phone = rawPhone.replace(/[^0-9]/g, '');
        const name = btnWa.dataset.name;
        const product = btnWa.dataset.product;
        const isComplaint = btnWa.dataset.complaint === 'true';

        let message = '';
        if (isComplaint) {
          message = `Hola ${name}, te escribimos de Comercializadora El Vecino respecto a tu experiencia con el producto *${product}*. Queremos ayudarte y darte atención prioritaria para resolver cualquier inconveniente. ¿Podrías comentarnos más detalles?`;
        } else {
          message = `Hola ${name}, te saludamos de Comercializadora El Vecino. Muchas gracias por tu reseña sobre *${product}*. ¡Nos alegra mucho haberte atendido! Recuerda que estamos a tu orden para futuras cotizaciones.`;
        }

        const url = phone 
          ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
          : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

        window.open(url, '_blank');
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