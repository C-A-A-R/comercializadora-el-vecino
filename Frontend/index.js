/**
 * index.js — Lógica modular exclusiva para la página de Inicio (Index)
 * Comercializadora EL VECINO — Electric Neo-Tech
 * Integra componentes reutilizables (Navbar, Footer, ProductCard, ProductModal)
 * y gestiona las secciones interactivas propias de la portada.
 */

// ==========================================================================
// UTILIDADES COMUNES
// ==========================================================================

/**
 * Genera el enlace directo a WhatsApp con codificación segura
 */
function getWhatsAppLink(message) {
  const phone = (window.CONFIG && (window.CONFIG.whatsappNumber || window.CONFIG.WHATSAPP_PHONE)) || "573001234567";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
window.getWhatsAppLink = getWhatsAppLink;

// ==========================================================================
// COMPONENTES GLOBALES (NAVBAR & FOOTER)
// ==========================================================================
function initGlobalComponents() {
  if (window.Navbar && typeof window.Navbar.mount === 'function') {
    window.Navbar.mount('#navbar-mount', 'inicio');
  }

  if (window.Footer && typeof window.Footer.mount === 'function') {
    window.Footer.mount('#footer-mount', 'inicio');
  }
}

// ==========================================================================
// SECCIÓN 1: BARRA DE BENEFICIOS DE BODEGA
// ==========================================================================
function renderBenefits() {
  const container = document.getElementById("benefitsContainer");
  if (!container || typeof BENEFITS_DATA === "undefined") return;

  container.innerHTML = BENEFITS_DATA.map(b => `
    <div class="benefit-card">
      <span class="material-symbols-outlined benefit-icon">${b.icon}</span>
      <div>
        <h4 class="benefit-title">${b.title}</h4>
        <p class="benefit-subtitle">${b.desc}</p>
      </div>
    </div>
  `).join("");
}

// ==========================================================================
// SECCIÓN 2: PROMOCIONES Y COMBOS (SISTEMA ADAPTATIVO & CARRUSEL INFINITO)
// ==========================================================================
let currentCombosPreviewMode = "auto"; // "auto", 1, 2, 3, or 4
let combosCarouselAutoplay = null;
let combosCarouselResizeHandler = null;

/**
 * Permite alternar la cantidad de combos para probar la respuesta adaptativa
 */
window.setCombosPreviewMode = function(mode) {
  currentCombosPreviewMode = mode;
  document.querySelectorAll(".btn-view-pill").forEach(btn => {
    btn.classList.toggle("active", String(btn.dataset.mode) === String(mode));
  });
  renderCombos();
};

/**
 * Genera la estructura HTML unificada de una carta de combo/promoción (sin SKU)
 * El listado de productos incluidos mantiene el diseño completo de thumbnail + nombre + detalle
 */
function createComboCardHTML(combo) {
  const includedItemsText = combo.items.map(i => i.name).join(", ");
  const waMsg = CONFIG.whatsappTemplates.comboQuote(combo.title, combo.sku, includedItemsText);
  const waLink = getWhatsAppLink(waMsg);

  return `
    <article class="combo-card combo-card-duo">
      <div class="combo-duo-img-box">
        <img class="combo-duo-img" src="${combo.image}" alt="${combo.title}" loading="lazy">
        <div class="combo-duo-badges">
          <span class="badge badge-${combo.badgeColor}">
            <span class="material-symbols-outlined">auto_awesome</span>
            ${combo.badge}
          </span>
        </div>
      </div>

      <div class="combo-duo-body">
        <h3 class="combo-duo-title">${combo.title}</h3>
        <p class="combo-duo-tagline">${combo.tagline}</p>

        <span class="combo-duo-inclusions-label">Equipos Incluidos:</span>
        <div class="combo-duo-inclusions">
          ${combo.items.map(item => `
            <div class="combo-duo-inclusion-item">
              <div class="combo-duo-thumb-wrap">
                <img class="combo-duo-thumb" src="${item.image || combo.image}" alt="${item.name}" loading="lazy">
              </div>
              <div class="combo-duo-inclusion-info">
                <span class="combo-duo-inclusion-name" title="${item.name}">${item.name}</span>
                <span class="combo-duo-inclusion-detail" title="${item.detail}">${item.detail}</span>
              </div>
            </div>
          `).join("")}
        </div>

        <div class="combo-duo-footer">
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan btn-lg w-full justify-center">
            <span class="material-symbols-outlined">chat</span>
            <span>Cotizar Combo por WhatsApp</span>
          </a>
        </div>
      </div>
    </article>
  `;
}

/**
 * Renderiza el carrusel infinito de combos cuando hay más de 3 promociones
 * - Rotación automática continua
 * - Flechas transparentes y poco notorias
 * - Bucle infinito hacia adelante continuo (sin efecto de retroceso)
 */
function renderCombosCarousel(container, combos) {
  const n = combos.length;
  const cloneCount = 3;
  const prefixClones = combos.slice(-cloneCount);
  const suffixClones = combos.slice(0, cloneCount);
  const allSlides = [...prefixClones, ...combos, ...suffixClones];

  container.className = "combos-container layout-carousel";
  container.innerHTML = `
    <div class="combos-carousel-wrapper" id="combosCarouselWrapper">
      <button type="button" class="combos-carousel-arrow combos-carousel-arrow-prev" id="combosCarouselPrevBtn" aria-label="Combo anterior">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>

      <div class="combos-carousel-viewport" id="combosCarouselViewport">
        <div class="combos-carousel-track" id="combosCarouselTrack">
          ${allSlides.map(c => `
            <div class="combos-carousel-slide">
              ${createComboCardHTML(c)}
            </div>
          `).join("")}
        </div>
      </div>

      <button type="button" class="combos-carousel-arrow combos-carousel-arrow-next" id="combosCarouselNextBtn" aria-label="Siguiente combo">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  `;

  const track = document.getElementById("combosCarouselTrack");
  const wrapper = document.getElementById("combosCarouselWrapper");
  const prevBtn = document.getElementById("combosCarouselPrevBtn");
  const nextBtn = document.getElementById("combosCarouselNextBtn");

  if (!track) return;

  let currentIndex = cloneCount; // Primer combo real
  let isAnimating = false;

  function getStep() {
    if (!track.children.length) return 0;
    if (track.children.length > 1) {
      const rect0 = track.children[0].getBoundingClientRect();
      const rect1 = track.children[1].getBoundingClientRect();
      const diff = rect1.left - rect0.left;
      if (diff > 0) return diff;
    }
    return track.children[0].getBoundingClientRect().width;
  }

  function updatePosition(withTransition = true) {
    const step = getStep();
    if (step <= 0) return;
    if (withTransition) {
      track.style.transition = "transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)";
    } else {
      track.style.transition = "none";
    }
    track.style.transform = `translateX(-${currentIndex * step}px)`;
  }

  requestAnimationFrame(() => {
    updatePosition(false);
  });

  function move(direction) {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex += direction;
    updatePosition(true);
  }

  track.addEventListener("transitionend", (e) => {
    if (e.target !== track) return;
    if (currentIndex >= cloneCount + n) {
      currentIndex = currentIndex - n;
      updatePosition(false);
    } else if (currentIndex < cloneCount) {
      currentIndex = currentIndex + n;
      updatePosition(false);
    }
    isAnimating = false;
  });

  function safeMove(direction) {
    move(direction);
    setTimeout(() => {
      isAnimating = false;
    }, 600);
  }

  function startAutoplay() {
    stopAutoplay();
    combosCarouselAutoplay = setInterval(() => {
      safeMove(1);
    }, 4500);
  }

  function stopAutoplay() {
    if (combosCarouselAutoplay) {
      clearInterval(combosCarouselAutoplay);
      combosCarouselAutoplay = null;
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      safeMove(-1);
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      safeMove(1);
      startAutoplay();
    });
  }

  if (wrapper) {
    wrapper.addEventListener("mouseenter", stopAutoplay);
    wrapper.addEventListener("mouseleave", startAutoplay);
  }

  let touchStartX = 0;
  let touchStartY = 0;
  track.addEventListener("touchstart", (e) => {
    stopAutoplay();
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  track.addEventListener("touchend", (e) => {
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX < 0) {
        safeMove(1);
      } else {
        safeMove(-1);
      }
    }
    startAutoplay();
  }, { passive: true });

  combosCarouselResizeHandler = () => {
    updatePosition(false);
  };
  window.addEventListener("resize", combosCarouselResizeHandler);

  startAutoplay();
}

