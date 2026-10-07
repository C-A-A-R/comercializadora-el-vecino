import { CategoryService } from '../../services/category.service.js';
import { ProductService } from '../../services/product.service.js';
import { Toast } from '../../components/ui/Toast.js';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.js';

export const CategoryListView = {
  allCategories: [],
  categories: [],
  products: [],

  async render() {
    try {
      const [categoriesData, productsData] = await Promise.all([
        CategoryService.listCategories(),
        ProductService.list()
      ]);
      this.allCategories = categoriesData.results || [];
      this.categories = [...this.allCategories];
      this.products = productsData.results || [];
    } catch (err) {
      console.error('[CategoryListView] Error al cargar datos:', err);
      this.allCategories = [];
      this.categories = [];
      this.products = [];
    }

    const totalCategories = this.allCategories.length;
    const activeCategories = this.allCategories.filter(c => c.is_active).length;
    const totalClassifiedProducts = this.products.length;

    // Distribución de demanda/vistas por categoría
    const distribution = this.calculateCategoryDistribution();

    return `
      <div class="space-y-6">
        <!-- Encabezado Principal -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold uppercase tracking-wider text-electric-blue bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                Catálogo
              </span>
              <span class="text-xs text-gray-400">/</span>
              <span class="text-xs font-semibold text-gray-500">Gestión de Categorías</span>
            </div>
            <h1 class="text-2xl font-bold text-deep-obsidian font-display">Categorías de Producto</h1>
            <p class="text-sm text-gray-500">Organice las familias y subcategorías para la navegación y clasificación de productos.</p>
          </div>
          <div>
            <button id="btn-open-cat-modal" class="px-4 py-2.5 bg-electric-blue text-white rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-blue-700 transition shadow-sm">
              <span class="material-symbols-outlined text-lg">add</span>
              Nueva Categoría
            </button>
          </div>
        </div>

        <!-- Tarjetas KPI de Resumen -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Categorías</p>
              <p class="text-2xl font-bold text-deep-obsidian mt-0.5" id="kpi-total-cats">${totalCategories}</p>
              <p class="text-[11px] text-gray-400">Familias registradas</p>
            </div>
            <div class="p-2.5 bg-blue-50 text-electric-blue rounded-xl">
              <span class="material-symbols-outlined text-xl">folder_open</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categorías Activas</p>
              <p class="text-2xl font-bold text-emerald-600 mt-0.5" id="kpi-active-cats">${activeCategories}</p>
              <p class="text-[11px] text-gray-400">Publicadas en catálogo</p>
            </div>
            <div class="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <span class="material-symbols-outlined text-xl">check_circle</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Modelos Clasificados</p>
              <p class="text-2xl font-bold text-purple-600 mt-0.5" id="kpi-total-products">${totalClassifiedProducts}</p>
              <p class="text-[11px] text-gray-400">Productos vinculados</p>
            </div>
            <div class="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <span class="material-symbols-outlined text-xl">grid_view</span>
            </div>
          </div>
        </div>

        <!-- Distribución Visual de Interés por Categoría -->
        <div class="bg-white p-5 rounded-xl border border-slate-border shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wider">Distribución de Interés y Vistas por Categoría</h3>
              <p class="text-xs text-gray-500 mt-0.5">Participación de visualizaciones del catálogo público</p>
            </div>
            <span class="text-xs font-semibold text-gray-400">Métricas de Catálogo</span>
          </div>

          <!-- Barra segmentada de progreso -->
          <div class="w-full bg-gray-100 h-3 rounded-full overflow-hidden flex">
            ${distribution.map(d => `
              <div class="${d.colorClass} h-full transition-all duration-500" style="width: ${d.percentage}%" title="${d.name}: ${d.percentage}%"></div>
            `).join('')}
          </div>

          <!-- Leyenda de categorías -->
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
            ${distribution.map(d => `
              <div class="flex items-center gap-1.5 text-xs text-gray-600">
                <span class="w-2.5 h-2.5 rounded-full ${d.colorClass}"></span>
                <span class="font-medium">${d.name}:</span>
                <span class="font-bold text-deep-obsidian">${d.percentage}%</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Buscador en tiempo real -->
        <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between gap-3">
          <div class="relative flex-1">
            <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none">search</span>
            <input 
              type="text" 
              id="cat-search-input" 
              placeholder="Buscar categoría por nombre, slug o subcategorías/tags..." 
              class="w-full pl-11 pr-10 py-2.5 bg-slate-surface border border-slate-border rounded-lg text-sm text-deep-obsidian placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:bg-white transition"
            />
            <button 
              id="cat-search-clear" 
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hidden p-1 rounded-full hover:bg-gray-100 transition"
              title="Limpiar búsqueda"
            >
              <span class="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <span id="cat-count-badge" class="px-3 py-2 bg-slate-surface border border-slate-border rounded-lg text-xs font-bold text-gray-600 whitespace-nowrap">
            ${totalCategories} categorías
          </span>
        </div>

        <!-- Tabla Maestra de Categorías -->
        <div class="bg-white rounded-xl border border-slate-border shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-surface border-b border-slate-border text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th class="px-5 py-4 w-72">Categoría</th>
                  <th class="px-5 py-4 min-w-[260px]">Subcategorías & Tags</th>
                  <th class="px-5 py-4 w-36">Productos</th>
                  <th class="px-5 py-4 min-w-[200px]">Descripción</th>
                  <th class="px-5 py-4 text-center w-32">Estado</th>
                  <th class="px-5 py-4 text-right w-24">Acciones</th>
                </tr>
              </thead>
              <tbody id="cat-table-body" class="divide-y divide-slate-border text-sm text-deep-obsidian">
                ${this.renderTableRows(this.categories)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal de Creación / Edición de Categoría -->
      <dialog id="modal-category" class="rounded-2xl border border-slate-border shadow-2xl p-6 max-w-lg w-full backdrop:bg-slate-900/50">
        <form id="form-category" class="space-y-4">
          <div class="flex items-center justify-between border-b border-slate-border pb-3">
            <h3 class="font-bold text-lg text-deep-obsidian font-display" id="cat-modal-title">Nueva Categoría</h3>
            <button type="button" id="btn-close-cat-modal" class="text-gray-400 hover:text-gray-600 p-1 rounded-full">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <input type="hidden" id="cat-id">

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nombre de la Categoría *</label>
            <input type="text" id="cat-name" required placeholder="Ej: Refrigeradores" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Subcategorías & Tags</label>
            <input type="text" id="cat-tags" placeholder="Ej: No Frost, Side by Side, Inverter (separados por coma)" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none">
            <p class="text-[11px] text-gray-400 mt-1">Escriba las subcategorías separadas por comas para agrupar productos.</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Descripción</label>
            <textarea id="cat-desc" rows="3" placeholder="Descripción clara para orientar la clasificación..." class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none"></textarea>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
              <input type="checkbox" id="cat-active" checked class="w-4 h-4 text-electric-blue rounded border-gray-300">
              Categoría Activa en Catálogo Público
            </label>
          </div>

          <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-border">
            <button type="button" id="btn-cancel-cat-modal" class="px-4 py-2 border border-slate-border text-gray-600 rounded-lg text-xs font-bold hover:bg-slate-surface transition">
              Cancelar
            </button>
            <button type="submit" class="px-4 py-2 bg-electric-blue text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition">
              Guardar Categoría
            </button>
          </div>
        </form>
      </dialog>
    `;
  },

  calculateCategoryDistribution() {
    const colorClasses = [
      'bg-blue-600',
      'bg-emerald-500',
      'bg-purple-600',
      'bg-amber-500',
      'bg-indigo-500',
      'bg-gray-400'
    ];

    if (this.allCategories.length === 0) {
      return [{ name: 'Sin categorías', percentage: 100, colorClass: 'bg-gray-300' }];
    }

    const counts = this.allCategories.map(cat => {
      const count = this.products.filter(p => {
        const pCatId = p.category_id || p.category?.id;
        const pCatName = (p.category?.name || p.category_name || '').toLowerCase();
        return pCatId === cat.id || pCatName === cat.name.toLowerCase();
      }).length;
      return { name: cat.name, count };
    });

    const total = counts.reduce((acc, c) => acc + c.count, 0) || 1;

    return counts.map((c, idx) => ({
      name: c.name,
      percentage: Math.max(5, Math.round((c.count / total) * 100)),
      colorClass: colorClasses[idx % colorClasses.length]
    }));
  },

  getProductsCountForCategory(cat) {
    if (!this.products || this.products.length === 0) return 0;
    return this.products.filter(p => {
      const pCatId = p.category_id || p.category?.id;
      const pCatName = (p.category?.name || p.category_name || '').toLowerCase();
      return pCatId === cat.id || pCatName === cat.name.toLowerCase();
    }).length;
  },

  renderTableRows(categories) {
    if (!categories || categories.length === 0) {
      return `
        <tr>
          <td colspan="6" class="px-6 py-12 text-center text-gray-500">
            <span class="material-symbols-outlined text-4xl text-gray-300 block mb-2">search_off</span>
            <p class="font-bold text-sm text-gray-700">No se encontraron categorías</p>
            <p class="text-xs text-gray-400 mt-1">Intente con otro término de búsqueda.</p>
          </td>
        </tr>
      `;
    }

    return categories.map(cat => {
      const tags = cat.tags || [];
      const prodCount = this.getProductsCountForCategory(cat);

      // Chips de subcategorías y tags
      const tagsHtml = tags.length > 0
        ? tags.map(tag => `
            <span class="px-2 py-0.5 rounded-md bg-slate-surface border border-slate-border text-gray-700 text-[11px] font-medium">
              ${tag}
            </span>
          `).join('')
        : '<span class="text-xs text-gray-400">Sin tags configurados</span>';

      return `
        <tr class="hover:bg-slate-surface/40 transition">
          <!-- 1. Categoría y Slug -->
          <td class="px-5 py-4">
            <div class="space-y-0.5">
              <p class="font-bold text-deep-obsidian text-sm">${cat.name}</p>
              <code class="text-[11px] font-mono text-gray-500 bg-slate-surface px-1.5 py-0.5 rounded border border-slate-border inline-block">
                ${cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')}
              </code>
            </div>
          </td>

          <!-- 2. Subcategorías & Tags -->
          <td class="px-5 py-4">
            <div class="flex flex-wrap items-center gap-1.5 max-w-sm">
              ${tagsHtml}
            </div>
          </td>

          <!-- 3. Productos Asociados -->
          <td class="px-5 py-4 whitespace-nowrap">
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-electric-blue border border-blue-100">
              ${prodCount} ${prodCount === 1 ? 'modelo' : 'modelos'}
            </span>
          </td>

          <!-- 4. Descripción -->
          <td class="px-5 py-4">
            <p class="text-xs text-gray-600 line-clamp-2 max-w-xs leading-relaxed">
              ${cat.description || 'Sin descripción'}
            </p>
          </td>

          <!-- 5. Estado (Switch Toggle Activo/Inactivo) -->
          <td class="px-5 py-4 whitespace-nowrap text-center">
            <div class="flex flex-col items-center gap-1">
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  data-action="toggle-cat-status" 
                  data-id="${cat.id}" 
                  class="sr-only peer" 
                  ${cat.is_active ? 'checked' : ''}
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <span class="text-[10px] font-bold ${cat.is_active ? 'text-emerald-700' : 'text-gray-400'}">
                ${cat.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </td>

          <!-- 6. Acciones -->
          <td class="px-5 py-4 whitespace-nowrap text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button 
                data-action="edit-cat" 
                data-id="${cat.id}" 
                class="p-1.5 text-gray-500 hover:text-electric-blue hover:bg-blue-50 rounded-lg transition" 
                title="Editar categoría"
              >
                <span class="material-symbols-outlined text-lg">edit</span>
              </button>
              <button 
                data-action="delete-cat" 
                data-id="${cat.id}" 
                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" 
                title="Eliminar categoría"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  filterCategories() {
    const searchInput = document.getElementById('cat-search-input');
    const clearBtn = document.getElementById('cat-search-clear');
    const tableBody = document.getElementById('cat-table-body');
    const countBadge = document.getElementById('cat-count-badge');

    const query = (searchInput?.value || '').toLowerCase().trim();

    if (clearBtn) {
      clearBtn.classList.toggle('hidden', query.length === 0);
    }

    this.categories = this.allCategories.filter(cat => {
      const name = (cat.name || '').toLowerCase();
      const slug = (cat.slug || '').toLowerCase();
      const desc = (cat.description || '').toLowerCase();
      const tagsMatch = (cat.tags || []).some(t => t.toLowerCase().includes(query));

      return !query || name.includes(query) || slug.includes(query) || desc.includes(query) || tagsMatch;
    });

    if (countBadge) {
      countBadge.textContent = `${this.categories.length} ${this.categories.length === 1 ? 'categoría' : 'categorías'}`;
    }

    if (tableBody) {
      tableBody.innerHTML = this.renderTableRows(this.categories);
    }
  },

  bindEvents() {
    const modalCat = document.getElementById('modal-category');
    const btnOpenCat = document.getElementById('btn-open-cat-modal');
    const btnCloseCat = document.getElementById('btn-close-cat-modal');
    const btnCancelCat = document.getElementById('btn-cancel-cat-modal');
    const formCat = document.getElementById('form-category');

    const searchInput = document.getElementById('cat-search-input');
    const clearBtn = document.getElementById('cat-search-clear');

    // 1. Buscador
    searchInput?.addEventListener('input', () => this.filterCategories());
    clearBtn?.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      this.filterCategories();
    });

    // 2. Modal Crear
    if (btnOpenCat && modalCat) {
      btnOpenCat.addEventListener('click', () => {
        document.getElementById('cat-id').value = '';
        document.getElementById('cat-name').value = '';
        document.getElementById('cat-tags').value = '';
        document.getElementById('cat-desc').value = '';
        document.getElementById('cat-active').checked = true;
        document.getElementById('cat-modal-title').innerText = 'Nueva Categoría';
        modalCat.showModal();
      });
    }

    if (btnCloseCat && modalCat) {
      btnCloseCat.addEventListener('click', () => modalCat.close());
    }

    if (btnCancelCat && modalCat) {
      btnCancelCat.addEventListener('click', () => modalCat.close());
    }

    // 3. Envío del Formulario (Guardar / Actualizar)
    if (formCat) {
      formCat.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('cat-id').value;
        const name = document.getElementById('cat-name').value.trim();
        const tagsStr = document.getElementById('cat-tags').value.trim();
        const desc = document.getElementById('cat-desc').value.trim();
        const isActive = document.getElementById('cat-active').checked;

        const data = {
          name,
          category_name: name,
          description: desc,
          tags: tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [],
          is_active: isActive
        };
        if (id) data.id = id;

        try {
          await CategoryService.saveCategory(data);
          Toast.show(`Categoría ${id ? 'actualizada' : 'creada'} con éxito`, 'success');
          modalCat.close();

          // Recargar lista
          const updated = await CategoryService.listCategories();
          this.allCategories = updated.results || [];
          this.filterCategories();
        } catch (err) {
          console.error(err);
          Toast.show('Error al guardar la categoría', 'error');
        }
      });
    }

    // 4. Switch Toggle de Estado Activo/Inactivo
    document.addEventListener('change', async (e) => {
      const toggle = e.target.closest('[data-action="toggle-cat-status"]');
      if (toggle) {
        const id = toggle.dataset.id;
        const newStatus = toggle.checked;
        try {
          await CategoryService.toggleCategoryActive(id, newStatus);
          Toast.show(`Categoría ${newStatus ? 'activada' : 'desactivada'} en catálogo`, 'success');

          const cat = this.allCategories.find(c => c.id == id);
          if (cat) cat.is_active = newStatus;

          const activeCount = this.allCategories.filter(c => c.is_active).length;
          const kpiActive = document.getElementById('kpi-active-cats');
          if (kpiActive) kpiActive.textContent = activeCount;

          this.filterCategories();
        } catch (err) {
          console.error(err);
          toggle.checked = !newStatus;
          Toast.show('Error al actualizar estado de la categoría', 'error');
        }
      }
    });

    // 5. Editar y Eliminar Categoría
    document.addEventListener('click', async (e) => {
      const btnEdit = e.target.closest('[data-action="edit-cat"]');
      if (btnEdit) {
        const id = btnEdit.dataset.id;
        const cat = this.allCategories.find(c => c.id == id);
        if (cat && modalCat) {
          document.getElementById('cat-id').value = cat.id;
          document.getElementById('cat-name').value = cat.name || cat.category_name || '';
          document.getElementById('cat-tags').value = (cat.tags || []).join(', ');
          document.getElementById('cat-desc').value = cat.description || '';
          document.getElementById('cat-active').checked = cat.is_active !== false;
          document.getElementById('cat-modal-title').innerText = 'Editar Categoría';
          modalCat.showModal();
        }
        return;
      }

      const btnDelete = e.target.closest('[data-action="delete-cat"]');
      if (btnDelete) {
        const id = btnDelete.dataset.id;
        const confirmed = await ConfirmDialog.show({
          title: 'Eliminar Categoría',
          message: '¿Está seguro de eliminar esta categoría? Los productos asociados podrían quedar sin clasificar.',
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
          type: 'danger'
        });

        if (confirmed) {
          try {
            await CategoryService.deleteCategory(id);
            Toast.show('Categoría eliminada con éxito', 'success');
            this.allCategories = this.allCategories.filter(c => c.id != id);
            this.filterCategories();
          } catch (err) {
            console.error(err);
            Toast.show('Error al eliminar la categoría', 'error');
          }
        }
      }
    });
  }
};