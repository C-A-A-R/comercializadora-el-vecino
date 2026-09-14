/**
 * categorias.js - Categories controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.Navbar) window.Navbar.mount('#navbar-mount', 'categorias');
  if (window.Footer) window.Footer.mount('#footer-mount');

  const container = document.getElementById('categoriesGrid');

  async function loadCategories() {
    try {
      const categories = await window.CategoriasApi.getCategories();
      renderCategories(categories);
    } catch (error) {
      console.error('[categorias.js] Error al cargar categorías:', error);
    }
  }

  function renderCategories(categories) {
    if (!container) return;

    container.innerHTML = categories.map(cat => `
      <a href="../product/product.html?cat=${cat.slug || cat.id}" class="category-card">
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
