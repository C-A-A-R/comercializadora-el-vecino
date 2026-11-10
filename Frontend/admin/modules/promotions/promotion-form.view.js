import { ProductService } from '../../services/product.service.js';
import { PromotionService } from '../../services/promotion.service.js';
import { Toast } from '../../components/ui/Toast.js';

export const PromotionFormView = {
  products: [],
  selectedProduct: null,
  currentPromo: null,
  previewImageUrl: '',

  // Helper para leer archivo como Base64
  readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async render(promoId = null) {
    const isEdit = Boolean(promoId);
    let promo = {
      name: '',
      product_id: '',
      discount_type: 'percentage',
      discount_value: 10,
      description: '',
      is_active: true,
      start_date: new Date().toISOString().slice(0, 16),
      end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
      image: null
    };

    if (isEdit) {
      try {
        const data = await PromotionService.getById(promoId);
        if (data) {
          promo = {
            ...promo,
            ...data,
            product_id: data.product?.id || data.product_id || '',
            discount_type: data.discount_type || data.discounted_type || 'percentage',
            discount_value: data.discount_value !== undefined ? data.discount_value : (data.discounted_value || 10),
            start_date: data.start_date ? new Date(data.start_date).toISOString().slice(0, 16) : promo.start_date,
            end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : promo.end_date
          };
          this.previewImageUrl = data.image || data.image_url || '';
        }
      } catch (err) {
        console.error('[PromotionFormView] Error al cargar promoción para edición:', err);
        Toast.show('Error al cargar datos de la promoción', 'error');
      }
    } else {
      this.previewImageUrl = '';
    }

    this.currentPromo = promo;

    return `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold uppercase tracking-wider text-electric-blue bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                Promociones & Ofertas
              </span>
              <span class="text-xs text-gray-400">/</span>
              <span class="text-xs font-semibold text-gray-500">${isEdit ? 'Editar Campaña' : 'Nueva Campaña'}</span>
            </div>
            <h1 class="text-2xl font-bold text-deep-obsidian font-display">
              ${isEdit ? 'Editar Promoción' : 'Crear Nueva Promoción'}
            </h1>
            <p class="text-sm text-gray-500">Configure una oferta destacada con descuento porcentual o valor fijo para un producto.</p>
          </div>
          <a href="#/promotions" class="px-4 py-2 border border-slate-border text-gray-600 rounded-lg text-xs font-bold hover:bg-slate-surface transition flex items-center gap-1">
            ← Volver a Promociones
          </a>
        </div>

        <form id="promo-form" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-border space-y-6">
          <input type="hidden" id="promo-id" value="${promoId || ''}">

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Nombre de la Promoción -->
            <div class="space-y-1.5 md:col-span-2">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre de la Promoción *</label>
              <input 
                type="text" 
                id="promo-name" 
                required 
                class="w-full px-3.5 py-2.5 border border-slate-border rounded-xl text-sm focus:ring-2 focus:ring-electric-blue outline-none" 
                placeholder="Ej: Semana de Descuentos en Línea Blanca o Especial Smart TVs" 
                value="${promo.name || ''}"
              />
            </div>

            <!-- Seleccionar Producto -->
            <div class="space-y-1.5 md:col-span-2">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Producto en Promoción *</label>
              <select id="promo-product-id" required class="w-full px-3.5 py-2.5 border border-slate-border rounded-xl text-sm bg-white focus:ring-2 focus:ring-electric-blue outline-none cursor-pointer">
                <option value="">-- Seleccionar un producto del catálogo --</option>
              </select>
            </div>

            <!-- IMAGEN DE LA PROMOCIÓN (SUBIDA O AUTO DEL PRODUCTO) -->
            <div class="space-y-1.5 md:col-span-2">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Imagen de la Promoción / Producto</label>
              <div class="flex items-start gap-6">
                <div id="promo-image-preview-container" class="w-28 h-28 border-2 border-dashed border-slate-border rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
                  ${this.previewImageUrl 
                    ? `<img src="${this.previewImageUrl}" class="w-full h-full object-cover" />` 
                    : '<span class="text-gray-400 text-xs text-center px-2">Vista previa</span>'}
                </div>
                <div class="flex-1 space-y-2">
                  <input type="file" id="promo-image-file" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-electric-blue hover:file:bg-blue-100 cursor-pointer" />
                  <p class="text-xs text-gray-500">Se usará automáticamente la foto del producto o puede subir un banner promocional exclusivo.</p>
                  <button type="button" id="btn-remove-promo-image" class="text-xs text-red-500 hover:text-red-700 underline ${this.previewImageUrl ? '' : 'hidden'}">Restablecer a imagen del producto</button>
                </div>
              </div>
            </div>

            <!-- TIPO DE DESCUENTO -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Tipo de Descuento *</label>
              <select id="promo-discount-type" required class="w-full px-3.5 py-2.5 border border-slate-border rounded-xl text-sm bg-white focus:ring-2 focus:ring-electric-blue outline-none cursor-pointer">
                <option value="percentage" ${promo.discount_type === 'percentage' ? 'selected' : ''}>Porcentaje (%)</option>
                <option value="fixed" ${promo.discount_type === 'fixed' ? 'selected' : ''}>Valor Fijo ($ USD)</option>
              </select>
            </div>

            <!-- VALOR DEL DESCUENTO -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Valor del Descuento *</label>
              <div class="relative">
                <input 
                  type="number" 
                  id="promo-discount-value" 
                  required 
                  min="0" 
                  step="0.01" 
                  class="w-full px-3.5 py-2.5 border border-slate-border rounded-xl text-sm font-bold text-deep-obsidian focus:ring-2 focus:ring-electric-blue outline-none pr-12" 
                  placeholder="${promo.discount_type === 'percentage' ? '15' : '50.00'}" 
                  value="${promo.discount_value || ''}"
                />
                <span id="promo-discount-suffix" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-500">
                  ${promo.discount_type === 'percentage' ? '%' : 'USD'}
                </span>
              </div>
            </div>

            <!-- Panel de Cálculo de Precio en Vivo -->
            <div class="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50/50 p-4 rounded-xl border border-blue-200/60 space-y-2">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left">
                <div>
                  <span class="text-[10px] font-bold uppercase text-gray-400 block tracking-wider">Precio Original</span>
                  <span id="promo-calc-original" class="text-base font-bold text-gray-700">$0.00 USD</span>
                </div>
                <div>
                  <span class="text-[10px] font-bold uppercase text-gray-400 block tracking-wider">Descuento Aplicado</span>
                  <span id="promo-calc-discount" class="text-base font-bold text-amber-600">0%</span>
                </div>
                <div>
                  <span class="text-[10px] font-bold uppercase text-electric-blue block tracking-wider">Precio Final en Oferta</span>
                  <span id="promo-calc-final" class="text-lg font-black text-electric-blue">$0.00 USD</span>
                </div>
              </div>
            </div>

            <!-- Estado Inicial -->
            <div class="space-y-1.5 flex items-center md:col-span-2 pt-1">
              <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                <input type="checkbox" id="promo-active" ${promo.is_active ? 'checked' : ''} class="w-4 h-4 text-electric-blue rounded border-gray-300" />
                <span>Publicar promoción como Activa en el Catálogo</span>
              </label>
            </div>

            <!-- Descripción de la Oferta -->
            <div class="space-y-1.5 md:col-span-2">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Detalles de la Promoción</label>
              <textarea 
                id="promo-description" 
                rows="2" 
                class="w-full px-3.5 py-2.5 border border-slate-border rounded-xl text-sm focus:ring-2 focus:ring-electric-blue outline-none" 
                placeholder="Especifique los términos de la promoción (ej. incluye transporte o instalación básica)..."
              >${promo.description || ''}</textarea>
            </div>

            <!-- Fechas de Vigencia -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Fecha de Inicio *</label>
              <input type="datetime-local" id="promo-start" required class="w-full px-3.5 py-2.5 border border-slate-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-electric-blue" value="${promo.start_date || ''}" />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Fecha de Fin (Vencimiento) *</label>
              <input type="datetime-local" id="promo-end" required class="w-full px-3.5 py-2.5 border border-slate-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-electric-blue" value="${promo.end_date || ''}" />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-slate-border">
            <a href="#/promotions" class="px-4 py-2 text-xs font-bold rounded-xl border border-slate-border text-gray-600 hover:bg-slate-100 transition">Cancelar</a>
            <button type="submit" id="btn-save-promo" class="px-5 py-2.5 text-xs font-bold bg-electric-blue text-white rounded-xl hover:bg-blue-700 transition shadow-sm cursor-pointer">
              ${isEdit ? 'Actualizar Promoción' : 'Guardar Promoción'}
            </button>
          </div>
        </form>
      </div>
    `;
  },

  async bindEvents() {
    const productSelect = document.getElementById('promo-product-id');
    const form = document.getElementById('promo-form');

    // Cargar productos
    try {
      const data = await ProductService.list();
      this.products = data.results || [];
      if (productSelect) {
        productSelect.innerHTML = '<option value="">-- Seleccionar un producto del catálogo --</option>' +
          this.products.map(p => {
            const price = Number(p.price_usd || (p.price ? p.price / 4200 : 0)).toFixed(2);
            const isSel = String(p.id) === String(this.currentPromo?.product_id);
            return `<option value="${p.id}" ${isSel ? 'selected' : ''}>${p.name} ($${price} USD)</option>`;
          }).join('');

        if (this.currentPromo?.product_id) {
          this.selectedProduct = this.products.find(p => String(p.id) === String(this.currentPromo.product_id));
        }
      }
    } catch (err) {
      console.warn('Error al cargar productos para promoción:', err);
    }

    const updateCalculations = () => {
      const prodId = productSelect?.value;
      const prod = this.products.find(p => String(p.id) === String(prodId));
      this.selectedProduct = prod || null;

      const origEl = document.getElementById('promo-calc-original');
      const discEl = document.getElementById('promo-calc-discount');
      const finalEl = document.getElementById('promo-calc-final');
      const previewImg = document.getElementById('promo-image-preview-container');

      const origPrice = Number(prod?.price_usd || (prod?.price ? prod.price / 4200 : 0)) || 0;
      const type = document.getElementById('promo-discount-type')?.value || 'percentage';
      const val = parseFloat(document.getElementById('promo-discount-value')?.value) || 0;

      let discountAmount = 0;
      if (type === 'percentage') {
        discountAmount = (origPrice * val) / 100;
        if (discEl) discEl.textContent = `${val}% OFF (-$${discountAmount.toFixed(2)} USD)`;
      } else {
        discountAmount = val;
        if (discEl) discEl.textContent = `-$${discountAmount.toFixed(2)} USD`;
      }

      const finalPrice = Math.max(0, origPrice - discountAmount);

      if (origEl) origEl.textContent = `$${origPrice.toFixed(2)} USD`;
      if (finalEl) finalEl.textContent = `$${finalPrice.toFixed(2)} USD`;

      // Si no hay imagen personalizada subida, usar la del producto
      if (!this.previewImageUrl && prod && previewImg) {
        const prodImg = (prod.images && prod.images[0]?.image) || prod.product_image || '';
        if (prodImg) {
          previewImg.innerHTML = `<img src="${prodImg}" class="w-full h-full object-cover" />`;
        }
      }
    };

    productSelect?.addEventListener('change', updateCalculations);

    // Tipo de descuento (actualizar sufijo y cálculos)
    const discountTypeSelect = document.getElementById('promo-discount-type');
    const discountSuffix = document.getElementById('promo-discount-suffix');
    const discountValInput = document.getElementById('promo-discount-value');

    discountTypeSelect?.addEventListener('change', (e) => {
      if (e.target.value === 'percentage') {
        if (discountSuffix) discountSuffix.textContent = '%';
        if (discountValInput) {
          discountValInput.max = '100';
          discountValInput.placeholder = '15';
        }
      } else {
        if (discountSuffix) discountSuffix.textContent = 'USD';
        if (discountValInput) {
          discountValInput.removeAttribute('max');
          discountValInput.placeholder = '50.00';
        }
      }
      updateCalculations();
    });

    discountValInput?.addEventListener('input', updateCalculations);

    // Preview inicial si hay producto seleccionado
    updateCalculations();

    // Archivo de imagen de la promo
    const imageInput = document.getElementById('promo-image-file');
    const previewContainer = document.getElementById('promo-image-preview-container');
    const btnRemoveImg = document.getElementById('btn-remove-promo-image');

    imageInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const base64 = await this.readFileAsBase64(file);
          this.previewImageUrl = base64;
          if (previewContainer) previewContainer.innerHTML = `<img src="${base64}" class="w-full h-full object-cover" />`;
          btnRemoveImg?.classList.remove('hidden');
        } catch (err) {
          Toast.show('Error al procesar la imagen', 'error');
        }
      }
    });

    btnRemoveImg?.addEventListener('click', () => {
      this.previewImageUrl = '';
      if (imageInput) imageInput.value = '';
      btnRemoveImg.classList.add('hidden');
      updateCalculations();
    });

    // Submit del formulario
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('promo-id').value;
      const prodId = productSelect.value;
      const name = document.getElementById('promo-name').value.trim();
      const discVal = parseFloat(document.getElementById('promo-discount-value').value);

      if (!prodId) {
        Toast.show('Seleccione un producto para la promoción', 'error');
        return;
      }

      if (isNaN(discVal) || discVal <= 0) {
        Toast.show('Indique un valor de descuento válido', 'error');
        return;
      }

      const prod = this.products.find(p => String(p.id) === String(prodId));

      const payload = {
        name,
        product_id: parseInt(prodId, 10),
        product: {
          id: parseInt(prodId, 10),
          name: prod ? prod.name : 'Producto',
          image: prod ? (prod.images?.[0]?.image || prod.product_image) : null
        },
        discount_type: document.getElementById('promo-discount-type').value,
        discounted_type: document.getElementById('promo-discount-type').value,
        discount_value: discVal,
        discounted_value: discVal,
        description: document.getElementById('promo-description').value.trim(),
        start_date: document.getElementById('promo-start').value,
        end_date: document.getElementById('promo-end').value,
        is_active: document.getElementById('promo-active').checked
      };

      if (this.previewImageUrl) {
        payload.image = this.previewImageUrl;
        payload.image_url = this.previewImageUrl;
      }

      const saveBtn = document.getElementById('btn-save-promo');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerText = 'Guardando...';
      }

      try {
        if (id) {
          await PromotionService.update(id, payload);
          Toast.show('Promoción actualizada con éxito', 'success');
        } else {
          await PromotionService.create(payload);
          Toast.show('Promoción creada con éxito', 'success');
        }
        window.location.hash = '#/promotions';
      } catch (err) {
        console.error(err);
        Toast.show('Error al guardar promoción: ' + (err.message || 'Error del servidor'), 'error');
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerText = id ? 'Actualizar Promoción' : 'Guardar Promoción';
        }
      }
    });
  }
};
