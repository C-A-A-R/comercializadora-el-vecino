import { ProductService } from '../../services/product.service.js';
import { ComboService } from '../../services/combo.service.js';
import { ComboBuilder } from './combo.builder.js';
import { Toast } from '../../components/ui/Toast.js';

export const ComboFormView = {
  allProducts: [],
  selectedItems: [],
  imageSourceData: '',

  async render() {
    return `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-deep-obsidian font-display">Armar Nuevo Combo Promocional</h1>
            <p class="text-sm text-gray-500">Combina productos y calcula cotizaciones rápidas en USD para ventas por WhatsApp.</p>
          </div>
          <a href="#/combos" class="text-sm text-gray-500 hover:text-gray-700">← Volver a combos</a>
        </div>

        <form id="combo-form" class="bg-white p-6 rounded-xl shadow-sm border border-slate-border space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2 md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Nombre del Combo</label>
              <input type="text" id="combo-name" required class="w-full border border-slate-border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-electric-blue" placeholder="Ej: Combo Equipamiento Cocina Premium" />
            </div>

            <div class="space-y-2 md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Descripción Promocional</label>
              <textarea id="combo-description" rows="2" class="w-full border border-slate-border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-electric-blue" placeholder="Detalles de los beneficios u oferta especial del combo..."></textarea>
            </div>

            <!-- Carga Híbrida de Imagen (Archivo o URL) -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">Imagen del Combo</label>
              
              <!-- Subir Archivo Local -->
              <div>
                <span class="block text-xs text-gray-500 mb-1">Adjuntar archivo desde tu equipo:</span>
                <input type="file" id="combo-image-file" accept="image/*" class="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-gray-700 hover:file:bg-slate-200 cursor-pointer" />
              </div>

              <div class="relative flex py-1 items-center">
                <div class="flex-grow border-t border-slate-200"></div>
                <span class="flex-shrink mx-2 text-[10px] text-gray-400 uppercase font-semibold">o mediante enlace</span>
                <div class="flex-grow border-t border-slate-200"></div>
              </div>

              <!-- Entrada por URL -->
              <div>
                <input type="url" id="combo-image-url" class="w-full border border-slate-border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-electric-blue" placeholder="https://ejemplo.com/imagen.jpg" />
              </div>
            </div>

            <!-- Previsualización de Imagen -->
            <div class="flex flex-col items-center justify-center border border-dashed border-slate-border rounded-lg p-3 bg-slate-50 min-h-[140px]">
              <div id="image-preview-container" class="text-center text-xs text-gray-400">
                <span class="material-symbols-outlined text-3xl block text-gray-300 mb-1">image</span>
                <span>Sin vista previa de imagen</span>
              </div>
            </div>
          </div>

          <!-- Selector de Productos del Combo -->
          <div class="border-t border-slate-border pt-4 space-y-4">
            <h3 class="text-sm font-bold text-gray-700">Productos del Combo (Mínimo 2 productos)</h3>
            <div class="flex gap-2">
              <select id="combo-product-select" class="flex-1 border border-slate-border rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-electric-blue outline-none">
                <option value="">-- Seleccionar producto para agregar --</option>
              </select>
              <button type="button" id="add-product-btn" class="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors">Agregar</button>
            </div>

            <div class="border border-slate-border rounded-lg overflow-hidden">
              <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 text-gray-600 border-b border-slate-border">
                  <tr>
                    <th class="p-3">Producto</th>
                    <th class="p-3">Precio Unitario (USD)</th>
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

          <!-- Definición de Precios y Calculadora -->
          <div class="border-t border-slate-border pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Precio Oferta del Combo ($ USD)</label>
                <input type="number" id="combo-price-usd" step="0.01" min="0.01" required class="w-full border border-slate-border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-electric-blue" placeholder="Ej: 850.00" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-medium text-gray-600">Inicio (Opcional)</label>
                  <input type="datetime-local" id="combo-start" class="w-full border border-slate-border rounded-lg p-2 text-xs" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600">Fin (Opcional)</label>
                  <input type="datetime-local" id="combo-end" class="w-full border border-slate-border rounded-lg p-2 text-xs" />
                </div>
              </div>
            </div>

            <!-- Resumen de Ahorro para Comercial -->
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
              <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                <span>Resumen Comercial del Combo</span>
                <span class="text-electric-blue bg-blue-100 text-[10px] px-2 py-0.5 rounded-full font-semibold">USD</span>
              </h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">Suma Precios Regulares:</span>
                  <span id="calc-regular-usd" class="font-semibold text-gray-800">$0.00 USD</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Precio Combo Especial:</span>
                  <span id="calc-combo-usd" class="font-semibold text-electric-blue">$0.00 USD</span>
                </div>
                <div class="flex justify-between border-t border-slate-200 pt-2">
                  <span class="font-bold text-gray-700">Ahorro para el Cliente:</span>
                  <span id="calc-saved-usd" class="font-bold text-neon-magenta">$0.00 USD (0%)</span>
                </div>
              </div>
              <div id="validation-msg" class="text-xs text-red-500 font-medium hidden"></div>
            </div>
          </div>

          <!-- Mensaje Generado para WhatsApp -->
          <div class="border-t border-slate-border pt-4">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-bold text-gray-700">Texto generado para enviar por WhatsApp:</span>
              <button type="button" id="copy-combo-ws-btn" class="text-xs text-whatsapp-green font-bold hover:underline flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">content_copy</span> Copiar Oferta Combo
              </button>
            </div>
            <textarea id="combo-whatsapp-template" readonly class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-gray-700 font-mono h-24 outline-none resize-none" placeholder="Agrega productos y asigna un precio comercial para ver la plantilla del chat..."></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-slate-border">
            <a href="#/combos" class="px-4 py-2 text-sm rounded-lg border border-slate-border text-gray-600 hover:bg-slate-100">Cancelar</a>
            <button type="submit" id="submit-combo-btn" class="px-4 py-2 text-sm bg-electric-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Guardar Combo Interno</button>
          </div>
        </form>
      </div>
    `;
  },

  async bindEvents() {
    this.selectedItems = [];
    this.imageSourceData = '';
    const select = document.getElementById('combo-product-select');
    const fileInput = document.getElementById('combo-image-file');
    const urlInput = document.getElementById('combo-image-url');

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

    // Evento: Carga por Archivo Local
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        urlInput.value = ''; // Limpiar el campo URL si subió archivo
        const reader = new FileReader();
        reader.onload = (event) => {
          this.imageSourceData = event.target.result;
          this.renderImagePreview(this.imageSourceData);
        };
        reader.readAsDataURL(file);
      }
    });

    // Evento: Carga por URL
    urlInput?.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      if (url) {
        if (fileInput) fileInput.value = ''; // Limpiar archivo seleccionado
        this.imageSourceData = url;
        this.renderImagePreview(url);
      } else if (!fileInput.files.length) {
        this.imageSourceData = '';
        this.renderImagePreview('');
      }
    });

    document.getElementById('add-product-btn')?.addEventListener('click', () => {
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

    document.getElementById('combo-price-usd')?.addEventListener('input', () => this.updateCalculations());
    document.getElementById('combo-name')?.addEventListener('input', () => this.updateCalculations());

    document.getElementById('copy-combo-ws-btn')?.addEventListener('click', () => {
      const text = document.getElementById('combo-whatsapp-template').value;
      if (!text) return;
      navigator.clipboard.writeText(text);
      Toast.show({ message: '¡Detalle del combo copiado para enviar por WhatsApp!', type: 'success' });
    });

    document.getElementById('combo-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  },

  renderImagePreview(src) {
    const container = document.getElementById('image-preview-container');
    if (src) {
      container.innerHTML = `<img src="${src}" class="max-h-28 mx-auto rounded-lg border border-slate-200 shadow-sm" onError="this.onerror=null;this.parentElement.innerHTML='<span class=\'text-red-500 text-xs\'>URL o archivo de imagen no válido</span>';" />`;
    } else {
      container.innerHTML = `
        <span class="material-symbols-outlined text-3xl block text-gray-300 mb-1">image</span>
        <span>Sin vista previa de imagen</span>
      `;
    }
  },

  renderSelectedItems() {
    const tbody = document.getElementById('combo-items-body');
    if (this.selectedItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-400">No se han agregado productos al combo.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.selectedItems.map((item, index) => `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-3 font-medium text-gray-800">${item.product.name}</td>
        <td class="p-3 text-gray-600">$${item.product.price_usd} USD</td>
        <td class="p-3">
          <input type="number" min="1" value="${item.quantity}" data-index="${index}" class="item-qty-input w-16 border border-slate-border rounded p-1 text-center outline-none focus:ring-1 focus:ring-electric-blue" />
        </td>
        <td class="p-3 text-right">
          <button type="button" data-remove-index="${index}" class="text-red-500 hover:text-red-700 text-xs font-semibold">Eliminar</button>
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
    const comboName = document.getElementById('combo-name').value || 'Combo Promocional';
    const calc = ComboBuilder.calculateTotals(this.selectedItems, comboPriceUsd);

    document.getElementById('calc-regular-usd').textContent = `${calc.regularTotalUsdFormatted} USD`;
    document.getElementById('calc-combo-usd').textContent = `${calc.offerPriceUsdFormatted} USD`;
    document.getElementById('calc-saved-usd').textContent = `${calc.savedUsdFormatted} USD (${calc.savedPercentage})`;

    const validationMsg = document.getElementById('validation-msg');
    const submitBtn = document.getElementById('submit-combo-btn');

    if (this.selectedItems.length > 0) {
      if (!calc.isValidProductCount) {
        validationMsg.textContent = '⚠️ El combo debe incluir al menos 2 unidades / productos.';
        validationMsg.classList.remove('hidden');
        submitBtn.disabled = true;
      } else if (comboPriceUsd >= calc.regularTotalUsd) {
        validationMsg.textContent = '⚠️ El precio de la oferta debe ser menor a la suma total ($' + calc.regularTotalUsd + ' USD).';
        validationMsg.classList.remove('hidden');
        submitBtn.disabled = true;
      } else {
        validationMsg.classList.add('hidden');
        submitBtn.disabled = false;
      }
    } else {
      validationMsg.classList.add('hidden');
      submitBtn.disabled = false;
    }

    // Actualizar Texto de Oferta para WhatsApp
    const itemsListText = this.selectedItems.map(i => ` • ${i.quantity}x ${i.product.name}`).join('\n');
    const wsText = `¡Hola! 👋 Mira esta súper oferta especial en combo que armamos para ti en El Vecino:\n\n` +
      `📦 *${comboName}*\n` +
      `Incluye:\n${itemsListText || ' • (Selecciona productos)'}\n\n` +
      `💰 *Precio de Lista:* ${calc.regularTotalUsdFormatted} USD\n` +
      `🔥 *Precio Combo Especial:* ${calc.offerPriceUsdFormatted} USD (Ahorras ${calc.savedUsdFormatted} USD)\n\n` +
      `¿Te lo dejamos apartado de una vez? 🛒✨`;

    document.getElementById('combo-whatsapp-template').value = wsText;
  },

  async handleSubmit() {
    const comboPriceUsd = parseFloat(document.getElementById('combo-price-usd').value) || 0;
    const calc = ComboBuilder.calculateTotals(this.selectedItems, comboPriceUsd);

    if (!calc.isValid) {
      Toast.show({ message: 'El combo requiere mínimo 2 productos y un precio oferta inferior al precio lista', type: 'error' });
      return;
    }

    const startVal = document.getElementById('combo-start').value;
    const endVal = document.getElementById('combo-end').value;

    const startDate = startVal ? new Date(startVal) : new Date();
    const endDate = endVal ? new Date(endVal) : new Date(Date.now() + 60*24*60*60*1000); // 60 días por defecto

    const payload = {
      name: document.getElementById('combo-name').value,
      description: document.getElementById('combo-description').value,
      image_url: this.imageSourceData, // Guarda o la DataURL (Base64) o el link de la URL
      price_combo_usd: comboPriceUsd,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      items: this.selectedItems.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
      is_active: true
    };

    try {
      await ComboService.create(payload);
      Toast.show({ message: 'Combo promocional registrado exitosamente', type: 'success' });
      window.location.hash = '#/combos';
    } catch (err) {
      Toast.show({ message: 'No se pudo guardar el combo promocional', type: 'error' });
    }
  }
};