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
 * Diseñada para el carrusel y cuadrícula: optimizada sin imágenes de productos individuales
 * para máxima legibilidad y responsividad sin amontonamiento
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
            <span>${combo.badge}</span>
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
                ${item.type ? `<span class="combo-duo-inclusion-type">${item.type}</span>` : ''}
                <span class="combo-duo-inclusion-name" title="${item.name}">${item.name}</span>
                ${item.detail ? `<span class="combo-duo-inclusion-detail" title="${item.detail}">${item.detail}</span>` : ''}
              </div>
            </div>
          `).join("")}
        </div>

        <div class="combo-duo-footer">
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan btn-combo-quote w-full justify-center">
            <span class="material-symbols-outlined">chat</span>
            <span>Cotizar Combo</span>
          </a>
        </div>
      </div>
    </article>
  `;
}

/**
 * Genera la estructura HTML de la carta de promoción completa (Hero) para cuando hay 1 o 2 combos,
 * mostrándose una debajo de otra con espacio amplio
 */
function createPromotionHeroCardHTML(combo) {
  const includedItemsText = combo.items.map(i => i.name).join(", ");
  const waMsg = CONFIG.whatsappTemplates.comboQuote(combo.title, combo.sku, includedItemsText);
  const waLink = getWhatsAppLink(waMsg);

  return `
    <article class="combo-card combo-card-hero">
      <div class="combo-grid">
        <div class="combo-content-side">
          <div class="combo-badge-row">
            <span class="badge badge-${combo.badgeColor}">
              <span class="material-symbols-outlined">auto_awesome</span>
              <span>${combo.badge}</span>
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
                  ${item.type ? `<span class="combo-inclusion-type">${item.type}</span>` : ''}
                  <span class="combo-inclusion-name">${item.name}</span>
                  ${item.detail ? `<p class="combo-inclusion-detail">${item.detail}</p>` : ''}
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

  // CASO 1 Y 2: 1 O 2 PROMOCIONES (Se muestran en forma de carta de promoción una debajo de otra)
  if (count === 1 || count === 2) {
    container.className = "combos-container layout-stacked";
    container.innerHTML = combos.map(combo => createPromotionHeroCardHTML(combo)).join("");
    return;
  }

  // CASO 3 O MÁS: (Carrusel automático infinito mostrando dos cartas a la vez en responsivo)
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
// SECCIÓN 3: PRODUCTOS DESTACADOS & MEJOR VALORADOS (MÁXIMO 8 / 2 FILAS)
// ==========================================================================
const MAX_FEATURED_PRODUCTS = 8;
let currentProductsList = typeof PRODUCTS_DATA !== "undefined" ? [...PRODUCTS_DATA] : [];
let currentCategoriesList = typeof CATEGORIES_DATA !== "undefined" ? [...CATEGORIES_DATA] : [];
let currentCategoryFilter = "todas";

/**
 * Helper para verificar correspondencia de categoría entre backend y frontend
 */
function matchCategory(p, targetCat) {
  if (!targetCat || targetCat === "all" || targetCat === "todas") return true;
  const target = String(typeof targetCat === "object" ? (targetCat.id || targetCat.slug || targetCat.name) : targetCat).toLowerCase().trim();
  const pCat = String(p.category || "").toLowerCase().trim();
  const pCatName = String(p.categoryName || "").toLowerCase().trim();
  const pCatSlug = String(p.categorySlug || "").toLowerCase().trim();
  if (pCat === target || pCatName === target || pCatSlug === target) return true;
  if (Array.isArray(p.categories) && p.categories.some(c => String(c).toLowerCase().trim() === target)) return true;
  if (Array.isArray(p.categories_detail)) {
    return p.categories_detail.some(cd =>
      String(cd.id).toLowerCase().trim() === target ||
      String(cd.category_name || "").toLowerCase().trim() === target ||
      String(cd.slug || "").toLowerCase().trim() === target
    );
  }
  return false;
}

/**
 * Obtiene hasta 8 productos priorizando los destacados (featured / is_feature_product)
 * y rellenando los cupos restantes con los productos de mayor valoración / ranking.
 */
function getFeaturedAndTopRatedProducts(sourceList = currentProductsList, limit = MAX_FEATURED_PRODUCTS) {
  if (!Array.isArray(sourceList) || sourceList.length === 0) return [];

  // 1. Obtener productos destacados
  const featured = sourceList.filter(p => p.featured === true || p.is_feature_product === true);

  // Ordenar los destacados por mayor valoración / ranking descendente
  featured.sort((a, b) => {
    const scoreA = Number(a.rating || a.ranking_score || a.sentiment_score || 0);
    const scoreB = Number(b.rating || b.ranking_score || b.sentiment_score || 0);
    return scoreB - scoreA;
  });

  // Si ya tenemos suficientes destacados para cubrir el cupo (máximo 8 o 2 filas)
  if (featured.length >= limit) {
    return featured.slice(0, limit);
  }

  // 2. Si no alcanzamos el cupo de 8, rellenar con los productos más valorados restantes
  const featuredIds = new Set(featured.map(p => p.id));
  const remaining = sourceList.filter(p => !featuredIds.has(p.id));

  remaining.sort((a, b) => {
    const scoreA = Number(a.rating || a.ranking_score || a.sentiment_score || 0);
    const scoreB = Number(b.rating || b.ranking_score || b.sentiment_score || 0);
    return scoreB - scoreA;
  });

  const slotsNeeded = limit - featured.length;
  const fillers = remaining.slice(0, slotsNeeded);

  return [...featured, ...fillers];
}

function renderCategoryFilters() {
  const container = document.getElementById("categoriesFilterContainer");
  if (!container) return;

  container.innerHTML = currentCategoriesList.map(cat => {
    const isMatch = (currentCategoryFilter === "todas" && cat.id === "todas") ||
      (currentCategoryFilter !== "todas" && (matchCategory({ category: currentCategoryFilter }, cat) || String(currentCategoryFilter) === String(cat.id)));

    return `
      <button 
        type="button"
        class="category-filter-btn ${isMatch ? "active" : ""}"
        onclick="filterByCategory('${cat.id}')"
      >
        ${cat.name}
      </button>
    `;
  }).join("");
}

window.filterByCategory = function(catId) {
  currentCategoryFilter = catId;
  renderCategoryFilters();
  renderProductsGrid();
};

function renderProductsGrid() {
  const container = document.getElementById("allProductsGrid");
  if (!container) return;

  // Filtrar según categoría seleccionada
  let filtered = [...currentProductsList];
  if (currentCategoryFilter && currentCategoryFilter !== "todas" && currentCategoryFilter !== "all") {
    filtered = filtered.filter(p => matchCategory(p, currentCategoryFilter));
  }

  // Filtrar por término de búsqueda si existe
  if (typeof catalogSearchQuery !== "undefined" && catalogSearchQuery) {
    const q = catalogSearchQuery.toLowerCase().trim();
    filtered = filtered.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q))
    );
  }

  // Obtener la selección de productos destacados y más valorados (máximo 8 / 2 filas en pantallas grandes)
  const displayProducts = getFeaturedAndTopRatedProducts(filtered, MAX_FEATURED_PRODUCTS);

  if (displayProducts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-outlined empty-state-icon">stars</span>
        <h3 class="empty-state-title">No hay productos disponibles</h3>
        <p class="empty-state-text">Vuelve a consultar más tarde o visita nuestro catálogo general.</p>
      </div>
    `;
    return;
  }

  // Utilizar el componente modular ProductCard
  if (window.ProductCard && typeof window.ProductCard.renderHTML === "function") {
    container.innerHTML = displayProducts.map(product => window.ProductCard.renderHTML(product)).join("");
  } else {
    // Renderizado de respaldo en caso de que el componente no haya cargado
    container.innerHTML = displayProducts.map(product => {
      const waMsg = CONFIG.whatsappTemplates.productQuote(product.name, product.sku);
      const waLink = getWhatsAppLink(waMsg);

      let catName = product.categoryName;
      if (!catName || catName === product.category) {
        const found = window.CATEGORIES_DATA?.find(c => c.id === product.category || c.name === product.category);
        if (found) catName = found.name;
      }
      catName = catName || product.category || 'Catálogo';

      let subcatName = product.subcategory || product.sub_category || '';
      if (typeof subcatName === 'string' && window.SUBCATEGORIES_DATA) {
        const foundSub = window.SUBCATEGORIES_DATA.find(s => s.id === subcatName || s.name.toLowerCase() === subcatName.toLowerCase());
        if (foundSub) subcatName = foundSub.name;
      }
      subcatName = subcatName || product.brand || catName;

      return `
        <article class="product-card" data-product-id="${product.id}">
          <div class="product-card-img-box">
            <span class="product-card-badge badge-neon-cyan" title="${catName}">${catName}</span>
            <img class="product-card-img" src="${product.image}" alt="${product.name}" loading="lazy">
          </div>
          <div class="product-card-body">
            <div class="product-card-meta">
              <span class="product-card-category" title="${subcatName}">${subcatName}</span>
              ${product.sku ? `<span class="product-card-sku">SKU: ${product.sku}</span>` : ''}
            </div>
            <h3 class="product-card-title">${product.name}</h3>
            ${product.description ? `
              <p class="product-card-description" title="${product.description}">
                ${product.description}
              </p>
            ` : ''}
            <div class="product-card-footer-box">
              <div class="product-card-actions">
                <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-card-quote">
                  <span class="material-symbols-outlined">chat</span>
                  <span>Cotizar WA</span>
                </a>
                <button type="button" class="btn-card-action-icon btn-card-cart" title="Añadir a lista de cotización" onclick="event.stopPropagation(); if (window.ProductCard) { ProductCard.addToQuote('${product.id}'); } else if (window.CartModal) { CartModal.open(); }">
                  <span class="material-symbols-outlined">shopping_cart</span>
                </button>
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

  const product = currentProductsList.find(p => String(p.id) === String(productId)) ||
    (typeof PRODUCTS_DATA !== "undefined" ? PRODUCTS_DATA : []).find(p => String(p.id) === String(productId));
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
// SECCIÓN: CONTROLADOR DEL CARRUSEL DE CATEGORÍAS (2 FILAS - BUCLE INFINITO Y AUTOPLAY)
// ==========================================================================
function initCategoriesCarousel() {
  const viewport = document.getElementById("catCarouselViewport");
  const track = document.getElementById("catCarouselTrack");
  const prevBtns = [document.getElementById("catCarouselPrev"), document.getElementById("catCarouselFloatPrev")].filter(Boolean);
  const nextBtns = [document.getElementById("catCarouselNext"), document.getElementById("catCarouselFloatNext")].filter(Boolean);
  const wrapper = document.querySelector(".categories-carousel-wrapper") || viewport;

  if (!viewport || !track) return;

  const originalCards = Array.from(track.children);
  if (originalCards.length < 2) return;

  // Cada columna está compuesta por 2 tarjetas en vertical (Fila 1 y Fila 2)
  const numCols = Math.ceil(originalCards.length / 2);

  // Crear clones para garantizar desplazamiento infinito y fluido sin cortes
  const createCloneSet = (label) => originalCards.map(c => {
    const clone = c.cloneNode(true);
    clone.setAttribute("data-clone", label);
    clone.setAttribute("aria-hidden", "true");
    return clone;
  });

  const prefix1 = createCloneSet("prefix-1");
  const prefix2 = createCloneSet("prefix-2");
  const suffix1 = createCloneSet("suffix-1");
  const suffix2 = createCloneSet("suffix-2");

  // Inserción en orden natural al principio y al final
  track.prepend(...prefix1, ...prefix2);
  track.append(...suffix1, ...suffix2);

  // Índice base: 2 juegos completos de columnas antes del conjunto original (10 columnas)
  const baseIndex = numCols * 2;
  let currentColIndex = baseIndex;
  let isAnimating = false;
  let autoplayTimer = null;
  const AUTOPLAY_INTERVAL = 3800; // Desplazamiento automático cada 3.8 segundos

  function getColWidth() {
    const first = track.children[0];
    if (!first) return 330;
    const w = first.getBoundingClientRect().width;
    return w > 0 ? w : 330;
  }

  function updatePosition(withTransition = true) {
    const colWidth = getColWidth();
    if (colWidth <= 0) return;
    if (withTransition) {
      track.style.transition = "transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)";
    } else {
      track.style.transition = "none";
    }
    track.style.transform = `translateX(-${currentColIndex * colWidth}px)`;
  }

  // Inicializar posición en el conjunto original de forma transparente
  requestAnimationFrame(() => {
    updatePosition(false);
    startAutoplay();
  });

  function move(direction) {
    if (isAnimating) return;
    isAnimating = true;
    currentColIndex += direction;
    updatePosition(true);
  }

  function safeMove(direction) {
    move(direction);
    setTimeout(() => {
      isAnimating = false;
    }, 750);
  }

  // Al llegar al final de la transición CSS, reajustar posición invisiblemente
  track.addEventListener("transitionend", (e) => {
    if (e.target !== track) return;

    // Al llegar al final, sigue la primera columna de forma continua y suave
    if (currentColIndex >= baseIndex + numCols) {
      currentColIndex -= numCols;
      updatePosition(false);
    } else if (currentColIndex < baseIndex) {
      currentColIndex += numCols;
      updatePosition(false);
    }

    isAnimating = false;
  });

  // Autoplay continuo
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      safeMove(1);
    }, AUTOPLAY_INTERVAL);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  // Pausar al pasar el ratón para facilitar la lectura y selección
  if (wrapper) {
    wrapper.addEventListener("mouseenter", stopAutoplay);
    wrapper.addEventListener("mouseleave", startAutoplay);
  }

  // Pausar si la pestaña pierde visibilidad
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  // Botones de avance y retroceso (funcionan de manera infinita)
  prevBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      safeMove(-1);
      stopAutoplay();
      startAutoplay();
    });
  });

  nextBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      safeMove(1);
      stopAutoplay();
      startAutoplay();
    });
  });

  // Soporte de arrastre suave con ratón y pantallas táctiles (Drag / Swipe to scroll)
  let isPointerDown = false;
  let startX = 0;
  let dragDeltaX = 0;
  let didDrag = false;

  function onPointerDown(e) {
    if (isAnimating) return;
    isPointerDown = true;
    didDrag = false;
    dragDeltaX = 0;
    startX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    stopAutoplay();
    track.style.transition = "none";
  }

  function onPointerMove(e) {
    if (!isPointerDown) return;
    const currentX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    dragDeltaX = currentX - startX;
    if (Math.abs(dragDeltaX) > 8) {
      didDrag = true;
    }
    const colWidth = getColWidth();
    const currentOffset = currentColIndex * colWidth - dragDeltaX;
    track.style.transform = `translateX(-${currentOffset}px)`;
  }

  function onPointerUp() {
    if (!isPointerDown) return;
    isPointerDown = false;
    const colWidth = getColWidth();
    const threshold = colWidth * 0.22;

    if (dragDeltaX < -threshold) {
      safeMove(1);
    } else if (dragDeltaX > threshold) {
      safeMove(-1);
    } else {
      updatePosition(true);
    }

    dragDeltaX = 0;
    startAutoplay();
  }

  viewport.addEventListener("mousedown", onPointerDown);
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);

  viewport.addEventListener("touchstart", onPointerDown, { passive: true });
  viewport.addEventListener("touchmove", onPointerMove, { passive: true });
  viewport.addEventListener("touchend", onPointerUp, { passive: true });

  // Prevenir navegación al hacer click como consecuencia del arrastre
  track.addEventListener("click", (e) => {
    if (didDrag) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // Reajustar tamaño al redimensionar ventana
  window.addEventListener("resize", () => {
    updatePosition(false);
  }, { passive: true });
}

/**
 * Conexión Híbrida: Obtiene productos y categorías desde el backend Django
 * y los mezcla dinámicamente con el catálogo estático del frontend
 */
async function initHybridCatalog() {
  try {
    if (window.ProductApi && typeof window.ProductApi.getProducts === "function") {
      const [hybridProducts, hybridCategories] = await Promise.all([
        window.ProductApi.getProducts(),
        window.ProductApi.getCategories()
      ]);
      if (Array.isArray(hybridProducts) && hybridProducts.length > 0) {
        currentProductsList = hybridProducts;
      }
      if (Array.isArray(hybridCategories) && hybridCategories.length > 0) {
        currentCategoriesList = hybridCategories;
      }
      renderCategoryFilters();
      renderProductsGrid();
    }
  } catch (err) {
    console.warn("[index.js] Catálogo híbrido funcionando en modo local:", err.message);
  }
}

// ==========================================================================
// INICIALIZACIÓN PRINCIPAL (DOM READY)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Soporte de filtro inicial por URL (?cat=...)
  const urlParams = new URLSearchParams(window.location.search);
  const urlCat = urlParams.get("cat");
  if (urlCat) {
    currentCategoryFilter = urlCat;
  }

  initGlobalComponents();
  renderBenefits();
  renderCombos();
  renderCategoryFilters();
  renderProductsGrid();
  initSearchInput();
  renderTikTokGrid();
  renderFloatingDock();
  initCategoriesCarousel();
  initHybridCatalog();

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
