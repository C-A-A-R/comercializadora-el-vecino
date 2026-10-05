/**
 * Ubicación: components/ui/Toast.js
 * Descripción: Sistema global de notificaciones toast para la UI.
 */
export class Toast {
  static container = null;

  static _ensureContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none';
      document.body.appendChild(this.container);
    }
  }

  /**
   * Renderiza una notificación.
   * @param {string} message - Texto del mensaje
   * @param {'success' | 'error' | 'warning' | 'info'} [type='info'] - Tipo de notificación
   * @param {number} [duration=4000] - Tiempo de vida en ms
   */
  static show(message, type = 'info', duration = 4000) {
    this._ensureContainer();

    let text = message;
    let toastType = type;
    let toastDuration = duration;

    if (typeof message === 'object' && message !== null) {
      text = message.message || '';
      toastType = message.type || 'info';
      toastDuration = message.duration || 4000;
    }

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-center gap-3 p-4 rounded-lg shadow-lg text-white transition-all transform translate-y-2 opacity-0 text-sm font-medium ${this._getTypeStyles(toastType)}`;
    
    const icon = this._getIcon(toastType);
    toast.innerHTML = `
      <span class="material-symbols-outlined text-xl">${icon}</span>
      <span class="flex-1">${text}</span>
      <button class="toast-close opacity-70 hover:opacity-100 transition-opacity">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    `;

    this.container.appendChild(toast);

    // Animación de entrada
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    const closeToast = () => {
      toast.classList.add('opacity-0', 'translate-y-2');
      toast.addEventListener('transitionend', () => toast.remove());
    };

    toast.querySelector('.toast-close').addEventListener('click', closeToast);

    if (toastDuration > 0) {
      setTimeout(closeToast, toastDuration);
    }
  }

  static _getTypeStyles(type) {
    switch (type) {
      case 'success': return 'bg-emerald-600';
      case 'error': return 'bg-red-600';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-electric-blue';
    }
  }

  static _getIcon(type) {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }
}