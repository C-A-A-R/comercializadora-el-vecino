/**
 * categorias.js - Categories controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.Navbar) window.Navbar.mount('#navbar-mount', 'categorias');
  if (window.Footer) window.Footer.mount('#footer-mount');

  const container = document.getElementById('categoriesGrid');

  async function loadCategories() {
    try {
      if (container) {
        container.innerHTML = `
          <div class="col-span-full py-16 text-center text-gray-500">
            <span class="material-symbols-outlined text-4xl animate-spin text-electric-blue">progress_activity</span>
            <p class="mt-2 font-medium">Consultando líneas de productos en bodega...</p>
          </div>
        `;
      }
      const categories = await window.CategoriasApi.getCategories();
      renderCategories(categories);
    } catch (error) {
      console.error('[categorias.js] Error al cargar categorías:', error);
      if (container) {
        container.innerHTML = `
          <div class="col-span-full py-12 text-center text-red-500">
            <span class="material-symbols-outlined text-4xl">error</span>
            <p class="mt-2">No se pudieron cargar las categorías del servidor.</p>
          </div>
        `;
      }
    }
  }

  function renderCategories(categories) {
    if (!container) return;

    if (!categories || categories.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-gray-500">
          No hay categorías registradas en este momento.
        </div>
      `;
      return;
    }

    container.innerHTML = categories.map(cat => `
      <a href="../product/product.html?cat=${cat.id || cat.slug}" class="category-card">
        <div class="category-card-img-box">
          <span class="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-bold text-deep-obsidian border border-slate-border shadow-sm flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px] text-electric-blue">${cat.icon || 'inventory_2'}</span>
            <span>${cat.count || 20}+ Modelos</span>
          </span>
          <img src="${cat.image || 'https://placehold.co/400'}" alt="${cat.name}" class="category-card-img">
        </div>
        <div class="p-6 flex flex-col justify-between flex-1 gap-4">
          <div>
            <h3 class="font-['Outfit'] font-bold text-xl text-deep-obsidian">${cat.name}</h3>
            <p class="text-sm text-gray-600 mt-2 line-clamp-2">${cat.description}</p>
          </div>
          <div class="flex items-center justify-between text-xs font-bold text-electric-blue pt-3 border-t border-slate-border">
            <span>Ver Fichas en Catálogo</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </div>
        </div>
      </a>
    `).join('');
  }

  loadCategories();
});
