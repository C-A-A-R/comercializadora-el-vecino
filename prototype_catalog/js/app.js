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
    <div class="flex items-center gap-space-xs px-4 py-2.5 rounded-xl bg-slate-surface border border-slate-border">
      <span class="material-symbols-outlined text-electric-blue text-[22px]">${b.icon}</span>
      <div class="flex flex-col">
        <span class="font-display font-bold text-xs uppercase text-deep-obsidian tracking-wider">${b.title}</span>
        <span class="font-body text-xs text-text-muted">${b.subtitle}</span>
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
      ${cat.count ? `<span style="font-size: 0.78rem; opacity: 0.75; margin-left: 4px;">(${cat.count})</span>` : ''}
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
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
        <span class="material-symbols-outlined" style="font-size: 48px; color: var(--text-muted);">inventory_2</span>
        <h3 style="font-family: var(--font-display); font-size: 1.25rem; margin-top: 0.5rem;">No se encontraron productos</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Prueba con otra categoría o término de búsqueda.</p>
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
        <div class="flex items-center justify-between">
          <span class="product-sku">SKU: ${product.sku}</span>
          <span class="text-xs text-text-muted font-medium">${product.brand}</span>
        </div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-specs-list">
          ${product.specs.slice(0, 3).map(s => `
            <span class="spec-chip"><strong>${s.label}:</strong> ${s.value}</span>
          `).join("")}
        </div>
        <div class="product-footer">
          <div style="display: flex; gap: 0.5rem;">
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan" style="flex: 1; padding: 0.65rem 0.85rem; font-size: 0.88rem;">
              <span class="material-symbols-outlined text-[18px]">chat</span>
              <span>Cotizar WA</span>
            </a>
            <button onclick="openProductModal('${product.id}')" class="btn btn-outline" style="padding: 0.65rem 0.85rem;" title="Ver Ficha Técnica">
              <span class="material-symbols-outlined text-[18px]">visibility</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * RENDERIZA LAS PUBLICACIONES DE COMBOS EN PROMOCIÓN
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
                <span class="material-symbols-outlined text-[14px]">auto_awesome</span>
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

            <div style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: #94A3B8;">
              <span class="material-symbols-outlined text-neon-cyan text-[18px]">verified</span>
              <span>Garantía: ${combo.guarantee}</span>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
              <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan" style="font-size: 1rem; padding: 0.85rem 1.6rem;">
                <span class="material-symbols-outlined text-[20px]">chat</span>
                <span>Cotizar Combo por WhatsApp</span>
              </a>
              <button onclick="copyComboDetails('${combo.sku}')" class="btn btn-outline" style="border-color: rgba(255,255,255,0.2); color: #FFF;">
                <span class="material-symbols-outlined text-[18px]">content_copy</span>
                <span>Copiar Ficha</span>
              </button>
            </div>
          </div>

          <div class="combo-img-box">
            <img class="combo-img" src="${combo.image}" alt="${combo.title}" loading="lazy">
            <div style="position: absolute; bottom: 12px; left: 12px; right: 12px; background: rgba(10,10,10,0.85); backdrop-filter: blur(10px); padding: 0.75rem 1rem; border-radius: var(--radius-lg); border: 1px solid rgba(255,255,255,0.15);">
              <span style="font-family: var(--font-display); font-size: 0.8rem; font-weight: 700; color: var(--neon-cyan); text-transform: uppercase; letter-spacing: 0.05em; display: block;">Bonificación Especial:</span>
              <span style="font-size: 0.85rem; color: #FFF;">${combo.bonification}</span>
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
                <span class="material-symbols-outlined text-[20px]">favorite</span>
              </div>
              <span>${video.likes}</span>
            </div>
            <div class="tiktok-stat-btn">
              <div class="tiktok-stat-icon">
                <span class="material-symbols-outlined text-[20px]">chat_bubble</span>
              </div>
              <span>${video.comments}</span>
            </div>
            <div class="tiktok-stat-btn">
              <div class="tiktok-stat-icon">
                <span class="material-symbols-outlined text-[20px]">visibility</span>
              </div>
              <span>${video.views}</span>
            </div>
          </div>

          <div>
            <span style="color: var(--neon-cyan); font-weight: 700; font-size: 0.85rem;">${video.author}</span>
            <h4 style="font-family: var(--font-display); color: #FFF; font-size: 1rem; margin-top: 2px;">${video.title}</h4>
            <p style="color: #CBD5E1; font-size: 0.8rem; margin-top: 4px; margin-bottom: 0.75rem;">${video.description}</p>
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan" style="width: 100%; padding: 0.55rem; font-size: 0.85rem;">
              <span class="material-symbols-outlined text-[16px]">chat</span>
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
    <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; padding: 2rem;">
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="height: 280px; border-radius: var(--radius-xl); overflow: hidden; background: var(--slate-surface);">
          <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="badge badge-${product.badgeColor}">${product.badge}</span>
            <span class="badge badge-dark">SKU: ${product.sku}</span>
          </div>
          <h2 style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; margin-top: 0.5rem; color: var(--deep-obsidian);">${product.name}</h2>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 0.5rem;">${product.summary}</p>
        </div>
      </div>

      <div>
        <h4 style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--deep-obsidian); border-bottom: 1px solid var(--slate-border); padding-bottom: 0.5rem;">
          Especificaciones Técnicas Certificadas
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
          ${product.specs.map(s => `
            <div style="background: var(--slate-surface); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--slate-border);">
              <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; display: block;">${s.label}</span>
              <span style="font-weight: 600; font-size: 0.9rem; color: var(--deep-obsidian);">${s.value}</span>
            </div>
          `).join("")}
        </div>

        <div style="background: var(--electric-blue-subtle); border: 1px solid rgba(8,0,255,0.2); border-radius: var(--radius-lg); padding: 1rem; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--electric-blue); font-weight: 700; font-size: 0.9rem;">
            <span class="material-symbols-outlined text-[20px]">warehouse</span>
            <span>Inventario Sellado Directo de Bodega</span>
          </div>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.25rem;">
            Despacho inmediato bajo cotización en tiempo real. Consultamos disponibilidad de lote al instante.
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan" style="flex: 1; font-size: 1rem;">
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
      <span class="material-symbols-outlined text-[24px]">chat</span>
      <span>Cotizar WhatsApp</span>
    </a>
  `;
}