/**
 * Renderiza los combos según la cantidad disponible o el modo seleccionado
 */
function renderCombos() {
  const container = document.getElementById("combosContainer");
  if (!container || typeof COMBOS_DATA === "undefined") return;

  if (combosCarouselAutoplay) {
    clearInterval(combosCarouselAutoplay);
    combosCarouselAutoplay = null;
  }
  if (combosCarouselResizeHandler) {
    window.removeEventListener("resize", combosCarouselResizeHandler);
    combosCarouselResizeHandler = null;
  }

  let combos = [...COMBOS_DATA];
  if (currentCombosPreviewMode === 1 || currentCombosPreviewMode === "1") {
    combos = [COMBOS_DATA[0]];
  } else if (currentCombosPreviewMode === 2 || currentCombosPreviewMode === "2") {
    combos = COMBOS_DATA.slice(0, 2);
  } else if (currentCombosPreviewMode === 3 || currentCombosPreviewMode === "3") {
    combos = COMBOS_DATA.slice(0, 3);
  } else if (currentCombosPreviewMode === 4 || currentCombosPreviewMode === "4") {
    combos = COMBOS_DATA.length >= 4 ? COMBOS_DATA : [...COMBOS_DATA, ...COMBOS_DATA].slice(0, 4);
  }

  const count = combos.length;

  if (count === 0) {
    container.className = "combos-container";
    container.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-outlined empty-state-icon">local_fire_department</span>
        <h3 class="empty-state-title">No hay promociones activas</h3>
        <p class="empty-state-text">Vuelve pronto para consultar nuevos combos de temporada.</p>
      </div>
    `;
    return;
  }

  // CASO 1: SOLO UNA PROMOCIÓN (Hero / Banner sin SKU)
  if (count === 1) {
    container.className = "combos-container";
    const combo = combos[0];
    const includedItemsText = combo.items.map(i => i.name).join(", ");
    const waMsg = CONFIG.whatsappTemplates.comboQuote(combo.title, combo.sku, includedItemsText);
    const waLink = getWhatsAppLink(waMsg);

    container.innerHTML = `
      <article class="combo-card">
        <div class="combo-grid">
          <div>
            <div class="combo-badge-row">
              <span class="badge badge-${combo.badgeColor}">
                <span class="material-symbols-outlined">auto_awesome</span>
                ${combo.badge}
              </span>
            </div>
            <h3 class="combo-title">${combo.title}</h3>
            <p class="combo-tagline">${combo.tagline}</p>

            <div class="combo-inclusions">
              ${combo.items.map(item => `
                <div class="combo-inclusion-item">
                  <div class="combo-inclusion-thumb-wrap">
                    <img class="combo-inclusion-thumb" src="${item.image || combo.image}" alt="${item.name}" loading="lazy">
                  </div>
                  <div class="combo-inclusion-content">
                    <span class="combo-inclusion-type">${item.type}</span>
                    <span class="combo-inclusion-name">${item.name}</span>
                    <p class="combo-inclusion-detail">${item.detail}</p>
                  </div>
                </div>
              `).join("")}
            </div>

            <div class="flex flex-wrap gap-sm">
              <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan btn-lg">
                <span class="material-symbols-outlined">chat</span>
                <span>Cotizar Combo por WhatsApp</span>
              </a>
            </div>
          </div>

          <div class="combo-img-box">
            <img class="combo-img" src="${combo.image}" alt="${combo.title}" loading="lazy">
            <div class="combo-img-badge-overlay">
              <span class="badge badge-neon-magenta">Lote Sellado Mayorista</span>
            </div>
          </div>
        </div>
      </article>
    `;
    return;
  }

  // CASO 2: EXACTAMENTE 2 PROMOCIONES (Comparten espacio en una misma fila, sin SKU)
  if (count === 2) {
    container.className = "combos-container layout-duo";
    container.innerHTML = combos.map(combo => createComboCardHTML(combo)).join("");
    return;
  }

  // CASO 3: EXACTAMENTE 3 PROMOCIONES (Ocupan el espacio disponible, en teléfono se reducen a dos)
  if (count === 3) {
    container.className = "combos-container layout-trio";
    container.innerHTML = combos.map(combo => createComboCardHTML(combo)).join("");
    return;
  }

  // CASO 4: MÁS DE 3 PROMOCIONES (Carrusel automático infinito sin retroceso y flechas transparentes)
  renderCombosCarousel(container, combos);
}

/**
 * Modal para visualizar el detalle completo de un combo
 */
window.openComboModal = function(comboId) {
  const combo = (typeof COMBOS_DATA !== "undefined" ? COMBOS_DATA : []).find(c => c.id === comboId);
  if (!combo) return;

  const modal = document.getElementById("productModal");
  const modalContent = document.getElementById("modalContent");
  if (!modal || !modalContent) return;

  const includedItemsText = combo.items.map(i => i.name).join(", ");
  const waMsg = CONFIG.whatsappTemplates.comboQuote(combo.title, combo.sku, includedItemsText);
  const waLink = getWhatsAppLink(waMsg);

  modalContent.innerHTML = `
    <div class="modal-content-grid">
      <div class="flex flex-col gap-sm">
        <div class="modal-img-box">
          <img class="modal-img" src="${combo.image}" alt="${combo.title}">
        </div>
        <div>
          <div class="flex items-center gap-xs">
            <span class="badge badge-${combo.badgeColor}">${combo.badge}</span>
          </div>
          <h2 class="section-title" style="margin-top: var(--space-xs);">${combo.title}</h2>
          <p class="section-subtitle">${combo.tagline}</p>
        </div>
      </div>

      <div>
        <h4 class="font-display font-bold text-base" style="margin-bottom: var(--space-sm); border-bottom: 1px solid var(--slate-border); padding-bottom: var(--space-xs);">
          Equipos y Beneficios Incluidos en el Paquete
        </h4>
        <div class="flex flex-col gap-sm" style="margin-bottom: var(--space-md);">
          ${combo.items.map(item => `
            <div class="combo-inclusion-item" style="background: var(--slate-surface); border: 1px solid var(--slate-border); padding: 8px 12px;">
              <div class="combo-inclusion-thumb-wrap" style="width: 50px; height: 50px;">
                <img class="combo-inclusion-thumb" src="${item.image || combo.image}" alt="${item.name}">
              </div>
              <div class="combo-inclusion-content">
                <span class="combo-inclusion-type" style="color: var(--electric-blue);">${item.type}</span>
                <span class="combo-inclusion-name" style="color: var(--deep-obsidian); font-size: var(--font-size-sm);">${item.name}</span>
                <p class="combo-inclusion-detail" style="color: var(--text-muted); font-size: var(--font-size-xs);">${item.detail}</p>
              </div>
            </div>
          `).join("")}
        </div>

        <div class="modal-warehouse-notice">
          <div class="flex items-center gap-xs text-electric-blue font-bold">
            <span class="material-symbols-outlined">inventory</span>
            <span>Despacho Consolidado Mayorista</span>
          </div>
          <p class="text-xs text-muted" style="margin-top: 4px;">
            Lote precintado con entrega simultánea y revisión técnica de fábrica en sitio.
          </p>
        </div>

        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan btn-lg w-full justify-center">
          <span class="material-symbols-outlined">chat</span>
          <span>Solicitar Cotización Oficial del Combo</span>
        </a>
      </div>
    </div>
  `;

  modal.classList.add("open");
};

// ==========================================================================
// SECCIÓN 3: CATÁLOGO TÉCNICO DE PRODUCTOS (USA EL COMPONENTE PRODUCT-CARD)
// ==========================================================================
let currentCategoryFilter = "all";
let catalogSearchQuery = "";

function renderCategoryFilters() {
  const container = document.getElementById("categoriesFilterContainer");
  if (!container || typeof CATEGORIES_DATA === "undefined") return;

  container.innerHTML = CATEGORIES_DATA.map(cat => `
    <button 
      type="button"
      class="category-filter-btn ${cat.id === currentCategoryFilter ? "active" : ""}"
      onclick="filterByCategory('${cat.id}')"
    >
      ${cat.name}
    </button>
  `).join("");
}

window.filterByCategory = function(catId) {
  currentCategoryFilter = catId;
  renderCategoryFilters();
  renderProductsGrid();
};

function renderProductsGrid() {
  const container = document.getElementById("allProductsGrid");
  if (!container || typeof PRODUCTS_DATA === "undefined") return;

  let filtered = [...PRODUCTS_DATA];

  // Filtro por categoría
  if (currentCategoryFilter !== "all") {
    filtered = filtered.filter(p => p.category === currentCategoryFilter);
  }

  // Filtro por búsqueda
  if (catalogSearchQuery.trim() !== "") {
    const q = catalogSearchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.sku && p.sku.toLowerCase().includes(q)) || 
      p.brand.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-outlined empty-state-icon">inventory_2</span>
        <h3 class="empty-state-title">No se encontraron productos</h3>
        <p class="empty-state-text">Intenta con otro término de búsqueda o selecciona otra categoría.</p>
      </div>
    `;
    return;
  }

  // Utilizar el componente modular ProductCard
  if (window.ProductCard && typeof window.ProductCard.renderHTML === "function") {
    container.innerHTML = filtered.map(product => window.ProductCard.renderHTML(product)).join("");
  } else {
    // Renderizado de respaldo en caso de que el componente no haya cargado
    container.innerHTML = filtered.map(product => {
      const waMsg = CONFIG.whatsappTemplates.productQuote(product.name, product.sku);
      const waLink = getWhatsAppLink(waMsg);
      return `
        <article class="product-card">
          <div class="product-card-img-box">
            <span class="product-card-badge badge-${product.badgeColor}">${product.badge}</span>
            <img class="product-card-img" src="${product.image}" alt="${product.name}" loading="lazy">
          </div>
          <div class="product-card-body">
            <div class="product-card-meta">
              <span class="product-card-category">${product.brand}</span>
              <span class="product-card-sku">SKU: ${product.sku}</span>
            </div>
            <h3 class="product-card-title">${product.name}</h3>
            <ul class="product-card-specs">
              ${(product.specs || []).slice(0, 3).map(s => `<li>${s}</li>`).join("")}
            </ul>
            <div class="product-card-footer-box">
              <div class="product-card-actions">
                <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-card-quote">
                  <span class="material-symbols-outlined">chat</span>
                  <span>Cotizar WA</span>
                </a>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }
}

function initSearchInput() {
  const searchInput = document.getElementById("catalogSearchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    catalogSearchQuery = e.target.value;
    renderProductsGrid();
  });
}

// ==========================================================================
// SECCIÓN 4: VÍDEO CATÁLOGO (TIKTOK / REELS SHOWCASE)
// ==========================================================================
function renderTikTokGrid() {
  const container = document.getElementById("tiktokGrid");
  if (!container || typeof TIKTOK_VIDEOS === "undefined") return;

  container.innerHTML = TIKTOK_VIDEOS.map(video => {
    const waMsg = `¡Hola El Vecino! Vi el video de ${video.title} (SKU: ${video.sku}) y deseo cotizarlo.`;
    const waLink = getWhatsAppLink(waMsg);

    return `
      <article class="tiktok-card">
        <img class="tiktok-video-img" src="${video.thumbnail}" alt="${video.title}" loading="lazy">
        
        <div class="tiktok-overlay">
          <div class="flex items-center justify-between">
            <span class="badge badge-neon-magenta">${video.duration}</span>
            <span class="badge badge-dark">
              <span class="material-symbols-outlined text-xs">play_circle</span>
              ${video.views}
            </span>
          </div>

          <div class="tiktok-stats">
            <button class="tiktok-stat-btn" type="button" aria-label="Me gusta">
              <div class="tiktok-stat-icon">
                <span class="material-symbols-outlined text-red-500">favorite</span>
              </div>
              <span>${video.likes}</span>
            </button>
            <button class="tiktok-stat-btn" type="button" aria-label="Compartir">
              <div class="tiktok-stat-icon">
                <span class="material-symbols-outlined text-neon-cyan">share</span>
              </div>
              <span>Compartir</span>
            </button>
          </div>

          <div>
            <span class="tiktok-author">${video.author}</span>
            <h4 class="tiktok-title">${video.title}</h4>
            <p class="tiktok-desc">${video.desc}</p>
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan btn-sm w-full justify-center">
              <span class="material-symbols-outlined">chat</span>
              <span>Cotizar Equipo del Vídeo</span>
            </a>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

// ==========================================================================
// SECCIÓN 5: DOCK FLOTANTE DE WHATSAPP
// ==========================================================================
function renderFloatingDock() {
  const dock = document.getElementById("floatingDock");
  if (!dock) return;

  const generalMsg = "¡Hola El Vecino! Estoy explorando el catálogo web y requiero cotización y asesoría técnica de inventario disponible en bodega.";
  const waLink = getWhatsAppLink(generalMsg);

  dock.innerHTML = `
    <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="floating-whatsapp-btn" aria-label="Cotizar por WhatsApp">
      <span class="material-symbols-outlined">chat</span>
      <span>Cotizar por WhatsApp</span>
    </a>
  `;
}

// ==========================================================================
// MODAL DE PRODUCTO / FICHA TÉCNICA
// ==========================================================================
window.openProductModal = function(productId) {
  if (window.ProductModal && typeof window.ProductModal.open === "function") {
    window.ProductModal.open(productId);
    return;
  }

  const product = (typeof PRODUCTS_DATA !== "undefined" ? PRODUCTS_DATA : []).find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById("productModal");
  const modalContent = document.getElementById("modalContent");
  if (!modal || !modalContent) return;

  const waMsg = CONFIG.whatsappTemplates.productQuote(product.name, product.sku);
  const waLink = getWhatsAppLink(waMsg);

  modalContent.innerHTML = `
    <div class="modal-content-grid">
      <div>
        <div class="modal-img-box">
          <img class="modal-img" src="${product.image}" alt="${product.name}">
        </div>
        <div class="flex items-center justify-between" style="margin-top: var(--space-sm);">
          <span class="badge badge-${product.badgeColor}">${product.badge}</span>
          <span class="badge badge-dark">SKU: ${product.sku}</span>
        </div>
        <h2 class="section-title" style="margin-top: var(--space-xs);">${product.name}</h2>
        <p class="section-subtitle">${product.description}</p>
      </div>

      <div>
        <h4 class="font-display font-bold text-base" style="margin-bottom: var(--space-sm); border-bottom: 1px solid var(--slate-border); padding-bottom: var(--space-xs);">
          Ficha Técnica de Homologación
        </h4>
        <div class="modal-specs-grid">
          ${(product.specs || []).map(spec => `
            <div class="modal-spec-card">
              <span class="modal-spec-label">Especificación</span>
              <span class="modal-spec-val">${spec}</span>
            </div>
          `).join("")}
        </div>

        <div class="modal-warehouse-notice">
          <div class="flex items-center gap-xs text-electric-blue font-bold">
            <span class="material-symbols-outlined">verified</span>
            <span>Garantía Oficial de Fábrica Directa</span>
          </div>
          <p class="text-xs text-muted" style="margin-top: 4px;">
            Este equipo cuenta con respaldo directo de la marca y certificación técnica de bodega mayorista.
          </p>
        </div>

        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan btn-lg w-full justify-center">
          <span class="material-symbols-outlined">chat</span>
          <span>Cotizar Ficha Técnica por WhatsApp</span>
        </a>
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

// ==========================================================================
// INICIALIZACIÓN PRINCIPAL (DOM READY)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initGlobalComponents();
  renderBenefits();
  renderCombos();
  renderCategoryFilters();
  renderProductsGrid();
  initSearchInput();
  renderTikTokGrid();
  renderFloatingDock();

  // Cerrar modal al pulsar fuera de la tarjeta
  const modal = document.getElementById("productModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        window.closeProductModal();
      }
    });
  }
});
