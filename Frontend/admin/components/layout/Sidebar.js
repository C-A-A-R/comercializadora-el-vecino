// components/layout/Sidebar.js

/**
 * Obtiene la ruta del logo de forma dinámica y absoluta en base a la ubicación del módulo
 * @returns {string} URL o ruta al archivo logo.jpg
 */
export function getLogoPath() {
  try {
    return new URL('../../../assets/images/logo.jpg', import.meta.url).href;
  } catch (e) {
    const path = (typeof window !== 'undefined' ? window.location.pathname : '').replace(/\\/g, '/');
    if (path.includes('/admin/modules/')) {
      return '../../assets/images/logo.jpg';
    } else if (path.includes('/admin/')) {
      return '../assets/images/logo.jpg';
    }
    return 'assets/images/logo.jpg';
  }
}

/**
 * Agrega o actualiza de forma automática el icono de pestaña (favicon)
 * de la página en el <head> utilizando el logo de Comercializadora El Vecino.
 * @param {string} [customUrl] - Ruta o URL opcional del favicon
 */
export function updateFavicon(customUrl) {
  if (typeof document === 'undefined') return;

  const iconUrl = customUrl || getLogoPath();
  if (!iconUrl) return;

  try {
    // 1. <link rel="icon">
    let iconLink = document.querySelector("link[rel~='icon']");
    if (iconLink) {
      iconLink.href = iconUrl;
      iconLink.type = 'image/jpeg';
    } else {
      iconLink = document.createElement('link');
      iconLink.rel = 'icon';
      iconLink.type = 'image/jpeg';
      iconLink.href = iconUrl;
      document.head.appendChild(iconLink);
    }

    // 2. <link rel="shortcut icon">
    let shortcutLink = document.querySelector("link[rel='shortcut icon']");
    if (shortcutLink) {
      shortcutLink.href = iconUrl;
      shortcutLink.type = 'image/jpeg';
    } else {
      shortcutLink = document.createElement('link');
      shortcutLink.rel = 'shortcut icon';
      shortcutLink.type = 'image/jpeg';
      shortcutLink.href = iconUrl;
      document.head.appendChild(shortcutLink);
    }

    // 3. Apple Touch Icon para dispositivos móviles
    let appleIcon = document.querySelector("link[rel='apple-touch-icon']");
    if (appleIcon) {
      appleIcon.href = iconUrl;
    } else {
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      appleIcon.href = iconUrl;
      document.head.appendChild(appleIcon);
    }
  } catch (err) {
    console.warn('[Sidebar] Error al configurar el icono de pestaña:', err);
  }
}

// Inyección automática al importar el drawer en cualquier vista o layout
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => updateFavicon());
  } else {
    updateFavicon();
  }
}

export function renderSidebar(currentPath = '') {
  // Asegurar icono de pestaña al renderizar el drawer
  updateFavicon();

  const logoUrl = getLogoPath();

  return `
    <aside id="sidebar" class="w-64 bg-deep-obsidian text-white flex flex-col transition-all duration-300">
      <div class="p-5 flex items-center justify-between border-b border-gray-800">
        <div class="flex items-center gap-2.5">
          <img 
            src="${logoUrl}" 
            alt="Comercializadora El Vecino" 
            class="w-8 h-8 rounded-lg object-cover border border-gray-700 shadow-sm flex-shrink-0"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" 
          />
          <div class="w-8 h-8 rounded-lg bg-electric-blue hidden items-center justify-center text-white font-black text-sm flex-shrink-0">
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