/**
 * product.js - Catalog controller connecting view with product.api.js
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Mount Global Navbar & Footer
  if (window.Navbar) window.Navbar.mount('#navbar-mount', 'catalogo');
  if (window.Footer) window.Footer.mount('#footer-mount');

  const productsContainer = document.getElementById('productsContainer');
  const categoryTabsContainer = document.getElementById('categoryTabs');
  const searchInput = document.getElementById('catalogSearchInput');
  const sortSelect = document.getElementById('catalogSortSelect');
  const resultsCount = document.getElementById('resultsCount');
  const inStockFilter = document.getElementById('filterInStock');
  const featuredFilter = document.getElementById('filterFeatured');
  const btnResetFilters = document.getElementById('btnResetFilters');

  let allProducts = [];
  let currentCategory = 'all';

  // Read URL query params
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('cat')) currentCategory = urlParams.get('cat');
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

      // Fetch from API through ProductApi gateway
      const [products, categories] = await Promise.all([
        window.ProductApi.getProducts(),
        window.ProductApi.getCategories()
      ]);

      allProducts = products;
      renderCategoryTabs(categories);
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

  function renderCategoryTabs(categories) {
    if (!categoryTabsContainer) return;

    let tabsHtml = `
      <button class="category-tab-btn ${currentCategory === 'all' ? 'active' : ''}" data-cat="all">
        <span>Todos</span>
        <span class="text-xs opacity-75">(${allProducts.length})</span>
      </button>
    `;

    categories.forEach(cat => {
      const count = allProducts.filter(p => p.category === cat.slug || p.category === cat.id).length;
      tabsHtml += `
        <button class="category-tab-btn ${currentCategory === cat.slug || currentCategory === cat.id ? 'active' : ''}" data-cat="${cat.slug || cat.id}">
          <span class="material-symbols-outlined text-[18px]">${cat.icon || 'inventory_2'}</span>
          <span>${cat.name}</span>
          <span class="text-xs opacity-75">(${count})</span>
        </button>
      `;
    });

    categoryTabsContainer.innerHTML = tabsHtml;

    categoryTabsContainer.querySelectorAll('.category-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        categoryTabsContainer.querySelectorAll('.category-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.cat;
        applyFilters();
      });
    });
  }

  function applyFilters() {
    let filtered = [...allProducts];

    // 1. Categoría
    if (currentCategory && currentCategory !== 'all') {
      filtered = filtered.filter(p => p.category === currentCategory);
    }

    // 2. Búsqueda por texto
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (query) {
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // 3. Filtro Solo Disponibles
    if (inStockFilter && inStockFilter.checked) {
      filtered = filtered.filter(p => p.inStock !== false);
    }

    // 4. Filtro Solo Destacados
    if (featuredFilter && featuredFilter.checked) {
      filtered = filtered.filter(p => p.featured === true);
    }

    // 5. Ordenamiento
    const sortVal = sortSelect ? sortSelect.value : 'default';
    if (sortVal === 'price-asc') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortVal === 'price-desc') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortVal === 'popular') {
      filtered.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
    }

    renderProducts(filtered);
  }

  function renderProducts(products) {
    if (!productsContainer) return;

    if (resultsCount) {
      resultsCount.textContent = `${products.length} producto${products.length === 1 ? '' : 's'} disponible${products.length === 1 ? '' : 's'}`;
    }

    if (products.length === 0) {
      productsContainer.innerHTML = `
        <div class="col-span-full bg-white p-12 rounded-2xl border border-slate-border text-center flex flex-col items-center justify-center gap-3">
          <div class="w-16 h-16 rounded-2xl bg-slate-surface text-outline flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl">search_off</span>
          </div>
          <h3 class="font-headline-sm text-deep-obsidian font-bold">No se encontraron productos</h3>
          <p class="text-sm text-on-surface-variant max-w-md">
            Prueba ajustando los términos de búsqueda o limpiando los filtros seleccionados.
          </p>
          <button class="btn-card-quote mt-2 px-6" onclick="location.reload()">
            <span>Restablecer Filtros</span>
          </button>
        </div>
      `;
      return;
    }

    productsContainer.innerHTML = products.map(prod => window.ProductCard.renderHTML(prod)).join('');
  }

  // Event Listeners
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (sortSelect) sortSelect.addEventListener('change', applyFilters);
  if (inStockFilter) inStockFilter.addEventListener('change', applyFilters);
  if (featuredFilter) featuredFilter.addEventListener('change', applyFilters);

  if (btnResetFilters) {
    btnResetFilters.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (inStockFilter) inStockFilter.checked = false;
      if (featuredFilter) featuredFilter.checked = false;
      if (sortSelect) sortSelect.value = 'default';
      currentCategory = 'all';
      if (categoryTabsContainer) {
        categoryTabsContainer.querySelectorAll('.category-tab-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.cat === 'all');
        });
      }
      applyFilters();
    });
  }

  // Global search event listener
  window.addEventListener('catalog:search', (e) => {
    if (searchInput) {
      searchInput.value = e.detail.query;
      applyFilters();
    }
  });

  loadData();
});
