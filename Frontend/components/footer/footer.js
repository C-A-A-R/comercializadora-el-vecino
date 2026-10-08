/**
 * footer.js - Reusable footer component for El Vecino
 */

const Footer = {
  mount(selector = '#footer-mount') {
    let target = document.querySelector(selector);
    if (!target) {
      target = document.createElement('div');
      target.id = 'footer-mount';
      document.body.appendChild(target);
    }

    const isModule = window.location.pathname.includes('/client/modules/');
    const rootPrefix = isModule ? '../../../' : './';
    const phone = window.CONFIG?.WHATSAPP_PHONE || '573001234567';

    target.innerHTML = `
      <footer class="footer-wrapper">
        <div class="footer-container">
          <div class="footer-grid">
            <!-- Col 1: Brand & Slogan -->
            <div class="footer-brand">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-pure-white flex items-center justify-center text-deep-obsidian">
                  <span class="material-symbols-outlined text-electric-blue text-[24px]">bolt</span>
                </div>
                <div>
                  <span class="footer-brand-title">EL VECINO</span>
                  <div class="footer-brand-tag">Distribución Directa de Bodega</div>
                </div>
              </div>
              <p class="footer-desc">
                Comercializadora especializada en electrodomésticos de alta gama, tecnología y equipamiento para el hogar sin intermediarios. Cotización inmediata por WhatsApp con verificación técnica de inventario sellado.
              </p>
              <div class="inline-flex items-center gap-2 text-xs text-white/70">
                <span class="w-2 h-2 rounded-full bg-electric-blue animate-pulse"></span>
                <span>Bodega Central Operativa</span>
              </div>
            </div>

            <!-- Col 2: Navigation Links -->
            <div>
              <div class="footer-col-title">Explorar</div>
              <ul class="footer-nav-list">
                <li><a href="${rootPrefix}index.html" class="footer-nav-link">Inicio</a></li>
                <li><a href="${rootPrefix}client/modules/product/product.html" class="footer-nav-link">Catálogo General</a></li>
                <li><a href="${rootPrefix}client/modules/categorias/categorias.html" class="footer-nav-link">Categorías</a></li>
                <li><a href="${rootPrefix}client/modules/promociones/promociones.html" class="footer-nav-link">Promociones &amp; Combos</a></li>
                <li><a href="${rootPrefix}client/modules/destacados/destacados.html" class="footer-nav-link">Más Cotizados</a></li>
                <li><a href="${rootPrefix}client/modules/tiktok/tiktok.html" class="footer-nav-link">TikTok Showcase</a></li>
              </ul>
            </div>

            <!-- Col 3: Categorías Principales -->
            <div>
              <div class="footer-col-title">Líneas de Equipo</div>
              <ul class="footer-nav-list">
                <li><a href="${rootPrefix}client/modules/product/product.html?cat=refrigeracion" class="footer-nav-link">Refrigeración &amp; Bespoke</a></li>
                <li><a href="${rootPrefix}client/modules/product/product.html?cat=smart-tvs-audio" class="footer-nav-link">Smart TVs OLED &amp; QLED</a></li>
                <li><a href="${rootPrefix}client/modules/product/product.html?cat=lavado-secado" class="footer-nav-link">Lavado Inteligente AI</a></li>
                <li><a href="${rootPrefix}client/modules/product/product.html?cat=gaming-tech" class="footer-nav-link">Gaming, PS5 &amp; Móviles</a></li>
                <li><a href="${rootPrefix}client/modules/product/product.html?cat=pequenos-electro" class="footer-nav-link">Pequeños Electrodomésticos</a></li>
                <li><a href="${rootPrefix}client/modules/contacto/contacto.html" class="footer-nav-link">Soporte Técnico Especializado</a></li>
              </ul>
            </div>

            <!-- Col 4: Garantías y Contacto Directo -->
            <div>
              <div class="footer-col-title">Garantía &amp; Respaldo</div>
              <div class="footer-badge-box">
                <div class="footer-badge-item">
                  <span class="material-symbols-outlined">verified</span>
                  <span>Garantía Oficial 100% </span>
                </div>
                <div class="footer-badge-item">
                  <span class="material-symbols-outlined">receipt_long</span>
                  <span>Factura Legal con IVA Desglosado</span>
                </div>
                <div class="footer-badge-item">
                  <span class="material-symbols-outlined">local_shipping</span>
                  <span>Despachos Asegurados a Nivel Nacional</span>
                </div>
              </div>
              <div class="mt-4">
                <a
                  href="https://wa.me/${phone}?text=${encodeURIComponent('¡Hola EL VECINO! Deseo contactarme con un asesor comercial.')}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn-nav-whatsapp w-full justify-center"
                >
                  <span class="material-symbols-outlined text-[18px]">chat</span>
                  <span>Atención Comercial WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Bottom bar -->
          <div class="footer-bottom">
            <div>
              &copy; ${new Date().getFullYear()} Comercializadora EL VECINO. Todos los derechos reservados.
            </div>
            <div class="flex items-center gap-4">
              <span>NIT: 901.482.109-4</span>
              <span>•</span>
              <a href="${rootPrefix}loguin.html" class="hover:text-white transition-colors">Portal Administrativo</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
};

if (typeof window !== 'undefined') {
  window.Footer = Footer;
}
