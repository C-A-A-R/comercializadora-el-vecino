import { ProductService } from '../../services/product.service.js';
import { ComboService } from '../../services/combo.service.js';
import { Toast } from '../../components/ui/Toast.js';

export const ComboFormView = {
  allProducts: [],
  selectedItems: [],
  previewImageUrl: '',
  currentCombo: null,

  // Helper para leer archivo como Base64
  readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async render(comboId = null) {
    const isEdit = Boolean(comboId);
    let combo = {
      name: '',
      description: '',
      price_combo_usd: '',
      start_date: new Date().toISOString().slice(0, 16),
      end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
      items: [],
      image: null
    };

    if (isEdit) {
      try {
        const data = await ComboService.getById(comboId);
        if (data) {
          combo = {
            ...combo,
            ...data,
            start_date: data.start_date ? new Date(data.start_date).toISOString().slice(0, 16) : combo.start_date,
            end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : combo.end_date
          };
          this.previewImageUrl = data.image || data.image_url || '';
        }
      } catch (err) {
        console.error('[ComboFormView] Error al cargar combo para edición:', err);
        Toast.show('Error al cargar datos del combo', 'error');
      }
    } else {
      this.previewImageUrl = '';
    }

    this.currentCombo = combo;

    return `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold uppercase tracking-wider text-electric-blue bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                Combos & Paquetes
              </span>
              <span class="text-xs text-gray-400">/</span>
              <span class="text-xs font-semibold text-gray-500">${isEdit ? 'Editar Combo' : 'Nuevo Combo'}</span>
            </div>
            <h1 class="text-2xl font-bold text-deep-obsidian font-display">
              ${isEdit ? 'Editar Combo Promocional' : 'Armar Nuevo Combo'}
            </h1>
            <p class="text-sm text-gray-500">Agrupe productos del catálogo y asigne un precio fijo cerrado por paquete.</p>
          </div>
          <a href="#/combos" class="px-4 py-2 border border-slate-border text-gray-600 rounded-lg text-xs font-bold hover:bg-slate-surface transition flex items-center gap-1">
            ← Volver a combos
          </a>
        </div>

        <form id="combo-form" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-border space-y-6">
          <input type="hidden" id="combo-id" value="${comboId || ''}">

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Nombre del Combo -->
            <div class="space-y-1.5 md:col-span-2">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre del Combo *</label>
              <input 
                type="text" 
                id="combo-name" 
                required 
                class="w-full px-3.5 py-2.5 border border-slate-border rounded-xl text-sm focus:ring-2 focus:ring-electric-blue outline-none" 
                placeholder="Ej: Combo Cocina Completa (Nevera + Microondas)" 
                value="${combo.name || ''}"
              />
            </div>

            <!-- Descripción Promocional -->
            <div class="space-y-1.5 md:col-span-2">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Descripción Promocional</label>
              <textarea 
                id="combo-description" 
                rows="2" 
                class="w-full px-3.5 py-2.5 border border-slate-border rounded-xl text-sm focus:ring-2 focus:ring-electric-blue outline-none" 
                placeholder="Detalles de la oferta, beneficios y ahorro..."
              >${combo.description || ''}</textarea>
            </div>

            <!-- IMAGEN DEL COMBO (SUBIDA DE ARCHIVO CON PREVIEW) -->
            <div class="space-y-1.5 md:col-span-2">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Imagen del Combo</label>
              <div class="flex items-start gap-6">
                <div id="combo-image-preview-container" class="w-32 h-32 border-2 border-dashed border-slate-border rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
                  ${this.previewImageUrl 
                    ? `<img src="${this.previewImageUrl}" class="w-full h-full object-cover" />` 
                    : '<span class="text-gray-400 text-xs text-center px-2">Sin vista previa</span>'}
                </div>
                <div class="flex-1 space-y-2">
                  <input type="file" id="combo-image-file" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-electric-blue hover:file:bg-blue-100 cursor-pointer" />
                  <p class="text-xs text-gray-500">Formatos recomendados: JPG o PNG cuadrados.</p>
                  <button type="button" id="btn-remove-combo-image" class="text-xs text-red-500 hover:text-red-700 underline ${this.previewImageUrl ? '' : 'hidden'}">Quitar imagen</button>
                </div>
              </div>
            </div>

            <!-- PRECIO FIJO DEL COMBO (SIN DESCUENTOS, PRECIO CERRADO) -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Precio Fijo del Combo ($ USD) *</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">$</span>
                <input 
                  type="number" 
                  id="combo-fixed-price-usd" 
                  required 
                  min="0" 
                  step="0.01" 
                  class="w-full pl-8 pr-3.5 py-2.5 border border-slate-border rounded-xl text-sm font-bold text-deep-obsidian focus:ring-2 focus:ring-electric-blue outline-none" 
                  placeholder="0.00" 
                  value="${combo.price_combo_usd || ''}"
                />
              </div>
              <p class="text-xs text-gray-400">Precio fijo del paquete completo para cotización directa.</p>
            </div>

            <!-- Comparativa Dinámica de Precios & Ahorro -->
            <div class="space-y-1.5 flex flex-col justify-end">
              <div class="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200/70 space-y-1.5">
                <div class="flex items-center justify-between text-xs text-gray-600">
                  <span>Suma individual referencial:</span>
                  <strong id="combo-sum-individual" class="text-gray-800">$0.00 USD</strong>
                </div>
                <div class="flex items-center justify-between text-xs font-bold text-deep-obsidian">
                  <span>Precio Fijo del Combo:</span>
                  <strong id="combo-display-fixed" class="text-electric-blue">$0.00 USD</strong>
                </div>
                <div class="flex items-center justify-between text-xs font-bold text-emerald-700 border-t border-blue-200/70 pt-1">
                  <span>Ahorro para el cliente:</span>
                  <span id="combo-calculated-savings" class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">$0.00 (0%)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Selector de Productos Incluidos en el Combo -->
          <div class="border-t border-slate-border pt-5 space-y-4">
            <div>
              <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wider">Productos Incluidos (Mínimo 2 productos) *</h3>
              <p class="text-xs text-gray-400">Seleccione los productos individuales que conforman este combo comercial.</p>
            </div>

            <div class="flex gap-2">
              <select id="combo-product-select" class="flex-1 border border-slate-border rounded-xl p-2.5 text-xs bg-white focus:ring-2 focus:ring-electric-blue outline-none cursor-pointer">
                <option value="">-- Seleccionar producto para agregar --</option>
              </select>
              <button type="button" id="add-product-btn" class="px-4 py-2.5 bg-deep-obsidian text-white rounded-xl text-xs font-bold hover:bg-black transition flex items-center gap-1 cursor-pointer shadow-xs">
                <span class="material-symbols-outlined text-base">add</span>
                <span>Agregar</span>
              </button>
            </div>

            <div class="border border-slate-border rounded-xl overflow-hidden shadow-xs">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-surface text-gray-600 font-bold uppercase tracking-wider border-b border-slate-border">
                  <tr>
                    <th class="p-3">Producto</th>
                    <th class="p-3">Precio Ref.</th>
                    <th class="p-3 text-center">Cantidad</th>
                    <th class="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody id="combo-items-body" class="divide-y divide-slate-border">
                  <tr><td colspan="4" class="p-6 text-center text-gray-400">No se han agregado productos al combo.</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Vigencia del Combo -->
          <div class="border-t border-slate-border pt-5 space-y-4">
            <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wider">Periodo de Vigencia</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Fecha de Inicio *</label>
                <input type="datetime-local" id="combo-start" required class="w-full border border-slate-border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-electric-blue" value="${combo.start_date || ''}" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Fecha de Fin (Vencimiento) *</label>
                <input type="datetime-local" id="combo-end" required class="w-full border border-slate-border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-electric-blue" value="${combo.end_date || ''}" />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-slate-border">
            <a href="#/combos" class="px-4 py-2 text-xs font-bold rounded-xl border border-slate-border text-gray-600 hover:bg-slate-100 transition">Cancelar</a>
            <button type="submit" id="submit-combo-btn" class="px-5 py-2.5 text-xs font-bold bg-electric-blue text-white rounded-xl hover:bg-blue-700 transition cursor-pointer shadow-sm">
              ${isEdit ? 'Actualizar Combo' : 'Guardar Combo'}
            </button>
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
      if (select) {
        select.innerHTML = `
          <option value="">-- Seleccionar producto para agregar --</option>
          ${this.allProducts.map(p => `
            <option value="${p.id}" data-price="${p.price_usd || (p.price ? (p.price / 4200) : 0)}">
              ${p.name} ($${Number(p.price_usd || (p.price ? p.price / 4200 : 0)).toFixed(2)} USD)
            </option>
          `).join('')}
        `;
      }

      // Si estamos editando y hay items previos
      if (this.currentCombo && Array.isArray(this.currentCombo.items) && this.currentCombo.items.length > 0) {
        this.selectedItems = this.currentCombo.items.map(item => {
          const prodId = item.product?.id || item.product;
          const fullProd = this.allProducts.find(p => String(p.id) === String(prodId)) || item.product;
          return {
            product: fullProd,
            quantity: Number(item.quantity) || 1
          };
        });
        this.renderSelectedItems();
        this.updateCalculations();
      }
    } catch (err) {
      Toast.show('Error al cargar catálogo de productos', 'error');
    }

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

    // Preview de imagen
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
        if (imageInput) imageInput.value = '';
        this.previewImageUrl = '';
        btnRemoveImage.classList.add('hidden');
      });
    }

    // Actualizar cálculos cuando el usuario escribe el precio fijo del combo
    document.getElementById('combo-fixed-price-usd')?.addEventListener('input', () => {
      this.updateCalculations();
    });

    document.getElementById('combo-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  },

  updateCalculations() {
    let sumIndividual = 0;
    this.selectedItems.forEach(item => {
      const p = item.product;
      const priceUsd = Number(p.price_usd || (p.price ? p.price / 4200 : 0)) || 0;
      sumIndividual += priceUsd * (item.quantity || 1);
    });

    const fixedPriceInput = document.getElementById('combo-fixed-price-usd');
    const fixedPrice = parseFloat(fixedPriceInput?.value) || 0;

    const sumEl = document.getElementById('combo-sum-individual');
    const fixedEl = document.getElementById('combo-display-fixed');
    const savingsEl = document.getElementById('combo-calculated-savings');

    if (sumEl) sumEl.textContent = `$${sumIndividual.toFixed(2)} USD`;
    if (fixedEl) fixedEl.textContent = `$${fixedPrice.toFixed(2)} USD`;

    if (savingsEl) {
      if (sumIndividual > 0 && fixedPrice > 0 && sumIndividual > fixedPrice) {
        const savingsUsd = sumIndividual - fixedPrice;
        const savingsPercent = Math.round((savingsUsd / sumIndividual) * 100);
        savingsEl.textContent = `$${savingsUsd.toFixed(2)} USD (${savingsPercent}% OFF)`;
        savingsEl.className = 'px-2 py-0.5 rounded bg-emerald-100 text-emerald-800';
      } else {
        savingsEl.textContent = 'Precio de lista';
        savingsEl.className = 'px-2 py-0.5 rounded bg-gray-100 text-gray-600';
      }
    }
  },

  renderSelectedItems() {
    const tbody = document.getElementById('combo-items-body');
    if (!tbody) return;

    if (this.selectedItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-gray-400">No se han agregado productos al combo.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.selectedItems.map((item, index) => {
      const p = item.product;
      const priceUsd = Number(p.price_usd || (p.price ? p.price / 4200 : 0)) || 0;

      return `
        <tr class="hover:bg-slate-50">
          <td class="p-3 font-medium text-gray-800">
            <div class="font-bold text-xs text-deep-obsidian">${p.name || p.product_name}</div>
            <div class="text-[10px] text-gray-400">${p.brand || 'El Vecino'}</div>
          </td>
          <td class="p-3 font-semibold text-gray-700">
            $${priceUsd.toFixed(2)} USD
          </td>
          <td class="p-3 text-center">
            <input 
              type="number" 
              min="1" 
              value="${item.quantity}" 
              data-index="${index}" 
              class="w-16 border border-slate-border rounded-lg p-1 text-center font-bold text-xs combo-qty-input" 
            />
          </td>
          <td class="p-3 text-right">
            <button type="button" data-index="${index}" class="text-red-500 hover:text-red-700 p-1 remove-combo-item" title="Eliminar">
              <span class="material-symbols-outlined text-base">delete</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.combo-qty-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = Number(e.target.dataset.index);
        const val = Math.max(1, parseInt(e.target.value) || 1);
        this.selectedItems[idx].quantity = val;
        this.updateCalculations();
      });
    });

    tbody.querySelectorAll('.remove-combo-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.currentTarget.dataset.index);
        this.selectedItems.splice(idx, 1);
        this.renderSelectedItems();
        this.updateCalculations();
      });
    });
  },

  async handleSubmit() {
    const id = document.getElementById('combo-id').value;
    const name = document.getElementById('combo-name').value.trim();
    const fixedPrice = parseFloat(document.getElementById('combo-fixed-price-usd').value);

    if (this.selectedItems.length < 2) {
      Toast.show('Un combo debe incluir al menos 2 productos del catálogo', 'error');
      return;
    }

    if (isNaN(fixedPrice) || fixedPrice <= 0) {
      Toast.show('Debe indicar un precio fijo válido para el combo', 'error');
      return;
    }

    const payload = {
      name,
      description: document.getElementById('combo-description').value.trim(),
      price_combo_usd: fixedPrice,
      price: fixedPrice * 4200,
      start_date: document.getElementById('combo-start').value,
      end_date: document.getElementById('combo-end').value,
      items: this.selectedItems.map(i => ({
        product_id: i.product.id,
        quantity: i.quantity
      }))
    };

    if (this.previewImageUrl) {
      payload.image = this.previewImageUrl;
      payload.image_url = this.previewImageUrl;
    }

    const submitBtn = document.getElementById('submit-combo-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Guardando combo...';
    }

    try {
      if (id) {
        await ComboService.update(id, payload);
        Toast.show('Combo actualizado con éxito', 'success');
      } else {
        await ComboService.create(payload);
        Toast.show('Combo creado con éxito con precio fijo', 'success');
      }
      window.location.hash = '#/combos';
    } catch (err) {
      console.error(err);
      Toast.show('Error al guardar combo: ' + (err.message || 'Error del servidor'), 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = id ? 'Actualizar Combo' : 'Guardar Combo';
      }
    }
  }
};
