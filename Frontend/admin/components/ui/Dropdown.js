/**
 * Ubicación: components/ui/Dropdown.js
 * Descripción: Componente custom para menús desplegables y selecciones avanzadas.
 */

export class Dropdown {
  /**
   * Renderiza el markup de un selector estructurado.
   * @param {Object} options
   * @param {string} options.id - ID único
   * @param {string} [options.label] - Label opcional
   * @param {Array<{value: string|number, label: string}>} options.options - Opciones
   * @param {string|number} [options.selectedValue] - Valor pre-seleccionado
   * @returns {string} HTML renderizable
   */
  static render({ id, label = '', options = [], selectedValue = '' }) {
    return `
      <div class="flex flex-col gap-1.5 w-full">
        ${label ? `<label for="${id}" class="text-sm font-medium text-deep-obsidian">${label}</label>` : ''}
        <select id="${id}" class="px-3 py-2 bg-white border border-slate-border rounded-lg text-sm font-medium text-deep-obsidian focus:outline-none focus:border-electric-blue transition-colors">
          <option value="" disabled ${!selectedValue ? 'selected' : ''}>Seleccione una opción...</option>
          ${options.map(opt => `
            <option value="${opt.value}" ${String(opt.value) === String(selectedValue) ? 'selected' : ''}>
              ${opt.label}
            </option>
          `).join('')}
        </select>
      </div>
    `;
  }
}