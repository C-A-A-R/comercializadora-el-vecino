/**
 * APP.JS - LÓGICA PRINCIPAL DE LA APLICACIÓN
 * Maneja el renderizado dinámico de productos, combos, filtros, búsqueda,
 * modales y la generación de enlaces automáticos de cotización a WhatsApp.
 */

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  renderBenefits();
  renderFeaturedProducts();
  renderAllProducts("todas");
  renderCategoriesFilter();
  renderCombos();
  renderTikTokVideos();
  setupEventListeners();
  setupWhatsAppFloatingBtn();
}

/**
 * Genera el enlace oficial de WhatsApp con mensaje personalizado
 */
function getWhatsAppLink(message) {
  const encodedMsg = encodeURIComponent(message || CONFIG.whatsappTemplates.generalQuote);
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMsg}`;
}

/**
 * Renderiza la barra de beneficios de bodega
 */
function renderBenefits() {
  const container = document.getElementById("benefitsContainer");
  if (!container) return;

  container.innerHTML = CONFIG.benefits.map(b => `
    <div class="benefit-card">
      <span class="material-symbols-outlined benefit-icon">${b.icon}</span>
      <div class="flex flex-col">
        <span class="benefit-title">${b.title}</span>
        <span class="benefit-subtitle">${b.subtitle}</span>
      </div>
    </div>
  `).join("");
}

/**
 * Renderiza los botones de filtrado por categoría
 */
function renderCategoriesFilter() {
  const container = document.getElementById("categoriesFilterContainer");
  if (!container) return;

  container.innerHTML = CATEGORIES_DATA.map((cat, idx) => `
    <button 
      class="category-filter-btn ${idx === 0 ? 'active' : ''}" 
      data-category="${cat.id}"
      onclick="filterProductsByCategory('${cat.id}', this)"
    >
      <span>${cat.name}</span>
      ${cat.count ? `<span>(${cat.count})</span>` : ''}
    </button>
  `).join("");
}

/**
 * Filtra los productos según la categoría seleccionada
 */
window.filterProductsByCategory = function(categoryId, buttonElement) {
  document.querySelectorAll(".category-filter-btn").forEach(btn => btn.classList.remove("active"));
  if (buttonElement) {
    buttonElement.classList.add("active");
  }
  renderAllProducts(categoryId);
};

/**
 * Renderiza la cuadrícula de productos destacados
 */
function renderFeaturedProducts() {
  const container = document.getElementById("featuredProductsGrid");
  if (!container) return;

  const featured = PRODUCTS_DATA.filter(p => p.featured);
  container.innerHTML = featured.map(p => createProductCardHtml(p)).join("");
}

/**
 * Renderiza todos los productos del catálogo con filtro
 */
function renderAllProducts(categoryFilter = "todas", searchQuery = "") {
  const container = document.getElementById("allProductsGrid");
  if (!container) return;

  let filtered = PRODUCTS_DATA;

  if (categoryFilter && categoryFilter !== "todas") {
    filtered = filtered.filter(p => p.category === categoryFilter);
  }

  if (searchQuery && searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.sku.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-outlined empty-state-icon">inventory_2</span>
        <h3 class="empty-state-title">No se encontraron productos</h3>
        <p class="empty-state-text">Prueba con otra categoría o término de búsqueda.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(p => createProductCardHtml(p)).join("");
}

/**
 * Plantilla HTML de cada tarjeta de producto (SIN PRECIO)
 */
function createProductCardHtml(product) {
  const waMsg = CONFIG.whatsappTemplates.productQuote(product.name, product.sku);
  const waLink = getWhatsAppLink(waMsg);

  return `
    <article class="product-card">
      <div class="product-img-wrapper">
        <img class="product-img" src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-badge-float badge badge-${product.badgeColor}">
          ${product.badge}
        </span>
      </div>
      <div class="product-body">
        <div class="product-header-info">
          <span class="product-sku">SKU: ${product.sku}</span>
          <span class="product-brand">${product.brand}</span>
        </div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-specs-list">
          ${product.specs.slice(0, 3).map(s => `
            <span class="spec-chip"><strong>${s.label}:</strong> ${s.value}</span>
          `).join("")}
        </div>
        <div class="product-footer">
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan btn-sm flex-1">
            <span class="material-symbols-outlined">chat</span>
            <span>Cotizar WA</span>
          </a>
          <button onclick="openProductModal('${product.id}')" class="btn btn-outline btn-icon" title="Ver Ficha Técnica">
            <span class="material-symbols-outlined">visibility</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Renderiza las publicaciones de combos en promoción
 */
