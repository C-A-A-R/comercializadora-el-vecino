/**
 * footer.js - Componente modular y reutilizable de Footer
 * Comercializadora EL VECINO - Electric Neo-Tech
 */

const Footer = {
  activePath: 'inicio',

  /**
   * Monta el footer en el selector objetivo o lo agrega al final del body
   * @param {string} selector - Selector del contenedor objetivo (default: '#footer-mount')
   * @param {string} activePath - Ruta activa: 'inicio' | 'promociones' | 'catalogo' | 'categorias' | 'destacados' | 'tiktok' | 'contacto'
   */
  mount(selector = '#footer-mount', activePath = 'inicio') {
    this.activePath = activePath;

    let target = document.querySelector(selector);
    if (!target) {
      target = document.createElement('div');
      target.id = 'footer-mount';
      document.body.appendChild(target);
    }

    // Calcular rutas relativas según el nivel de anidación
    const isModule = window.location.pathname.includes('/client/modules/');
    const rootPrefix = isModule ? '../../../' : './';
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
              <a href="${rootPrefix}index.html" class="${activePath === 'inicio' ? 'text-neon-cyan' : ''}">Inicio</a>
              <a href="${rootPrefix}promociones.html" class="${activePath === 'promociones' ? 'text-neon-cyan' : ''}">Promociones</a>
              <a href="${rootPrefix}catalogo.html" class="${activePath === 'catalogo' ? 'text-neon-cyan' : ''}">Catálogo</a>
              <a href="${rootPrefix}categorias.html" class="${activePath === 'categorias' ? 'text-neon-cyan' : ''}">Categorías</a>
              <a href="${rootPrefix}destacados.html" class="${activePath === 'destacados' ? 'text-neon-cyan' : ''}">Destacados</a>
              <a href="${rootPrefix}tiktok.html" class="${activePath === 'tiktok' ? 'text-neon-cyan' : ''}">Vídeo Catálogo</a>
              <a href="${rootPrefix}contacto.html" class="${activePath === 'contacto' ? 'text-neon-cyan' : ''}">Contacto</a>
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
