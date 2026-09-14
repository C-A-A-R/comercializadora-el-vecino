/**
 * toast.js - Reusable floating toast notification system
 */

const Toast = {
  container: null,

  init() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },

  show(message, type = 'info', title = null, duration = 3500) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    const iconMap = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    const iconName = iconMap[type] || 'notifications';

    const defaultTitles = {
      success: 'Completado',
      error: 'Atención',
      warning: 'Aviso',
      info: 'Notificación'
    };
    const toastTitle = title || defaultTitles[type] || 'EL VECINO';

    toast.innerHTML = `
      <div class="toast-icon">
        <span class="material-symbols-outlined">${iconName}</span>
      </div>
      <div class="toast-content">
        <div class="toast-title">${toastTitle}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" type="button" aria-label="Cerrar">
        <span class="material-symbols-outlined">close</span>
      </button>
      <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
    `;

    this.container.appendChild(toast);

    // Trigger transition
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    const closeBtn = toast.querySelector('.toast-close');
    let timeoutId;

    const dismiss = () => {
      if (timeoutId) clearTimeout(timeoutId);
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 350);
    };

    closeBtn.addEventListener('click', dismiss);
    timeoutId = setTimeout(dismiss, duration);

    return { dismiss };
  },

  success(msg, title = 'Éxito', duration = 3500) {
    return this.show(msg, 'success', title, duration);
  },

  error(msg, title = 'Error', duration = 4000) {
    return this.show(msg, 'error', title, duration);
  },

  info(msg, title = 'Información', duration = 3500) {
    return this.show(msg, 'info', title, duration);
  },

  warning(msg, title = 'Advertencia', duration = 3500) {
    return this.show(msg, 'warning', title, duration);
  }
};

if (typeof window !== 'undefined') {
  window.Toast = Toast;
}
