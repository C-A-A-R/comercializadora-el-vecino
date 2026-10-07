import { ProductService } from '../../services/product.service.js';
import { DataTable } from '../../components/ui/DataTable.js';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.js';
import { Toast } from '../../components/ui/Toast.js';

export const ProductListView = {
  allProducts: [],
  products: [],
  columns: [],
  actions: [],

  async render() {
    const data = await ProductService.list();
    this.allProducts = data.results || [];
    this.products = [...this.allProducts];

    this.columns = [
      { 
        key: 'name', 
        label: 'Producto',
        render: (val, row) => {
          const imgUrl = (row.images && row.images[0]?.image) || row.product_image || 'https://via.placeholder.com/40';
          const productName = val || row.product_name || 'Producto';
          const hasComplaints = Boolean(row.has_complaints || (row.negative_reviews_count > 0));

          const complaintBadgeHtml = hasComplaints ? `
            <div class="relative group/tooltip inline-block">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-300 cursor-help shadow-sm animate-pulse">
                <span class="material-symbols-outlined text-[13px] text-red-600">report_problem</span>
                <span>Reclamos (${row.negative_reviews_count || 1})</span>
              </span>
              <div class="pointer-events-none absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:flex flex-col items-start z-30 w-60 p-2.5 text-xs text-white bg-gray-900 rounded-lg shadow-xl">
                <span class="font-bold text-red-400 flex items-center gap-1 mb-1">
                  <span class="material-symbols-outlined text-sm">warning</span>
                  Alerta de Reclamos
                </span>
                <span class="text-gray-200 leading-tight">Este producto cuenta con ${row.negative_reviews_count || 1} reseña(s) negativa(s) que requieren atención.</span>
                <div class="w-2 h-2 -mb-3 ml-4 bg-gray-900 rotate-45 self-start"></div>
              </div>
            </div>
          ` : '';

          return `
            <div class="flex items-center gap-3">
              <img src="${imgUrl}" class="w-11 h-11 object-cover rounded-lg border border-slate-border flex-shrink-0" alt="${productName}" />
              <div class="space-y-1">
                <p class="font-semibold text-deep-obsidian text-sm leading-tight">${productName}</p>
                <p class="text-xs text-gray-500">${row.brand || 'El Vecino'} ${row.model ? `| Mod: ${row.model}` : ''}</p>
                ${complaintBadgeHtml ? `<div class="pt-0.5">${complaintBadgeHtml}</div>` : ''}
              </div>
            </div>
          `;
        }
      },
      { 
        key: 'category', 
        label: 'Categoría', 
        render: (val, row) => {
          const catName = val?.name || row.category_name || (row.categories_detail && row.categories_detail[0]?.category_name) || '-';
          return `<span class="px-2.5 py-1 bg-slate-surface border border-slate-border rounded-md text-xs font-medium text-gray-700">${catName}</span>`;
        }
      },
      { 
        key: 'total_views',
        label: 'Total Vistas',
        render: (val) => `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-electric-blue rounded-lg text-xs font-bold border border-blue-100">
            <span class="material-symbols-outlined text-sm">visibility</span>
            ${Number(val || 0).toLocaleString()}
          </span>
        `
      },
      { 
        key: 'is_active',
        label: 'Estado',
        render: (val) => val 
          ? `<span class="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">Activo</span>`
          : `<span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Inactivo</span>`
      }
    ];

    this.actions = [
      { name: 'edit', label: 'Editar', icon: 'edit' },
      { name: 'deactivate', label: 'Desactivar', icon: 'block' }
    ];

    const categories = Array.from(
      new Set(
        this.allProducts
          .map(p => p.category?.name || p.category_name)
          .filter(Boolean)
      )
    ).sort();

    const categoryOptionsHtml = categories
      .map(cat => `<option value="${cat}">${cat}</option>`)
      .join('');

    const tableComponent = new DataTable({ columns: this.columns, data: this.products, actions: this.actions });

    return `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="font-display text-2xl font-bold text-deep-obsidian">Catálogo de Productos</h2>
            <p class="text-sm text-gray-500">Gestión completa de productos, marcas, categorías y consultas</p>
          </div>
          <a href="#/products/new" class="px-4 py-2 bg-electric-blue text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700 transition shadow-sm">
            <span class="material-symbols-outlined text-lg">add</span>
            Nuevo Producto
          </a>
        </div>

        <!-- Barra de Búsqueda y Filtros en Tiempo Real -->
        <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div class="relative flex-1">
            <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none">search</span>
            <input 
              type="text" 
              id="product-search-input" 
              placeholder="Buscar por nombre, marca, modelo o categoría..." 
              class="w-full pl-11 pr-10 py-2.5 bg-slate-surface border border-slate-border rounded-lg text-sm text-deep-obsidian placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:bg-white transition"
            />
            <button 
              id="product-search-clear" 
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hidden p-1 rounded-full hover:bg-gray-100 transition"
              title="Limpiar búsqueda"
            >
              <span class="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <div class="flex items-center gap-2.5">
            <select id="product-category-filter" class="px-3 py-2.5 bg-slate-surface border border-slate-border rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:bg-white cursor-pointer transition">
              <option value="">Todas las categorías</option>
              ${categoryOptionsHtml}
            </select>
            
            <span id="product-count-badge" class="px-3 py-2 bg-slate-surface border border-slate-border rounded-lg text-xs font-bold text-gray-600 whitespace-nowrap">
              ${this.products.length} productos
            </span>
          </div>
        </div>

        <!-- Contenedor dinámico de Tabla -->
        <div id="products-table-container">
          ${tableComponent.render()}
        </div>
      </div>
    `;
  },

  filterProducts() {
    const searchInput = document.getElementById('product-search-input');
    const categorySelect = document.getElementById('product-category-filter');
    const clearBtn = document.getElementById('product-search-clear');
    const countBadge = document.getElementById('product-count-badge');
    const container = document.getElementById('products-table-container');

    const query = (searchInput?.value || '').toLowerCase().trim();
    const selectedCategory = categorySelect?.value || '';

    if (clearBtn) {
      clearBtn.classList.toggle('hidden', query.length === 0);
    }

    this.products = this.allProducts.filter(item => {
      const name = (item.name || item.product_name || '').toLowerCase();
      const brand = (item.brand || '').toLowerCase();
      const model = (item.model || '').toLowerCase();
      const cat = (item.category?.name || item.category_name || '').toLowerCase();

      const matchesText = !query || name.includes(query) || brand.includes(query) || model.includes(query) || cat.includes(query);
      const matchesCategory = !selectedCategory || (item.category?.name || item.category_name) === selectedCategory;

      return matchesText && matchesCategory;
    });

    if (countBadge) {
      countBadge.textContent = `${this.products.length} ${this.products.length === 1 ? 'producto' : 'productos'}`;
    }

    if (container) {
      if (this.products.length === 0) {
        container.innerHTML = `
          <div class="bg-white rounded-xl border border-slate-border p-12 text-center shadow-sm">
            <span class="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</span>
            <p class="font-bold text-gray-700 text-sm">No se encontraron productos</p>
            <p class="text-xs text-gray-500 mt-1">No hay productos que coincidan con "${query}". Intente con otro término o categoría.</p>
            <button id="btn-reset-filter" class="mt-4 px-3 py-1.5 text-xs font-semibold text-electric-blue bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition">
              Restablecer filtros
            </button>
          </div>
        `;
        document.getElementById('btn-reset-filter')?.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          if (categorySelect) categorySelect.value = '';
          this.filterProducts();
        });
      } else {
        const tableComponent = new DataTable({ columns: this.columns, data: this.products, actions: this.actions });
        container.innerHTML = tableComponent.render();
      }
    }
  },

  bindEvents() {
    const searchInput = document.getElementById('product-search-input');
    const categorySelect = document.getElementById('product-category-filter');
    const clearBtn = document.getElementById('product-search-clear');

    searchInput?.addEventListener('input', () => this.filterProducts());
    categorySelect?.addEventListener('change', () => this.filterProducts());
    clearBtn?.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      this.filterProducts();
    });

    // Acciones de tabla
    document.addEventListener('click', async (e) => {
      const btnEdit = e.target.closest('[data-action="edit"]');
      if (btnEdit) {
        const id = btnEdit.dataset.id || (this.products && this.products[btnEdit.dataset.index]?.id);
        if (id) {
          window.location.hash = `#/products/edit/${id}`;
        }
        return;
      }

      const btnDeactivate = e.target.closest('[data-action="deactivate"]');
      if (btnDeactivate) {
        const id = btnDeactivate.dataset.id || (this.products && this.products[btnDeactivate.dataset.index]?.id);
        const confirmed = await ConfirmDialog.show({
          title: 'Deshabilitar Producto',
          message: 'El producto no se eliminará físicamente, pero no se mostrará en el catálogo público.',
          confirmText: 'Deshabilitar',
          cancelText: 'Cancelar',
          type: 'danger'
        });

        if (confirmed && id) {
          try {
            await ProductService.deactivate(id);
            Toast.show('Producto deshabilitado con éxito', 'success');
            const prod = this.allProducts.find(p => p.id === id);
            if (prod) {
              prod.is_active = false;
            }
            this.filterProducts();
          } catch (err) {
            console.error(err);
            Toast.show('Error al deshabilitar el producto', 'error');
          }
        }
      }
    });
  }
};