/**
 * Ubicación: components/ui/Loader.js
 * Descripción: Componentes visuales de carga (spinners y skeletons).
 */

export class Loader {
  /**
   * Genera un spinner centrado.
   * @returns {string} HTML del spinner
   */
  static spinner() {
    return `
      <div class="flex justify-center items-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-4 border-slate-border border-t-electric-blue"></div>
      </div>
    `;
  }

  /**
   * Genera filas skeleton para tablas mientras cargan los datos.
   * @param {number} [rows=5] - Número de filas
   * @returns {string} HTML
   */
  static tableSkeleton(rows = 5) {
    return Array.from({ length: rows }).map(() => `
      <tr class="animate-pulse border-b border-slate-border">
        <td class="p-4"><div class="h-4 bg-gray-200 rounded w-3/4"></div></td>
        <td class="p-4"><div class="h-4 bg-gray-200 rounded w-1/2"></div></td>
        <td class="p-4"><div class="h-4 bg-gray-200 rounded w-1/4"></div></td>
        <td class="p-4"><div class="h-4 bg-gray-200 rounded w-1/3"></div></td>
      </tr>
    `).join('');
  }
}