function renderCombos() {
  const container = document.getElementById("combosContainer");
  if (!container) return;

  container.innerHTML = COMBOS_DATA.map(combo => {
    const includedItemsText = combo.items.map(i => i.name).join(", ");
    const waMsg = CONFIG.whatsappTemplates.comboQuote(combo.title, combo.sku, includedItemsText);
    const waLink = getWhatsAppLink(waMsg);

    return `
      <article class="combo-card">
        <div class="combo-grid">
          <div>
            <div class="combo-badge-row">
              <span class="badge badge-${combo.badgeColor}">
                <span class="material-symbols-outlined">auto_awesome</span>
                ${combo.badge}
              </span>
              <span class="badge badge-dark">
                SKU: ${combo.sku}
              </span>
            </div>
            <h3 class="combo-title">${combo.title}</h3>
            <p class="combo-tagline">${combo.tagline}</p>

            <div class="combo-inclusions">
              ${combo.items.map(item => `
                <div class="combo-inclusion-item">
                  <span class="material-symbols-outlined combo-inclusion-icon">${item.icon}</span>
                  <div>
                    <span class="combo-inclusion-name">${item.name}</span>
                    <p class="combo-inclusion-detail">${item.detail}</p>
                  </div>
                </div>
              `).join("")}
            </div>

            <div class="combo-guarantee-row">
              <span class="material-symbols-outlined text-neon-cyan">verified</span>
              <span>Garantía: ${combo.guarantee}</span>
            </div>

            <div class="flex flex-wrap gap-sm">
              <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan btn-lg">
                <span class="material-symbols-outlined">chat</span>
                <span>Cotizar Combo por WhatsApp</span>
              </a>
              <button onclick="copyComboDetails('${combo.sku}')" class="btn btn-outline-light">
                <span class="material-symbols-outlined">content_copy</span>
                <span>Copiar Ficha</span>
              </button>
            </div>
          </div>

          <div class="combo-img-box">
            <img class="combo-img" src="${combo.image}" alt="${combo.title}" loading="lazy">
            <div class="combo-bonus-box">
              <span class="combo-bonus-label">Bonificación Especial:</span>
              <span class="combo-bonus-text">${combo.bonification}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

/**
 * Renderiza el formato TikTok / Vídeo Catálogo
 */
function renderTikTokVideos() {
  const container = document.getElementById("tiktokGrid");
  if (!container) return;

  container.innerHTML = TIKTOK_DATA.map(video => {
    const waMsg = `¡Hola El Vecino! Vi el video de ${video.title} (SKU: ${video.sku}) y deseo cotizarlo.`;
    const waLink = getWhatsAppLink(waMsg);

    return `
      <div class="tiktok-card">
        <img class="tiktok-video-img" src="${video.videoThumbnail}" alt="${video.title}">
        <div class="tiktok-overlay">
          <div>
            <span class="badge badge-neon-cyan">${video.tag}</span>
          </div>

          <div class="tiktok-stats">
            <div class="tiktok-stat-btn">
              <div class="tiktok-stat-icon">
                <span class="material-symbols-outlined">favorite</span>
              </div>
              <span>${video.likes}</span>
            </div>
            <div class="tiktok-stat-btn">
              <div class="tiktok-stat-icon">
                <span class="material-symbols-outlined">chat_bubble</span>
              </div>
              <span>${video.comments}</span>
            </div>
            <div class="tiktok-stat-btn">
              <div class="tiktok-stat-icon">
                <span class="material-symbols-outlined">visibility</span>
              </div>
              <span>${video.views}</span>
            </div>
          </div>

          <div>
            <span class="tiktok-author">${video.author}</span>
            <h4 class="tiktok-title">${video.title}</h4>
            <p class="tiktok-desc">${video.description}</p>
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan btn-full btn-sm">
              <span class="material-symbols-outlined">chat</span>
              <span>Cotizar este Producto</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/**
 * Modal de Producto Detallado (Ficha Técnica)
 */
window.openProductModal = function(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById("productModal");
  const modalContent = document.getElementById("modalContent");
  if (!modal || !modalContent) return;

  const waMsg = CONFIG.whatsappTemplates.productQuote(product.name, product.sku);
  const waLink = getWhatsAppLink(waMsg);

  modalContent.innerHTML = `
    <div class="modal-content-grid">
      <div class="flex flex-col gap-sm">
        <div class="modal-img-box">
          <img class="modal-img" src="${product.image}" alt="${product.name}">
        </div>
        <div>
          <div class="flex items-center gap-xs">
            <span class="badge badge-${product.badgeColor}">${product.badge}</span>
            <span class="badge badge-dark">SKU: ${product.sku}</span>
          </div>
          <h2 class="section-title" style="margin-top: var(--space-xs);">${product.name}</h2>
          <p class="section-subtitle">${product.summary}</p>
        </div>
      </div>

      <div>
        <h4 class="font-display font-bold text-base" style="margin-bottom: var(--space-sm); border-bottom: 1px solid var(--slate-border); padding-bottom: var(--space-xs);">
          Especificaciones Técnicas Certificadas
        </h4>
        <div class="modal-specs-grid">
          ${product.specs.map(s => `
            <div class="modal-spec-card">
              <span class="modal-spec-label">${s.label}</span>
              <span class="modal-spec-val">${s.value}</span>
            </div>
          `).join("")}
        </div>

        <div class="modal-warehouse-notice">
          <div class="flex items-center gap-xs text-electric-blue font-bold">
            <span class="material-symbols-outlined">warehouse</span>
            <span>Inventario Sellado Directo de Bodega</span>
          </div>
          <p class="text-muted" style="font-size: var(--font-size-xs); margin-top: var(--space-3xs);">
            Despacho inmediato bajo cotización en tiempo real. Consultamos disponibilidad de lote al instante.
          </p>
        </div>

        <div class="flex gap-sm">
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan btn-full btn-lg">
            <span class="material-symbols-outlined">chat</span>
            <span>Solicitar Cotización por WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("open");
};

window.closeProductModal = function() {
  const modal = document.getElementById("productModal");
  if (modal) {
    modal.classList.remove("open");
  }
};

/**
 * Copia los detalles del combo al portapapeles
 */
window.copyComboDetails = function(sku) {
  const combo = COMBOS_DATA.find(c => c.sku === sku);
  if (!combo) return;

  const text = `${combo.title} (SKU: ${combo.sku})\nIncluye:\n${combo.items.map(i => `- ${i.name} (${i.detail})`).join("\n")}\nBonificación: ${combo.bonification}`;
  navigator.clipboard.writeText(text).then(() => {
    alert("¡Ficha del combo copiada al portapapeles! Puedes pegarla en WhatsApp o enviarla a tu cliente.");
  });
};

/**
 * Control del menú móvil
 */
window.closeMobileNav = function() {
  const drawer = document.getElementById("mobileNavDrawer");
  if (drawer) {
    drawer.classList.remove("open");
  }
};

/**
 * Configuración de eventos de búsqueda y filtros
 */
function setupEventListeners() {
  const searchInput = document.getElementById("catalogSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const activeCatBtn = document.querySelector(".category-filter-btn.active");
      const activeCat = activeCatBtn ? activeCatBtn.dataset.category : "todas";
      renderAllProducts(activeCat, e.target.value);
    });
  }

  // Toggle menú móvil
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileNavDrawer = document.getElementById("mobileNavDrawer");
  if (mobileMenuBtn && mobileNavDrawer) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileNavDrawer.classList.toggle("open");
    });
  }

  // Cerrar modal al hacer clic en el fondo
  const modal = document.getElementById("productModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeProductModal();
      }
    });
  }
}

/**
 * Configuración del botón flotante de WhatsApp
 */
function setupWhatsAppFloatingBtn() {
  const dock = document.getElementById("floatingDock");
  if (!dock) return;

  const link = getWhatsAppLink(CONFIG.whatsappTemplates.generalQuote);
  dock.innerHTML = `
    <a href="${link}" target="_blank" rel="noopener noreferrer" class="floating-whatsapp-btn" title="Cotizar por WhatsApp">
      <span class="material-symbols-outlined">chat</span>
      <span>Cotizar WhatsApp</span>
    </a>
  `;
}
