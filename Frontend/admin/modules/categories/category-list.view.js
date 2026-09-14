import { CategoryService } from '../../services/category.service.js';
import { DataTable } from '../../components/ui/DataTable.js';

export const CategoryListView = {
  async render() {
    const categoriesData = await CategoryService.listCategories();
    const productTypesData = await CategoryService.listProductTypes();

    const catColumns = [
      { key: 'name', label: 'Categoría', render: (val) => `<span class="font-semibold text-deep-obsidian">${val}</span>` },
      { key: 'slug', label: 'Slug', render: (val) => `<code class="text-xs bg-slate-surface px-2 py-0.5 rounded text-gray-600">${val}</code>` },
      { key: 'description', label: 'Descripción', render: (val) => `<span class="text-xs text-gray-500">${val || 'Sin descripción'}</span>` },
      { 
        key: 'product_types', 
        label: 'Tipos Asociados',
        render: (val) => val && val.length > 0 
          ? val.map(t => `<span class="inline-block mr-1 px-2 py-0.5 bg-blue-50 text-electric-blue border border-blue-200 rounded text-xs font-medium">${t.name}</span>`).join('')
          : `<span class="text-xs text-gray-400">Ninguno</span>`
      }
    ];

    const typeColumns = [
      { key: 'name', label: 'Tipo de Producto', render: (val) => `<span class="font-semibold text-deep-obsidian">${val}</span>` },
      { key: 'slug', label: 'Slug', render: (val) => `<code class="text-xs bg-slate-surface px-2 py-0.5 rounded text-gray-600">${val}</code>` },
      { key: 'description', label: 'Descripción', render: (val) => `<span class="text-xs text-gray-500">${val || 'Sin descripción'}</span>` }
    ];

    const catTable = new DataTable({ columns: catColumns, data: categoriesData.results, actions: [{ name: 'edit-cat', label: 'Editar', icon: 'edit' }] });
    const typeTable = new DataTable({ columns: typeColumns, data: productTypesData.results, actions: [{ name: 'edit-type', label: 'Editar', icon: 'edit' }] });

    return `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="font-display text-2xl font-bold text-deep-obsidian">Categorías y Tipos de Producto</h2>
            <p class="text-sm text-gray-500">Organice la taxonomía del catálogo de productos (SPEC-005)</p>
          </div>
          <div class="flex gap-2">
            <button id="btn-open-cat-modal" class="px-4 py-2 bg-electric-blue text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700 transition">
              <span class="material-symbols-outlined text-lg">add</span>
              Nueva Categoría
            </button>
            <button id="btn-open-type-modal" class="px-4 py-2 border border-slate-border text-gray-700 bg-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-slate-surface transition">
              <span class="material-symbols-outlined text-lg">add</span>
              Nuevo Tipo
            </button>
          </div>
        </div>

        <!-- Secciones Tabuladas -->
        <div class="bg-white rounded-xl border border-slate-border shadow-sm">
          <div class="border-b border-slate-border px-6 pt-4 flex gap-6">
            <button id="tab-cat-btn" class="pb-3 text-sm font-semibold text-electric-blue border-b-2 border-electric-blue">Categorías (${categoriesData.count})</button>
            <button id="tab-type-btn" class="pb-3 text-sm font-semibold text-gray-500 border-b-2 border-transparent hover:text-gray-700">Tipos de Producto (${productTypesData.count})</button>
          </div>

          <div id="tab-cat-content" class="p-6">
            ${catTable.render()}
          </div>

          <div id="tab-type-content" class="p-6 hidden">
            ${typeTable.render()}
          </div>
        </div>
      </div>

      <!-- Modal Rápido Categoría -->
      <dialog id="modal-category" class="rounded-xl border border-slate-border shadow-lg p-6 max-w-md w-full backdrop:bg-slate-900/50">
        <form id="form-category" class="space-y-4">
          <h3 class="font-bold text-lg text-deep-obsidian" id="cat-modal-title">Nueva Categoría</h3>
          <input type="hidden" id="cat-id">
          <div>
            <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Nombre *</label>
            <input type="text" id="cat-name" required class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none">
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Descripción</label>
            <textarea id="cat-desc" rows="3" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none"></textarea>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" id="btn-close-cat-modal" class="px-4 py-2 border border-slate-border text-gray-600 rounded-lg text-sm font-medium">Cancelar</button>
            <button type="submit" class="px-4 py-2 bg-electric-blue text-white rounded-lg text-sm font-medium">Guardar</button>
          </div>
        </form>
      </dialog>
    `;
  },

  bindEvents() {
    const tabCatBtn = document.getElementById('tab-cat-btn');
    const tabTypeBtn = document.getElementById('tab-type-btn');
    const tabCatContent = document.getElementById('tab-cat-content');
    const tabTypeContent = document.getElementById('tab-type-content');

    if (tabCatBtn && tabTypeBtn) {
      tabCatBtn.addEventListener('click', () => {
        tabCatBtn.className = 'pb-3 text-sm font-semibold text-electric-blue border-b-2 border-electric-blue';
        tabTypeBtn.className = 'pb-3 text-sm font-semibold text-gray-500 border-b-2 border-transparent hover:text-gray-700';
        tabCatContent.classList.remove('hidden');
        tabTypeContent.classList.add('hidden');
      });

      tabTypeBtn.addEventListener('click', () => {
        tabTypeBtn.className = 'pb-3 text-sm font-semibold text-electric-blue border-b-2 border-electric-blue';
        tabCatBtn.className = 'pb-3 text-sm font-semibold text-gray-500 border-b-2 border-transparent hover:text-gray-700';
        tabTypeContent.classList.remove('hidden');
        tabCatContent.classList.add('hidden');
      });
    }

    const modalCat = document.getElementById('modal-category');
    const btnOpenCat = document.getElementById('btn-open-cat-modal');
    const btnCloseCat = document.getElementById('btn-close-cat-modal');
    const formCat = document.getElementById('form-category');

    if (btnOpenCat && modalCat) {
      btnOpenCat.addEventListener('click', () => {
        document.getElementById('cat-id').value = '';
        document.getElementById('cat-name').value = '';
        document.getElementById('cat-desc').value = '';
        document.getElementById('cat-modal-title').innerText = 'Nueva Categoría';
        modalCat.showModal();
      });
    }

    if (btnCloseCat && modalCat) {
      btnCloseCat.addEventListener('click', () => modalCat.close());
    }

    if (formCat) {
      formCat.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
          id: document.getElementById('cat-id').value,
          name: document.getElementById('cat-name').value,
          description: document.getElementById('cat-desc').value
        };
        await CategoryService.saveCategory(data);
        modalCat.close();
        window.location.reload();
      });
    }
  }
};