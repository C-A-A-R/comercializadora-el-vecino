import { ProductService } from '../../services/product.service.js';
import { ComboService } from '../../services/combo.service.js';
import { Toast } from '../../components/ui/Toast.js';

export const ComboFormView = {
  allProducts: [],
  selectedItems: [],
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

            <!-- ✅ IMAGEN DEL COMBO (SUBIDA DE ARCHIVO CON PREVIEW) -->
            <div class="space-y-2 md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Imagen del Combo</label>
              <div class="flex items-start gap-6">
                <div id="combo-image-preview-container" class="w-32 h-32 border-2 border-dashed border-slate-border rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
                  <span class="text-gray-400 text-xs text-center px-2">Sin vista previa</span>
                </div>
                <div class="flex-1 space-y-2">
                  <input type="file" id="combo-image-file" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-electric-blue hover:file:bg-blue-100 cursor-pointer" />
                  <p class="text-xs text-gray-500">Formatos: JPG, PNG. Se recomienda imagen cuadrada.</p>
                  <button type="button" id="btn-remove-combo-image" class="text-xs text-red-500 hover:text-red-700 underline hidden">Quitar imagen</button>
                </div>
              </div>
            </div>

            <!-- ✅ CAMPOS DE DESCUENTO -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Tipo de Descuento</label>
              <select id="combo-discount-type" class="w-full border border-slate-border rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-electric-blue outline-none">
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Valor Fijo ($)</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Valor del Descuento</label>
              <div class="relative">
                <input type="number" id="combo-discount-value" min="0" step="0.01" class="w-full border border-slate-border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-electric-blue pr-8" placeholder="0" />
                <span id="discount-suffix" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">%</span>
              </div>
              <p class="text-xs text-gray-400">Ingrese el valor del descuento según el tipo seleccionado.</p>
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
                    <th class="p-3">Cantidad</th>
                    <th class="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody id="combo-items-body" class="divide-y divide-slate-border">
                  <tr><td colspan="3" class="p-4 text-center text-gray-400">No se han agregado productos al combo.</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Vigencia del Combo -->
          <div class="border-t border-slate-border pt-4 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <input type="datetime-local" id="combo-start" required class="w-full border border-slate-border rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                <input type="datetime-local" id="combo-end" required class="w-full border border-slate-border rounded-lg p-2.5 text-sm" />
              </div>
            </div>
            <div id="validation-msg" class="text-xs text-red-500 font-medium hidden"></div>
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
        ${this.allProducts.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
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

    // ✅ Preview de imagen con archivo
    const imageInput = document.getElementById('combo-image-file');
    const imagePreviewContainer = document.getElementById('combo-image-preview-container');
    const btnRemoveImage = document.getElementById('btn-remove-combo-image');

    if (imageInput && imagePreviewContainer) {
      imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const base64Image = await this.readFileAsBase64(file);
            this.previewImageUrl = base64Image;
            imagePreviewContainer.innerHTML = `<img src="${base64Image}" class="w-full h-full object-cover" />`;
            if (btnRemoveImage) btnRemoveImage.classList.remove('hidden');
          } catch (err) {
            console.error('Error al procesar imagen:', err);
            Toast.show('Error al procesar la imagen', 'error');
          }
        }
      });
    }

    if (btnRemoveImage) {
      btnRemoveImage.addEventListener('click', () => {
        imagePreviewContainer.innerHTML = '<span class="text-gray-400 text-xs text-center px-2">Sin vista previa</span>';
        imageInput.value = '';
        this.previewImageUrl = '';
        btnRemoveImage.classList.add('hidden');
      });
    }

    // ✅ Cambio de tipo de descuento (actualiza sufijo)
    const discountTypeSelect = document.getElementById('combo-discount-type');
    const discountSuffix = document.getElementById('discount-suffix');
    const discountValueInput = document.getElementById('combo-discount-value');

    if (discountTypeSelect && discountSuffix) {
      discountTypeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'percentage') {
          discountSuffix.textContent = '%';
          if (discountValueInput) {
            discountValueInput.max = '100';
            discountValueInput.placeholder = '0-100';
          }
        } else {
          discountSuffix.textContent = '$';
          if (discountValueInput) {
            discountValueInput.max = '';
            discountValueInput.placeholder = '0';
          }
        }
      });
    }

    document.getElementById('combo-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  },

  renderSelectedItems() {
    const tbody = document.getElementById('combo-items-body');
    if (this.selectedItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-gray-400">No se han agregado productos al combo.</td></tr>`;
      return;
    }
    tbody.innerHTML = this.selectedItems.map((item, index) => `
      <tr class="hover:bg-slate-50">
        <td class="p-3 font-medium text-gray-800">${item.product.name}</td>
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
    const totalItems = this.selectedItems.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
    const validationMsg = document.getElementById('validation-msg');
    const submitBtn = document.getElementById('submit-combo-btn');

    if (this.selectedItems.length > 0 && totalItems < 2) {
      if (validationMsg) {
        validationMsg.textContent = '⚠️ El combo debe incluir al menos 2 unidades/productos.';
        validationMsg.classList.remove('hidden');
      }
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    if (validationMsg) validationMsg.classList.add('hidden');
    if (submitBtn) submitBtn.disabled = false;
  },

  async handleSubmit() {
    const totalItems = this.selectedItems.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
    if (totalItems < 2) {
      Toast.show('El combo debe incluir al menos 2 productos', 'error');
      return;
    }

    const discountType = document.getElementById('combo-discount-type').value;
    const discountValue = parseFloat(document.getElementById('combo-discount-value').value) || 0;

    // Validación de descuento
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      Toast.show('El porcentaje de descuento debe estar entre 0 y 100', 'error');
      return;
    }
    if (discountType === 'fixed' && discountValue < 0) {
      Toast.show('El valor del descuento no puede ser negativo', 'error');
      return;
    }

    const payload = {
      name: document.getElementById('combo-name').value.trim(),
      description: document.getElementById('combo-description').value.trim(),
      image: this.previewImageUrl || null, // ✅ Imagen en Base64
      discount_type: discountType, // ✅ 'percentage' o 'fixed'
      discount_value: discountValue, // ✅ Valor numérico
      price_combo_usd: 0,
      price: 0,
      start_date: new Date(document.getElementById('combo-start').value).toISOString(),
      end_date: new Date(document.getElementById('combo-end').value).toISOString(),
      items: this.selectedItems.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
      is_active: true
    };

    try {
      await ComboService.create(payload);
      Toast.show('Combo promocional creado exitosamente', 'success');
      window.location.hash = '#/combos';
    } catch (err) {
      console.error(err);
      Toast.show('No se pudo guardar el combo promocional', 'error');
    }
  }
};