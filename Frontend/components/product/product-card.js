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
    const detailUrl = ProductCard.getDetailUrl(product.id);

    // Generar enlace dinámico de WhatsApp para cotización
    let waUrl = '#';
    if (window.OrderService?.buildDirectProductQuoteUrl) {
      waUrl = window.OrderService.buildDirectProductQuoteUrl(product);
    } else {
      const phone = ((window.CONFIG?.WHATSAPP_PHONE || window.CONFIG?.whatsappNumber || '584129227264')).replace(/\D/g, '');
      const msg = `¡Hola EL VECINO! Me interesa consultar disponibilidad y cotización técnica del equipo: *${product.name}*.`;
      waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    }

    // Procesar descripción técnica del equipo
    const descriptionText = product.description || product.summary || '';

    // Resolver categoría para la etiqueta flotante de la imagen
    let categoryName = product.categoryName;
    if (!categoryName || categoryName === product.category) {
      if (window.CATEGORIES_DATA && Array.isArray(window.CATEGORIES_DATA)) {
        const foundCat = window.CATEGORIES_DATA.find(c =>
          String(c.id).toLowerCase() === String(product.category).toLowerCase() ||
          String(c.name).toLowerCase() === String(product.category).toLowerCase()
        );
        if (foundCat) categoryName = foundCat.name;
      }
    }
    if (!categoryName && product.categories_detail && Array.isArray(product.categories_detail) && product.categories_detail.length) {
      categoryName = product.categories_detail[0].category_name;
    }
    categoryName = categoryName || product.category || 'General';

    // Resolver subcategoría para la etiqueta interna del cuerpo de la tarjeta
    let subcategoryName = product.subcategory || product.sub_category || product.subcategoryName || '';
    if (typeof subcategoryName === 'string' && window.SUBCATEGORIES_DATA && Array.isArray(window.SUBCATEGORIES_DATA)) {
      const foundSub = window.SUBCATEGORIES_DATA.find(s =>
        String(s.id).toLowerCase() === String(subcategoryName).toLowerCase() ||
        String(s.name).toLowerCase() === String(subcategoryName).toLowerCase()
      );
      if (foundSub) subcategoryName = foundSub.name;
    }
    if (!subcategoryName && Array.isArray(product.sub_categories) && product.sub_categories.length) {
      const firstSub = product.sub_categories[0];
      subcategoryName = typeof firstSub === 'object' ? (firstSub.sub_category_name || firstSub.name) : firstSub;
    }
    if (!subcategoryName) {
      subcategoryName = product.brand || categoryName || 'Línea de Equipo';
    }

    const badgeColorClass = product.badgeColor ? `badge-${product.badgeColor}` : 'badge-neon-cyan';

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-card-img-box" onclick="ProductCard.openDetail('${product.id}', '${detailUrl}')" style="cursor: pointer;" title="Ver ficha técnica de ${product.name}">
          <span class="product-card-badge ${badgeColorClass}" title="${categoryName}">${categoryName}</span>
          <img class="product-card-img" src="${product.image || 'https://placehold.co/400x300?text=EL+VECINO'}" alt="${product.name}" loading="lazy">
          <button class="product-card-quick-view" type="button" title="Vista Rápida" onclick="event.stopPropagation(); ProductCard.quickView('${product.id}')">
            <span class="material-symbols-outlined text-[18px]">visibility</span>
          </button>
        </div>

        <div class="product-card-body">
          <div class="product-card-main-content">
            <div class="product-card-meta">
              <span class="product-card-category" title="${subcategoryName}">${subcategoryName}</span>
            </div>
            <h3 class="product-card-title" onclick="ProductCard.openDetail('${product.id}', '${detailUrl}')" title="${product.name}" style="cursor: pointer;">
              <a href="${detailUrl}" onclick="event.preventDefault(); ProductCard.openDetail('${product.id}', '${detailUrl}');" style="color: inherit; text-decoration: none;">
                ${product.name}
              </a>
            </h3>
            ${descriptionText ? `
              <p class="product-card-description" title="${descriptionText}">
                ${descriptionText}
              </p>
            ` : ''}
          </div>

          <div class="product-card-footer-box">
            <div class="product-card-actions">
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-quote">
                <span class="material-symbols-outlined text-[18px]">chat</span>
                <span>Cotizar WA</span>
              </a>
              <button type="button" class="btn-card-action-icon btn-card-cart" title="Añadir a lista de cotización" onclick="event.stopPropagation(); ProductCard.addToQuote('${product.id}');">
                <span class="material-symbols-outlined text-[19px]">shopping_cart</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  },

  /**
   * Resuelve la ruta relativa hacia detail.html según la ubicación actual
   */
  getDetailUrl(productId) {
    const path = (window.location.pathname || '').replace(/\\/g, '/');
    const safeId = encodeURIComponent(productId);
    if (path.includes('/client/modules/product/')) {
      return `detail.html?id=${safeId}`;
    }
    if (path.includes('/client/modules/')) {
      return `../product/detail.html?id=${safeId}`;
    }
    return `./client/modules/product/detail.html?id=${safeId}`;
  },

  /**
   * Navega a la pantalla de detalle del producto
   */
  openDetail(productId, detailUrl) {
    const targetUrl = detailUrl || ProductCard.getDetailUrl(productId);
    if (targetUrl) {
      window.location.href = targetUrl;
    }
  },

  /**
   * Agrega a lista de cotización o carrito y despliega la caja derecha
   */
  async addToQuote(productId) {
    let product = null;
    if (window.ProductService?.getById) {
      try {
        product = await window.ProductService.getById(productId);
      } catch (e) {
        console.warn('[ProductCard] Error obteniendo producto por ID:', e);
      }
    }
    if (!product) {
      const all = window.Storage?.getProducts ? window.Storage.getProducts() : (window.PRODUCTS_DATA || []);
      product = all.find(p => String(p.id) === String(productId));
    }

    if (product) {
      const normalized = window.Api?.normalizeProduct ? window.Api.normalizeProduct(product) : product;
      if (window.Storage?.addToCart) {
        window.Storage.addToCart(normalized, 1);
      }
      if (window.Toast) {
        window.Toast.success(`"${normalized.name}" añadido a la cotización.`);
      }
      if (window.Navbar?.updateCartBadge) {
        window.Navbar.updateCartBadge();
      }
    } else {
      console.warn(`[ProductCard] Producto ${productId} no encontrado.`);
    }

    // Desplegar la caja lateral por el lado derecho mostrando los productos del carrito
    if (window.CartModal && typeof window.CartModal.open === 'function') {
      window.CartModal.open();
    } else if (window.Navbar?.openCart) {
      window.Navbar.openCart();
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
