export class Modal {
  constructor({ id, title, content, onConfirm, confirmText = 'Guardar' }) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.onConfirm = onConfirm;
    this.confirmText = confirmText;
    this.element = null;
  }

  render() {
    const modalHtml = `
      <div id="${this.id}" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-200">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden transform scale-95 transition-transform duration-200">
          <div class="px-6 py-4 border-b border-slate-border flex justify-between items-center">
            <h3 class="font-display font-bold text-lg text-deep-obsidian">${this.title}</h3>
            <button class="close-modal text-gray-400 hover:text-gray-600" aria-label="Cerrar modal">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="p-6">
            ${this.content}
          </div>
          <div class="px-6 py-4 bg-slate-surface border-t border-slate-border flex justify-end gap-3">
            <button class="close-modal px-4 py-2 rounded-lg border border-slate-border text-gray-600 hover:bg-gray-100 font-medium text-sm transition">Cancelar</button>
            <button id="${this.id}-confirm" class="px-4 py-2 rounded-lg bg-electric-blue text-white font-medium text-sm hover:bg-blue-700 transition">${this.confirmText}</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.element = document.getElementById(this.id);
    this.bindEvents();
  }

  bindEvents() {
    const closeBtns = this.element.querySelectorAll('.close-modal');
    closeBtns.forEach(btn => btn.addEventListener('click', () => this.close()));

    const confirmBtn = this.element.querySelector(`#${this.id}-confirm`);
    if (confirmBtn && this.onConfirm) {
      confirmBtn.addEventListener('click', () => {
        this.onConfirm();
        this.close();
      });
    }
  }

  open() {
    if (!this.element) this.render();
    setTimeout(() => {
      this.element.classList.remove('opacity-0', 'pointer-events-none');
      this.element.firstElementChild.classList.remove('scale-95');
    }, 10);
  }

  close() {
    if (!this.element) return;
    this.element.classList.add('opacity-0', 'pointer-events-none');
    this.element.firstElementChild.classList.add('scale-95');
    setTimeout(() => this.destroy(), 200);
  }

  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}