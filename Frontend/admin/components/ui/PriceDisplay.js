/**
 * Ubicación: components/ui/PriceDisplay.js
 * Descripción: Componente para renderizado unificado de montos en USD y COP simultáneamente.
 */
import { formatUSD, formatCOP } from '../../../js/config.js';

export class PriceDisplay {
  /**
   * Genera el HTML formateado para visualizar USD y COP según la norma RN-06.
   * @param {number} priceUsd - Precio base en USD
   * @param {number} priceCop - Precio calculado o proyectado en COP
   * @param {Object} [options]
   * @param {'sm' | 'md' | 'lg'} [options.size='md'] - Tamaño tipográfico
   * @returns {string} String HTML renderizable
   */
  static render(priceUsd, priceCop, options = { size: 'md' }) {
    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base font-bold'
    };

    const currentSize = sizeClasses[options.size] || sizeClasses.md;

    return `
      <div class="price-display inline-flex flex-col ${currentSize}">
        <span class="font-bold text-deep-obsidian dark:text-white">
          ${formatUSD(priceUsd)}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">
          ${formatCOP(priceCop)}
        </span>
      </div>
    `;
  }
}