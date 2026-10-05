/**
 * Ubicación: components/ui/PriceDisplay.js
 * Descripción: Componente para renderizado unificado de montos en USD y COP simultáneamente.
 */
import { formatUSD, formatCOP } from '../../../js/config.js';

export function PriceDisplay(props, cop, options = { size: 'md' }) {
  let priceUsd = 0;
  let priceCop = 0;
  let opt = options;

  if (typeof props === 'object' && props !== null) {
    priceUsd = Number(props.priceUSD ?? props.priceUsd ?? props.usd ?? 0);
    priceCop = Number(props.priceCOP ?? props.priceCop ?? props.cop ?? (priceUsd * 4200));
    if (props.size) opt = { size: props.size };
  } else {
    priceUsd = Number(props) || 0;
    priceCop = Number(cop) || (priceUsd * 4200);
  }

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base font-bold'
  };

  const currentSize = sizeClasses[opt?.size] || sizeClasses.md;

  return `
    <div class="price-display inline-flex flex-col ${currentSize}">
      <span class="font-bold text-deep-obsidian">
        ${formatUSD(priceUsd)}
      </span>
      <span class="text-xs text-gray-500 font-medium">
        ${formatCOP(priceCop)}
      </span>
    </div>
  `;
}

PriceDisplay.render = function(priceUsd, priceCop, options = { size: 'md' }) {
  return PriceDisplay(priceUsd, priceCop, options);
};