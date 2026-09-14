/**
 * promociones.js - Promotions controller connecting view with promociones.api.js
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.Navbar) window.Navbar.mount('#navbar-mount', 'promociones');
  if (window.Footer) window.Footer.mount('#footer-mount');

  const promosContainer = document.getElementById('promotionsGrid');

  async function loadPromotions() {
    try {
      const promos = await window.PromocionesApi.getPromociones();
      renderPromotions(promos);
    } catch (error) {
      console.error('[promociones.js] Error cargando promociones:', error);
    }
  }

  function renderPromotions(promos) {
    if (!promosContainer) return;

    if (promos.length === 0) {
      promosContainer.innerHTML = `
        <div class="col-span-full text-center py-12 text-gray-500">
          No hay promociones activas en este momento.
        </div>
      `;
      return;
    }

    promosContainer.innerHTML = promos.map(promo => {
      const waUrl = window.OrderService.buildPromoQuoteUrl(promo);
      const formattedPromoPrice = window.CONFIG.formatCurrency(promo.promoPrice);
      const formattedOriginal = window.CONFIG.formatCurrency(promo.originalPrice);
      const formattedSaving = window.CONFIG.formatCurrency(promo.saving);

      return `
        <div class="promo-card">
          <div class="relative w-full aspect-video bg-slate-surface overflow-hidden flex items-center justify-center p-4">
            <span class="absolute top-3 left-3 bg-neon-magenta text-white font-['Outfit'] font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow">
              ${promo.badge || 'PROMO EXCLUSIVA'}
            </span>
            <img class="w-full h-full object-contain" src="${promo.image || 'https://placehold.co/400'}" alt="${promo.title}">
          </div>

          <div class="p-6 flex flex-col justify-between flex-1 gap-4">
            <div>
              <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span class="font-bold text-electric-blue uppercase">${promo.category || 'COMBO'}</span>
                <span class="font-semibold text-emerald-600">${promo.stockNote || 'STOCK ACTIVO'}</span>
              </div>
              <h3 class="font-['Outfit'] font-bold text-lg text-deep-obsidian leading-snug">
                ${promo.title}
              </h3>
              <p class="text-xs text-gray-600 mt-2 line-clamp-2">
                ${promo.description}
              </p>
            </div>

            <div>
              <div class="p-3 bg-blue-50/60 rounded-xl mb-4 flex items-center justify-between">
                <div>
                  <div class="text-xs text-gray-500">Precio Promo:</div>
                  <div class="font-['Outfit'] font-extrabold text-xl text-deep-obsidian">${formattedPromoPrice}</div>
                  <div class="text-xs text-gray-400 line-through">${formattedOriginal}</div>
                </div>
                <div class="text-right">
                  <span class="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md">
                    Ahorras ${formattedSaving}
                  </span>
                </div>
              </div>

              <a
                href="${waUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-card-quote w-full justify-center h-12 text-sm shadow-md"
              >
                <span class="material-symbols-outlined text-[20px]">chat</span>
                <span>Apartar Promo vía WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  loadPromotions();
});
