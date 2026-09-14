/**
 * Ubicación: components/ui/EmptyState.js
 * Descripción: Componente para representar visualmente la ausencia de datos o resultados de búsqueda.
 */

export class EmptyState {
  /**
   * Renderiza una vista o contenedor de estado vacío.
   * @param {Object} options
   * @param {string} [options.title='No hay resultados']
   * @param {string} [options.message='No se encontraron registros en este apartado.']
   * @param {string} [options.icon='inbox'] - Nombre del ícono Material Symbols
   * @param {string} [options.actionText] - Texto para botón secundario
   * @param {string} [options.actionId] - ID para enlazar el evento
   * @returns {string} HTML
   */
  static render({ title = 'No hay resultados', message = 'No se encontraron registros.', icon = 'inbox', actionText = null, actionId = null }) {
    return `
      <div class="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-slate-border my-4 space-y-3">
        <span class="material-symbols-outlined text-5xl text-gray-300">${icon}</span>
        <h3 class="text-lg font-semibold text-deep-obsidian">${title}</h3>
        <p class="text-sm text-gray-500 max-w-xs">${message}</p>
        ${actionText && actionId ? `
          <button id="${actionId}" class="mt-2 px-4 py-2 bg-electric-blue text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors">
            ${actionText}
          </button>
        ` : ''}
      </div>
    `;
  }
}