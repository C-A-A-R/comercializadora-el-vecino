/**
 * navbar.js - Global reusable navigation component for Comercializadora EL VECINO
 * Generates the official Electric Neo-Tech navigation bar and mobile drawer.
 */

const Navbar = {
  activePath: 'inicio',

  /**
   * Determina de forma dinámica y robusta la ruta relativa a la raíz del Frontend
   * sin importar en qué nivel de anidación o carpeta se encuentre la pantalla.
   * @returns {string} Prefijo relativo, por ejemplo: './', '../', '../../../'
   */
  getRootPrefix() {
    // 1. Detección precisa analizando el tag <script> que incluyó navbar.js
    const script = document.querySelector('script[src*="components/navbar/navbar.js"]') ||
                   document.querySelector('script[src*="navbar.js"]');
    if (script) {
      const srcAttr = script.getAttribute('src') || '';
      const idx = srcAttr.indexOf('components/navbar/navbar.js');
      if (idx !== -1) {
        return srcAttr.substring(0, idx);
      }
    }

    // 2. Fallback analizando la estructura de carpetas en window.location.pathname
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/client/modules/')) {
      return '../../../';
    } else if (path.includes('/admin/modules/')) {
      return '../../';
    } else if (path.includes('/admin/') || path.includes('/client/')) {
      return '../';
    }
    return './';
  },

  /**
   * Retorna la ruta relativa al logo de Comercializadora EL VECINO
   * @returns {string} Ruta relativa hacia assets/images/logo.jpg
   */
  getLogoPath() {
    return `${this.getRootPrefix()}assets/images/logo.jpg`;
  },

  /**
   * Retorna los enlaces oficiales a redes sociales y canales de contacto directo
   * @returns {Object} Enlaces para Instagram, WhatsApp, TikTok y Gmail
   */
  getSocialLinks() {
    const waPhone = (window.CONFIG?.WHATSAPP_PHONE || window.CONFIG?.whatsappNumber || '584129227264').replace(/\D/g, '');
    return {
      instagram: 'https://www.instagram.com/elvecinocom?stkn=ZDNlZDc0MzIxNw==',
      whatsapp: `https://wa.me/${waPhone}?text=${encodeURIComponent('¡Hola Comercializadora EL VECINO! Me gustaría solicitar más información y cotización.')}`,
      tiktok: 'https://www.tiktok.com/@elvecinocom011?is_from_webapp=1&sender_device=pc',
      gmail: 'mailto:ventas@tuestante.com?subject=Consulta%20Cat%C3%A1logo%20El%20Vecino'
    };
  },

  /**
   * Actualiza automáticamente el icono de pestaña (favicon) de la página
   * actual utilizando la imagen del logo.
   * @param {string} [customUrl] - Ruta o URL opcional del logo
   */
  updateFavicon(customUrl) {
    const iconUrl = customUrl || this.getLogoPath();
    if (!iconUrl) return;

    try {
      // 1. Actualizar o crear <link rel="icon">
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

      // 2. Actualizar o crear <link rel="shortcut icon">
      let shortcutLink = document.querySelector("link[rel='shortcut icon']");
      if (shortcutLink) {
        shortcutLink.href = iconUrl;
        shortcutLink.type = 'image/jpeg';
      }

      // 3. Soporte para navegadores móviles y Apple touch icon
      let appleIcon = document.querySelector("link[rel='apple-touch-icon']");
      if (!appleIcon) {
        appleIcon = document.createElement('link');
        appleIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleIcon);
      }
      appleIcon.href = iconUrl;
    } catch (e) {
      console.warn('[Navbar] No se pudo configurar el favicon:', e);
    }
  },

  /**
   * Mounts the navbar into target selector or prepends to body
   * @param {string} selector - Selector of mounting element (default: '#navbar-mount')
   * @param {string} activePath - Active route key: 'inicio' | 'promociones' | 'catalogo' | 'categorias' | 'destacados' | 'tiktok' | 'contacto'
   */
  mount(selector = '#navbar-mount', activePath = 'inicio') {
    this.activePath = activePath;

    // Calcular rutas relativas según el nivel de anidación de la pantalla actual
    const rootPrefix = this.getRootPrefix();
    const catalogUrl = `${rootPrefix}client/modules/product/product.html`;
    const logoUrl = this.getLogoPath();

    // Actualizar automáticamente el icono de pestaña (favicon) en la pantalla
    this.updateFavicon(logoUrl);

    // Obtener enlaces a redes sociales y canales de contacto directo
    const social = this.getSocialLinks();

    let target = document.querySelector(selector);
    if (!target) {
      target = document.createElement('div');
      target.id = 'navbar-mount';
      document.body.prepend(target);
    }

    const headerHtml = `
      <header class="header" id="mainHeader">
        <div class="container header-inner">
          <a href="${rootPrefix}index.html" class="brand-logo" title="Comercializadora EL VECINO">
            <div class="brand-icon-box">
              <img src="${logoUrl}" alt="EL VECINO — Electro &amp; Hogar" loading="eager">
            </div>
            <div class="brand-info">
              <span class="brand-name">EL VECINO</span>
              <span class="brand-tag">Electro &amp; Hogar</span>
            </div>
          </a>

          <!-- Buscador Global en Navbar (Desktop) -->
          <div class="header-search-container" id="headerSearchContainer">
            <div class="header-search-bar">
              <span class="material-symbols-outlined header-search-icon">search</span>
              <input
                type="text"
                id="navbarSearchInput"
                class="header-search-input"
                placeholder="Buscar productos, categorías, marcas, combos..."
                autocomplete="off"
                aria-label="Buscar productos, categorías, subcategorías y combos"
              />
              <button type="button" id="navbarSearchClear" class="header-search-clear" style="display:none;" aria-label="Limpiar búsqueda">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div id="navbarSearchResults" class="header-search-dropdown" style="display:none;"></div>
          </div>

          <nav class="desktop-nav">
            <ul class="nav-links">
              <li><a href="${rootPrefix}index.html" class="nav-link ${activePath === 'inicio' ? 'active' : ''}">Inicio</a></li>
              <li><a href="${rootPrefix}promociones.html" class="nav-link nav-link-promo ${activePath === 'promociones' ? 'active' : ''}">Promociones &amp; Combos ⚡</a></li>
              <li><a href="${catalogUrl}" class="nav-link ${activePath === 'catalogo' ? 'active' : ''}">Catálogo</a></li>
              <li><a href="${rootPrefix}categorias.html" class="nav-link ${activePath === 'categorias' ? 'active' : ''}">Categorías</a></li>
              <li><a href="${rootPrefix}tiktok.html" class="nav-link ${activePath === 'tiktok' ? 'active' : ''}">Vídeo Catálogo</a></li>
              
              <!-- Contacto con menú desplegable de Redes Sociales -->
              <li class="nav-item-dropdown" id="navContactDropdown">
                <button type="button" class="nav-link nav-dropdown-trigger ${activePath === 'contacto' ? 'active' : ''}" id="contactDropdownBtn" aria-expanded="false" aria-haspopup="true">
                  <span>Contacto</span>
                  <span class="material-symbols-outlined nav-dropdown-arrow">expand_more</span>
                </button>
                <div class="nav-dropdown-menu" id="contactDropdownMenu" role="menu" aria-label="Redes sociales y canales de contacto">
                  <!-- Instagram -->
                  <a href="${social.instagram}" target="_blank" rel="noopener noreferrer" class="nav-dropdown-item social-ig" role="menuitem">
                    <div class="social-icon-wrapper ig-gradient">
                      <svg viewBox="0 0 24 24" class="social-svg" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div class="social-text">
                      <span class="social-name">Instagram</span>
                      <span class="social-sub">@elvecinocom</span>
                    </div>
                    <span class="material-symbols-outlined social-arrow">arrow_outward</span>
                  </a>

                  <!-- WhatsApp -->
                  <a href="${social.whatsapp}" target="_blank" rel="noopener noreferrer" class="nav-dropdown-item social-wa" role="menuitem">
                    <div class="social-icon-wrapper wa-green">
                      <svg viewBox="0 0 24 24" class="social-svg" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                    </div>
                    <div class="social-text">
                      <span class="social-name">WhatsApp</span>
                      <span class="social-sub">+58 412 922 7264</span>
                    </div>
                    <span class="material-symbols-outlined social-arrow">arrow_outward</span>
                  </a>

                  <!-- TikTok -->
                  <a href="${social.tiktok}" target="_blank" rel="noopener noreferrer" class="nav-dropdown-item social-tk" role="menuitem">
                    <div class="social-icon-wrapper tk-dark">
                      <svg viewBox="0 0 24 24" class="social-svg" fill="currentColor">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                    </div>
                    <div class="social-text">
                      <span class="social-name">TikTok</span>
                      <span class="social-sub">@elvecinocom011</span>
                    </div>
                    <span class="material-symbols-outlined social-arrow">arrow_outward</span>
                  </a>

                  <!-- Gmail -->
                  <a href="${social.gmail}" class="nav-dropdown-item social-gmail" role="menuitem">
                    <div class="social-icon-wrapper gmail-red">
                      <svg viewBox="0 0 24 24" class="social-svg" fill="currentColor">
                        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                      </svg>
                    </div>
                    <div class="social-text">
                      <span class="social-name">Gmail</span>
                      <span class="social-sub">ventas@tuestante.com</span>
                    </div>
                    <span class="material-symbols-outlined social-arrow">mail</span>
                  </a>
                </div>
              </li>
            </ul>
          </nav>

          <div class="header-actions">
            <!-- Botón de Búsqueda Móvil -->
            <button type="button" id="mobileSearchBtn" class="mobile-search-toggle" aria-label="Abrir buscador" title="Buscar productos y combos">
              <span class="material-symbols-outlined">search</span>
            </button>

            <!-- Botón Carrito en Navbar -->
            <button type="button" id="navbarCartBtn" class="navbar-cart-btn" aria-label="Abrir lista de cotización" title="Ver lista de cotización">
              <span class="material-symbols-outlined navbar-cart-icon">shopping_cart</span>
              <span class="navbar-cart-badge" id="navbarCartBadge">0</span>
            </button>

            <!-- Botón Cotizar WhatsApp Directo -->
            <a href="${social.whatsapp}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan btn-sm btn-header-quote" title="Cotizar por WhatsApp">
              <span class="material-symbols-outlined">chat</span>
              <span class="btn-quote-text">Cotizar WA</span>
            </a>

            <!-- Botón Hamburguesa (Rayas) para desglose de opciones -->
            <button type="button" id="mobileMenuBtn" class="mobile-menu-toggle" aria-label="Abrir Menú de navegación" aria-expanded="false" title="Menú de navegación">
              <span class="material-symbols-outlined hamburger-icon">menu</span>
              <span class="material-symbols-outlined close-icon" style="display:none;">close</span>
            </button>
          </div>
        </div>

        <!-- Buscador Móvil Desplegable (Debajo del Header) -->
        <div id="mobileSearchCollapsible" class="mobile-search-collapsible" style="display:none;">
          <div class="container mobile-search-inner">
            <div class="header-search-bar mobile-search-bar-active">
              <span class="material-symbols-outlined header-search-icon">search</span>
              <input
                type="text"
                id="mobileHeaderSearchInput"
                class="header-search-input"
                placeholder="Buscar productos, marcas, combos..."
                autocomplete="off"
                aria-label="Buscar en catálogo"
              />
              <button type="button" id="mobileHeaderSearchClear" class="header-search-clear" style="display:none;" aria-label="Limpiar búsqueda">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <button type="button" id="mobileSearchCloseBtn" class="mobile-search-close-btn" aria-label="Cerrar buscador">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div id="mobileHeaderSearchResults" class="header-search-dropdown mobile-search-dropdown" style="display:none;"></div>
        </div>

        <!-- Cajón de navegación móvil (Desglose de opciones) -->
        <div id="mobileNavDrawer" class="mobile-nav-drawer">
          <div class="mobile-nav-header">
            <span class="mobile-nav-title">Navegación &amp; Opciones</span>
            <button type="button" class="mobile-nav-close-btn" onclick="closeMobileNav()" aria-label="Cerrar Menú">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Buscador Global Móvil en Cajón -->
          <div class="mobile-search-wrapper mb-3">
            <div class="header-search-bar mobile-search-bar">
              <span class="material-symbols-outlined header-search-icon">search</span>
              <input
                type="text"
                id="mobileNavbarSearchInput"
                class="header-search-input"
                placeholder="Buscar productos, categorías, combos..."
                autocomplete="off"
                aria-label="Buscar en catálogo"
              />
              <button type="button" id="mobileNavbarSearchClear" class="header-search-clear" style="display:none;" aria-label="Limpiar búsqueda">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div id="mobileNavbarSearchResults" class="header-search-dropdown mobile-search-dropdown" style="display:none;"></div>
          </div>

          <ul class="mobile-nav-links">
            <li><a href="${rootPrefix}index.html" class="mobile-nav-link ${activePath === 'inicio' ? 'active' : ''}" onclick="closeMobileOverlays()"><span class="material-symbols-outlined text-neon-cyan">home</span> Inicio</a></li>
            <li><a href="javascript:void(0)" class="mobile-nav-link" onclick="closeMobileOverlays(); Navbar.openCart();"><span class="material-symbols-outlined text-electric-blue">shopping_cart</span> <span style="flex:1;">Lista de Cotización</span> <span class="cart-count-pill mobile-drawer-cart-pill" id="mobileDrawerCartPill">0</span></a></li>
            <li><a href="${rootPrefix}promociones.html" class="mobile-nav-link ${activePath === 'promociones' ? 'active' : ''}" onclick="closeMobileOverlays()"><span class="material-symbols-outlined text-neon-magenta">local_fire_department</span> Promociones &amp; Combos ⚡</a></li>
            <li><a href="${catalogUrl}" class="mobile-nav-link ${activePath === 'catalogo' ? 'active' : ''}" onclick="closeMobileOverlays()"><span class="material-symbols-outlined">format_list_bulleted</span> Catálogo Técnico</a></li>
            <li><a href="${rootPrefix}categorias.html" class="mobile-nav-link ${activePath === 'categorias' ? 'active' : ''}" onclick="closeMobileOverlays()"><span class="material-symbols-outlined">grid_view</span> Categorías</a></li>
            <li><a href="${rootPrefix}destacados.html" class="mobile-nav-link ${activePath === 'destacados' ? 'active' : ''}" onclick="closeMobileOverlays()"><span class="material-symbols-outlined">star</span> Destacados</a></li>
            <li><a href="${rootPrefix}tiktok.html" class="mobile-nav-link ${activePath === 'tiktok' ? 'active' : ''}" onclick="closeMobileOverlays()"><span class="material-symbols-outlined">smart_display</span> Vídeo Catálogo</a></li>
            
            <!-- Contacto Desplegable / Acordeón Móvil (Redes Sociales) -->
            <li class="mobile-nav-accordion" id="mobileContactAccordion">
              <button type="button" class="mobile-nav-link mobile-accordion-trigger ${activePath === 'contacto' ? 'active' : ''}" id="mobileContactTrigger" aria-expanded="false">
                <div class="flex items-center gap-sm">
                  <span class="material-symbols-outlined text-neon-cyan">forum</span>
                  <span>Contacto &amp; Redes</span>
                </div>
                <span class="material-symbols-outlined mobile-accordion-arrow">expand_more</span>
              </button>
              <div class="mobile-accordion-content" id="mobileContactContent">
                <!-- Instagram -->
                <a href="${social.instagram}" target="_blank" rel="noopener noreferrer" class="mobile-social-link social-ig" onclick="closeMobileOverlays()">
                  <div class="social-icon-wrapper ig-gradient">
                    <svg viewBox="0 0 24 24" class="social-svg" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div class="mobile-social-info">
                    <span class="mobile-social-title">Instagram</span>
                    <span class="mobile-social-handle">@elvecinocom</span>
                  </div>
                  <span class="material-symbols-outlined mobile-social-arrow">arrow_outward</span>
                </a>

                <!-- WhatsApp -->
                <a href="${social.whatsapp}" target="_blank" rel="noopener noreferrer" class="mobile-social-link social-wa" onclick="closeMobileOverlays()">
                  <div class="social-icon-wrapper wa-green">
                    <svg viewBox="0 0 24 24" class="social-svg" fill="currentColor">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </div>
                  <div class="mobile-social-info">
                    <span class="mobile-social-title">WhatsApp</span>
                    <span class="mobile-social-handle">+58 412 922 7264</span>
                  </div>
                  <span class="material-symbols-outlined mobile-social-arrow">arrow_outward</span>
                </a>

                <!-- TikTok -->
                <a href="${social.tiktok}" target="_blank" rel="noopener noreferrer" class="mobile-social-link social-tk" onclick="closeMobileOverlays()">
                  <div class="social-icon-wrapper tk-dark">
                    <svg viewBox="0 0 24 24" class="social-svg" fill="currentColor">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  </div>
                  <div class="mobile-social-info">
                    <span class="mobile-social-title">TikTok</span>
                    <span class="mobile-social-handle">@elvecinocom011</span>
                  </div>
                  <span class="material-symbols-outlined mobile-social-arrow">arrow_outward</span>
                </a>

                <!-- Gmail -->
                <a href="${social.gmail}" class="mobile-social-link social-gmail" onclick="closeMobileOverlays()">
                  <div class="social-icon-wrapper gmail-red">
                    <svg viewBox="0 0 24 24" class="social-svg" fill="currentColor">
                      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                    </svg>
                  </div>
                  <div class="mobile-social-info">
                    <span class="mobile-social-title">Gmail</span>
                    <span class="mobile-social-handle">ventas@tuestante.com</span>
                  </div>
                  <span class="material-symbols-outlined mobile-social-arrow">mail</span>
                </a>
              </div>
            </li>
          </ul>

          <div class="mobile-nav-footer">
            <a href="${social.whatsapp}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan btn-block" onclick="closeMobileOverlays()">
              <span class="material-symbols-outlined">chat</span>
              <span>Cotizar por WhatsApp</span>
            </a>
          </div>
        </div>
      </header>
      <div class="header-spacer" aria-hidden="true"></div>
    `;

    if (target.tagName && target.tagName.toLowerCase() === 'header') {
      target.outerHTML = headerHtml;
    } else {
      target.innerHTML = headerHtml;
    }

    this.ensureCartLoaded(rootPrefix);
    this.bindEvents(rootPrefix);
    this.initSearch(rootPrefix);
    this.updateCartBadge();
  },

  bindEvents(rootPrefix) {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNavDrawer = document.getElementById('mobileNavDrawer');
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
    const mobileSearchCollapsible = document.getElementById('mobileSearchCollapsible');
    const mobileSearchCloseBtn = document.getElementById('mobileSearchCloseBtn');
    const mobileHeaderSearchInput = document.getElementById('mobileHeaderSearchInput');

    // Contacto Dropdown (Desktop)
    const navContactDropdown = document.getElementById('navContactDropdown');
    const contactDropdownBtn = document.getElementById('contactDropdownBtn');

    // Contacto Acordeón (Móvil)
    const mobileContactTrigger = document.getElementById('mobileContactTrigger');
    const mobileContactAccordion = document.getElementById('mobileContactAccordion');

    window.closeMobileNav = function () {
      if (mobileNavDrawer) {
        mobileNavDrawer.classList.remove('open');
      }
      if (mobileMenuBtn) {
        mobileMenuBtn.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        const hamb = mobileMenuBtn.querySelector('.hamburger-icon');
        const closeI = mobileMenuBtn.querySelector('.close-icon');
        if (hamb && closeI) {
          hamb.style.display = 'inline-block';
          closeI.style.display = 'none';
        }
      }
    };

    window.openMobileNav = function () {
      window.closeMobileSearch?.();
      if (mobileNavDrawer) {
        mobileNavDrawer.classList.add('open');
      }
      if (mobileMenuBtn) {
        mobileMenuBtn.classList.add('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        const hamb = mobileMenuBtn.querySelector('.hamburger-icon');
        const closeI = mobileMenuBtn.querySelector('.close-icon');
        if (hamb && closeI) {
          hamb.style.display = 'none';
          closeI.style.display = 'inline-block';
        }
      }
    };

    window.toggleMobileNav = function () {
      if (mobileNavDrawer && mobileNavDrawer.classList.contains('open')) {
        window.closeMobileNav();
      } else {
        window.openMobileNav();
      }
    };

    window.closeMobileSearch = function () {
      if (mobileSearchCollapsible) {
        mobileSearchCollapsible.style.display = 'none';
        mobileSearchCollapsible.classList.remove('open');
      }
      if (mobileSearchBtn) {
        mobileSearchBtn.classList.remove('active');
        mobileSearchBtn.setAttribute('aria-expanded', 'false');
      }
      const mobDrop = document.getElementById('mobileHeaderSearchResults');
      if (mobDrop) mobDrop.style.display = 'none';
    };

    window.openMobileSearch = function () {
      window.closeMobileNav();
      if (mobileSearchCollapsible) {
        mobileSearchCollapsible.style.display = 'block';
        mobileSearchCollapsible.classList.add('open');
      }
      if (mobileSearchBtn) {
        mobileSearchBtn.classList.add('active');
        mobileSearchBtn.setAttribute('aria-expanded', 'true');
      }
      if (mobileHeaderSearchInput) {
        setTimeout(() => mobileHeaderSearchInput.focus(), 60);
      }
    };

    window.toggleMobileSearch = function () {
      if (mobileSearchCollapsible && mobileSearchCollapsible.classList.contains('open')) {
        window.closeMobileSearch();
      } else {
        window.openMobileSearch();
      }
    };

    window.closeMobileOverlays = function () {
      window.closeMobileNav();
      window.closeMobileSearch();
      if (navContactDropdown) {
        navContactDropdown.classList.remove('open');
        if (contactDropdownBtn) contactDropdownBtn.setAttribute('aria-expanded', 'false');
      }
    };

    if (mobileMenuBtn && !mobileMenuBtn.dataset.bound) {
      mobileMenuBtn.dataset.bound = 'true';
      mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.toggleMobileNav();
      });
    }

    if (mobileSearchBtn && !mobileSearchBtn.dataset.bound) {
      mobileSearchBtn.dataset.bound = 'true';
      mobileSearchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.toggleMobileSearch();
      });
    }

    if (mobileSearchCloseBtn && !mobileSearchCloseBtn.dataset.bound) {
      mobileSearchCloseBtn.dataset.bound = 'true';
      mobileSearchCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.closeMobileSearch();
      });
    }

    // Botón Carrito en Navbar
    const navbarCartBtn = document.getElementById('navbarCartBtn');
    if (navbarCartBtn && !navbarCartBtn.dataset.bound) {
      navbarCartBtn.dataset.bound = 'true';
      navbarCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        Navbar.openCart();
      });
    }

    // Header fijado: detección de scroll para elevación y sombra
    const handleScroll = () => {
      const header = document.getElementById('mainHeader');
      if (!header) return;
      if (window.scrollY > 8) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Sincronización continua de badge de carrito
    const handleCartUpdate = () => Navbar.updateCartBadge();
    window.addEventListener('cart:updated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);

    // Interacción Dropdown Contacto en Desktop (Click y Hover)
    if (contactDropdownBtn && !contactDropdownBtn.dataset.bound) {
      contactDropdownBtn.dataset.bound = 'true';
      contactDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navContactDropdown) {
          const isOpen = navContactDropdown.classList.toggle('open');
          contactDropdownBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
      });
    }

    if (navContactDropdown && !navContactDropdown.dataset.hoverBound) {
      navContactDropdown.dataset.hoverBound = 'true';
      navContactDropdown.addEventListener('mouseenter', () => {
        navContactDropdown.classList.add('open');
        if (contactDropdownBtn) contactDropdownBtn.setAttribute('aria-expanded', 'true');
      });
      navContactDropdown.addEventListener('mouseleave', () => {
        navContactDropdown.classList.remove('open');
        if (contactDropdownBtn) contactDropdownBtn.setAttribute('aria-expanded', 'false');
      });
    }

    // Interacción Acordeón Contacto en Móvil
    if (mobileContactTrigger && !mobileContactTrigger.dataset.bound) {
      mobileContactTrigger.dataset.bound = 'true';
      mobileContactTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (mobileContactAccordion) {
          const isOpen = mobileContactAccordion.classList.toggle('open');
          mobileContactTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
      });
    }

    // Cerrar al presionar Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.closeMobileOverlays();
        const deskDrop = document.getElementById('navbarSearchResults');
        const mobDrop = document.getElementById('mobileNavbarSearchResults');
        const mobHeaderDrop = document.getElementById('mobileHeaderSearchResults');
        if (deskDrop) deskDrop.style.display = 'none';
        if (mobDrop) mobDrop.style.display = 'none';
        if (mobHeaderDrop) mobHeaderDrop.style.display = 'none';
      }
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      // 1. Drawer móvil
      const drawer = document.getElementById('mobileNavDrawer');
      const menuBtn = document.getElementById('mobileMenuBtn');
      if (drawer && drawer.classList.contains('open')) {
        if (!drawer.contains(e.target) && (!menuBtn || !menuBtn.contains(e.target))) {
          window.closeMobileNav();
        }
      }

      // 2. Buscador móvil desplegable
      const searchCol = document.getElementById('mobileSearchCollapsible');
      const searchBtn = document.getElementById('mobileSearchBtn');
      if (searchCol && searchCol.classList.contains('open')) {
        if (!searchCol.contains(e.target) && (!searchBtn || !searchBtn.contains(e.target))) {
          window.closeMobileSearch();
        }
      }

      // 3. Dropdown buscador desktop
      const searchContainer = document.getElementById('headerSearchContainer');
      const deskDrop = document.getElementById('navbarSearchResults');
      if (searchContainer && deskDrop && !searchContainer.contains(e.target)) {
        deskDrop.style.display = 'none';
      }

      // 4. Dropdown buscador móvil dentro del drawer
      const mobileSearchWrapper = document.querySelector('.mobile-search-wrapper');
      const mobDrop = document.getElementById('mobileNavbarSearchResults');
      if (mobileSearchWrapper && mobDrop && !mobileSearchWrapper.contains(e.target)) {
        mobDrop.style.display = 'none';
      }

      // 5. Dropdown de contacto desktop
      const contactDrop = document.getElementById('navContactDropdown');
      const contactBtn = document.getElementById('contactDropdownBtn');
      if (contactDrop && contactDrop.classList.contains('open')) {
        if (!contactDrop.contains(e.target) && (!contactBtn || !contactBtn.contains(e.target))) {
          contactDrop.classList.remove('open');
          if (contactBtn) contactBtn.setAttribute('aria-expanded', 'false');
        }
      }
    });
  },

  /**
   * Inicializa la búsqueda en vivo en productos, categorías, subcategorías y combos
   */
  initSearch(rootPrefix) {
    const bindSearchInput = (inputId, clearId, dropdownId) => {
      const input = document.getElementById(inputId);
      const clearBtn = document.getElementById(clearId);
      const dropdown = document.getElementById(dropdownId);
      if (!input || !dropdown) return;

      let debounceTimer = null;

      const handleSearch = () => {
        const query = input.value.trim();
        if (clearBtn) {
          clearBtn.style.display = query ? 'flex' : 'none';
        }

        if (query.length < 2) {
          dropdown.style.display = 'none';
          dropdown.innerHTML = '';
          return;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const results = this.executeSearch(query);
          dropdown.innerHTML = this.renderDropdownHTML(results, rootPrefix);
          dropdown.style.display = 'block';
        }, 150);
      };

      input.addEventListener('input', handleSearch);
      input.addEventListener('focus', () => {
        if (input.value.trim().length >= 2) {
          handleSearch();
        }
      });

      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          input.value = '';
          clearBtn.style.display = 'none';
          dropdown.style.display = 'none';
          input.focus();
        });
      }

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const query = input.value.trim();
          if (!query) return;

          dropdown.style.display = 'none';
          window.closeMobileOverlays?.();
          this.navigateToCatalogSearch(query, rootPrefix);
        }
      });
    };

    bindSearchInput('navbarSearchInput', 'navbarSearchClear', 'navbarSearchResults');
    bindSearchInput('mobileHeaderSearchInput', 'mobileHeaderSearchClear', 'mobileHeaderSearchResults');
    bindSearchInput('mobileNavbarSearchInput', 'mobileNavbarSearchClear', 'mobileNavbarSearchResults');
  },

  /**
   * Ejecuta la búsqueda sobre productos, categorías, subcategorías y combos
   */
  executeSearch(query) {
    const q = query.toLowerCase();

    // 1. Obtener productos disponibles
    let products = [];
    if (window.PRODUCTS_DATA && Array.isArray(window.PRODUCTS_DATA)) {
      products = window.PRODUCTS_DATA;
    } else if (window.Storage?.getProducts) {
      products = window.Storage.getProducts();
    }
    products = products.map(p => (window.Api?.normalizeProduct ? window.Api.normalizeProduct(p) : p));

    // 2. Obtener categorías
    const categories = window.CATEGORIES_DATA || [];

    // 3. Obtener subcategorías
    let subcategories = window.SUBCATEGORIES_DATA || [];
    if (!subcategories.length) {
      // Extraer dinámicamente de productos si no están precargadas
      const subcatSet = new Set();
      products.forEach(p => {
        if (p.subcategory) subcatSet.add(p.subcategory);
      });
      subcategories = Array.from(subcatSet).map(name => ({ id: name, name }));
    }

    // 4. Obtener combos
    const combos = window.COMBOS_DATA || [];

    // Filtrar Productos
    const matchedProducts = products.filter(p => {
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.summary && p.summary.toLowerCase().includes(q))
      );
    }).slice(0, 4);

    // Filtrar Categorías
    const matchedCategories = categories.filter(c => {
      if (c.id === 'todas') return false;
      const catName = c.name || c.category_name || '';
      return catName.toLowerCase().includes(q) || (c.id && c.id.toLowerCase().includes(q));
    }).slice(0, 3);

    // Filtrar Subcategorías
    const matchedSubcategories = subcategories.filter(s => {
      const subName = s.name || s.sub_category_name || '';
      return subName.toLowerCase().includes(q) || (s.id && s.id.toLowerCase().includes(q));
    }).slice(0, 3);

    // Filtrar Combos / Promociones
    const matchedCombos = combos.filter(cb => {
      const title = cb.title || cb.name || '';
      const sku = cb.sku || '';
      const tag = cb.tagline || '';
      const summary = cb.summary || '';
      const hasItem = Array.isArray(cb.items) && cb.items.some(it => it.name && it.name.toLowerCase().includes(q));
      return (
        title.toLowerCase().includes(q) ||
        sku.toLowerCase().includes(q) ||
        tag.toLowerCase().includes(q) ||
        summary.toLowerCase().includes(q) ||
        hasItem
      );
    }).slice(0, 3);

    const total = matchedProducts.length + matchedCategories.length + matchedSubcategories.length + matchedCombos.length;

    return {
      total,
      query,
      products: matchedProducts,
      categories: matchedCategories,
      subcategories: matchedSubcategories,
      combos: matchedCombos
    };
  },

  /**
   * Renderiza el dropdown de resultados categorizado
   */
  renderDropdownHTML(results, rootPrefix) {
    if (!results) return '';

    if (results.total === 0) {
      return `
        <div class="search-empty-state">
          <span class="material-symbols-outlined search-empty-icon">search_off</span>
          <p class="search-empty-text">No se encontraron resultados para <strong>"${this.escapeHTML(results.query)}"</strong></p>
          <a href="${rootPrefix}client/modules/product/product.html?q=${encodeURIComponent(results.query)}" class="search-btn-catalog">
            Buscar en catálogo completo
          </a>
        </div>
      `;
    }

    let html = `<div class="search-results-list">`;

    // 1. Productos
    if (results.products.length > 0) {
      html += `
        <div class="search-group">
          <div class="search-group-header">
            <span class="material-symbols-outlined">inventory_2</span>
            <span>Productos (${results.products.length})</span>
          </div>
      `;
      results.products.forEach(p => {
        const detailHref = `${rootPrefix}client/modules/product/detail.html?id=${p.id}`;
        html += `
          <a href="${detailHref}" class="search-result-item" onclick="window.closeMobileOverlays?.(); if(window.ProductCard?.openDetail){event.preventDefault(); window.ProductCard.openDetail('${p.id}', '${detailHref}');}">
            <div class="search-item-thumb">
              <img src="${p.image || 'https://placehold.co/80'}" alt="${this.escapeHTML(p.name)}" loading="lazy">
            </div>
            <div class="search-item-details">
              <span class="search-item-title">${this.escapeHTML(p.name)}</span>
              <div class="search-item-meta">
                <span class="search-item-badge">${this.escapeHTML(p.brand || 'El Vecino')}</span>
                <span>•</span>
                <span class="search-item-cat">${this.escapeHTML(p.categoryName || p.category || 'Equipo')}</span>
              </div>
            </div>
            <span class="material-symbols-outlined search-item-arrow">chevron_right</span>
          </a>
        `;
      });
      html += `</div>`;
    }

    // 2. Categorías
    if (results.categories.length > 0) {
      html += `
        <div class="search-group">
          <div class="search-group-header">
            <span class="material-symbols-outlined">grid_view</span>
            <span>Categorías (${results.categories.length})</span>
          </div>
      `;
      results.categories.forEach(c => {
        const catHref = `${rootPrefix}client/modules/product/product.html?cat=${encodeURIComponent(c.id)}`;
        html += `
          <a href="${catHref}" class="search-result-item" onclick="window.closeMobileOverlays?.()">
            <div class="search-item-icon-box">
              <span class="material-symbols-outlined">${c.icon || 'kitchen'}</span>
            </div>
            <div class="search-item-details">
              <span class="search-item-title">${this.escapeHTML(c.name || c.category_name)}</span>
              <span class="search-item-meta">${this.escapeHTML(c.count || 'Línea de Bodega')}</span>
            </div>
            <span class="material-symbols-outlined search-item-arrow">chevron_right</span>
          </a>
        `;
      });
      html += `</div>`;
    }

    // 3. Subcategorías
    if (results.subcategories.length > 0) {
      html += `
        <div class="search-group">
          <div class="search-group-header">
            <span class="material-symbols-outlined">label</span>
            <span>Subcategorías (${results.subcategories.length})</span>
          </div>
      `;
      results.subcategories.forEach(s => {
        const subName = s.name || s.sub_category_name || s.id;
        const subHref = `${rootPrefix}client/modules/product/product.html?subcat=${encodeURIComponent(subName)}`;
        html += `
          <a href="${subHref}" class="search-result-item" onclick="window.closeMobileOverlays?.()">
            <div class="search-item-icon-box subcat-icon">
              <span class="material-symbols-outlined">sell</span>
            </div>
            <div class="search-item-details">
              <span class="search-item-title">${this.escapeHTML(subName)}</span>
              <span class="search-item-meta">Filtro técnico por modelo</span>
            </div>
            <span class="material-symbols-outlined search-item-arrow">chevron_right</span>
          </a>
        `;
      });
      html += `</div>`;
    }

    // 4. Combos y Promociones
    if (results.combos.length > 0) {
      html += `
        <div class="search-group">
          <div class="search-group-header promo-header">
            <span class="material-symbols-outlined">local_fire_department</span>
            <span>Combos & Promociones (${results.combos.length})</span>
          </div>
      `;
      results.combos.forEach(cb => {
        const promoHref = `${rootPrefix}promociones.html#${cb.id}`;
        html += `
          <a href="${promoHref}" class="search-result-item" onclick="window.closeMobileOverlays?.()">
            <div class="search-item-thumb">
              <img src="${cb.image || 'https://placehold.co/80'}" alt="${this.escapeHTML(cb.title || cb.name)}" loading="lazy">
            </div>
            <div class="search-item-details">
              <span class="search-item-title">${this.escapeHTML(cb.title || cb.name)}</span>
              <span class="search-item-meta text-neon-magenta font-semibold">${this.escapeHTML(cb.badge || '⚡ Combo Promocional')}</span>
            </div>
            <span class="material-symbols-outlined search-item-arrow">chevron_right</span>
          </a>
        `;
      });
      html += `</div>`;
    }

    // Pie con enlace directo a catálogo
    html += `
      <div class="search-footer-action">
        <a href="${rootPrefix}client/modules/product/product.html?q=${encodeURIComponent(results.query)}" class="search-footer-link" onclick="window.closeMobileOverlays?.()">
          <span>Ver todos los resultados de "${this.escapeHTML(results.query)}" en Catálogo</span>
          <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
        </a>
      </div>
    </div>`;

    return html;
  },

  navigateToCatalogSearch(query, rootPrefix) {
    const isCatalog = window.location.pathname.includes('/product.html') || window.location.pathname.includes('catalogo.html');
    if (isCatalog) {
      const localInput = document.getElementById('catalogSearchInput');
      if (localInput) {
        localInput.value = query;
        localInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      window.dispatchEvent(new CustomEvent('catalog:search', { detail: { query } }));
    } else {
      window.location.href = `${rootPrefix}client/modules/product/product.html?q=${encodeURIComponent(query)}`;
    }
  },

  /**
   * Actualiza el badge del contador de productos en el carrito de la barra de navegación
   */
  updateCartBadge() {
    let count = 0;
    if (window.Storage?.getCartCount) {
      count = window.Storage.getCartCount();
    } else if (window.Storage?.getCart) {
      const cart = window.Storage.getCart() || [];
      count = cart.reduce((acc, it) => acc + (it.quantity || 1), 0);
    }

    const badge = document.getElementById('navbarCartBadge');
    if (badge) {
      badge.textContent = count;
      badge.classList.remove('has-items');
      if (count > 0) {
        void badge.offsetWidth; // re-flow para reiniciar animación pop
        badge.classList.add('has-items');
      }
    }

    const mobilePill = document.getElementById('mobileDrawerCartPill');
    if (mobilePill) {
      mobilePill.textContent = count;
    }
  },

  /**
   * Abre la caja lateral derecha del carrito
   */
  openCart() {
    if (window.CartModal && typeof window.CartModal.open === 'function') {
      window.CartModal.open();
    } else {
      // Reintentar si está cargando dinámicamente
      setTimeout(() => {
        if (window.CartModal) window.CartModal.open();
      }, 100);
    }
  },

  /**
   * Garantiza que los estilos y scripts del carrito estén listos en cualquier página
   */
  ensureCartLoaded(rootPrefix) {
    // 1. Estilos CSS del carrito
    if (!document.querySelector('link[href*="cart-modal.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${rootPrefix}components/cart-modal/cart-modal.css`;
      document.head.appendChild(link);
    }

    // 2. Storage helper
    if (!window.Storage && !document.querySelector('script[src*="storage.js"]')) {
      const s = document.createElement('script');
      s.src = `${rootPrefix}js/storage.js`;
      s.onload = () => this.updateCartBadge();
      document.head.appendChild(s);
    }

    // 3. OrderService helper
    if (!window.OrderService && !document.querySelector('script[src*="order.service.js"]')) {
      const s = document.createElement('script');
      s.src = `${rootPrefix}js/service/order.service.js`;
      document.head.appendChild(s);
    }

    // 4. CartModal component
    if (!window.CartModal && !document.querySelector('script[src*="cart-modal.js"]')) {
      const s = document.createElement('script');
      s.src = `${rootPrefix}components/cart-modal/cart-modal.js`;
      s.onload = () => {
        if (window.CartModal?.init) {
          window.CartModal.init();
        }
      };
      document.head.appendChild(s);
    } else if (window.CartModal?.init) {
      window.CartModal.init();
    }
  },

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};

if (typeof window !== 'undefined') {
  window.Navbar = Navbar;

  // Auto-actualizar favicon en cuanto se importe la barra de navegación
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (window.Navbar && typeof window.Navbar.updateFavicon === 'function') {
          window.Navbar.updateFavicon();
        }
      });
    } else {
      Navbar.updateFavicon();
    }
  }
}

