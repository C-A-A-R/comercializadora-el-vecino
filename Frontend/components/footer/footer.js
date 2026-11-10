/**
 * footer.js - Componente modular y reutilizable de Footer
 * Comercializadora EL VECINO - Electric Neo-Tech
 */

const Footer = {
  activePath: 'inicio',

  /**
   * Determina de forma dinámica la ruta relativa a la raíz del Frontend
   * @returns {string} Prefijo relativo, por ejemplo: './', '../../../'
   */
  getRootPrefix() {
    // 1. Detección precisa analizando el tag <script> que incluyó footer.js
    const script = document.querySelector('script[src*="components/footer/footer.js"]') ||
                   document.querySelector('script[src*="footer.js"]');
    if (script && typeof script.getAttribute === 'function') {
      const srcAttr = script.getAttribute('src') || '';
      const idx = srcAttr.indexOf('components/footer/footer.js');
      if (idx !== -1) {
        return srcAttr.substring(0, idx);
      }
    }

    // 2. Fallback analizando la estructura de carpetas en window.location.pathname
    const path = (window.location.pathname || '').replace(/\\/g, '/');
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
   * Detecta automáticamente la ruta activa analizando la URL actual o la sugerencia provista
   * @param {string} [suggestedPath] - Ruta sugerida: 'inicio' | 'promociones' | 'catalogo' | 'categorias' | 'destacados' | 'tiktok' | 'contacto'
   * @returns {string} Ruta activa resuelta
   */
  determineActivePath(suggestedPath) {
    let path = '';
    let href = '';
    try {
      path = decodeURIComponent(window.location.pathname || '').toLowerCase().replace(/\\/g, '/');
      href = decodeURIComponent(window.location.href || '').toLowerCase();
    } catch (e) {
      path = (window.location.pathname || '').toLowerCase().replace(/\\/g, '/');
      href = (window.location.href || '').toLowerCase();
    }

    // 1. Auto-detección prioritaria mediante análisis de la URL/archivo actual
    if (path.includes('categoria') || href.includes('categoria')) {
      return 'categorias';
    }
    if (path.includes('promocion') || href.includes('promocion')) {
      return 'promociones';
    }
    if (path.includes('catalogo') || path.includes('/product/') || path.includes('product.html') || path.includes('detail.html') || href.includes('catalogo')) {
      return 'catalogo';
    }
    if (path.includes('destacado') || href.includes('destacado')) {
      return 'destacados';
    }
    if (path.includes('tiktok') || path.includes('video') || href.includes('tiktok')) {
      return 'tiktok';
    }
    if (path.includes('contacto') || href.includes('contacto')) {
      return 'contacto';
    }

    // 2. Si la sugerencia explícita es distinta a 'inicio' y 'auto', respetarla
    if (suggestedPath && suggestedPath !== 'inicio' && suggestedPath !== 'auto') {
      return suggestedPath;
    }

    // 3. Si coincide con inicio o es la portada principal
    return 'inicio';
  },

  /**
   * Monta el footer en el selector objetivo o lo agrega al final del body
   * @param {string} selector - Selector del contenedor objetivo (default: '#footer-mount')
   * @param {string} [activePath] - Ruta activa: 'inicio' | 'promociones' | 'catalogo' | 'categorias' | 'destacados' | 'tiktok' | 'contacto' | 'auto'
   */
  mount(selector = '#footer-mount', activePath = 'auto') {
    const resolvedPath = this.determineActivePath(activePath);
    this.activePath = resolvedPath;

    let target = document.querySelector(selector);
    if (!target) {
      target = document.createElement('div');
      target.id = 'footer-mount';
      document.body.appendChild(target);
    }

    const rootPrefix = this.getRootPrefix();
    const catalogUrl = `${rootPrefix}client/modules/product/product.html`;
    const destacadosUrl = `${rootPrefix}client/modules/destacados/destacados.html`;
    const currentYear = new Date().getFullYear();

    const footerHtml = `
      <footer class="footer" id="mainFooter">
        <div class="container footer-inner">
          <div class="footer-top">
            <div class="footer-brand">
              <div class="brand-icon-box">
                <span class="material-symbols-outlined text-neon-cyan">bolt</span>
              </div>
              <span class="footer-brand-title">EL VECINO</span>
            </div>

            <div class="footer-nav-links">
              <a href="${rootPrefix}index.html" class="${resolvedPath === 'inicio' ? 'text-neon-cyan active' : ''}">Inicio</a>
              <a href="${rootPrefix}promociones.html" class="${resolvedPath === 'promociones' ? 'text-neon-cyan active' : ''}">Promociones</a>
              <a href="${catalogUrl}" class="${resolvedPath === 'catalogo' ? 'text-neon-cyan active' : ''}">Catálogo</a>
              <a href="${rootPrefix}categorias.html" class="${resolvedPath === 'categorias' ? 'text-neon-cyan active' : ''}">Categorías</a>
              <a href="${destacadosUrl}" class="${resolvedPath === 'destacados' ? 'text-neon-cyan active' : ''}">Destacados</a>
              <a href="${rootPrefix}tiktok.html" class="${resolvedPath === 'tiktok' ? 'text-neon-cyan active' : ''}">Vídeo Catálogo</a>
              <a href="${rootPrefix}contacto.html" class="${resolvedPath === 'contacto' ? 'text-neon-cyan active' : ''}">Contacto</a>
            </div>
          </div>

          <div class="footer-bottom">
            <p>© ${currentYear} EL VECINO. Catálogo Técnico y Comercial sin precios fijos online.</p>
            <p>Sistema Electric Neo-Tech con Cotización Directa.</p>
          </div>
        </div>
      </footer>
    `;

    if (target.tagName && target.tagName.toLowerCase() === 'footer') {
      target.outerHTML = footerHtml;
    } else {
      target.innerHTML = footerHtml;
    }
  }
};

if (typeof window !== 'undefined') {
  window.Footer = Footer;
}
