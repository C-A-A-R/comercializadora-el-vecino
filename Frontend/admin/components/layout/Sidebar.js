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
  const currentHash = typeof window !== 'undefined' ? (window.location.hash || '#/dashboard') : '#/dashboard';

  const navLinks = [
    { href: '#/dashboard', label: 'Página Principal', icon: 'storefront' },
    { href: '#/products', label: 'Productos', icon: 'inventory_2' },
    { href: '#/categories', label: 'Categorías', icon: 'category' },
    { href: '#/promotions', label: 'Promociones & Combos', icon: 'auto_awesome_motion' },
    { href: '#/special-dates', label: 'Fechas Especiales & Avisos', icon: 'event_upcoming', badge: 'Nuevo' },
    { href: '#/reviews', label: 'Reseñas & Testimonios', icon: 'rate_review' },
    { href: '#/reports', label: 'Reportes PDF', icon: 'picture_as_pdf' }
  ];

  return `
    <!-- Backdrop oscuro para móviles -->
    <div id="sidebar-backdrop" class="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 hidden md:hidden transition-opacity duration-300"></div>

    <!-- Barra lateral / Drawer fijo que no se estira con la página -->
    <aside 
      id="sidebar" 
      class="fixed inset-y-0 left-0 z-50 md:sticky md:top-0 md:self-start w-64 h-screen bg-deep-obsidian text-white flex flex-col flex-shrink-0 transform -translate-x-full md:translate-x-0 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-lg"
    >
      <!-- Cabecera del Sidebar -->
      <div class="p-4 md:p-5 flex items-center justify-between border-b border-gray-800 flex-shrink-0">
        <a href="#/dashboard" class="flex items-center gap-2.5 min-w-0">
          <img 
            src="${logoUrl}" 
            alt="Comercializadora El Vecino" 
            class="w-9 h-9 rounded-xl object-cover border border-gray-700 shadow-sm flex-shrink-0"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" 
          />
          <div class="w-9 h-9 rounded-xl bg-electric-blue hidden items-center justify-center text-white font-black text-sm flex-shrink-0">
            EV
          </div>
          <div class="truncate">
            <h1 class="font-display font-bold text-sm text-white leading-tight truncate">El Vecino Admin</h1>
            <p class="text-[10px] text-gray-400 truncate">Electro & Hogar</p>
          </div>
        </a>

        <!-- Botón para cerrar drawer en móvil -->
        <button 
          id="toggle-sidebar" 
          type="button"
          class="md:hidden p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition cursor-pointer flex items-center justify-center" 
          aria-label="Cerrar menú"
        >
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <!-- Navegación con scroll interno independiente -->
      <nav class="flex-1 p-3 space-y-1 text-xs overflow-y-auto custom-scrollbar">
        ${navLinks.map(link => {
          const isActive = currentHash.startsWith(link.href);
          return `
            <a 
              href="${link.href}" 
              class="flex items-center justify-between px-3.5 py-2.5 rounded-xl transition font-semibold group ${
                isActive 
                  ? 'bg-electric-blue text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
              }"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-lg ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}">
                  ${link.icon}
                </span>
                <span>${link.label}</span>
              </div>
              ${link.badge ? `
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-electric-blue/30 text-neon-cyan border border-electric-blue/40'
                }">
                  ${link.badge}
                </span>
              ` : ''}
            </a>
          `;
        }).join('')}
      </nav>

      <!-- Pie del Sidebar siempre fijo al fondo de la pantalla -->
      <div class="p-3 border-t border-gray-800/80 flex-shrink-0 bg-deep-obsidian">
        <a 
          href="../index.html" 
          target="_blank" 
          class="w-full mb-2 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white p-2.5 rounded-xl border border-gray-700/60 flex items-center justify-between text-xs transition"
        >
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-base text-neon-cyan">storefront</span>
            <span class="font-bold text-[11px]">Ver Catálogo Web</span>
          </div>
          <span class="material-symbols-outlined text-sm">open_in_new</span>
        </a>

        <div class="bg-gray-900/60 p-2.5 rounded-xl border border-gray-800 flex items-center gap-2.5">
          <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <div>
            <p class="text-[11px] font-bold text-gray-200 leading-none">Comercializadora El Vecino</p>
            <p class="text-[9px] text-gray-400 mt-0.5">Sistema Neo-Tech v2.0</p>
          </div>
        </div>
      </div>
    </aside>
  `;
}
