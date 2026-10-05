import { ProductService } from '../../services/product.service.js';
import { formatCOP } from '../../../js/config.js';

export const ProductFormView = {
  async render(productId = null) {
    const isEdit = Boolean(productId);
    let product = {
      name: '',
      description: '',
      price_usd: '',
      stock: 0,
      brand: '',
      model: '',
      voltage: '110V',
      capacity: '',
      dimensions: '',
      category_id: '',
      product_type_id: '',
      is_active: true,
      is_featured: false,
      variants: [],
      images: []
    };

    if (isEdit) {
      const data = await ProductService.getById(productId);
      if (data) product = data;
    }

    return `
      <div class="space-y-6 max-w-4xl mx-auto">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-display text-2xl font-bold text-deep-obsidian">
              ${isEdit ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <p class="text-sm text-gray-500">Complete la información general, especificaciones técnicas, variantes e imágenes.</p>
          </div>
          <a href="#/products" class="px-4 py-2 border border-slate-border text-gray-700 rounded-lg text-sm font-medium hover:bg-slate-surface transition flex items-center gap-1">
            <span class="material-symbols-outlined text-base">arrow_back</span>
            Cancelar
          </a>
        </div>

        <form id="product-form" class="bg-white rounded-xl border border-slate-border shadow-sm p-6 space-y-6">
          <input type="hidden" id="product-id" value="${productId || ''}">
          
          <!-- Contenedor General -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Nombre del Producto *</label>
              <input type="text" id="prod-name" required value="${product.name}" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Ej. Nevera Samsung 200L No Frost">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Marca *</label>
              <input type="text" id="prod-brand" required value="${product.brand}" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Ej. Samsung">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Modelo *</label>
              <input type="text" id="prod-model" required value="${product.model}" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Ej. RT20K5030S8">
            </div>

            <!-- Precios y Multimoneda (RN-06) -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Precio USD ($) *</label>
              <input type="number" step="0.01" min="0" id="prod-price-usd" required value="${product.price_usd}" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="0.00">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Precio Estimado COP (Calculado)</label>
              <input type="text" id="prod-price-cop-preview" disabled value="${product.price_usd ? formatCOP(product.price_usd * 4200) : '$ 0'}" class="w-full px-3 py-2 bg-slate-surface border border-slate-border rounded-lg text-sm font-semibold text-gray-600 cursor-not-allowed">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Stock Disponible *</label>
              <input type="number" min="0" id="prod-stock" required value="${product.stock}" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Voltaje</label>
              <select id="prod-voltage" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none">
                <option value="110V" ${product.voltage === '110V' ? 'selected' : ''}>110V</option>
                <option value="220V" ${product.voltage === '220V' ? 'selected' : ''}>220V</option>
                <option value="Dual" ${product.voltage === 'Dual' ? 'selected' : ''}>Dual (110V/220V)</option>
              </select>
            </div>
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Descripción</label>
            <textarea id="prod-description" rows="3" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Descripción corta comercial...">${product.description}</textarea>
          </div>

          <!-- Toggles Destacado / Activo -->
          <div class="flex items-center gap-6 pt-2">
            <label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
              <input type="checkbox" id="prod-active" ${product.is_active ? 'checked' : ''} class="w-4 h-4 text-electric-blue rounded border-gray-300">
              Producto Activo en Catálogo
            </label>

            <label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
              <input type="checkbox" id="prod-featured" ${product.is_featured ? 'checked' : ''} class="w-4 h-4 text-amber-500 rounded border-gray-300">
              Marcar como Destacado
            </label>
          </div>

          <!-- Acciones -->
          <div class="pt-4 border-t border-slate-border flex justify-end gap-3">
            <a href="#/products" class="px-4 py-2 border border-slate-border text-gray-600 rounded-lg text-sm font-medium hover:bg-slate-surface transition">Cancelar</a>
            <button type="submit" class="px-5 py-2 bg-electric-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              ${isEdit ? 'Actualizar Producto' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    `;
  },

  bindEvents() {
    const inputUsd = document.getElementById('prod-price-usd');
    const previewCop = document.getElementById('prod-price-cop-preview');

    if (inputUsd && previewCop) {
      inputUsd.addEventListener('input', (e) => {
        const usd = parseFloat(e.target.value) || 0;
        previewCop.value = formatCOP(usd * 4200);
      });
    }
  }
};