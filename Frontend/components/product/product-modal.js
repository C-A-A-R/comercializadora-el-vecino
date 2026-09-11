/**
 * product-modal.js - Quick technical view modal for product inspection
 */

const ProductModal = {
  backdrop: null,

  init() {
    if (this.backdrop) return;
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'product-modal-backdrop';
    this.backdrop.id = 'productModalBackdrop';

    this.backdrop.innerHTML = `
      <div class="product-modal-dialog">
        <button class="btn-close-product-modal" id="btnCloseProductModal" type="button" aria-label="Cerrar">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div id="productModalContent">
          <!-- Rendered dynamically -->
        </div>
      </div>
    `;

    document.body.appendChild(this.backdrop);
    this.bindEvents();
  },

  async open(productId) {
    this.init();

    let product = null;
    if (window.ProductService) {
      product = await window.ProductService.getById(productId);
    }
    if (!product) {
      const all = window.Storage?.getProducts() || [];
      product = all.find(p => p.id === productId);
    }

    if (!product) {
      console.error(`[ProductModal] Producto ${productId} no encontrado.`);
      return;
    }

    const content = document.getElementById('productModalContent');
    const isModule = window.location.pathname.includes('/client/modules/');
    const detailUrl = isModule
      ? `detail.html?id=${product.id}`
      : `./client/modules/product/detail.html?id=${product.id}`;

    const formattedPrice = window.CONFIG?.formatCurrency(product.price) || `$ ${product.price}`;
    const formattedOldPrice = product.originalPrice ? window.CONFIG?.formatCurrency(product.originalPrice) : null;
    const waUrl = window.OrderService?.buildDirectProductQuoteUrl(product) || '#';

    const specsHtml = (product.specs || []).map(spec => `
      <li class="product-modal-spec-row">
        <span class="material-symbols-outlined">verified</span>
        <span>${spec}</span>
      </li>
    `).join('');

    content.innerHTML = `
      <div class="product-modal-grid">
        <div class="product-modal-gallery">
          ${product.badge ? `<span class="product-card-badge">${product.badge}</span>` : ''}
          <img class="product-modal-img" src="${product.image || 'https://placehold.co/400'}" alt="${product.name}">
          <div class="mt-4 flex items-center gap-2 text-xs text-on-surface-variant">
            <span class="w-2 h-2 rounded-full bg-whatsapp-green animate-pulse"></span>
            <span>Verificado en Bodega Central</span>
          </div>
        </div>

        <div class="product-modal-details">
          <div>
            <div class="flex items-center justify-between text-xs text-outline mb-1">
              <span class="font-bold text-electric-blue uppercase">${product.categoryName || product.category || 'Equipo'}</span>
              <span>SKU: ${product.sku || 'N/A'}</span>
            </div>
            <h2 class="font-headline-md text-headline-md text-deep-obsidian font-bold tracking-tight">
              ${product.name}
            </h2>
            <p class="text-sm text-on-surface-variant mt-2 leading-relaxed">
              ${product.description || 'Equipo técnico sellado de fábrica con respaldo legal y garantía comercial.'}
            </p>

            <ul class="product-modal-specs-list">
              ${specsHtml}
            </ul>

            <div class="p-3 rounded-xl bg-slate-surface text-xs text-deep-obsidian flex items-center gap-2">
              <span class="material-symbols-outlined text-electric-blue text-[18px]">verified_user</span>
              <span><strong>Garantía Oficial:</strong> ${product.warranty || 'Garantía directa de fábrica + Factura DIAN'}</span>
            </div>
          </div>

          <div>
            <div class="product-card-pricing mb-4">
              <span class="font-headline-lg text-headline-lg font-bold text-deep-obsidian">${formattedPrice}</span>
              ${formattedOldPrice ? `<span class="product-card-old-price text-base">${formattedOldPrice}</span>` : ''}
            </div>

            <div class="flex flex-col sm:flex-row gap-3">
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-quote flex-1 h-12 text-sm justify-center">
                <span class="material-symbols-outlined text-[20px]">chat</span>
                <span>Cotizar WhatsApp</span>
              </a>
              <button
                class="h-12 px-5 rounded-xl bg-electric-blue text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:bg-primary"
                type="button"
                onclick="ProductModal.addToCart('${product.id}')"
              >
                <span class="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                <span>Añadir a Cotización</span>
              </button>
            </div>

            <div class="mt-4 text-center">
              <a href="${detailUrl}" class="text-xs text-electric-blue font-bold hover:underline">
                Ver ficha técnica completa e información de ingeniería &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    requestAnimationFrame(() => {
      this.backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  },

  close() {
    if (!this.backdrop) return;
    this.backdrop.classList.remove('open');
    document.body.style.overflow = '';
  },

  addToCart(productId) {
    ProductCard.addToQuote(productId);
    this.close();
  },

  bindEvents() {
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    const btnClose = document.getElementById('btnCloseProductModal');
    if (btnClose) btnClose.addEventListener('click', () => this.close());
  }
};

if (typeof window !== 'undefined') {
  window.ProductModal = ProductModal;
}
