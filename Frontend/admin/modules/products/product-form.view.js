import { ProductService } from '../../services/product.service.js';
import { CategoryService } from '../../services/category.service.js';
import { Toast } from '../../components/ui/Toast.js';

export const ProductFormView = {
  categories: [],
  currentProduct: null,
  
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
      subcategory: '',
      is_active: true,
      features: []
    };

    // Cargar categorías del backend / mock
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
            subcategory: data.subcategory || '',
            features: data.features || data.specs || []
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
            <p class="text-sm text-gray-500">Complete la información general, categoría, subcategoría y especificaciones técnicas.</p>
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
            
            <!-- Categoría con botón para crear nueva categoría en Modal -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold text-gray-700 uppercase">Categoría *</label>
                <button type="button" id="btn-quick-category-modal" class="text-xs font-bold text-electric-blue hover:text-blue-800 flex items-center gap-0.5 cursor-pointer">
                  <span class="material-symbols-outlined text-sm">add_circle</span>
                  <span>+ Nueva Categoría</span>
                </button>
              </div>
              <select id="prod-category" required class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none bg-white">
                <option value="">-- Seleccione una categoría --</option>
                ${this.categories.map(cat => `
                  <option value="${cat.id}" ${String(cat.id) === String(currentCatId) ? 'selected' : ''}>
                    ${cat.name || cat.category_name}
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Subcategoría reactiva a la categoría seleccionada -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold text-gray-700 uppercase">Subcategoría</label>
                <span class="text-[10px] text-gray-400">Tipo de producto</span>
              </div>
              <select id="prod-subcategory" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none bg-white">
                <option value="">-- Seleccionar subcategoría --</option>
              </select>
            </div>
            
            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Marca *</label>
              <input type="text" id="prod-brand" required value="${product.brand || ''}" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="Ej. Samsung, LG, Oster...">
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
            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">Precio Referencial ($ USD) *</label>
              <input type="number" step="0.01" min="0" id="prod-price-usd" required value="${product.price_usd || ''}" class="w-full px-3 py-2 border border-slate-border rounded-lg text-sm focus:ring-2 focus:ring-electric-blue outline-none" placeholder="0.00">
            </div>

            <!-- IMAGEN DEL PRODUCTO -->
            <div class="md:col-span-2 border-t border-slate-border pt-4">
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-2">Imagen del Producto</label>
              <div class="flex items-start gap-6">
                <div id="image-preview-container" class="w-32 h-32 border-2 border-dashed border-slate-border rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
                  ${product.product_image || product.image 
                    ? `<img src="${product.product_image || product.image}" class="w-full h-full object-cover" id="current-image-preview">` 
                    : '<span class="text-gray-400 text-xs text-center px-2">Vista previa</span>'}
                </div>
                <div class="flex-1 space-y-2">
                  <input type="file" id="prod-image" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-electric-blue hover:file:bg-blue-100 cursor-pointer">
                  <p class="text-xs text-gray-500">Formatos: JPG, PNG. Se recomienda imagen cuadrada.</p>
                  ${product.product_image || product.image ? '<button type="button" id="btn-remove-image" class="text-xs text-red-500 hover:text-red-700 underline">Quitar imagen actual</button>' : ''}
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
              <button type="button" id="btn-add-feature" class="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition font-medium cursor-pointer">
                <span class="material-symbols-outlined text-base">add</span>
                Añadir
              </button>
            </div>
            <div id="features-container" class="space-y-2">
              ${initialFeaturesHtml}
            </div>
            <p class="text-xs text-gray-400 mt-2">Agregue características específicas como: Color, Garantía, Eficiencia energética, etc.</p>
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
            <button type="submit" id="btn-save-product" class="px-5 py-2 bg-electric-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition cursor-pointer shadow-sm">
              ${isEdit ? 'Actualizar Producto' : 'Guardar Producto'}
            </button>
          </div>
        </form>

        <!-- MODAL RÁPIDO PARA CREAR CATEGORÍA Y SUBCATEGORÍAS DIRECTAMENTE DESDE EL FORMULARIO -->
        <div id="modal-quick-category" class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 hidden">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-border w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div class="p-4 border-b border-slate-border flex items-center justify-between bg-slate-50">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-electric-blue text-lg">category</span>
                <h3 class="font-display font-bold text-sm text-deep-obsidian">Crear Nueva Categoría</h3>
              </div>
              <button type="button" id="btn-close-quick-cat" class="text-gray-400 hover:text-gray-700 p-1 rounded-lg">
                <span class="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <form id="form-quick-category" class="p-5 space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre de la Categoría *</label>
                <input type="text" id="quick-cat-name" required placeholder="Ej: Audio & Video, Climatización..." class="w-full px-3 py-2 border border-slate-border rounded-lg text-xs focus:ring-2 focus:ring-electric-blue outline-none" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Subcategorías (separadas por coma) *</label>
                <input type="text" id="quick-cat-tags" placeholder="Ej: Smart TV 4K, Barras de Sonido, Soportes..." class="w-full px-3 py-2 border border-slate-border rounded-lg text-xs focus:ring-2 focus:ring-electric-blue outline-none" />
                <p class="text-[10px] text-gray-400 mt-1">Escriba las subfamilias o tipos de producto separadas por coma.</p>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción Opcional</label>
                <textarea id="quick-cat-desc" rows="2" placeholder="Breve descripción..." class="w-full px-3 py-2 border border-slate-border rounded-lg text-xs focus:ring-2 focus:ring-electric-blue outline-none"></textarea>
              </div>
              <div class="pt-2 border-t border-slate-border flex justify-end gap-2">
                <button type="button" id="btn-cancel-quick-cat" class="px-3 py-1.5 border border-slate-border text-gray-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition">
                  Cancelar
                </button>
                <button type="submit" class="px-4 py-1.5 bg-electric-blue hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm">
                  Crear y Seleccionar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  updateSubcategoriesDropdown(categoryId, selectedSubcategory = '') {
    const subcatSelect = document.getElementById('prod-subcategory');
    if (!subcatSelect) return;

    subcatSelect.innerHTML = '<option value="">-- Seleccionar subcategoría --</option>';
    if (!categoryId) return;

    const cat = this.categories.find(c => String(c.id) === String(categoryId));
    if (cat && Array.isArray(cat.tags) && cat.tags.length > 0) {
      cat.tags.forEach(tag => {
        const opt = document.createElement('option');
        opt.value = tag;
        opt.textContent = tag;
        if (selectedSubcategory && (tag.toLowerCase() === selectedSubcategory.toLowerCase())) {
          opt.selected = true;
        }
        subcatSelect.appendChild(opt);
      });
    }

    // Si tiene una subcategoría guardada que no está en los tags, agregarla
    if (selectedSubcategory && !Array.from(subcatSelect.options).some(o => o.value.toLowerCase() === selectedSubcategory.toLowerCase())) {
      const customOpt = document.createElement('option');
      customOpt.value = selectedSubcategory;
      customOpt.textContent = selectedSubcategory;
      customOpt.selected = true;
      subcatSelect.appendChild(customOpt);
    }
  },

  bindEvents() {
    const form = document.getElementById('product-form');
    if (!form) return;

    const catSelect = document.getElementById('prod-category');
    const initialCatId = catSelect ? catSelect.value : '';
    const initialSubcat = this.currentProduct?.subcategory || '';

    // Poblar subcategorías iniciales
    if (initialCatId) {
      this.updateSubcategoriesDropdown(initialCatId, initialSubcat);
    }

    // Actualizar subcategorías al cambiar de categoría
    catSelect?.addEventListener('change', (e) => {
      this.updateSubcategoriesDropdown(e.target.value);
    });

    // Modal para crear nueva categoría en caliente
    const modalQuickCat = document.getElementById('modal-quick-category');
    const btnOpenQuickCat = document.getElementById('btn-quick-category-modal');
    const btnCloseQuickCat = document.getElementById('btn-close-quick-cat');
    const btnCancelQuickCat = document.getElementById('btn-cancel-quick-cat');
    const formQuickCat = document.getElementById('form-quick-category');

    btnOpenQuickCat?.addEventListener('click', () => {
      formQuickCat?.reset();
      modalQuickCat?.classList.remove('hidden');
    });

    const closeQuickModal = () => modalQuickCat?.classList.add('hidden');
    btnCloseQuickCat?.addEventListener('click', closeQuickModal);
    btnCancelQuickCat?.addEventListener('click', closeQuickModal);

    formQuickCat?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('quick-cat-name').value.trim();
      const tagsStr = document.getElementById('quick-cat-tags').value.trim();
      const desc = document.getElementById('quick-cat-desc').value.trim();

      const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

      try {
        await CategoryService.saveCategory({
          name,
          category_name: name,
          tags,
          description: desc,
          is_active: true
        });

        // Recargar categorías
        const catData = await CategoryService.listCategories();
        this.categories = catData.results || [];

        // Repoblar select de categorías y seleccionar la nueva
        if (catSelect) {
          catSelect.innerHTML = '<option value="">-- Seleccione una categoría --</option>' +
            this.categories.map(c => `<option value="${c.id}">${c.name || c.category_name}</option>`).join('');
          
          const newCreated = this.categories.find(c => (c.name || c.category_name).toLowerCase() === name.toLowerCase()) || this.categories[0];
          if (newCreated) {
            catSelect.value = newCreated.id;
            this.updateSubcategoriesDropdown(newCreated.id, tags[0] || '');
          }
        }

        Toast.show(`Categoría "${name}" creada y seleccionada con éxito`, 'success');
        closeQuickModal();
      } catch (err) {
        Toast.show('Error al crear la categoría', 'error');
      }
    });

    // 1. Lógica para añadir características dinámicas
    const featuresContainer = document.getElementById('features-container');
    const btnAddFeature = document.getElementById('btn-add-feature');
    
    if (btnAddFeature && featuresContainer) {
      btnAddFeature.addEventListener('click', () => {
        featuresContainer.insertAdjacentHTML('beforeend', this.renderFeatureRow());
      });

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
        imageInput.value = '';
        if (this.currentProduct) {
          this.currentProduct.product_image = null;
          this.currentProduct.image = null;
        }
      });
    }

    // 3. Submit del formulario
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const id = document.getElementById('product-id').value;
      const catVal = document.getElementById('prod-category').value;
      const subcatVal = document.getElementById('prod-subcategory').value;
      const usdVal = parseFloat(document.getElementById('prod-price-usd').value) || 0;

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
        subcategory: subcatVal,
        price_usd: usdVal,
        price: usdVal * 4200,
        stock: this.currentProduct?.stock ?? 10,
        description: document.getElementById('prod-description').value.trim(),
        is_active: document.getElementById('prod-active').checked,
        category_id: catVal ? parseInt(catVal, 10) : undefined,
        categories: catVal ? [parseInt(catVal, 10)] : [],
        features: features
      };

      if (imageInput && imageInput.files.length > 0) {
        try {
          const base64Image = await this.readFileAsBase64(imageInput.files[0]);
          payload.image = base64Image;
          payload.product_image = base64Image;
        } catch (err) {
          console.error('Error al procesar imagen:', err);
          Toast.show('Error al procesar la imagen', 'error');
          return;
        }
      } else if (this.currentProduct?.product_image === null) {
        payload.image = null;
        payload.product_image = null;
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
