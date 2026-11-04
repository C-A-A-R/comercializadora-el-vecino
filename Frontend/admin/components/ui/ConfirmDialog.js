import { Modal } from './Modal.js';

export class ConfirmDialog {
  static show({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) {
    return new Promise((resolve) => {
      const container = document.createElement('div');
      const confirmBtnClass = type === 'danger'
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : 'bg-electric-blue hover:bg-blue-700 text-white';

      // Sanitizar el mensaje
      let messageContent = '';
      if (typeof message === 'string') {
        messageContent = message;
      } else if (message instanceof HTMLElement) {
        messageContent = message.textContent || message.innerText || '';
        console.warn('[ConfirmDialog] Se recibió un elemento DOM. Extrayendo texto:', messageContent);
      } else if (message === null || message === undefined) {
        messageContent = '¿Está seguro de realizar esta acción?';
      } else {
        messageContent = String(message);
      }

      container.innerHTML = `
        <div class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">${messageContent}</p>
          <div class="flex justify-end gap-3 pt-4 border-t border-slate-border">
            <button id="btn-cancel" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              ${cancelText}
            </button>
            <button id="btn-confirm" class="px-4 py-2 text-sm font-semibold ${confirmBtnClass} rounded-lg shadow-sm transition-colors">
              ${confirmText}
            </button>
          </div>
        </div>
      `;

      const modal = new Modal({
        title,
        content: container,
        onClose: () => resolve(false)
      });

      modal.open();

      const btnCancel = container.querySelector('#btn-cancel');
      const btnConfirm = container.querySelector('#btn-confirm');

      btnCancel.addEventListener('click', () => {
        modal.close();
        resolve(false);
      });

      btnConfirm.addEventListener('click', () => {
        modal.close();
        resolve(true);
      });
    });
  }
}