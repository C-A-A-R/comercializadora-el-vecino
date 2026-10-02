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
          <div>
            <h1 class="text-2xl font-bold text-deep-obsidian font-display">Simulador y Registro de Promociones (Interno)</h1>
            <p class="text-sm text-gray-500">Calcula descuentos en USD para cierres comerciales en WhatsApp y guarda la referencia interna.</p>
          </div>
          <a href="#/promotions" class="text-sm text-gray-500 hover:text-gray-700">← Volver al listado</a>
        </div>

        <form id="promo-form" class="bg-white p-6 rounded-xl shadow-sm border border-slate-border grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2 md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Nombre de la Promoción / Campaña Interna</label>
            <input type="text" id="promo-name" required class="w-full border border-slate-border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Ej: Especial Cierre WhatsApp - Refrigeración" />
          </div>

          <div class="space-y-2 md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Seleccionar Producto</label>
            <select id="promo-product-id" required class="w-full border border-slate-border rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-electric-blue outline-none">
              <option value="">Cargando catálogo de productos...</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Tipo de Descuento</label>
            <div class="flex gap-4 pt-2">
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
            <label class="block text-sm font-medium text-gray-700">Vigencia Inicio (Opcional)</label>
            <input type="datetime-local" id="promo-start" class="w-full border border-slate-border rounded-lg p-2.5 text-sm" />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Vigencia Fin (Opcional)</label>
            <input type="datetime-local" id="promo-end" class="w-full border border-slate-border rounded-lg p-2.5 text-sm" />
          </div>

          <!-- Preview de Precios Internos (Calculado en tiempo real) -->
          <div class="md:col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 class="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span class="material-symbols-outlined text-electric-blue text-lg">calculate</span>
                Cálculo de Promoción para Vendedor (USD)
              </h3>
              <span class="text-[11px] font-semibold bg-blue-100 text-electric-blue px-2 py-0.5 rounded-full">Uso Interno Comercial</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div class="bg-white p-3 rounded-lg border border-slate-200">
                <span class="block text-xs font-medium text-gray-500 uppercase">Precio Base</span>
                <span id="preview-base-usd" class="font-bold text-lg text-gray-800">$0.00 USD</span>
              </div>
              <div class="bg-white p-3 rounded-lg border border-slate-200">
                <span class="block text-xs font-medium text-gray-500 uppercase">Monto Descontado</span>
                <span id="preview-saved-usd" class="font-bold text-lg text-neon-magenta">$0.00 USD</span>
                <span id="preview-saved-pct" class="block text-xs text-neon-magenta font-medium">0% de ahorro</span>
              </div>
              <div class="bg-white p-3 rounded-lg border border-slate-200">
                <span class="block text-xs font-medium text-gray-500 uppercase">Precio Final Cierre</span>
                <span id="preview-final-usd" class="font-bold text-xl text-electric-blue">$0.00 USD</span>
              </div>
            </div>

            <!-- Plantilla lista para copiar y enviar al chat de WhatsApp -->
            <div class="pt-2">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold text-gray-700">Texto para Copiar al Chat de WhatsApp:</span>
                <button type="button" id="copy-whatsapp-btn" class="text-xs text-whatsapp-green font-bold hover:underline flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">content_copy</span> Copiar Oferta
                </button>
              </div>
              <textarea id="whatsapp-template" readonly class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-gray-700 font-mono h-20 outline-none resize-none" placeholder="Selecciona un producto y descuento para generar el mensaje de venta..."></textarea>
            </div>
          </div>

          <div class="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-border">
            <a href="#/promotions" class="px-4 py-2 text-sm rounded-lg border border-slate-border text-gray-600 hover:bg-slate-100">Cancelar</a>
            <button type="submit" class="px-4 py-2 text-sm bg-electric-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Guardar Referencia de Promoción</button>
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

    document.getElementById('copy-whatsapp-btn')?.addEventListener('click', () => {
      const text = document.getElementById('whatsapp-template').value;
      if (!text) return;
      navigator.clipboard.writeText(text);
      Toast.show({ message: '¡Texto copiado al portapapeles para WhatsApp!', type: 'success' });
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
    document.getElementById('preview-saved-usd').textContent = `${calc.savedUsdFormatted} USD`;
    document.getElementById('preview-saved-pct').textContent = `${calc.savedPercentage} de ahorro`;
    document.getElementById('preview-final-usd').textContent = `${calc.finalUsdFormatted} USD`;

    // Generar mensaje listo para WhatsApp
    const promoName = document.getElementById('promo-name').value || 'Promoción Especial';
    const textMsg = `¡Hola! 👋 Te comparto el detalle de la promoción especial de El Vecino para ti:\n\n` +
      `📌 *Producto:* ${this.selectedProduct.name}\n` +
      `💵 *Precio Regular:* ${calc.baseUsdFormatted} USD\n` +
      `🔥 *Precio Oferta Cierre:* ${calc.finalUsdFormatted} USD (Ahorras ${calc.savedUsdFormatted} USD)\n\n` +
      `¿Avanzamos con la reserva del equipo? 🛒✨`;

    document.getElementById('whatsapp-template').value = textMsg;
  },

  resetPreview() {
    document.getElementById('preview-base-usd').textContent = '$0.00 USD';
    document.getElementById('preview-saved-usd').textContent = '$0.00 USD';
    document.getElementById('preview-saved-pct').textContent = '0% ahorro';
    document.getElementById('preview-final-usd').textContent = '$0.00 USD';
    document.getElementById('whatsapp-template').value = '';
  },

  async handleSubmit() {
    const startVal = document.getElementById('promo-start').value;
    const endVal = document.getElementById('promo-end').value;

    const startDate = startVal ? new Date(startVal) : new Date();
    const endDate = endVal ? new Date(endVal) : new Date(Date.now() + 30*24*60*60*1000); // 30 días por defecto

    if (startVal && endVal && startDate >= endDate) {
      Toast.show({ message: 'La fecha de inicio debe ser anterior a la fecha de fin', type: 'error' });
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
      Toast.show({ message: 'Promoción guardada en el catálogo interno', type: 'success' });
      window.location.hash = '#/promotions';
    } catch (err) {
      Toast.show({ message: 'No se pudo guardar la promoción', type: 'error' });
    }
  }
};