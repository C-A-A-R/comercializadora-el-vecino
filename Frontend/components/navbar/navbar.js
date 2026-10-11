/**
 * navbar.js - Global reusable navigation component for Comercializadora EL VECINO
 * Generates the official Electric Neo-Tech navigation bar and mobile drawer.
 */

const Navbar = {
  activePath: 'inicio',

  /**
   * Mounts the navbar into target selector or prepends to body
   * @param {string} selector - Selector of mounting element (default: '#navbar-mount')
   * @param {string} activePath - Active route key: 'inicio' | 'promociones' | 'catalogo' | 'categorias' | 'destacados' | 'tiktok' | 'contacto'
   */
  mount(selector = '#navbar-mount', activePath = 'inicio') {
    this.activePath = activePath;

    let target = document.querySelector(selector);
    if (!target) {
      target = document.createElement('div');
      target.id = 'navbar-mount';
      document.body.prepend(target);
    }

    // Determine relative paths based on folder depth
    const isModule = window.location.pathname.includes('/client/modules/');
    const rootPrefix = isModule ? '../../../' : './';

    const headerHtml = `
      <header class="header" id="mainHeader">
        <div class="container header-inner">
          <a href="${rootPrefix}index.html" class="brand-logo">
            <div class="brand-icon-box">
              <span class="material-symbols-outlined">bolt</span>
            </div>
            <div class="brand-info">
              <span class="brand-name">EL VECINO</span>
              <span class="brand-tag">Electro &amp; Hogar</span>
            </div>
          </a>

          <nav>
            <ul class="nav-links">
              <li><a href="${rootPrefix}index.html" class="nav-link ${activePath === 'inicio' ? 'active' : ''}">Inicio</a></li>
              <li><a href="${rootPrefix}promociones.html" class="nav-link nav-link-promo ${activePath === 'promociones' ? 'active' : ''}">Promociones &amp; Combos ⚡</a></li>
              <li><a href="${rootPrefix}catalogo.html" class="nav-link ${activePath === 'catalogo' ? 'active' : ''}">Catálogo</a></li>
              <li><a href="${rootPrefix}categorias.html" class="nav-link ${activePath === 'categorias' ? 'active' : ''}">Categorías</a></li>
              <li><a href="${rootPrefix}destacados.html" class="nav-link ${activePath === 'destacados' ? 'active' : ''}">Destacados</a></li>
              <li><a href="${rootPrefix}tiktok.html" class="nav-link ${activePath === 'tiktok' ? 'active' : ''}">Vídeo Catálogo</a></li>
              <li><a href="${rootPrefix}contacto.html" class="nav-link ${activePath === 'contacto' ? 'active' : ''}">Contacto</a></li>
            </ul>
          </nav>

          <div class="flex items-center gap-sm">
            <a href="${rootPrefix}contacto.html" class="btn btn-neon-cyan btn-sm">
              <span class="material-symbols-outlined">chat</span>
              <span>Cotizar WA</span>
            </a>
            <button id="mobileMenuBtn" class="mobile-menu-toggle" aria-label="Abrir Menú">
              <span class="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>

        <!-- Cajón de navegación móvil -->
        <div id="mobileNavDrawer" class="mobile-nav-drawer">
          <ul class="mobile-nav-links">
            <li><a href="${rootPrefix}index.html" class="mobile-nav-link ${activePath === 'inicio' ? 'active' : ''}" onclick="closeMobileNav()"><span class="material-symbols-outlined text-neon-cyan">home</span> Inicio</a></li>
            <li><a href="${rootPrefix}promociones.html" class="mobile-nav-link ${activePath === 'promociones' ? 'active' : ''}" onclick="closeMobileNav()"><span class="material-symbols-outlined text-neon-magenta">local_fire_department</span> Promociones &amp; Combos ⚡</a></li>
            <li><a href="${rootPrefix}catalogo.html" class="mobile-nav-link ${activePath === 'catalogo' ? 'active' : ''}" onclick="closeMobileNav()"><span class="material-symbols-outlined">format_list_bulleted</span> Catálogo Técnico</a></li>
            <li><a href="${rootPrefix}categorias.html" class="mobile-nav-link ${activePath === 'categorias' ? 'active' : ''}" onclick="closeMobileNav()"><span class="material-symbols-outlined">grid_view</span> Categorías</a></li>
            <li><a href="${rootPrefix}destacados.html" class="mobile-nav-link ${activePath === 'destacados' ? 'active' : ''}" onclick="closeMobileNav()"><span class="material-symbols-outlined">star</span> Destacados</a></li>
            <li><a href="${rootPrefix}tiktok.html" class="mobile-nav-link ${activePath === 'tiktok' ? 'active' : ''}" onclick="closeMobileNav()"><span class="material-symbols-outlined">smart_display</span> Vídeo Catálogo</a></li>
            <li><a href="${rootPrefix}contacto.html" class="mobile-nav-link ${activePath === 'contacto' ? 'active' : ''}" onclick="closeMobileNav()"><span class="material-symbols-outlined">contact_support</span> Contacto &amp; Asesoría</a></li>
          </ul>
        </div>
      </header>
    `;

    if (target.tagName && target.tagName.toLowerCase() === 'header') {
      target.outerHTML = headerHtml;
    } else {
      target.innerHTML = headerHtml;
    }

    this.bindEvents();
  },

  bindEvents() {
    // Definir globalmente closeMobileNav para enlaces móviles
    window.closeMobileNav = function() {
      const drawer = document.getElementById('mobileNavDrawer');
      if (drawer) {
        drawer.classList.remove('open');
      }
    };

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNavDrawer = document.getElementById('mobileNavDrawer');

    if (mobileMenuBtn && !mobileMenuBtn.dataset.bound) {
      mobileMenuBtn.dataset.bound = 'true';
      mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (mobileNavDrawer) {
          mobileNavDrawer.classList.toggle('open');
        }
      });
    }

    // Cerrar al presionar Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.closeMobileNav();
      }
    });

    // Cerrar al hacer click fuera del cajón
    document.addEventListener('click', (e) => {
      const drawer = document.getElementById('mobileNavDrawer');
      const btn = document.getElementById('mobileMenuBtn');
      if (drawer && drawer.classList.contains('open')) {
        if (!drawer.contains(e.target) && (!btn || !btn.contains(e.target))) {
          window.closeMobileNav();
        }
      }
    });
  }
};

if (typeof window !== 'undefined') {
  window.Navbar = Navbar;
}
