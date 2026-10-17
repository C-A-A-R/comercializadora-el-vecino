/**
 * product-card.js - Componente modular y reutilizable de Tarjeta de Producto
 * Comercializadora EL VECINO - Electric Neo-Tech
 */

const ProductCard = {
  /**
   * Genera el HTML string de la tarjeta de producto
   * @param {Object} rawProduct - Datos del producto
   * @returns {string} HTML string
   */
  renderHTML(rawProduct) {
    if (!rawProduct) return '';
    const product = window.Api?.normalizeProduct ? window.Api.normalizeProduct(rawProduct) : rawProduct;

    // Calcular rutas relativas según el nivel de anidación
    const isModule = window.location.pathname.includes('/client/modules/');
    const detailUrl = isModule
      ? `detail.html?id=${product.id}`
      : `./client/modules/product/detail.html?id=${product.id}`;

    // Generar enlace dinámico de WhatsApp para cotización
    let waUrl = '#';
    if (window.OrderService?.buildDirectProductQuoteUrl) {
      waUrl = window.OrderService.buildDirectProductQuoteUrl(product);
    } else {
      const phone = window.CONFIG?.whatsappNumber || window.CONFIG?.WHATSAPP_PHONE || '573001234567';
      const msg = `¡Hola EL VECINO! Me interesa consultar disponibilidad y cotización técnica del equipo: *${product.name}*.`;
      waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    }

    // Procesar descripción técnica del equipo
    const descriptionText = product.description || product.summary || '';

    const hasPrice = Number(product?.price) > 0;
    const hasOldPrice = Number(product?.originalPrice) > 0;
    const formattedPrice = hasPrice ? (window.CONFIG?.formatCurrency ? window.CONFIG.formatCurrency(product.price) : `$${product.price}`) : null;
    const formattedOldPrice = hasOldPrice ? (window.CONFIG?.formatCurrency ? window.CONFIG.formatCurrency(product.originalPrice) : `$${product.originalPrice}`) : null;

    const badgeText = product.badge || '';
    const badgeColorClass = product.badgeColor ? `badge-${product.badgeColor}` : '';

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-card-img-box">
          ${badgeText ? `<span class="product-card-badge ${badgeColorClass}">${badgeText}</span>` : ''}
          <img class="product-card-img" src="${product.image || 'https://placehold.co/400x300?text=EL+VECINO'}" alt="${product.name}" loading="lazy">
          <button class="product-card-quick-view" type="button" title="Vista Rápida" onclick="ProductCard.quickView('${product.id}')">
            <span class="material-symbols-outlined text-[18px]">visibility</span>
          </button>
        </div>

        <div class="product-card-body">
          <div class="product-card-main-content">
            <div class="product-card-meta">
              <span class="product-card-category">${product.categoryName || product.category || product.brand || 'Equipo'}</span>
              ${product.rating ? `
                <div class="product-card-rating" style="display: inline-flex; align-items: center; gap: 3px; font-weight: 700; color: #f59e0b; font-size: 0.75rem;">
                  <span class="material-symbols-outlined" style="font-size: 14px; font-variation-settings: 'FILL' 1; color: #f59e0b;">star</span>
                  <span>${Number(product.rating).toFixed(1)}</span>
                </div>
              ` : (product.sku ? `<span class="product-card-sku">SKU: ${product.sku}</span>` : '')}
            </div>
            <h3 class="product-card-title" onclick="ProductCard.openDetail('${product.id}', '${detailUrl}')" title="${product.name}">
              ${product.name}
            </h3>
            ${descriptionText ? `
              <p class="product-card-description" title="${descriptionText}">
                ${descriptionText}
              </p>
            ` : ''}
          </div>

          <div class="product-card-footer-box">
            ${(formattedPrice || formattedOldPrice) ? `
              <div class="product-card-pricing">
                ${formattedPrice ? `<span class="product-card-price">${formattedPrice}</span>` : ''}
                ${formattedOldPrice ? `<span class="product-card-old-price">${formattedOldPrice}</span>` : ''}
              </div>
            ` : ''}

            <div class="product-card-actions">
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-quote">
                <span class="material-symbols-outlined text-[18px]">chat</span>
                <span>Cotizar WA</span>
              </a>
              <button class="btn-card-action-icon" type="button" title="Ver Ficha Técnica" onclick="ProductCard.quickView('${product.id}')">
                <span class="material-symbols-outlined text-[18px]">visibility</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  },

  /**
   * Abre la ficha técnica o modal del producto
   */
  openDetail(productId, detailUrl) {
    if (typeof window.openProductModal === 'function') {
      window.openProductModal(productId);
    } else if (window.ProductModal) {
      window.ProductModal.open(productId);
    } else if (detailUrl) {
      window.location.href = detailUrl;
    }
  },

  /**
   * Agrega a lista de cotización o carrito
   */
  async addToQuote(productId) {
    let product = null;
    if (window.ProductService) {
      product = await window.ProductService.getById(productId);
    }
    if (!product) {
      const all = window.Storage?.getProducts() || window.PRODUCTS_DATA || [];
      product = all.find(p => p.id === productId);
    }

    if (product) {
      if (window.Storage?.addToCart) {
        window.Storage.addToCart(product, 1);
      }
      if (window.Toast) {
        window.Toast.success(`"${product.name}" añadido a la cotización.`);
      }
    } else {
      console.warn(`[ProductCard] Producto ${productId} no encontrado.`);
    }
  },

  /**
   * Abre la vista rápida / modal técnico
   */
  quickView(productId) {
    if (typeof window.openProductModal === 'function') {
      window.openProductModal(productId);
    } else if (window.ProductModal) {
      window.ProductModal.open(productId);
    } else {
      console.warn('[ProductCard] Modal de producto no disponible.');
    }
  }
};

if (typeof window !== 'undefined') {
  window.ProductCard = ProductCard;
}
