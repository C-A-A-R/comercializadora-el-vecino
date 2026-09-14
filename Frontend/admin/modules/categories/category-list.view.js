import { CategoryService } from '../../services/category.service.js';
import { DataTable } from '../../components/ui/DataTable.js';
import { Toast } from '../../components/ui/Toast.js';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.js';

export const CategoryListView = {
  categories: [],

  async render() {
    const categoriesData = await CategoryService.listCategories();
    this.categories = categoriesData.results || [];

    const catColumns = [
      { key: 'name', label: 'Categoría', render: (val) => `<span class="font-semibold text-deep-obsidian">${val}</span>` },
      { key: 'slug', label: 'Slug', render: (val) => `<code class="text-xs bg-slate-surface px-2 py-0.5 rounded text-gray-600">${val || '-'}</code>` },
      { key: 'description', label: 'Descripción', render: (val) => `<span class="text-xs text-gray-500">${val || 'Sin descripción'}</span>` }
    ];

    const catActions = [
      { name: 'edit-cat', label: 'Editar', icon: 'edit' },
      { name: 'delete-cat', label: 'Eliminar', icon: 'delete' }
    ];

    const catTable = new DataTable({ columns: catColumns, data: this.categories, actions: catActions });

    return `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="font-display text-2xl font-bold text-deep-obsidian">Categorías de Producto</h2>
            <p class="text-sm text-gray-500">Organice las categorías del catálogo en el backend</p>
          </div>
          <div>
            <button id="btn-open-cat-modal" class="px-4 py-2 bg-electric-blue text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700 transition shadow-sm">
              <span class="material-symbols-outlined text-lg">add</span>
              Nueva Categoría
            </button>
          </div>
        </div>

        <!-- Tabla de Categorías -->
        <div class="bg-white rounded-xl border border-slate-border shadow-sm p-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-border mb-4">
            <span class="text-sm font-semibold text-gray-700">Total: ${categoriesData.count} categoría(s)</span>
          </div>
          ${catTable.render()}
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
            <button type="button" id="btn-close-cat-modal" class="px-4 py-2 border border-slate-border text-gray-600 rounded-lg text-sm font-medium hover:bg-slate-surface">Cancelar</button>
            <button type="submit" class="px-4 py-2 bg-electric-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700">Guardar</button>
          </div>
        </form>
      </dialog>
    `;
  },

  bindEvents() {
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
        const id = document.getElementById('cat-id').value;
        const data = {
          name: document.getElementById('cat-name').value,
          description: document.getElementById('cat-desc').value
        };
        if (id) data.id = id;

        try {
          await CategoryService.saveCategory(data);
          Toast.show(id ? 'Categoría actualizada con éxito' : 'Categoría creada con éxito', 'success');
          modalCat.close();
          window.location.reload();
        } catch (err) {
          console.error(err);
          Toast.show('Error al guardar la categoría: ' + (err.message || 'Error del servidor'), 'error');
        }
      });
    }

    // Delegación para editar y eliminar
    document.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('[data-action="edit-cat"]');
      if (editBtn && modalCat) {
        const id = editBtn.dataset.id;
        const idx = editBtn.dataset.index;
        const cat = this.categories.find(c => String(c.id) === String(id)) || this.categories[idx];
        if (cat) {
          document.getElementById('cat-id').value = cat.id;
          document.getElementById('cat-name').value = cat.name || cat.category_name || '';
          document.getElementById('cat-desc').value = cat.description || '';
          document.getElementById('cat-modal-title').innerText = 'Editar Categoría';
          modalCat.showModal();
        }
        return;
      }

      const deleteBtn = e.target.closest('[data-action="delete-cat"]');
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        const idx = deleteBtn.dataset.index;
        const cat = this.categories.find(c => String(c.id) === String(id)) || this.categories[idx];
        const catName = cat ? (cat.name || cat.category_name) : 'esta categoría';

        const confirmed = await ConfirmDialog.show({
          title: 'Eliminar Categoría',
          message: `¿Está seguro de que desea eliminar la categoría "${catName}"?`,
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
          type: 'danger'
        });

        if (confirmed && (id || cat?.id)) {
          try {
            await CategoryService.deleteCategory(id || cat.id);
            Toast.show('Categoría eliminada con éxito', 'success');
            window.location.reload();
          } catch (err) {
            console.error(err);
            Toast.show('Error al eliminar la categoría', 'error');
          }
        }
      }
    });
  }
};