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
              <div class="space-y-0.5 min-w-0">
                <p class="font-semibold text-deep-obsidian text-sm leading-tight truncate">${productName}</p>
                <p class="text-xs text-gray-500">${row.brand || 'El Vecino'} ${row.model ? `| Mod: ${row.model}` : ''}</p>
                ${complaintBadgeHtml ? `<div class="pt-0.5">${complaintBadgeHtml}</div>` : ''}
              </div>
            </div>
          `;
        }
      },
      { 
        key: 'category', 
        label: 'Categoría & Subcategoría', 
        render: (val, row) => {
          const catName = val?.name || row.category_name || (row.categories_detail && row.categories_detail[0]?.category_name) || '-';
          const subcat = row.subcategory || '';
          return `
            <div class="space-y-1">
              <span class="px-2.5 py-1 bg-slate-surface border border-slate-border rounded-md text-xs font-semibold text-gray-700 block w-max">${catName}</span>
              ${subcat ? `<span class="px-2 py-0.5 bg-blue-50/70 border border-blue-200/60 rounded text-[11px] font-medium text-electric-blue block w-max">${subcat}</span>` : ''}
            </div>
          `;
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
        label: 'Estado en Catálogo',
        render: (val, row) => `
          <button 
            data-action="toggle-product-visibility" 
            data-id="${row.id}" 
            data-active="${val ? 'true' : 'false'}"
            class="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer border ${val ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}"
            title="${val ? 'Clic para esconder este producto del catálogo' : 'Clic para mostrar este producto en el catálogo'}"
          >
            <span class="w-2 h-2 rounded-full ${val ? 'bg-emerald-500' : 'bg-gray-400'}"></span>
            <span>${val ? 'Visible' : 'Oculto'}</span>
            <span class="material-symbols-outlined text-[13px] text-gray-400 group-hover:text-gray-700">sync</span>
          </button>
        `
      }
    ];

    this.actions = [
      { name: 'view', label: 'Ver Detalles', icon: 'visibility' },
      { name: 'edit', label: 'Editar', icon: 'edit' },
      { name: 'delete', label: 'Borrar', icon: 'delete' }
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

          <div class="flex items-center gap-2">
            <select 
              id="product-category-filter" 
              class="px-3.5 py-2.5 bg-slate-surface border border-slate-border rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:bg-white transition cursor-pointer"
            >
              <option value="">Todas las categorías</option>
              ${categoryOptionsHtml}
            </select>
          </div>
        </div>

        <div id="product-table-container">
          ${tableComponent.render()}
        </div>

        <!-- MODAL PARA VER DETALLES DEL PRODUCTO -->
        <div id="modal-product-detail" class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 hidden">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-border w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div class="p-5 border-b border-slate-border flex items-center justify-between bg-slate-50 sticky top-0 bg-white z-10">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-electric-blue text-xl">visibility</span>
                <h3 class="font-display font-bold text-base text-deep-obsidian">Ficha Técnica del Producto</h3>
              </div>
              <button type="button" id="btn-close-product-detail" class="text-gray-400 hover:text-gray-700 p-1 rounded-lg">
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div id="product-detail-modal-body" class="p-6">
              <!-- Se inyecta dinámicamente -->
            </div>
          </div>
        </div>
      </div>
    `;
  },

  filterProducts() {
    const searchInput = document.getElementById('product-search-input');
    const categorySelect = document.getElementById('product-category-filter');
    const clearBtn = document.getElementById('product-search-clear');

    const query = (searchInput?.value || '').toLowerCase().trim();
    const category = categorySelect?.value || '';

    if (clearBtn) {
      if (query.length > 0) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
    }

    this.products = this.allProducts.filter(product => {
      const name = (product.name || product.product_name || '').toLowerCase();
      const brand = (product.brand || '').toLowerCase();
      const model = (product.model || product.capacity || '').toLowerCase();
      const cat = (product.category?.name || product.category_name || '').toLowerCase();
      const subcat = (product.subcategory || '').toLowerCase();

      const matchesQuery = !query || 
        name.includes(query) || 
        brand.includes(query) || 
        model.includes(query) || 
        cat.includes(query) ||
        subcat.includes(query);

      const matchesCategory = !category || 
        (product.category?.name === category) || 
        (product.category_name === category);

      return matchesQuery && matchesCategory;
    });

    const container = document.getElementById('product-table-container');
    if (container) {
      if (this.products.length === 0) {
        container.innerHTML = `
          <div class="bg-white rounded-xl border border-slate-border p-12 text-center">
            <span class="material-symbols-outlined text-4xl text-gray-300 block mb-2">search_off</span>
            <p class="font-display font-bold text-gray-700 text-base">No se encontraron productos coincidentes</p>
            <p class="text-xs text-gray-400 mt-1">Pruebe ajustando el término de búsqueda o seleccionando otra categoría.</p>
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

  showProductDetailModal(prod) {
    const modal = document.getElementById('modal-product-detail');
    const modalBody = document.getElementById('product-detail-modal-body');
    if (!modal || !modalBody || !prod) return;

    const imgUrl = (prod.images && prod.images[0]?.image) || prod.product_image || 'https://via.placeholder.com/200';
    const catName = prod.category?.name || prod.category_name || '-';
    const subcat = prod.subcategory || 'General';
    const priceUsd = prod.price_usd ? `$${Number(prod.price_usd).toFixed(2)} USD` : 'A consultar';
    const priceCop = prod.price ? `$${Number(prod.price).toLocaleString('es-CO')} COP` : '';

    modalBody.innerHTML = `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row gap-5 items-start">
          <img src="${imgUrl}" alt="${prod.name}" class="w-full sm:w-44 h-44 object-cover rounded-xl border border-slate-border flex-shrink-0 shadow-sm" />
          <div class="space-y-2 flex-1">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-electric-blue border border-blue-200">${catName}</span>
              ${subcat ? `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">${subcat}</span>` : ''}
              <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${prod.is_active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}">
                ${prod.is_active !== false ? 'Visible en catálogo' : 'Oculto'}
              </span>
            </div>
            <h2 class="text-xl font-bold text-deep-obsidian leading-tight">${prod.name}</h2>
            <p class="text-xs text-gray-500 font-medium">Marca: <strong class="text-gray-800">${prod.brand || 'El Vecino'}</strong> ${prod.model ? `| Modelo: <strong class="text-gray-800">${prod.model}</strong>` : ''}</p>
            <div class="pt-2">
              <span class="text-xs text-gray-400 uppercase font-semibold tracking-wider block">Precio Referencial</span>
              <span class="text-2xl font-black text-electric-blue">${priceUsd}</span>
              ${priceCop ? `<span class="text-xs text-gray-500 ml-2">(${priceCop})</span>` : ''}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-border text-xs">
          <div>
            <span class="text-gray-400 block font-semibold">Voltaje:</span>
            <span class="font-bold text-gray-800">${prod.voltage || '110V'}</span>
          </div>
          <div>
            <span class="text-gray-400 block font-semibold">Capacidad:</span>
            <span class="font-bold text-gray-800">${prod.capacity || prod.model || 'N/A'}</span>
          </div>
          <div>
            <span class="text-gray-400 block font-semibold">Stock:</span>
            <span class="font-bold text-gray-800">${prod.stock ?? 10} unds</span>
          </div>
          <div>
            <span class="text-gray-400 block font-semibold">Total Vistas:</span>
            <span class="font-bold text-electric-blue">${Number(prod.total_views || 0).toLocaleString()}</span>
          </div>
        </div>

        ${prod.description ? `
          <div class="space-y-1">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider">Descripción Comercial</h4>
            <p class="text-xs text-gray-600 bg-white p-3 rounded-lg border border-slate-border leading-relaxed">
              ${prod.description}
            </p>
          </div>
        ` : ''}

        <div class="pt-4 border-t border-slate-border flex justify-between items-center">
          <button type="button" id="btn-close-modal-detail" class="px-4 py-2 text-xs font-bold border border-slate-border text-gray-600 rounded-lg hover:bg-slate-100 transition">
            Cerrar
          </button>
          <a href="#/products/edit/${prod.id}" class="px-5 py-2 text-xs font-bold bg-electric-blue text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm">
            <span class="material-symbols-outlined text-sm">edit</span>
            <span>Editar este Producto</span>
          </a>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.getElementById('btn-close-product-detail')?.addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('btn-close-modal-detail')?.addEventListener('click', () => modal.classList.add('hidden'));
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

    // Cerrar modal al dar click fuera
    const detailModal = document.getElementById('modal-product-detail');
    detailModal?.addEventListener('click', (e) => {
      if (e.target === detailModal) detailModal.classList.add('hidden');
    });

    // Acciones de tabla
    if (this.documentEventsBound) return;
    this.documentEventsBound = true;

    document.addEventListener('click', async (e) => {
      // 1. Ver Detalles del Producto (Modal)
      const btnView = e.target.closest('[data-action="view"]');
      if (btnView) {
        const id = btnView.dataset.id || (this.products && this.products[btnView.dataset.index]?.id);
        const prod = this.allProducts.find(p => String(p.id) === String(id));
        if (prod) {
          this.showProductDetailModal(prod);
        }
        return;
      }

      // 2. Editar Producto
      const btnEdit = e.target.closest('[data-action="edit"]');
      if (btnEdit) {
        const id = btnEdit.dataset.id || (this.products && this.products[btnEdit.dataset.index]?.id);
        if (id) {
          window.location.hash = `#/products/edit/${id}`;
        }
        return;
      }

      // 3. Borrar Producto
      const btnDelete = e.target.closest('[data-action="delete"]');
      if (btnDelete) {
        const id = btnDelete.dataset.id || (this.products && this.products[btnDelete.dataset.index]?.id);
        const prod = this.allProducts.find(p => String(p.id) === String(id));
        if (!prod) return;

        const confirmed = await ConfirmDialog.show({
          title: 'Borrar Producto',
          message: `¿Está seguro de eliminar definitivamente "${prod.name || 'este producto'}"? El producto será borrado del catálogo del sistema.`,
          confirmText: 'Borrar Producto',
          cancelText: 'Cancelar',
          type: 'danger'
        });

        if (confirmed && id) {
          try {
            await ProductService.delete(id);
            this.allProducts = this.allProducts.filter(p => String(p.id) !== String(id));
            Toast.show('Producto eliminado con éxito', 'success');
            this.filterProducts();
          } catch (err) {
            console.error(err);
            Toast.show('Error al eliminar el producto', 'error');
          }
        }
        return;
      }

      // 4. Toggle Visibilidad (Mostrar / Esconder)
      const btnToggle = e.target.closest('[data-action="toggle-product-visibility"]') || e.target.closest('[data-action="deactivate"]');
      if (btnToggle) {
        const id = btnToggle.dataset.id || (this.products && this.products[btnToggle.dataset.index]?.id);
        const prod = this.allProducts.find(p => String(p.id) === String(id));
        if (!prod) return;

        const isCurrentlyActive = prod.is_active !== false;
        const actionVerb = isCurrentlyActive ? 'esconder' : 'mostrar';
        const actionTitle = isCurrentlyActive ? 'Esconder Producto del Catálogo' : 'Mostrar Producto en el Catálogo';
        const actionMessage = isCurrentlyActive 
          ? `¿Está seguro de esconder "${prod.name || 'este producto'}"? El producto no se eliminará físicamente, pero dejará de ser visible para los clientes en el catálogo público.`
          : `¿Está seguro de mostrar "${prod.name || 'este producto'}"? El producto volverá a estar visible públicamente en el catálogo web para todos los clientes.`;
        const confirmBtnText = isCurrentlyActive ? 'Esconder Producto' : 'Mostrar Producto';
        const confirmBtnType = isCurrentlyActive ? 'danger' : 'primary';

        const confirmed = await ConfirmDialog.show({
          title: actionTitle,
          message: actionMessage,
          confirmText: confirmBtnText,
          cancelText: 'Cancelar',
          type: confirmBtnType
        });

        if (confirmed && id) {
          try {
            await ProductService.toggleActive(id, !isCurrentlyActive);
            prod.is_active = !isCurrentlyActive;
            Toast.show(`Producto ${isCurrentlyActive ? 'ocultado' : 'mostrado'} con éxito en el catálogo`, 'success');
            this.filterProducts();
          } catch (err) {
            console.error(err);
            Toast.show(`Error al ${actionVerb} el producto`, 'error');
          }
        }
      }
    });
  }
};
