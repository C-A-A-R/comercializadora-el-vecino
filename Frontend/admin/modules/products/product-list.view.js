import { ProductService } from '../../services/product.service.js';
import { DataTable } from '../../components/ui/DataTable.js';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.js';
import { formatUSD, formatCOP } from '../../../js/config.js'; // Formateadores directos

// SVG codificado en Base64 para evitar conflictos de comillas o caracteres especiales en HTML inline
const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ii8+PHBvbHlsaW5lIHBvaW50cz0iMjEgMTUgMTYgMTAgNSAyMSIvPjwvc3ZnPg==';

export const ProductListView = {
  async render() {
    const data = await ProductService.list();

    const columns = [
      { 
        key: 'name', 
        label: 'Producto',
        render: (val, row) => {
          const imgSrc = (row.images && row.images[0]?.image) ? row.images[0].image : placeholderImage;
          return `
            <div class="flex items-center gap-3">
              <img 
                src="${imgSrc}" 
                onerror="this.onerror=null; this.src='${placeholderImage}';" 
                class="w-10 h-10 object-cover rounded-lg border border-slate-border bg-slate-100" 
                alt="${val}" 
              />
              <div>
                <p class="font-semibold text-deep-obsidian text-sm">${val}</p>
                <p class="text-xs text-gray-500">${row.brand} | Mod: ${row.model}</p>
              </div>
            </div>
          `;
        }
      },
      { key: 'category', label: 'Categoría', render: (val) => `<span class="px-2.5 py-1 bg-slate-surface border border-slate-border rounded-md text-xs font-medium">${val.name}</span>` },
      { 
        key: 'price_usd', 
        label: 'Precio (USD / COP)',
        render: (val, row) => `
          <div>
            <span class="text-sm font-bold text-deep-obsidian block">${formatUSD(row.price_usd)}</span>
            <span class="text-xs text-gray-500 block">${formatCOP(row.price_cop)} COP</span>
          </div>
        `
      },
      { 
        key: 'stock', 
        label: 'Stock',
        render: (val) => val <= 5 
          ? `<span class="px-2 py-1 bg-red-100 text-red-700 font-bold rounded text-xs flex items-center gap-1 w-fit"><span class="material-symbols-outlined text-sm">warning</span> ${val} (Crítico)</span>`
          : `<span class="font-medium text-gray-700">${val} unid.</span>`
      },
      {
        key: 'is_featured',
        label: 'Destacado',
        render: (val, row) => `
          <button data-action="toggle-featured" data-id="${row.id}" data-featured="${val}" class="p-1 text-amber-500 hover:scale-110 transition">
            <span class="material-symbols-outlined text-xl">${val ? 'star' : 'star_outline'}</span>
          </button>
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

    const actions = [
      { name: 'edit', label: 'Editar', icon: 'edit' },
      { name: 'deactivate', label: 'Desactivar', icon: 'block' }
    ];

    const tableComponent = new DataTable({ columns, data: data.results, actions });

    return `
      <div class="space-y-6">
        <!-- Banner Disclaimer RN-20 -->
        <div class="p-3 bg-blue-50 border-l-4 border-electric-blue text-xs text-blue-900 rounded-r-lg flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-electric-blue text-base">info</span>
            <span><strong>Aviso de Precios:</strong> Precios referenciales. Consulte disponibilidad y precio final por WhatsApp.</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="font-display text-2xl font-bold text-deep-obsidian">Catálogo de Productos</h2>
            <p class="text-sm text-gray-500">Gestión de inventario, variantes y visibilidad</p>
          </div>
          <a href="#/products/new" class="px-4 py-2 bg-electric-blue text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700 transition">
            <span class="material-symbols-outlined text-lg">add</span>
            Nuevo Producto
          </a>
        </div>

        <!-- Render de Tabla -->
        ${tableComponent.render()}
      </div>
    `;
  },

  bindEvents() {
    document.addEventListener('click', async (e) => {
      const btnFeatured = e.target.closest('[data-action="toggle-featured"]');
      if (btnFeatured) {
        const id = parseInt(btnFeatured.dataset.id, 10);
        const current = btnFeatured.dataset.featured === 'true';
        await ProductService.toggleFeatured(id, current);
        window.location.reload();
      }

      const btnDeactivate = e.target.closest('[data-action="deactivate"]');
      if (btnDeactivate) {
        const id = parseInt(btnDeactivate.dataset.id, 10);
        const confirmed = await ConfirmDialog.show({
          title: 'Deshabilitar Producto',
          message: 'El producto no se eliminará físicamente (Soft-Delete RN-10), pero no se mostrará en el catálogo público.',
          confirmText: 'Deshabilitar',
          cancelText: 'Cancelar',
          type: 'danger'
        });

        if (confirmed) {
          await ProductService.deactivate(id);
          window.location.reload();
        }
      }
    });
  }
};