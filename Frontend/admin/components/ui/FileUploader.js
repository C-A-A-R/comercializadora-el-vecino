/**
 * Ubicación: components/ui/FileUploader.js
 * Descripción: Componente de subida de imágenes con Drag & Drop y vista previa.
 */

export class FileUploader {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Contenedor donde se montará
   * @param {Function} [options.onChange] - Callback con el archivo seleccionado
   * @param {string} [options.currentPreview] - URL inicial si se está editando
   */
  constructor({ container, onChange, currentPreview = null }) {
    this.container = container;
    this.onChange = onChange;
    this.currentPreview = currentPreview;
    this.file = null;
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="file-uploader flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-border rounded-lg bg-slate-surface text-center hover:border-electric-blue transition-colors cursor-pointer relative">
        <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
        <div class="uploader-content space-y-2 pointer-events-none">
          <span class="material-symbols-outlined text-4xl text-gray-400">cloud_upload</span>
          <p class="text-sm font-medium text-deep-obsidian">
            Arrastra tu imagen aquí o <span class="text-electric-blue font-semibold">explora</span>
          </p>
          <p class="text-xs text-gray-500">PNG, JPG, WEBP (Máx. 5MB)</p>
        </div>
        <div class="preview-container hidden w-full flex-col items-center space-y-2">
          <img src="" alt="Vista previa" class="max-h-48 rounded-lg object-contain border border-slate-border" />
          <button type="button" class="btn-remove text-xs text-red-600 hover:underline font-semibold">Cambiar imagen</button>
        </div>
      </div>
    `;

    this.input = this.container.querySelector('input[type="file"]');
    this.content = this.container.querySelector('.uploader-content');
    this.previewContainer = this.container.querySelector('.preview-container');
    this.imgPreview = this.previewContainer.querySelector('img');
    this.btnRemove = this.container.querySelector('.btn-remove');

    if (this.currentPreview) {
      this._showPreview(this.currentPreview);
    }

    this._bindEvents();
  }

  _bindEvents() {
    this.input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this._handleFile(file);
    });

    this.btnRemove.addEventListener('click', (e) => {
      e.stopPropagation();
      this._clear();
    });
  }

  _handleFile(file) {
    this.file = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this._showPreview(e.target.result);
      if (this.onChange) this.onChange(this.file);
    };
    reader.readAsDataURL(file);
  }

  _showPreview(src) {
    this.imgPreview.src = src;
    this.content.classList.add('hidden');
    this.previewContainer.classList.remove('hidden');
  }

  _clear() {
    this.file = null;
    this.input.value = '';
    this.imgPreview.src = '';
    this.previewContainer.classList.add('hidden');
    this.content.classList.remove('hidden');
    if (this.onChange) this.onChange(null);
  }
}