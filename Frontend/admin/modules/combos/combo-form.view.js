import { ProductService } from '../../services/product.service.js';
import { ComboService } from '../../services/combo.service.js';
import { ComboBuilder } from './combo.builder.js';
import { Toast } from '../../components/ui/Toast.js';

export const ComboFormView = {
  allProducts: [],
  selectedItems: [],
  previewImageUrl: '',

  async render() {
    return `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-deep-obsidian font-display">Armar Nuevo Combo</h1>
          <a href="#/combos" class="text-sm text-gray-500 hover:text-gray-700">← Volver a combos</a>
        </div>

        <form id="combo-form" class="bg-white p-6 rounded-xl shadow-sm border border-slate-border space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2 md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Nombre del Combo</label>
              <input type="text" id="combo-name" required class="w-full border border-slate-border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-electric-blue" placeholder="Ej: Combo Lavado Perfecto" />
            </div>

            <div class="space-y-2 md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Descripción Promocional</label>
              <textarea id="combo-description" rows="2" class="w-full border border-slate-border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-electric-blue" placeholder="Detalles de la oferta..."></textarea>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Imagen del Combo (URL / Preview)</label>
              <input type="url" id="combo-image-url" class="w-full border border-slate-border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-electric-blue" placeholder="https://..." />
            </div>

            <div class="flex items-center justify-center border border-dashed border-slate-border rounded-lg p-2 bg-slate-surface">
              <div id="image-preview-container" class="text-center text-xs text-gray-400">
                <span>Sin vista previa de imagen</span>
              </div>
            </div>
          </div>

          <!-- Selector de Productos -->
          <div class="border-t border-slate-border pt-4 space-y-4">
            <h3 class="text-sm font-bold text-gray-700">Productos del Combo (Mínimo 2 productos)</h3>
            <div class="flex gap-2">
              <select id="combo-product-select" class="flex-1 border border-slate-border rounded-lg p-2.5 text-sm bg-white">
                <option value="">-- Seleccionar producto para agregar --</option>
              </select>
              <button type="button" id="add-product-btn" class="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-black">Agregar</button>
            </div>

            <div class="border border-slate-border rounded-lg overflow-hidden">
              <table class="w-full text-left text-sm">
                <thead class="bg-slate-surface text-gray-600">
                  <tr>
                    <th class="p-3">Producto</th>
                    <th class="p-3">Precio Regular (USD)</th>
                    <th class="p-3">Cantidad</th>
                    <th class="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody id="combo-items-body" class="divide-y divide-slate-border">
                  <tr><td colspan="4" class="p-4 text-center text-gray-400">No se han agregado productos al combo.</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Definición de Precios y Calculadora en Tiempo Real -->
          <div class="border-t border-slate-border pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Precio Final del Combo ($ USD)</label>
                <input type="number" id="combo-price-usd" step="0.01" min="0.01" required class="w-full border border-slate-border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-electric-blue" placeholder="Ej: 2100.00" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-medium text-gray-600">Fecha Inicio</label>
                  <input type="datetime-local" id="combo-start" required class="w-full border border-slate-border rounded-lg p-2 text-xs" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600">Fecha Fin</label>
                  <input type="datetime-local" id="combo-end" required class="w-full border border-slate-border rounded-lg p-2 text-xs" />
                </div>
              </div>
            </div>

            <!-- Dashboard / Preview del Ahorro -->
            <div class="bg-slate-surface p-4 rounded-xl border border-slate-border flex flex-col justify-between space-y-3">
              <h4 class="text-xs font-bold text-gray-600 uppercase tracking-wider">Resumen de Ahorro en Tiempo Real</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">Suma Precios Regulares:</span>
                  <span id="calc-regular-usd" class="font-semibold text-gray-800">$0.00 USD</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Precio del Combo:</span>
                  <span id="calc-combo-usd" class="font-semibold text-electric-blue">$0.00 USD</span>
                </div>
                <div class="flex justify-between border-t border-slate-border pt-2">
                  <span class="font-bold text-gray-700">Ahorro para el Cliente:</span>
                  <div class="text-right">
                    <span id="calc-saved-usd" class="font-bold text-neon-magenta block">$0.00 USD (0%)</span>
                    <span id="calc-saved-cop" class="text-xs text-gray-400 block">$ 0 COP</span>
                  </div>
                </div>
              </div>
              <div id="validation-msg" class="text-xs text-red-500 font-medium hidden"></div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-slate-border">
            <a href="#/combos" class="px-4 py-2 text-sm rounded-lg border border-slate-border text-gray-600 hover:bg-slate-100">Cancelar</a>
            <button type="submit" id="submit-combo-btn" class="px-4 py-2 text-sm bg-electric-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Crear Combo</button>
          </div>
        </form>
      </div>
    `;
  },

  async bindEvents() {
    this.selectedItems = [];
    const select = document.getElementById('combo-product-select');

    try {
      const data = await ProductService.list();
      this.allProducts = data.results || [];
      select.innerHTML = `
        <option value="">-- Seleccionar producto para agregar --</option>
        ${this.allProducts.map(p => `<option value="${p.id}">${p.name} ($${p.price_usd} USD)</option>`).join('')}
      `;
    } catch (err) {
      Toast.show({ message: 'Error al cargar catálogo de productos', type: 'error' });
    }

    document.getElementById('add-product-btn').addEventListener('click', () => {
      const prodId = Number(select.value);
      if (!prodId) return;
      const product = this.allProducts.find(p => p.id === prodId);
      if (!product) return;

      const existing = this.selectedItems.find(i => i.product.id === prodId);
      if (existing) {
        existing.quantity += 1;
      } else {
        this.selectedItems.push({ product, quantity: 1 });
      }

      this.renderSelectedItems();
      this.updateCalculations();
    });

    document.getElementById('combo-image-url').addEventListener('input', (e) => {
      const container = document.getElementById('image-preview-container');
      const url = e.target.value;
      if (url) {
        container.innerHTML = `<img src="${url}" class="max-h-24 mx-auto rounded border border-slate-border" onError="this.onerror=null;this.parentElement.innerHTML='URL de imagen no válida';" />`;
      } else {
        container.innerHTML = `<span>Sin vista previa de imagen</span>`;
      }
    });

    document.getElementById('combo-price-usd').addEventListener('input', () => this.updateCalculations());
    document.getElementById('combo-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  },

  renderSelectedItems() {
    const tbody = document.getElementById('combo-items-body');
    if (this.selectedItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-400">No se han agregado productos al combo.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.selectedItems.map((item, index) => `
      <tr class="hover:bg-slate-50">
        <td class="p-3 font-medium text-gray-800">${item.product.name}</td>
        <td class="p-3 text-gray-600">$${item.product.price_usd} USD</td>
        <td class="p-3">
          <input type="number" min="1" value="${item.quantity}" data-index="${index}" class="item-qty-input w-16 border border-slate-border rounded p-1 text-center" />
        </td>
        <td class="p-3 text-right">
          <button type="button" data-remove-index="${index}" class="text-red-500 hover:text-red-700 text-xs font-medium">Eliminar</button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.item-qty-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = Number(e.target.getAttribute('data-index'));
        const val = Math.max(1, parseInt(e.target.value) || 1);
        this.selectedItems[idx].quantity = val;
        this.updateCalculations();
      });
    });

    document.querySelectorAll('[data-remove-index]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.target.getAttribute('data-remove-index'));
        this.selectedItems.splice(idx, 1);
        this.renderSelectedItems();
        this.updateCalculations();
      });
    });
  },

  updateCalculations() {
    const comboPriceUsd = parseFloat(document.getElementById('combo-price-usd').value) || 0;
    const calc = ComboBuilder.calculateTotals(this.selectedItems, comboPriceUsd);

    document.getElementById('calc-regular-usd').textContent = `${calc.regularTotalUsdFormatted} USD`;
    document.getElementById('calc-combo-usd').textContent = `${calc.offerPriceUsdFormatted} USD`;
    document.getElementById('calc-saved-usd').textContent = `${calc.savedUsdFormatted} USD (${calc.savedPercentage})`;
    document.getElementById('calc-saved-cop').textContent = `${calc.savedCopFormatted} COP`;

    const validationMsg = document.getElementById('validation-msg');
    const submitBtn = document.getElementById('submit-combo-btn');

    if (this.selectedItems.length > 0) {
      if (!calc.isValidProductCount) {
        validationMsg.textContent = '⚠️ El combo debe incluir al menos 2 unidades/productos.';
        validationMsg.classList.remove('hidden');
        submitBtn.disabled = true;
        return;
      }
      if (comboPriceUsd >= calc.regularTotalUsd) {
        validationMsg.textContent = '⚠️ El precio del combo debe ser inferior a la suma de precios regulares.';
        validationMsg.classList.remove('hidden');
        submitBtn.disabled = true;
        return;
      }
    }

    validationMsg.classList.add('hidden');
    submitBtn.disabled = false;
  },

  async handleSubmit() {
    const comboPriceUsd = parseFloat(document.getElementById('combo-price-usd').value) || 0;
    const calc = ComboBuilder.calculateTotals(this.selectedItems, comboPriceUsd);

    if (!calc.isValid) {
      Toast.show({ message: 'El combo no cumple con las validaciones requeridas (mínimo 2 productos y precio menor al regular)', type: 'error' });
      return;
    }

    const payload = {
      name: document.getElementById('combo-name').value,
      description: document.getElementById('combo-description').value,
      image_url: document.getElementById('combo-image-url').value,
      price_combo_usd: comboPriceUsd,
      start_date: new Date(document.getElementById('combo-start').value).toISOString(),
      end_date: new Date(document.getElementById('combo-end').value).toISOString(),
      items: this.selectedItems.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
      is_active: true
    };

    try {
      await ComboService.create(payload);
      Toast.show({ message: 'Combo promocional creado exitosamente', type: 'success' });
      window.location.hash = '#/combos';
    } catch (err) {
      Toast.show({ message: 'No se pudo guardar el combo promocional', type: 'error' });
    }
  }
};