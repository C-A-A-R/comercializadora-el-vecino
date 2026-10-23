/**
 * product.js - Catalog controller connecting view with product.api.js
 * Comercializadora EL VECINO - Electric Neo-Tech
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Mount Global Navbar & Footer
  if (window.Navbar) window.Navbar.mount('#navbar-mount', 'catalogo');
  if (window.Footer) window.Footer.mount('#footer-mount');

  // DOM Elements
  const productsContainer = document.getElementById('productsContainer');
  const searchInput = document.getElementById('catalogSearchInput');
  const sortSelect = document.getElementById('catalogSortSelect');
  const resultsCount = document.getElementById('resultsCount');
  const inStockFilter = document.getElementById('filterInStock');
  const featuredFilter = document.getElementById('filterFeatured');
  const btnResetFilters = document.getElementById('btnResetFilters');

  // Desktop Sidebar Filter Containers
  const sidebarCategoryList = document.getElementById('sidebarCategoryList');
  const sidebarSubcategoryList = document.getElementById('sidebarSubcategoryList');
  const sidebarBrandList = document.getElementById('sidebarBrandList');

  // Mobile Dropdown Selects
  const mobileCategorySelect = document.getElementById('mobileCategorySelect');
  const mobileSubcategorySelect = document.getElementById('mobileSubcategorySelect');
  const mobileBrandSelect = document.getElementById('mobileBrandSelect');

  // State
  let allProducts = [];
  let allCategories = [];
  let allSubcategories = [];
  let allBrands = [];

  let currentCategory = 'all';
  let currentSubcategory = 'all';
  let currentBrand = 'all';

  // Read URL query params
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('cat')) currentCategory = urlParams.get('cat');
  if (urlParams.get('subcat')) currentSubcategory = urlParams.get('subcat');
  if (urlParams.get('brand')) currentBrand = urlParams.get('brand');
  if (urlParams.get('q') && searchInput) searchInput.value = urlParams.get('q');

  /**
   * Load Categories & Products from ProductApi
   */
  async function loadData() {
    try {
      if (productsContainer) {
        productsContainer.innerHTML = `
          <div class="col-span-full py-16 text-center text-outline">
            <span class="material-symbols-outlined text-4xl animate-spin text-electric-blue">progress_activity</span>
            <p class="mt-2 font-medium">Consultando catálogo en bodega...</p>
          </div>
        `;
      }

      // Fetch from API or local fallback
      const [products, categories] = await Promise.all([
        window.ProductApi.getProducts(),
        window.ProductApi.getCategories()
      ]);

      allProducts = products;
      allCategories = categories;

      extractMetadata();
      renderAllFilters();
      applyFilters();
    } catch (error) {
      console.error('[product.js] Error cargando catálogo:', error);
      if (productsContainer) {
        productsContainer.innerHTML = `
          <div class="col-span-full py-12 text-center text-error">
            <span class="material-symbols-outlined text-4xl">error</span>
            <p class="mt-2">No se pudo cargar el inventario. Intenta nuevamente.</p>
          </div>
        `;
      }
    }
  }

  /**
   * Extracts distinct subcategories and brands from products and static data
   */
  function extractMetadata() {
    // 1. Subcategorías
    const subcatMap = new Map();
    // Pre-populate from SUBCATEGORIES_DATA if available
    if (window.SUBCATEGORIES_DATA && Array.isArray(window.SUBCATEGORIES_DATA)) {
      window.SUBCATEGORIES_DATA.forEach(s => {
        subcatMap.set(s.name, {
          id: s.id || s.name,
          name: s.name,
          categoryId: s.categoryId || ''
        });
      });
    }
    // Also scan products
    allProducts.forEach(p => {
      if (p.subcategory && !subcatMap.has(p.subcategory)) {
        subcatMap.set(p.subcategory, {
          id: p.subcategory,
          name: p.subcategory,
          categoryId: p.category || ''
        });
      }
    });
    allSubcategories = Array.from(subcatMap.values());

    // 2. Marcas
    const brandSet = new Set();
    allProducts.forEach(p => {
      if (p.brand && typeof p.brand === 'string') {
        brandSet.add(p.brand.trim());
      }
    });
    allBrands = Array.from(brandSet).sort();
  }

  /**
   * Renders and synchronizes all filter UI elements (desktop sidebar & mobile selects)
   */
  function renderAllFilters() {
    renderCategoryFilters();
    renderSubcategoryFilters();
    renderBrandFilters();
  }

  /**
   * Helper para verificar correspondencia de categoría entre backend y frontend
   */
  function matchCategory(p, targetCat) {
    if (!targetCat || targetCat === 'all' || targetCat === 'todas') return true;
    const target = String(typeof targetCat === 'object' ? (targetCat.id || targetCat.slug || targetCat.name) : targetCat).toLowerCase().trim();
    const pCat = String(p.category || '').toLowerCase().trim();
    const pCatName = String(p.categoryName || '').toLowerCase().trim();
    const pCatSlug = String(p.categorySlug || '').toLowerCase().trim();
    if (pCat === target || pCatName === target || pCatSlug === target) return true;
    if (Array.isArray(p.categories) && p.categories.some(c => String(c).toLowerCase().trim() === target)) return true;
    if (Array.isArray(p.categories_detail)) {
      return p.categories_detail.some(cd =>
        String(cd.id).toLowerCase().trim() === target ||
        String(cd.category_name || '').toLowerCase().trim() === target ||
        String(cd.slug || '').toLowerCase().trim() === target
      );
    }
    return false;
  }

  /**
   * Category filters
   */
  function renderCategoryFilters() {
    // 1. Desktop Sidebar List
    if (sidebarCategoryList) {
      let html = `
        <button type="button" class="filter-option-btn ${currentCategory === 'all' ? 'active' : ''}" data-cat="all">
          <div class="filter-option-btn-content">
            <span class="material-symbols-outlined text-[16px]">grid_view</span>
            <span>Todas las Líneas</span>
          </div>
          <span class="filter-option-count">${allProducts.length}</span>
        </button>
      `;

      allCategories.forEach(cat => {
        if (cat.id === 'todas') return;
        const count = allProducts.filter(p => matchCategory(p, cat)).length;
        const isMatch = matchCategory({ category: currentCategory }, cat) || String(currentCategory) === String(cat.id);

        html += `
          <button type="button" class="filter-option-btn ${isMatch ? 'active' : ''}" data-cat="${cat.id}">
            <div class="filter-option-btn-content">
              <span class="material-symbols-outlined text-[16px]">${cat.icon || 'inventory_2'}</span>
              <span>${cat.name}</span>
            </div>
            <span class="filter-option-count">${count}</span>
          </button>
        `;
      });

      sidebarCategoryList.innerHTML = html;

      sidebarCategoryList.querySelectorAll('.filter-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          currentCategory = btn.dataset.cat;
          currentSubcategory = 'all'; // reset subcat on cat change
          renderCategoryFilters();
          renderSubcategoryFilters();
          renderBrandFilters();
          applyFilters();
        });
      });
    }

    // 2. Mobile Select
    if (mobileCategorySelect) {
      let options = `<option value="all">Todas las Categorías (${allProducts.length})</option>`;
      allCategories.forEach(cat => {
        if (cat.id === 'todas') return;
        const count = allProducts.filter(p => matchCategory(p, cat)).length;
        const isSelected = matchCategory({ category: currentCategory }, cat) || String(currentCategory) === String(cat.id);
        options += `<option value="${cat.id}" ${isSelected ? 'selected' : ''}>${cat.name} (${count})</option>`;
      });
      mobileCategorySelect.innerHTML = options;
      mobileCategorySelect.value = currentCategory;
    }
  }

  /**
   * Subcategory filters
   */
  function renderSubcategoryFilters() {
    // Filter subcategories applicable to current category
    const relevantSubcats = allSubcategories.filter(s => {
      if (currentCategory === 'all') return true;
      if (s.categoryId && (s.categoryId === currentCategory || String(s.categoryId) === String(currentCategory))) {
        return true;
      }
      return allProducts.some(p =>
        (String(p.category) === String(currentCategory) || p.category === currentCategory) &&
        p.subcategory === s.name
      );
    });

    // 1. Desktop Sidebar List
    if (sidebarSubcategoryList) {
      let html = `
        <button type="button" class="filter-option-btn ${currentSubcategory === 'all' ? 'active' : ''}" data-subcat="all">
          <div class="filter-option-btn-content">
            <span class="material-symbols-outlined text-[16px]">label</span>
            <span>Todas las Subcategorías</span>
          </div>
          <span class="filter-option-count">${relevantSubcats.length}</span>
        </button>
      `;

      relevantSubcats.forEach(s => {
        const count = allProducts.filter(p => {
          const matchCat = currentCategory === 'all' ||
            String(p.category) === String(currentCategory) ||
            p.category === currentCategory;
          const matchSub = p.subcategory === s.name || p.subcategory === s.id;
          return matchCat && matchSub;
        }).length;

        const isMatch = currentSubcategory === s.name || currentSubcategory === s.id;

        html += `
          <button type="button" class="filter-option-btn ${isMatch ? 'active' : ''}" data-subcat="${s.name}">
            <div class="filter-option-btn-content">
              <span class="material-symbols-outlined text-[16px]">sell</span>
              <span>${s.name}</span>
            </div>
            <span class="filter-option-count">${count}</span>
          </button>
        `;
      });

      sidebarSubcategoryList.innerHTML = html;

      sidebarSubcategoryList.querySelectorAll('.filter-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          currentSubcategory = btn.dataset.subcat;
          renderSubcategoryFilters();
          applyFilters();
        });
      });
    }

    // 2. Mobile Select
    if (mobileSubcategorySelect) {
      let options = `<option value="all">Todas las Subcategorías</option>`;
      relevantSubcats.forEach(s => {
        const count = allProducts.filter(p => {
          const matchCat = currentCategory === 'all' ||
            String(p.category) === String(currentCategory) ||
            p.category === currentCategory;
          const matchSub = p.subcategory === s.name || p.subcategory === s.id;
          return matchCat && matchSub;
        }).length;
        const isSelected = currentSubcategory === s.name || currentSubcategory === s.id;
        options += `<option value="${s.name}" ${isSelected ? 'selected' : ''}>${s.name} (${count})</option>`;
      });
      mobileSubcategorySelect.innerHTML = options;
      mobileSubcategorySelect.value = currentSubcategory;
    }
  }

  /**
   * Brand filters
   */
  function renderBrandFilters() {
    // 1. Desktop Sidebar List
    if (sidebarBrandList) {
      let html = `
        <button type="button" class="filter-option-btn ${currentBrand === 'all' ? 'active' : ''}" data-brand="all">
          <div class="filter-option-btn-content">
            <span class="material-symbols-outlined text-[16px]">verified</span>
            <span>Todas las Marcas</span>
          </div>
          <span class="filter-option-count">${allBrands.length}</span>
        </button>
      `;

      allBrands.forEach(b => {
        const count = allProducts.filter(p => {
          const matchCat = currentCategory === 'all' ||
            String(p.category) === String(currentCategory) ||
            p.category === currentCategory;
          return matchCat && p.brand === b;
        }).length;

        const isMatch = currentBrand === b;

        html += `
          <button type="button" class="filter-option-btn ${isMatch ? 'active' : ''}" data-brand="${b}">
            <div class="filter-option-btn-content">
              <span class="material-symbols-outlined text-[16px]">check_circle</span>
              <span>${b}</span>
            </div>
            <span class="filter-option-count">${count}</span>
          </button>
        `;
      });

      sidebarBrandList.innerHTML = html;

      sidebarBrandList.querySelectorAll('.filter-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          currentBrand = btn.dataset.brand;
          renderBrandFilters();
          applyFilters();
        });
      });
    }

    // 2. Mobile Select
    if (mobileBrandSelect) {
      let options = `<option value="all">Todas las Marcas</option>`;
      allBrands.forEach(b => {
        const count = allProducts.filter(p => {
          const matchCat = currentCategory === 'all' ||
            String(p.category) === String(currentCategory) ||
            p.category === currentCategory;
          return matchCat && p.brand === b;
        }).length;
        const isSelected = currentBrand === b;
        options += `<option value="${b}" ${isSelected ? 'selected' : ''}>${b} (${count})</option>`;
      });
      mobileBrandSelect.innerHTML = options;
      mobileBrandSelect.value = currentBrand;
    }
  }

  /**
   * Filter and render product list
   */
  function applyFilters() {
    let filtered = [...allProducts];

    // 1. Categoría
    if (currentCategory && currentCategory !== 'all') {
      filtered = filtered.filter(p => matchCategory(p, currentCategory));
    }

    // 2. Subcategoría
    if (currentSubcategory && currentSubcategory !== 'all') {
      filtered = filtered.filter(p =>
        p.subcategory === currentSubcategory ||
        (Array.isArray(p.sub_categories) && p.sub_categories.some(sc =>
          (typeof sc === 'object' ? sc.sub_category_name : sc) === currentSubcategory
        ))
      );
    }

    // 3. Marca
    if (currentBrand && currentBrand !== 'all') {
      filtered = filtered.filter(p => p.brand === currentBrand);
    }

    // 4. Búsqueda por texto (nombre, sku, descripción, marca, modelo)
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (query) {
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.brand && p.brand.toLowerCase().includes(query)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.summary && p.summary.toLowerCase().includes(query))
      );
    }

    // 5. Filtro Solo Disponibles
    if (inStockFilter && inStockFilter.checked) {
      filtered = filtered.filter(p => p.inStock !== false);
    }

    // 6. Filtro Solo Destacados
    if (featuredFilter && featuredFilter.checked) {
      filtered = filtered.filter(p => p.featured === true || p.is_feature_product === true);
    }

    // 7. Ordenamiento
    const sortVal = sortSelect ? sortSelect.value : 'default';
    if (sortVal === 'price-asc') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortVal === 'price-desc') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortVal === 'popular') {
      filtered.sort((a, b) => (b.clicks || b.total_views || 0) - (a.clicks || a.total_views || 0));
    }

    renderProducts(filtered);
  }

  function renderProducts(products) {
    if (!productsContainer) return;

    if (resultsCount) {
      resultsCount.textContent = `${products.length} equipo${products.length === 1 ? '' : 's'} disponible${products.length === 1 ? '' : 's'}`;
    }

    if (products.length === 0) {
      productsContainer.innerHTML = `
        <div class="col-span-full bg-white p-12 rounded-2xl border border-slate-border text-center flex flex-col items-center justify-center gap-3">
          <div class="w-16 h-16 rounded-2xl bg-slate-surface text-outline flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl text-gray-400">search_off</span>
          </div>
          <h3 class="font-headline-sm text-deep-obsidian font-bold text-lg">No se encontraron productos</h3>
          <p class="text-sm text-gray-500 max-w-md">
            Prueba ajustando los filtros de categoría, subcategoría o marca, o limpiando los términos de búsqueda.
          </p>
          <button class="btn-card-quote mt-2 px-6" id="btnEmptyReset" type="button">
            <span>Restablecer Filtros</span>
          </button>
        </div>
      `;
      const btnEmptyReset = document.getElementById('btnEmptyReset');
      if (btnEmptyReset) {
        btnEmptyReset.addEventListener('click', resetAllFilters);
      }
      return;
    }

    productsContainer.innerHTML = products.map(prod => window.ProductCard.renderHTML(prod)).join('');
  }

  function resetAllFilters() {
    currentCategory = 'all';
    currentSubcategory = 'all';
    currentBrand = 'all';
    if (searchInput) searchInput.value = '';
    if (inStockFilter) inStockFilter.checked = false;
    if (featuredFilter) featuredFilter.checked = false;
    if (sortSelect) sortSelect.value = 'default';

    renderAllFilters();
    applyFilters();
  }

  // Mobile Select Event Listeners
  if (mobileCategorySelect) {
    mobileCategorySelect.addEventListener('change', (e) => {
      currentCategory = e.target.value;
      currentSubcategory = 'all';
      renderAllFilters();
      applyFilters();
    });
  }

  if (mobileSubcategorySelect) {
    mobileSubcategorySelect.addEventListener('change', (e) => {
      currentSubcategory = e.target.value;
      renderSubcategoryFilters();
      applyFilters();
    });
  }

  if (mobileBrandSelect) {
    mobileBrandSelect.addEventListener('change', (e) => {
      currentBrand = e.target.value;
      renderBrandFilters();
      applyFilters();
    });
  }

  // Common Controls Event Listeners
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (sortSelect) sortSelect.addEventListener('change', applyFilters);
  if (inStockFilter) inStockFilter.addEventListener('change', applyFilters);
  if (featuredFilter) featuredFilter.addEventListener('change', applyFilters);

  if (btnResetFilters) {
    btnResetFilters.addEventListener('click', resetAllFilters);
  }

  // Global search event listener (from Navbar)
  window.addEventListener('catalog:search', (e) => {
    if (searchInput) {
      searchInput.value = e.detail.query;
      applyFilters();
    }
  });

  loadData();
});
