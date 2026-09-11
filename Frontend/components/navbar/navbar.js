/**
 * navbar.js - Global navigation component with dynamic badge and responsive drawer
 */

const Navbar = {
  activePath: 'inicio',

  /**
   * Mounts the navbar into target selector or prepends to body
   */
  mount(selector = '#navbar-mount', activePath = 'inicio') {
    this.activePath = activePath;
    let target = document.querySelector(selector);
    if (!target) {
      target = document.createElement('div');
      target.id = 'navbar-mount';
      document.body.prepend(target);
    }

    // Calcular rutas relativas según el nivel de anidación
    const isModule = window.location.pathname.includes('/client/modules/');
    const isRoot = !isModule && !window.location.pathname.includes('/admin/');
    const rootPrefix = isModule ? '../../../' : './';

    const cartCount = window.Storage?.getCartCount() || 0;
    const user = window.AuthService?.getCurrentUser();
    const phone = window.CONFIG?.WHATSAPP_PHONE || '573001234567';

    target.innerHTML = `
      <header class="navbar-header">
        <div class="navbar-container">
          <!-- Brand Logo -->
          <a class="navbar-brand" href="${rootPrefix}index.html">
            <div class="navbar-brand-icon">
              <span class="material-symbols-outlined text-[24px]">bolt</span>
            </div>
            <div class="navbar-brand-text">
              <span class="navbar-brand-title">EL VECINO</span>
              <span class="navbar-brand-subtitle">Electro &amp; Hogar</span>
            </div>
          </a>

          <!-- Quick Search -->
          <div class="navbar-search">
            <span class="material-symbols-outlined navbar-search-icon">search</span>
            <input
              type="text"
              id="globalNavSearch"
              class="navbar-search-input"
              placeholder="Buscar electrodomésticos, TVs..."
            />
          </div>

          <!-- Desktop Navigation -->
          <nav class="navbar-nav">
            <a href="${rootPrefix}index.html" class="navbar-link ${activePath === 'inicio' ? 'active' : ''}">Inicio</a>
            <a href="${rootPrefix}client/modules/product/product.html" class="navbar-link ${activePath === 'catalogo' ? 'active' : ''}">Catálogo</a>
            <a href="${rootPrefix}client/modules/categorias/categorias.html" class="navbar-link ${activePath === 'categorias' ? 'active' : ''}">Categorías</a>
            <a href="${rootPrefix}client/modules/promociones/promociones.html" class="navbar-link ${activePath === 'promociones' ? 'active' : ''}">Promociones</a>
            <a href="${rootPrefix}client/modules/destacados/destacados.html" class="navbar-link ${activePath === 'destacados' ? 'active' : ''}">Destacados</a>
            <a href="${rootPrefix}client/modules/tiktok/tiktok.html" class="navbar-link ${activePath === 'tiktok' ? 'active' : ''}">TikTok</a>
            <a href="${rootPrefix}client/modules/contacto/contacto.html" class="navbar-link ${activePath === 'contacto' ? 'active' : ''}">Contacto</a>
          </nav>

          <!-- Actions -->
          <div class="navbar-actions">
            <!-- Cart Button -->
            <button class="btn-nav-cart" id="btnOpenCart" type="button" aria-label="Abrir Cotización">
              <span class="material-symbols-outlined text-[22px]">shopping_bag</span>
              <span class="nav-cart-badge" id="navCartCount" style="${cartCount > 0 ? '' : 'display:none;'}">${cartCount}</span>
            </button>

            <!-- WhatsApp Direct Quote -->
            <a
              href="https://wa.me/${phone}?text=${encodeURIComponent('¡Hola EL VECINO! Deseo cotizar disponibilidad de equipos en bodega.')}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-nav-whatsapp"
            >
              <span class="material-symbols-outlined text-[20px]">chat</span>
              <span class="hidden sm:inline">Cotizar WhatsApp</span>
            </a>

            <!-- Admin / Login Portal Link -->
            <a
              href="${rootPrefix}loguin.html"
              class="btn-nav-admin"
              title="${user ? 'Sesión: ' + user.name : 'Iniciar Sesión'}"
            >
              <span class="material-symbols-outlined text-[20px] text-neon-magenta">${user ? 'account_circle' : 'shield_person'}</span>
              <span class="hidden md:inline">${user ? (user.role === 'admin' ? 'Admin' : 'Mi Cuenta') : 'Ingreso'}</span>
            </a>

            <!-- Mobile Hamburger -->
            <button class="btn-nav-hamburger" id="btnToggleMobileMenu" type="button" aria-label="Abrir Menú">
              <span class="material-symbols-outlined text-[24px]">menu</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Mobile Navigation Drawer -->
      <div class="mobile-nav-backdrop" id="mobileNavBackdrop">
        <div class="mobile-nav-drawer">
          <div class="mobile-nav-header">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-electric-blue text-[22px]">bolt</span>
              <span class="font-headline-sm text-headline-sm text-deep-obsidian font-bold">EL VECINO</span>
            </div>
            <button class="btn-nav-hamburger" id="btnCloseMobileMenu" type="button">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div class="mobile-nav-body">
            <a href="${rootPrefix}index.html" class="mobile-nav-link ${activePath === 'inicio' ? 'active' : ''}">
              <span class="material-symbols-outlined">home</span>
              <span>Inicio</span>
            </a>
            <a href="${rootPrefix}client/modules/product/product.html" class="mobile-nav-link ${activePath === 'catalogo' ? 'active' : ''}">
              <span class="material-symbols-outlined">format_list_bulleted</span>
              <span>Catálogo General</span>
            </a>
            <a href="${rootPrefix}client/modules/categorias/categorias.html" class="mobile-nav-link ${activePath === 'categorias' ? 'active' : ''}">
              <span class="material-symbols-outlined">category</span>
              <span>Categorías</span>
            </a>
            <a href="${rootPrefix}client/modules/promociones/promociones.html" class="mobile-nav-link ${activePath === 'promociones' ? 'active' : ''}">
              <span class="material-symbols-outlined">local_fire_department</span>
              <span>Promociones &amp; Combos</span>
            </a>
            <a href="${rootPrefix}client/modules/destacados/destacados.html" class="mobile-nav-link ${activePath === 'destacados' ? 'active' : ''}">
              <span class="material-symbols-outlined">grade</span>
              <span>Destacados</span>
            </a>
            <a href="${rootPrefix}client/modules/tiktok/tiktok.html" class="mobile-nav-link ${activePath === 'tiktok' ? 'active' : ''}">
              <span class="material-symbols-outlined">play_circle</span>
              <span>TikTok Showcase</span>
            </a>
            <a href="${rootPrefix}client/modules/contacto/contacto.html" class="mobile-nav-link ${activePath === 'contacto' ? 'active' : ''}">
              <span class="material-symbols-outlined">support_agent</span>
              <span>Contacto &amp; Asesoría</span>
            </a>
          </div>

          <div class="mobile-nav-footer">
            <a
              href="https://wa.me/${phone}?text=${encodeURIComponent('¡Hola EL VECINO! Deseo cotizar equipos en bodega.')}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-nav-whatsapp justify-center w-full"
            >
              <span class="material-symbols-outlined">chat</span>
              <span>WhatsApp Directo</span>
            </a>
            <a href="${rootPrefix}loguin.html" class="btn-nav-admin justify-center w-full">
              <span class="material-symbols-outlined">shield_person</span>
              <span>Portal de Ingreso</span>
            </a>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(rootPrefix);
  },

  bindEvents(rootPrefix) {
    // Open Cart Drawer
    const btnCart = document.getElementById('btnOpenCart');
    if (btnCart) {
      btnCart.addEventListener('click', () => {
        if (window.CartModal) {
          window.CartModal.open();
        } else {
          console.warn('[Navbar] CartModal no inicializado.');
        }
      });
    }

    // Reactive Cart Badge Update
    window.addEventListener('cart:updated', (e) => {
      const badge = document.getElementById('navCartCount');
      if (badge) {
        const count = window.Storage?.getCartCount() || 0;
        badge.textContent = count;
        badge.style.display = count > 0 ? '' : 'none';
      }
    });

    // Search input with debounce
    const searchInput = document.getElementById('globalNavSearch');
    let debounceTimer;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const query = e.target.value.trim();
          window.dispatchEvent(new CustomEvent('catalog:search', { detail: { query } }));
          // Si no está en catálogo y presiona enter o escribe, redirigir al catálogo
        }, 300);
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const query = e.target.value.trim();
          if (!window.location.pathname.includes('/product/product.html')) {
            window.location.href = `${rootPrefix}client/modules/product/product.html?q=${encodeURIComponent(query)}`;
          }
        }
      });
    }

    // Mobile Menu Toggle
    const backdrop = document.getElementById('mobileNavBackdrop');
    const btnToggle = document.getElementById('btnToggleMobileMenu');
    const btnClose = document.getElementById('btnCloseMobileMenu');

    if (btnToggle && backdrop) {
      btnToggle.addEventListener('click', () => backdrop.classList.add('open'));
    }
    if (btnClose && backdrop) {
      btnClose.addEventListener('click', () => backdrop.classList.remove('open'));
    }
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.classList.remove('open');
      });
    }
  }
};

if (typeof window !== 'undefined') {
  window.Navbar = Navbar;
}
