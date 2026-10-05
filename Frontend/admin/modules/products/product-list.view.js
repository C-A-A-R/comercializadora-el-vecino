import { ProductService } from '../../services/product.service.js';
import { DataTable } from '../../components/ui/DataTable.js';
import { PriceDisplay } from '../../components/ui/PriceDisplay.js';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.js';
import { Toast } from '../../components/ui/Toast.js';

export const ProductListView = {
  products: [],

  async render() {
    const data = await ProductService.list();
    this.products = data.results || [];

    const columns = [
      { 
        key: 'name', 
        label: 'Producto',
        render: (val, row) => {
          const imgUrl = (row.images && row.images[0]?.image) || row.product_image || 'https://via.placeholder.com/40';
          const productName = val || row.product_name || 'Producto';
          const isTop = Boolean(row.is_top_ranked);
          const hasComplaints = Boolean(row.has_complaints || (row.negative_reviews_count > 0));

          // Badges interactivos con tooltips
          const topBadgeHtml = isTop ? `
            <div class="relative group/tooltip inline-block">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 cursor-help shadow-sm">
                <span class="material-symbols-outlined text-[13px] text-amber-600">workspace_premium</span>
                <span>Top 5</span>
              </span>
              <div class="pointer-events-none absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:flex flex-col items-start z-30 w-56 p-2.5 text-xs text-white bg-gray-900 rounded-lg shadow-xl">
                <span class="font-bold text-amber-300 flex items-center gap-1 mb-1">
                  <span class="material-symbols-outlined text-sm">military_tech</span>
                  Top 5 Destacado
                </span>
                <span class="text-gray-200 leading-tight">Producto entre los 5 de mayor demanda, ranking y desempeño global del catálogo.</span>
                <div class="w-2 h-2 -mb-3 ml-4 bg-gray-900 rotate-45 self-start"></div>
              </div>
            </div>
          ` : '';

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
                <span class="text-gray-200 leading-tight">Este producto cuenta con ${row.negative_reviews_count || 1} reseña(s) negativa(s) detectadas por análisis de sentimiento que requieren atención.</span>
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
                <div class="flex flex-wrap items-center gap-1.5 pt-0.5">
                  ${topBadgeHtml}
                  ${complaintBadgeHtml}
                </div>
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
        key: 'price_usd', 
        label: 'Precio (USD / COP)',
        render: (val, row) => PriceDisplay({ priceUSD: row.price_usd, priceCOP: row.price_cop })
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
        key: 'ranking_score',
        label: 'Score de Ranking',
        render: (val, row) => {
          const score = Number(val || 0);
          const pct = Math.min(100, Math.round(score * 100));
          const isHigh = pct >= 75;
          const isMedium = pct >= 45 && pct < 75;

          const textColor = isHigh ? 'text-emerald-700' : (isMedium ? 'text-blue-700' : 'text-gray-600');
          const barColor = isHigh ? 'bg-emerald-500' : (isMedium ? 'bg-blue-600' : 'bg-gray-400');

          return `
            <div class="flex flex-col gap-1 w-28">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold ${textColor}">${score.toFixed(2)}</span>
                <span class="text-[10px] text-gray-500 font-medium">${pct}% rel.</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div class="${barColor} h-1.5 rounded-full transition-all duration-300" style="width: ${pct}%"></div>
              </div>
            </div>
          `;
        }
      },
      { 
        key: 'stock', 
        label: 'Stock',
        render: (val) => Number(val) <= 5 
          ? `<span class="px-2 py-1 bg-red-100 text-red-700 font-bold rounded text-xs flex items-center gap-1 w-fit"><span class="material-symbols-outlined text-sm">warning</span> ${val} (Crítico)</span>`
          : `<span class="font-medium text-gray-700">${val} unid.</span>`
      },
      {
        key: 'is_featured',
        label: 'Destacado',
        render: (val, row) => `
          <button data-action="toggle-featured" data-id="${row.id}" data-featured="${Boolean(val)}" class="p-1 text-amber-500 hover:scale-110 transition" title="Alternar producto destacado">
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

    const tableComponent = new DataTable({ columns, data: this.products, actions });

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
            <p class="text-sm text-gray-500">Gestión de inventario, analítica de vistas, relevancia y alertas</p>
          </div>
          <a href="#/products/new" class="px-4 py-2 bg-electric-blue text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700 transition shadow-sm">
            <span class="material-symbols-outlined text-lg">add</span>
            Nuevo Producto
          </a>
        </div>

        <!-- Leyenda explicativa de distintivos / badges analíticos -->
        <div class="flex flex-wrap items-center gap-4 px-4 py-2.5 bg-white border border-slate-border rounded-xl text-xs text-gray-600">
          <span class="font-semibold text-deep-obsidian flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-electric-blue">help</span>
            Guía de Indicadores:
          </span>
          <span class="inline-flex items-center gap-1">
            <span class="material-symbols-outlined text-amber-600 text-base">workspace_premium</span>
            <strong>Top 5:</strong> Mayor volumen y ranking en catálogo
          </span>
          <span class="inline-flex items-center gap-1">
            <span class="material-symbols-outlined text-red-600 text-base">report_problem</span>
            <strong>Alerta:</strong> Reseñas negativas o reclamos de clientes
          </span>
          <span class="inline-flex items-center gap-1">
            <span class="material-symbols-outlined text-electric-blue text-base">visibility</span>
            <strong>Total Vistas:</strong> Visualizaciones acumuladas
          </span>
        </div>

        <!-- Render de Tabla -->
        ${tableComponent.render()}
      </div>
    `;
  },

  bindEvents() {
    document.addEventListener('click', async (e) => {
      const btnEdit = e.target.closest('[data-action="edit"]');
      if (btnEdit) {
        const id = btnEdit.dataset.id || (this.products && this.products[btnEdit.dataset.index]?.id);
        if (id) {
          window.location.hash = `#/products/edit/${id}`;
        }
        return;
      }

      const btnFeatured = e.target.closest('[data-action="toggle-featured"]');
      if (btnFeatured) {
        const id = parseInt(btnFeatured.dataset.id, 10);
        const current = btnFeatured.dataset.featured === 'true';
        try {
          await ProductService.toggleFeatured(id, current);
          Toast.show(`Producto ${!current ? 'marcado como destacado' : 'desmarcado de destacados'}`, 'success');
          window.location.reload();
        } catch (err) {
          console.error(err);
          Toast.show('Error al alternar estado de destacado', 'error');
        }
        return;
      }

      const btnDeactivate = e.target.closest('[data-action="deactivate"]');
      if (btnDeactivate) {
        const id = btnDeactivate.dataset.id || (this.products && this.products[btnDeactivate.dataset.index]?.id);
        const confirmed = await ConfirmDialog.show({
          title: 'Deshabilitar Producto',
          message: 'El producto no se eliminará físicamente (Soft-Delete RN-10), pero no se mostrará en el catálogo público.',
          confirmText: 'Deshabilitar',
          cancelText: 'Cancelar',
          type: 'danger'
        });

        if (confirmed && id) {
          try {
            await ProductService.deactivate(id);
            Toast.show('Producto deshabilitado con éxito', 'success');
            window.location.reload();
          } catch (err) {
            console.error(err);
            Toast.show('Error al deshabilitar el producto', 'error');
          }
        }
      }
    });
  }
};