// components/layout/Sidebar.js
export function renderSidebar(currentPath = '') {
  return `
    <aside id="sidebar" class="w-64 bg-deep-obsidian text-white flex flex-col transition-all duration-300">
      <div class="p-5 flex items-center justify-between border-b border-gray-800">
        <h1 class="font-display font-bold text-lg text-white">El Vecino Admin</h1>
        <button id="toggle-sidebar" class="md:hidden text-gray-400 hover:text-white" aria-label="Cerrar menú">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <nav class="flex-1 p-4 space-y-1">
        <a href="#/dashboard" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
          <span class="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </a>
        <a href="#/products" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
          <span class="material-symbols-outlined">inventory_2</span>
          <span>Productos</span>
        </a>
        <a href="#/categories" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
          <span class="material-symbols-outlined">category</span>
          <span>Categorías</span>
        </a>
        <a href="#/promotions" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
          <span class="material-symbols-outlined">sell</span>
          <span>Promociones</span>
        </a>
        <a href="#/combos" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
          <span class="material-symbols-outlined">package_2</span>
          <span>Combos</span>
        </a>
        <a href="#/reports" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
          <span class="material-symbols-outlined">picture_as_pdf</span>
          <span>Reportes PDF</span>
        </a>
      </nav>
    </aside>
  `;
}