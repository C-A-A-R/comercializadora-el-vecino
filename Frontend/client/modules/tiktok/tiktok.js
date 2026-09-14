/**
 * tiktok.js - TikTok showcase controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.Navbar) window.Navbar.mount('#navbar-mount', 'tiktok');
  if (window.Footer) window.Footer.mount('#footer-mount');

  const container = document.getElementById('tiktokGrid');

  async function loadReels() {
    try {
      const reels = await window.TiktokApi.getReels();
      renderReels(reels);
    } catch (e) {
      console.error('[tiktok.js] Error al cargar reels:', e);
    }
  }

  function renderReels(reels) {
    if (!container) return;

    container.innerHTML = reels.map(reel => {
      const waUrl = `https://wa.me/${window.CONFIG.WHATSAPP_PHONE}?text=${encodeURIComponent(`¡Hola EL VECINO! Vi su video en TikTok "${reel.title}" y deseo consultar disponibilidad y precio.`)}`;

      return `
        <div class="tiktok-card group">
          <img src="${reel.thumbnail || 'https://placehold.co/400x700'}" alt="${reel.title}" class="tiktok-card-bg">
          <div class="tiktok-card-overlay"></div>

          <div class="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white border border-white/10">
            <span class="material-symbols-outlined text-neon-magenta text-[16px]">visibility</span>
            <span class="font-bold">${reel.views} views</span>
          </div>

          <div class="tiktok-card-content">
            <div class="flex items-center gap-2 text-xs text-cyan-400 font-bold">
              <span>${reel.author || '@elvecinocolombia'}</span>
              <span>•</span>
              <span class="text-gray-400">Verificado</span>
            </div>

            <h3 class="font-['Outfit'] font-bold text-base text-white leading-snug">
              ${reel.title}
            </h3>

            <div class="pt-2 flex items-center gap-2">
              <a
                href="${waUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-card-quote flex-1 h-10 text-xs justify-center"
              >
                <span class="material-symbols-outlined text-[16px]">chat</span>
                <span>Cotizar este Producto</span>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  loadReels();
});
