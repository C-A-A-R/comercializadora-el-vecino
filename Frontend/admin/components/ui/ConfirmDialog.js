import { Modal } from './Modal.js';

export class ConfirmDialog {
  static show({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) {
    return new Promise((resolve) => {
      // 1. Sanitizar el mensaje para asegurar que sea una cadena limpia de texto
      let messageContent = '';
      if (typeof message === 'string') {
        messageContent = message;
      } else if (message instanceof HTMLElement) {
        messageContent = message.textContent || message.innerText || '';
      } else if (!message) {
        messageContent = '¿Está seguro de realizar esta acción?';
      } else {
        messageContent = String(message);
      }

      // 2. Definir el ID único para esta instancia de modal de confirmación
      const modalId = `confirm-modal-${Date.now()}`;

      // 3. Crear el nodo de contenido interno (solo el párrafo, sin duplicar botones)
      const contentHtml = `
        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">${messageContent}</p>
      `;

      // 4. Instanciar el Modal nativo aprovechando su Footer integrado
      const modal = new Modal({
        id: modalId,
        title,
        content: contentHtml,
        confirmText,
        onConfirm: () => resolve(true)
      });

      modal.open();

      // 5. Ajustar dinámicamente las clases del botón de confirmación si es tipo 'danger' (rojo)
      setTimeout(() => {
        const confirmBtn = document.getElementById(`${modalId}-confirm`);
        if (confirmBtn && type === 'danger') {
          confirmBtn.className = 'px-4 py-2 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition';
        }

        // Manejar el cierre o la cancelación mediante el botón Cancelar o la X superior
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
          const closeTriggers = modalElement.querySelectorAll('.close-modal');
          closeTriggers.forEach(btn => {
            // Reasignar o interceptar el evento de cierre para que resuelva con `false`
            btn.addEventListener('click', () => resolve(false), { once: true });
          });
        }
      }, 0);
    });
  }
}