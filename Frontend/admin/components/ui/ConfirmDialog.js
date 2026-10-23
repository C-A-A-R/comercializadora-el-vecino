import { Modal } from './Modal.js';

export class ConfirmDialog {
  /**
   * Muestra un diálogo modal de confirmación con promesa.
   * @param {Object} options
   * @param {string} options.title - Título del modal
   * @param {string} options.message - Texto o contenido explicativo
   * @param {string} [options.confirmText='Confirmar'] - Etiqueta del botón de confirmación
   * @param {string} [options.cancelText='Cancelar'] - Etiqueta del botón de cancelación
   * @param {'danger'|'primary'|'warning'} [options.type='danger'] - Tipo de diálogo para estilos
   * @returns {Promise<boolean>} Resuelve true si el usuario confirma, false si cancela o cierra
   */
  static show({ 
    title = 'Confirmación', 
    message = '¿Está seguro de realizar esta acción?', 
    confirmText = 'Confirmar', 
    cancelText = 'Cancelar', 
    type = 'danger' 
  }) {
    return new Promise((resolve) => {
      // Sanitizar mensaje
      let messageContent = '';
      if (typeof message === 'string') {
        messageContent = message;
      } else if (message instanceof HTMLElement) {
        messageContent = message.textContent || message.innerText || '';
      } else if (message === null || message === undefined) {
        messageContent = '¿Está seguro de realizar esta acción?';
      } else {
        messageContent = String(message);
      }

      const iconName = type === 'danger' ? 'warning' : (type === 'warning' ? 'help' : 'info');
      const iconColors = type === 'danger' 
        ? 'bg-rose-100 text-rose-600' 
        : (type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-electric-blue');
      const confirmBtnClass = type === 'danger'
        ? 'bg-rose-600 hover:bg-rose-700 text-white'
        : (type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-electric-blue hover:bg-blue-700 text-white');

      const bodyHtml = `
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${iconColors}">
            <span class="material-symbols-outlined text-2xl">${iconName}</span>
          </div>
          <div class="flex-1 pt-1">
            <p class="text-sm text-gray-700 leading-relaxed font-normal">${messageContent}</p>
          </div>
        </div>
      `;

      let hasResolved = false;

      const modal = new Modal({
        title,
        content: bodyHtml,
        confirmText,
        cancelText,
        confirmBtnClass,
        showFooter: true,
        onConfirm: () => {
          if (!hasResolved) {
            hasResolved = true;
            resolve(true);
          }
        },
        onClose: () => {
          if (!hasResolved) {
            hasResolved = true;
            resolve(false);
          }
        }
      });

      modal.open();
    });
  }
}