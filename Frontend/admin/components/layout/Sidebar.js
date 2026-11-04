// components/layout/Sidebar.js
export function renderSidebar(currentPath = '') {
  return `
    <aside id="sidebar" class="w-64 bg-deep-obsidian text-white flex flex-col transition-all duration-300">
      <div class="p-5 flex items-center justify-between border-b border-gray-800">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-electric-blue flex items-center justify-center text-white font-black text-sm">
            EV
          </div>
          <div>
            <h1 class="font-display font-bold text-sm text-white leading-tight">El Vecino Admin</h1>
            <p class="text-[10px] text-gray-400">Electrodomésticos</p>
          </div>
        </div>
        <button id="toggle-sidebar" class="md:hidden text-gray-400 hover:text-white" aria-label="Cerrar menú">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <nav class="flex-1 p-3 space-y-1 text-xs">
        <a href="#/dashboard" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition font-semibold">
          <span class="material-symbols-outlined text-lg">storefront</span>
          <span>Página Principal</span>
        </a>
        <a href="#/products" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition font-semibold">
          <span class="material-symbols-outlined text-lg">inventory_2</span>
          <span>Productos</span>
        </a>
        <a href="#/categories" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition font-semibold">
          <span class="material-symbols-outlined text-lg">category</span>
          <span>Categorías</span>
        </a>
        <a href="#/promotions" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition font-semibold">
          <span class="material-symbols-outlined text-lg">auto_awesome_motion</span>
          <span>Promociones & Combos</span>
        </a>
        <a href="#/banners" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition font-semibold">
          <span class="material-symbols-outlined text-lg">view_carousel</span>
          <span>Banners & Avisos</span>
        </a>
        <a href="#/reviews" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition font-semibold">
          <span class="material-symbols-outlined text-lg">rate_review</span>
          <span>Reseñas & Testimonios</span>
        </a>
        <a href="#/reports" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition font-semibold">
          <span class="material-symbols-outlined text-lg">picture_as_pdf</span>
          <span>Reportes PDF</span>
        </a>
      </nav>
      <div class="p-3 border-t border-gray-800/80">
        <div class="bg-gray-900/60 p-3 rounded-xl border border-gray-800 flex items-center gap-2.5">
          <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <div>
            <p class="text-[11px] font-bold text-gray-200 leading-none">WhatsApp Activo</p>
            <p class="text-[10px] text-gray-400 mt-0.5">Asesoría y Cotizaciones</p>
          </div>
        </div>
      </div>
    </aside>
  `;
}