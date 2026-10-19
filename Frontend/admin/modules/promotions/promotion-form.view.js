import { ProductService } from '../../services/product.service.js';
import { PromotionService } from '../../services/promotion.service.js';
import { Toast } from '../../components/ui/Toast.js';

export const PromotionFormView = {
  products: [],
  selectedProduct: null,

  async render() {
    return `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold uppercase tracking-wider text-electric-blue bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                Promociones & Combos
              </span>
              <span class="text-xs text-gray-400">/</span>
              <span class="text-xs font-semibold text-gray-500">Nueva Campaña</span>
            </div>
            <h1 class="text-2xl font-bold text-deep-obsidian font-display">Crear Nueva Promoción</h1>
            <p class="text-sm text-gray-500">Configure una oferta destacada para un producto específico del catálogo.</p>
          </div>
          <a href="#/promotions" class="px-4 py-2 border border-slate-border text-gray-600 rounded-lg text-xs font-bold hover:bg-slate-surface transition">
            ← Volver a Promociones
          </a>
        </div>

        <form id="promo-form" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-border space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Nombre de la Promoción -->
            <div class="space-y-1.5 md:col-span-2">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre de la Promoción *</label>
              <input type="text" id="promo-name" required class="w-full px-3.5 py-2.5 border border-slate-border rounded-xl text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Ej: Semana Inverter o Kit de Instalación Obsequio" />
            </div>

            <!-- Seleccionar Producto -->
            <div class="space-y-1.5 md:col-span-2">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Producto en Campaña *</label>
              <select id="promo-product-id" required class="w-full px-3.5 py-2.5 border border-slate-border rounded-xl text-sm bg-white focus:ring-2 focus:ring-electric-blue outline-none cursor-pointer">
                <option value="">-- Seleccionar un producto del catálogo --</option>
              </select>
            </div>

            <!-- Tipo de Beneficio Promocional -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Etiqueta de Beneficio / Tipo *</label>
              <select id="promo-benefit-type" required class="w-full px-3.5 py-2.5 border border-slate-border rounded-xl text-sm bg-white focus:ring-2 focus:ring-electric-blue outline-none cursor-pointer">
                <option value="Kit Obsequio">Kit de Instalación / Accesorio Obsequio</option>
                <option value="Garantía Extendida">Garantía Extendida de Fábrica</option>
                <option value="Campaña Destacada">Campaña Destacada de Temporada</option>
                <option value="Promoción Especial">Promoción Especial Catálogo</option>
                <option value="Bono Especial">Bono / Descuento en Consulta</option>
              </select>
            </div>

            <!-- Estado Inicial -->
            <div class="space-y-1.5 flex flex-col justify-center">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Estado</label>
              <label class="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                <input type="checkbox" id="promo-active" checked class="w-4 h-4 text-electric-blue rounded border-gray-300" />
                <span>Publicar promoción como Activa</span>
              </label>
            </div>

            <!-- Descripción de la Oferta -->
            <div class="space-y-1.5 md:col-span-2">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Detalles de la Promoción</label>
              <textarea id="promo-description" rows="3" class="w-full px-3.5 py-2.5 border border-slate-border rounded-xl text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Especifique los términos de la promoción que el cliente podrá consultar por WhatsApp..."></textarea>
            </div>

            <!-- Fechas de Vigencia -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Fecha de Inicio *</label>
              <input type="datetime-local" id="promo-start" required class="w-full px-3.5 py-2.5 border border-slate-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-electric-blue" />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Fecha de Fin *</label>
              <input type="datetime-local" id="promo-end" required class="w-full px-3.5 py-2.5 border border-slate-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-electric-blue" />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-slate-border">
            <a href="#/promotions" class="px-4 py-2 text-xs font-bold rounded-xl border border-slate-border text-gray-600 hover:bg-slate-100 transition">Cancelar</a>
            <button type="submit" class="px-5 py-2.5 text-xs font-bold bg-electric-blue text-white rounded-xl hover:bg-blue-700 transition shadow-sm">Guardar Promoción</button>
          </div>
        </form>
      </div>
    `;
  },

  async bindEvents() {
    const productSelect = document.getElementById('promo-product-id');
    const form = document.getElementById('promo-form');

    // Fechas por defecto (hoy a 30 días)
    const now = new Date();
    const future = new Date(Date.now() + 30 * 86400000);
    const startInput = document.getElementById('promo-start');
    const endInput = document.getElementById('promo-end');
    if (startInput) startInput.value = now.toISOString().slice(0, 16);
    if (endInput) endInput.value = future.toISOString().slice(0, 16);

    try {
      const data = await ProductService.list();
      this.products = data.results || [];
      if (productSelect) {
        productSelect.innerHTML = `
          <option value="">-- Seleccionar un producto del catálogo --</option>
          ${this.products.map(p => `<option value="${p.id}">${p.name} (${p.brand || 'El Vecino'})</option>`).join('')}
        `;
      }
    } catch (err) {
      Toast.show('Error al cargar productos para el selector', 'error');
    }

    productSelect?.addEventListener('change', (e) => {
      const id = Number(e.target.value);
      this.selectedProduct = this.products.find(p => p.id === id) || null;
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });
  },

  async handleSubmit() {
    const startDate = new Date(document.getElementById('promo-start').value);
    const endDate = new Date(document.getElementById('promo-end').value);

    if (startDate >= endDate) {
      Toast.show('La fecha de inicio debe ser anterior a la fecha de fin', 'error');
      return;
    }

    if (!this.selectedProduct) {
      Toast.show('Por favor seleccione un producto del catálogo', 'error');
      return;
    }

    const benefitType = document.getElementById('promo-benefit-type').value;

    const payload = {
      name: document.getElementById('promo-name').value.trim(),
      description: document.getElementById('promo-description').value.trim(),
      product: this.selectedProduct,
      product_id: this.selectedProduct.id,
      discount_type: benefitType,
      discounted_type: benefitType,
      value: 0,
      discounted_value: 0,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      is_active: document.getElementById('promo-active').checked
    };

    try {
      await PromotionService.create(payload);
      Toast.show('Promoción creada exitosamente', 'success');
      window.location.hash = '#/promotions';
    } catch (err) {
      console.error(err);
      Toast.show('No se pudo guardar la promoción', 'error');
    }
  }
};