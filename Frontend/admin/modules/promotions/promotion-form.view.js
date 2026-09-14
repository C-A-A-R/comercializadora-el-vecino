import { ProductService } from '../../services/product.service.js';
import { PromotionService } from '../../services/promotion.service.js';
import { PromotionCalculator } from './promotions.calculator.js';
import { Toast } from '../../components/ui/Toast.js';

export const PromotionFormView = {
  products: [],
  selectedProduct: null,

  async render() {
    return `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-deep-obsidian font-display">Crear Nueva Promoción</h1>
          <a href="#/promotions" class="text-sm text-gray-500 hover:text-gray-700">← Volver al listado</a>
        </div>

        <form id="promo-form" class="bg-white p-6 rounded-xl shadow-sm border border-slate-border grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4 md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Nombre de la Promoción</label>
            <input type="text" id="promo-name" required class="w-full border border-slate-border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Ej: Super Descuento Septiembre" />
          </div>

          <div class="space-y-4 md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Seleccionar Producto</label>
            <select id="promo-product-id" required class="w-full border border-slate-border rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-electric-blue outline-none">
              <option value="">Cargando productos...</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Tipo de Descuento</label>
            <div class="flex gap-4 pt-1">
              <label class="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="discount_type" value="percentage" checked class="text-electric-blue focus:ring-electric-blue" />
                Porcentaje (%)
              </label>
              <label class="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="discount_type" value="fixed" class="text-electric-blue focus:ring-electric-blue" />
                Monto Fijo ($ USD)
              </label>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Valor del Descuento</label>
            <input type="number" id="promo-value" step="0.01" min="0.01" required class="w-full border border-slate-border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Ej: 15 o 50.00" />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
            <input type="datetime-local" id="promo-start" required class="w-full border border-slate-border rounded-lg p-2.5 text-sm" />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Fecha de Fin</label>
            <input type="datetime-local" id="promo-end" required class="w-full border border-slate-border rounded-lg p-2.5 text-sm" />
          </div>

          <!-- Preview de Precios -->
          <div class="md:col-span-2 bg-slate-surface p-4 rounded-xl border border-slate-border space-y-3">
            <h3 class="text-sm font-bold text-gray-700">Vista Previa de Precios (Calculado en tiempo real)</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span class="block text-xs text-gray-500">Precio Regular</span>
                <span id="preview-base-usd" class="font-semibold text-gray-800">$0.00 USD</span>
                <span id="preview-base-cop" class="block text-xs text-gray-400">$ 0 COP</span>
              </div>
              <div>
                <span class="block text-xs text-gray-500">Descuento Estimado</span>
                <span id="preview-saved-usd" class="font-semibold text-neon-magenta">$0.00 USD</span>
                <span id="preview-saved-pct" class="block text-xs text-neon-magenta">0% ahorro</span>
              </div>
              <div>
                <span class="block text-xs text-gray-500">Precio Promocional Final</span>
                <span id="preview-final-usd" class="font-bold text-base text-electric-blue">$0.00 USD</span>
                <span id="preview-final-cop" class="block text-xs text-electric-blue">$ 0 COP</span>
              </div>
            </div>
          </div>

          <div class="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-border">
            <a href="#/promotions" class="px-4 py-2 text-sm rounded-lg border border-slate-border text-gray-600 hover:bg-slate-100">Cancelar</a>
            <button type="submit" class="px-4 py-2 text-sm bg-electric-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Guardar Promoción</button>
          </div>
        </form>
      </div>
    `;
  },

  async bindEvents() {
    const productSelect = document.getElementById('promo-product-id');
    const form = document.getElementById('promo-form');

    try {
      const data = await ProductService.list();
      this.products = data.results || [];
      productSelect.innerHTML = `
        <option value="">-- Seleccionar un producto --</option>
        ${this.products.map(p => `<option value="${p.id}">${p.name} ($${p.price_usd} USD)</option>`).join('')}
      `;
    } catch (err) {
      Toast.show({ message: 'Error al cargar productos para el selector', type: 'error' });
    }

    productSelect.addEventListener('change', (e) => {
      const id = Number(e.target.value);
      this.selectedProduct = this.products.find(p => p.id === id) || null;
      this.updatePreview();
    });

    document.getElementById('promo-value')?.addEventListener('input', () => this.updatePreview());
    document.querySelectorAll('input[name="discount_type"]').forEach(r => {
      r.addEventListener('change', () => this.updatePreview());
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });
  },

  updatePreview() {
    if (!this.selectedProduct) {
      this.resetPreview();
      return;
    }

    const discountType = document.querySelector('input[name="discount_type"]:checked')?.value || 'percentage';
    const discountValue = parseFloat(document.getElementById('promo-value').value) || 0;

    const calc = PromotionCalculator.calculateDiscount(this.selectedProduct.price_usd, discountType, discountValue);

    document.getElementById('preview-base-usd').textContent = `${calc.baseUsdFormatted} USD`;
    document.getElementById('preview-base-cop').textContent = calc.baseCopFormatted;
    document.getElementById('preview-saved-usd').textContent = `${calc.savedUsdFormatted} USD`;
    document.getElementById('preview-saved-pct').textContent = `${calc.savedPercentage} ahorro`;
    document.getElementById('preview-final-usd').textContent = `${calc.finalUsdFormatted} USD`;
    document.getElementById('preview-final-cop').textContent = calc.finalCopFormatted;
  },

  resetPreview() {
    document.getElementById('preview-base-usd').textContent = '$0.00 USD';
    document.getElementById('preview-base-cop').textContent = '$ 0 COP';
    document.getElementById('preview-saved-usd').textContent = '$0.00 USD';
    document.getElementById('preview-saved-pct').textContent = '0% ahorro';
    document.getElementById('preview-final-usd').textContent = '$0.00 USD';
    document.getElementById('preview-final-cop').textContent = '$ 0 COP';
  },

  async handleSubmit() {
    const startDate = new Date(document.getElementById('promo-start').value);
    const endDate = new Date(document.getElementById('promo-end').value);

    if (startDate >= endDate) {
      Toast.show({ message: 'La fecha de inicio debe ser estrictamente anterior a la fecha de fin', type: 'error' });
      return;
    }

    const payload = {
      name: document.getElementById('promo-name').value,
      product: this.selectedProduct,
      discount_type: document.querySelector('input[name="discount_type"]:checked').value,
      value: parseFloat(document.getElementById('promo-value').value),
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      is_active: true
    };

    try {
      await PromotionService.create(payload);
      Toast.show({ message: 'Promoción creada exitosamente', type: 'success' });
      window.location.hash = '#/promotions';
    } catch (err) {
      Toast.show({ message: 'No se pudo guardar la promoción', type: 'error' });
    }
  }
};