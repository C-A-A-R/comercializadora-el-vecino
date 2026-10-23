/**
 * Ubicación: components/ui/Switch.js
 * Descripción: Componente Switch Toggle accesible (W3C role="switch") y estilizado para activar/desactivar estados.
 */

export class Switch {
  /**
   * Genera el HTML de un Switch Toggle.
   * @param {Object} options
   * @param {string} [options.id] - Identificador único
   * @param {boolean} [options.checked=false] - Estado encendido/apagado
   * @param {string} [options.label=''] - Texto opcional visible al lado del switch
   * @param {string} [options.dataAction=''] - Atributo data-action para delegación de eventos
   * @param {string|number} [options.dataId=''] - Atributo data-id
   * @param {boolean} [options.disabled=false] - Estado deshabilitado
   * @param {string} [options.labelClass=''] - Clases personalizadas de la etiqueta
   * @returns {string} HTML renderizable
   */
  static render({
    id = '',
    checked = false,
    label = '',
    dataAction = '',
    dataId = '',
    disabled = false,
    labelClass = 'text-xs font-semibold text-gray-700'
  } = {}) {
    const isChecked = Boolean(checked);

    return `
      <button 
        type="button" 
        role="switch" 
        aria-checked="${isChecked ? 'true' : 'false'}"
        ${id ? `id="${id}"` : ''}
        ${dataAction ? `data-action="${dataAction}"` : ''}
        ${dataId !== undefined ? `data-id="${dataId}"` : ''}
        ${disabled ? 'disabled' : ''}
        class="ui-switch inline-flex items-center gap-2.5 cursor-pointer select-none group focus:outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}"
      >
        <span class="ui-switch-track relative inline-block w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${isChecked ? 'bg-emerald-500' : 'bg-slate-300'}">
          <span class="ui-switch-thumb absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out ${isChecked ? 'translate-x-5' : 'translate-x-0'}"></span>
        </span>
        ${label ? `<span class="${labelClass}">${label}</span>` : ''}
      </button>
    `;
  }
}
