import { formatUSD, formatCOP } from '../../../js/config.js';

export const PromotionCalculator = {
  calculateDiscount(priceUsd, discountType, discountValue, exchangeRate = 4200) {
    const basePrice = Number(priceUsd) || 0;
    const value = Number(discountValue) || 0;
    let finalUsd = basePrice;
    let savedUsd = 0;

    if (discountType === 'percentage') {
      savedUsd = basePrice * (value / 100);
      finalUsd = Math.max(0, basePrice - savedUsd);
    } else if (discountType === 'fixed') {
      savedUsd = Math.min(basePrice, value);
      finalUsd = Math.max(0, basePrice - savedUsd);
    }

    const savedPercentage = basePrice > 0 ? ((savedUsd / basePrice) * 100).toFixed(1) : 0;
    const finalCop = finalUsd * exchangeRate;
    const baseCop = basePrice * exchangeRate;

    return {
      baseUsdFormatted: formatUSD(basePrice),
      baseCopFormatted: formatCOP(baseCop),
      finalUsdFormatted: formatUSD(finalUsd),
      finalCopFormatted: formatCOP(finalCop),
      savedUsdFormatted: formatUSD(savedUsd),
      savedPercentage: `${savedPercentage}%`,
      finalUsd,
      savedUsd
    };
  },

  getStatusBadge(startDate, endDate, isActive) {
    if (!isActive) {
      return '<span class="px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-700">Inactiva</span>';
    }
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return '<span class="px-2 py-1 text-xs font-semibold rounded bg-amber-100 text-amber-800">Pendiente</span>';
    }
    if (now > end) {
      return '<span class="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">Vencida</span>';
    }
    return '<span class="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">Activa</span>';
  }
};