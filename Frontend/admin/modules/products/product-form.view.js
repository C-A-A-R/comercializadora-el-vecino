import { ProductService } from '../../services/product.service.js';
import { CategoryService } from '../../services/category.service.js';
import { Toast } from '../../components/ui/Toast.js';

export const ProductFormView = {
  categories: [],
  
  // Helper para leer archivo como Base64 (para enviar en JSON)
  readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Helper para renderizar una fila de característica
  renderFeatureRow(key = '', value = '') {
    return `
      <div class="feature-row flex gap-2 items-center">
        <input type="text" class="feat-key flex-1 px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Característica (ej. Color)" value="${key}">
        <input type="text" class="feat-val flex-1 px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Valor (ej. Blanco)" value="${value}">
        <button type="button" class="btn-remove-feature p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Eliminar">
          <span class="material-symbols-outlined text-base">delete</span>
        </button>
      </div>
    `;
  },

  async render(productId = null) {
    const isEdit = Boolean(productId);
    let product = {
      name: '',
      description: '',
      price_usd: '',
      stock: 10,
      brand: '',
      model: '',
      voltage: '110V',
      capacity: '',
      category_id: '',
      is_active: true,
      features: [] // Array para características dinámicas
    };

    // Cargar categorías del backend
    try {
      const catData = await CategoryService.listCategories();
      this.categories = catData.results || [];
    } catch (err) {
      console.warn('[ProductFormView] Error al cargar categorías:', err);
      this.categories = [];
    }

    if (isEdit) {
      try {
        const data = await ProductService.getById(productId);
        if (data) {
          product = {
            ...product,
            ...data,
            category_id: data.category?.id || (data.categories && data.categories[0]) || '',
            features: data.features || data.specs || [] // Asumimos que viene como array de objetos {key, value}
          };
        }
      } catch (err) {
        console.error('[ProductFormView] Error al cargar producto para edición:', err);
        Toast.show('Error al cargar datos del producto', 'error');
      }
    }

    this.currentProduct = product;
    const currentCatId = product.category_id || (product.category && product.category.id) || '';

    // Renderizar características iniciales si existen
    const initialFeaturesHtml = Array.isArray(product.features) 
      ? product.features.map(f => this.renderFeatureRow(f.key || f.name, f.value)).join('') 
      : '';

    return `
      <div class="space-y-6 max-w-4xl mx-auto">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-display text-2xl font-bold text-deep-obsidian">
              ${isEdit ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <p class="text-sm text-gray-500">Complete la información general y especificaciones técnicas para el catálogo.</p>
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
              <input type="text" id="prod-name" required value="${product.name || product.product_name || ''}" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Ej. Nevera Samsung 200L No Frost">
            </div>
            
            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Categoría *</label>
              <select id="prod-category" required class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none bg-white">
                <option value="">-- Seleccione una categoría --</option>
                ${this.categories.map(cat => `
                  <option value="${cat.id}" ${String(cat.id) === String(currentCatId) ? 'selected' : ''}>
                    ${cat.name || cat.category_name}
                  </option>
                `).join('')}
              </select>
            </div>
            
            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Marca *</label>
              <input type="text" id="prod-brand" required value="${product.brand || ''}" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Ej. Samsung">
            </div>
            
            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Capacidad / Modelo</label>
              <input type="text" id="prod-capacity" value="${product.capacity || product.model || ''}" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Ej. 600 Litros, 15 kg, etc.">
            </div>
            
            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Voltaje</label>
              <select id="prod-voltage" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none bg-white">
                <option value="110V" ${product.voltage === '110V' ? 'selected' : ''}>110V</option>
                <option value="220V" ${product.voltage === '220V' ? 'selected' : ''}>220V</option>
                <option value="110V/220V" ${product.voltage === '110V/220V' || product.voltage === 'Dual' ? 'selected' : ''}>Dual (110V/220V)</option>
              </select>
            </div>
            
            <!-- Precio -->
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Precio ($) *</label>
              <input type="number" step="0.01" min="0" id="prod-price-usd" required value="${product.price_usd || ''}" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="0.00">
            </div>

            <!-- IMAGEN DEL PRODUCTO -->
            <div class="md:col-span-2 border-t border-slate-border pt-4">
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-2">Imagen del Producto</label>
              <div class="flex items-start gap-6">
                <div id="image-preview-container" class="w-32 h-32 border-2 border-dashed border-slate-border rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
                  ${product.image 
                    ? `<img src="${product.image}" class="w-full h-full object-cover" id="current-image-preview">` 
                    : '<span class="text-gray-400 text-xs text-center px-2">Vista previa</span>'}
                </div>
                <div class="flex-1 space-y-2">
                  <input type="file" id="prod-image" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-electric-blue hover:file:bg-blue-100 cursor-pointer">
                  <p class="text-xs text-gray-500">Formatos: JPG, PNG. Se recomienda imagen cuadrada.</p>
                  ${product.image ? '<button type="button" id="btn-remove-image" class="text-xs text-red-500 hover:text-red-700 underline">Quitar imagen actual</button>' : ''}
                </div>
              </div>
            </div>
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Descripción Comercial</label>
            <textarea id="prod-description" rows="3" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Descripción general del producto...">${product.description || ''}</textarea>
          </div>

          <!-- CARACTERÍSTICAS DINÁMICAS -->
          <div class="border-t border-slate-border pt-4">
            <div class="flex items-center justify-between mb-3">
              <label class="block text-xs font-semibold text-gray-700 uppercase">Especificaciones Técnicas / Características</label>
              <button type="button" id="btn-add-feature" class="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition font-medium">
                <span class="material-symbols-outlined text-base">add</span>
                Añadir
              </button>
            </div>
            <div id="features-container" class="space-y-2">
              ${initialFeaturesHtml}
            </div>
            <p class="text-xs text-gray-400 mt-2">Agregue características específicas como: Color, Garantía, Tipo de motor, etc.</p>
          </div>

          <!-- Toggle Activo -->
          <div class="flex items-center gap-6 pt-2 border-t border-slate-border">
            <label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
              <input type="checkbox" id="prod-active" ${product.is_active !== false ? 'checked' : ''} class="w-4 h-4 text-electric-blue rounded border-gray-300">
              Producto Activo en Catálogo
            </label>
          </div>

          <!-- Acciones -->
          <div class="pt-4 border-t border-slate-border flex justify-end gap-3">
            <a href="#/products" class="px-4 py-2 border border-slate-border text-gray-600 rounded-lg text-sm font-medium hover:bg-slate-surface transition">Cancelar</a>
            <button type="submit" id="btn-save-product" class="px-5 py-2 bg-electric-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              ${isEdit ? 'Actualizar Producto' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    `;
  },

  bindEvents() {
    const form = document.getElementById('product-form');
    if (!form) return;

    // 1. Lógica para añadir características dinámicas
    const featuresContainer = document.getElementById('features-container');
    const btnAddFeature = document.getElementById('btn-add-feature');
    
    if (btnAddFeature && featuresContainer) {
      btnAddFeature.addEventListener('click', () => {
        featuresContainer.insertAdjacentHTML('beforeend', this.renderFeatureRow());
      });

      // Delegación de eventos para botones de eliminar característica
      featuresContainer.addEventListener('click', (e) => {
        const btnRemove = e.target.closest('.btn-remove-feature');
        if (btnRemove) {
          btnRemove.closest('.feature-row').remove();
        }
      });
    }

    // 2. Lógica para preview de imagen
    const imageInput = document.getElementById('prod-image');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const btnRemoveImage = document.getElementById('btn-remove-image');

    if (imageInput && imagePreviewContainer) {
      imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            imagePreviewContainer.innerHTML = `<img src="${ev.target.result}" class="w-full h-full object-cover">`;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (btnRemoveImage) {
      btnRemoveImage.addEventListener('click', () => {
        imagePreviewContainer.innerHTML = '<span class="text-gray-400 text-xs text-center px-2">Vista previa</span>';
        imageInput.value = ''; // Limpiar input
        this.currentProduct.image = null; // Marcar para borrar en backend si es necesario
      });
    }

    // 3. Submit del formulario
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const id = document.getElementById('product-id').value;
      const catVal = document.getElementById('prod-category').value;
      const usdVal = parseFloat(document.getElementById('prod-price-usd').value) || 0;

      // Recolectar características dinámicas
      const features = [];
      document.querySelectorAll('.feature-row').forEach(row => {
        const key = row.querySelector('.feat-key').value.trim();
        const value = row.querySelector('.feat-val').value.trim();
        if (key) {
          features.push({ key, value });
        }
      });

      const payload = {
        name: document.getElementById('prod-name').value.trim(),
        product_name: document.getElementById('prod-name').value.trim(),
        brand: document.getElementById('prod-brand').value.trim(),
        capacity: document.getElementById('prod-capacity').value.trim(),
        voltage: document.getElementById('prod-voltage').value,
        price_usd: usdVal,
        price: usdVal * 4200,
        stock: this.currentProduct?.stock ?? 10,
        description: document.getElementById('prod-description').value.trim(),
        is_active: document.getElementById('prod-active').checked,
        category_id: catVal ? parseInt(catVal, 10) : undefined,
        categories: catVal ? [parseInt(catVal, 10)] : [],
        features: features // Añadir características al payload
      };

      // Manejo de imagen (convertir a Base64 si hay archivo nuevo)
      if (imageInput && imageInput.files.length > 0) {
        try {
          const base64Image = await this.readFileAsBase64(imageInput.files[0]);
          payload.image = base64Image;
        } catch (err) {
          console.error('Error al procesar imagen:', err);
          Toast.show('Error al procesar la imagen', 'error');
          return;
        }
      } else if (this.currentProduct?.image === null) {
        // Si el usuario dio click en "Quitar imagen actual"
        payload.image = null; 
      }

      if (id) {
        payload.id = parseInt(id, 10) || id;
      }

      const submitBtn = document.getElementById('btn-save-product');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Guardando...';
      }

      try {
        await ProductService.save(payload);
        Toast.show(id ? 'Producto actualizado con éxito' : 'Producto creado con éxito', 'success');
        window.location.hash = '#/products';
      } catch (err) {
        console.error(err);
        Toast.show('Error al guardar producto: ' + (err.message || 'Error del servidor'), 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = id ? 'Actualizar Producto' : 'Guardar Producto';
        }
      }
    });
  }
};