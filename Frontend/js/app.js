/**
 * APP.JS - LÓGICA PRINCIPAL DE LA APLICACIÓN
 * Maneja el renderizado dinámico de productos, combos, filtros, búsqueda,
 * modales y la generación de enlaces automáticos de cotización a WhatsApp.
 */

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  if (window.Navbar && document.getElementById("navbar-mount")) {
    window.Navbar.mount("#navbar-mount", "inicio");
  }
  if (window.Footer && document.getElementById("footer-mount")) {
    window.Footer.mount("#footer-mount", "inicio");
  }
  renderBenefits();
  renderFeaturedProducts();
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get("cat") || "todas";
  renderAllProducts(initialCategory);
  renderCategoriesFilter(initialCategory);
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
function renderCategoriesFilter(activeCatId = "todas") {
  const container = document.getElementById("categoriesFilterContainer");
  if (!container) return;

  container.innerHTML = CATEGORIES_DATA.map((cat, idx) => {
    const isActive = activeCatId ? (cat.id === activeCatId) : (idx === 0);
    return `
      <button 
        class="category-filter-btn ${isActive ? 'active' : ''}" 
        data-category="${cat.id}"
        onclick="filterProductsByCategory('${cat.id}', this)"
      >
        <span>${cat.name}</span>
        ${cat.count ? `<span>(${cat.count})</span>` : ''}
      </button>
    `;
  }).join("");
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
 * Plantilla HTML de cada tarjeta de producto (utiliza el componente reutilizable ProductCard)
 */
function createProductCardHtml(product) {
  if (window.ProductCard && typeof window.ProductCard.renderHTML === "function") {
    return window.ProductCard.renderHTML(product);
  }

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
    <article class="product-card">
      <div class="product-img-wrapper">
        <img class="product-img" src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-badge-float badge badge-neon-cyan" title="${catName}">
          ${catName}
        </span>
      </div>
      <div class="product-body">
        <div class="product-header-info">
          <span class="product-category text-electric-blue uppercase font-bold text-xs">${subcatName}</span>
          ${product.sku ? `<span class="product-sku">SKU: ${product.sku}</span>` : ''}
        </div>
        <h3 class="product-name">${product.name}</h3>
        ${(product.description || product.summary) ? `
          <p class="product-card-description">${product.description || product.summary}</p>
        ` : ''}
        <div class="product-footer">
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan btn-sm flex-1">
            <span class="material-symbols-outlined">chat</span>
            <span>Cotizar WA</span>
          </a>
          <button onclick="event.stopPropagation(); if (window.ProductCard) { ProductCard.addToQuote('${product.id}'); } else if (window.CartModal) { CartModal.open(); }" class="btn btn-outline btn-icon btn-card-cart" title="Añadir a lista de cotización">
            <span class="material-symbols-outlined">shopping_cart</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

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
 * - Rotación automática
 * - Flechas transparentes y poco notorias
 * - Bucle infinito hacia adelante continuo (sin efecto de retroceso brusco)
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

  let currentIndex = cloneCount; // Comienza exactamente en el primer combo real
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

  // Posicionar de inicio sin transición
  requestAnimationFrame(() => {
    updatePosition(false);
  });

  function move(direction) {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex += direction;
    updatePosition(true);
  }

  // Bucle infinito perfecto: cuando finaliza la animación hacia adelante muestra
  // el clon del primer combo y luego se posiciona en el real sin animación de retroceso
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

  // Autoplay (cada 4.5s)
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

  // Pausar en hover para no interrumpir la lectura del usuario
  if (wrapper) {
    wrapper.addEventListener("mouseenter", stopAutoplay);
    wrapper.addEventListener("mouseleave", startAutoplay);
  }

  // Soporte de gestos táctiles (swipe)
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
 * Renderiza las publicaciones de combos en promoción
 * Reglas de diseño adaptativo:
 * - 1 sola promoción: formato hero/banner sin SKU.
 * - 2 promociones: comparten espacio en una misma fila (layout-duo) sin SKU.
 * - 3 promociones: cartas ocupando el espacio disponible (en teléfono se reducen a 2) con el mismo estilo de listado que de a 2.
 * - Más de 3 promociones: se ven de la misma forma que en 3 pero con carrusel automático infinito y flechas transparentes.
 */
function renderCombos() {
  const container = document.getElementById("combosContainer");
  if (!container) return;

  // Limpiar carrusel previo si existía
  if (combosCarouselAutoplay) {
    clearInterval(combosCarouselAutoplay);
    combosCarouselAutoplay = null;
  }
  if (combosCarouselResizeHandler) {
    window.removeEventListener("resize", combosCarouselResizeHandler);
    combosCarouselResizeHandler = null;
  }

  // Determinar los combos según el modo de previsualización o datos activos
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
  const combo = COMBOS_DATA.find(c => c.id === comboId);
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
            <span>Paquete Consolidado de Bodega</span>
          </div>
          <p class="text-muted" style="font-size: var(--font-size-xs); margin-top: var(--space-3xs);">
            ${combo.summary}
          </p>
        </div>

        <div class="flex gap-sm">
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan btn-full btn-lg">
            <span class="material-symbols-outlined">chat</span>
            <span>Cotizar Paquete Completo por WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("open");
};

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
  if (mobileMenuBtn && mobileNavDrawer && !mobileMenuBtn.dataset.bound) {
    mobileMenuBtn.dataset.bound = "true";
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
