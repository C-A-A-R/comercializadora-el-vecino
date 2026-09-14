/**
 * product-card.js - Modular product card renderer and interaction handler
 */

const ProductCard = {
  /**
   * Generates product card HTML string
   */
  renderHTML(rawProduct) {
    const product = window.Api?.normalizeProduct ? window.Api.normalizeProduct(rawProduct) : rawProduct;
    let detailUrl = `detail.html?id=${product.id}`;
    if (window.location.pathname.includes('/client/modules/product/')) {
      detailUrl = `detail.html?id=${product.id}`;
    } else if (window.location.pathname.includes('/client/modules/')) {
      detailUrl = `../product/detail.html?id=${product.id}`;
    } else {
      detailUrl = `./client/modules/product/detail.html?id=${product.id}`;
    }

    const hasPrice = Number(product?.price) > 0;
    const hasOldPrice = Number(product?.originalPrice) > 0;
    const formattedPrice = hasPrice ? window.CONFIG?.formatCurrency(product.price) : null;
    const formattedOldPrice = hasOldPrice ? window.CONFIG?.formatCurrency(product.originalPrice) : null;
    const waUrl = window.OrderService?.buildDirectProductQuoteUrl(product) || '#';

    const specsPreview = (product.specs || []).slice(0, 2).map(spec => `
      <li class="product-card-spec-item">
        <span class="material-symbols-outlined">check</span>
        <span class="truncate">${spec}</span>
      </li>
    `).join('');

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-card-img-box">
          ${product.badge ? `<span class="product-card-badge">${product.badge}</span>` : ''}
          <img class="product-card-img" src="${product.image || 'https://placehold.co/300'}" alt="${product.name}" loading="lazy">
          <button class="product-card-quick-view" type="button" title="Vista Rápida" onclick="ProductCard.quickView('${product.id}')">
            <span class="material-symbols-outlined text-[18px]">visibility</span>
          </button>
        </div>

        <div class="product-card-body">
          <div>
            <div class="product-card-meta">
              <span class="product-card-category">${product.categoryName || product.category || 'Equipo'}</span>
              <span>SKU: ${product.sku || 'N/A'}</span>
            </div>
            <h3 class="product-card-title" onclick="window.location.href='${detailUrl}'">
              ${product.name}
            </h3>
            ${specsPreview ? `<ul class="product-card-specs">${specsPreview}</ul>` : ''}
          </div>

          <div>
            <div class="product-card-pricing">
              ${formattedPrice ? `<span class="product-card-price">${formattedPrice}</span>` : ''}
              ${formattedOldPrice ? `<span class="product-card-old-price">${formattedOldPrice}</span>` : ''}
            </div>

            <div class="product-card-actions">
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-quote">
                <span class="material-symbols-outlined text-[18px]">chat</span>
                <span>Cotizar WhatsApp</span>
              </a>
              <button class="btn-card-add" type="button" title="Agregar a Lista de Cotización" onclick="ProductCard.addToQuote('${product.id}')">
                <span class="material-symbols-outlined text-[20px]">add_shopping_cart</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  },

  async addToQuote(productId) {
    let product = null;
    if (window.ProductService) {
      product = await window.ProductService.getById(productId);
    }
    if (!product) {
      const all = window.Storage?.getProducts() || [];
      product = all.find(p => p.id === productId);
    }

    if (product) {
      window.Storage.addToCart(product, 1);
      if (window.Toast) {
        window.Toast.success(`"${product.name}" añadido a la cotización.`);
      }
    } else {
      console.warn(`[ProductCard] Producto ${productId} no encontrado.`);
    }
  },

  quickView(productId) {
    if (window.ProductModal) {
      window.ProductModal.open(productId);
    } else {
      console.warn('[ProductCard] ProductModal no disponible.');
    }
  }
};

if (typeof window !== 'undefined') {
  window.ProductCard = ProductCard;
}
