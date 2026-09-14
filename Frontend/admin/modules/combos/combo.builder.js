import { formatUSD, formatCOP } from '../../../js/config.js';

export const ComboBuilder = {
  calculateTotals(selectedItems, comboPriceUsd, exchangeRate = 4200) {
    let regularTotalUsd = 0;
    let totalItemsCount = 0;

    selectedItems.forEach(item => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.product.price_usd) || 0;
      regularTotalUsd += price * qty;
      totalItemsCount += qty;
    });

    const offerPriceUsd = Number(comboPriceUsd) || 0;
    const savedUsd = Math.max(0, regularTotalUsd - offerPriceUsd);
    const savedPercentage = regularTotalUsd > 0 && offerPriceUsd < regularTotalUsd
      ? ((savedUsd / regularTotalUsd) * 100).toFixed(1)
      : 0;

    const regularTotalCop = regularTotalUsd * exchangeRate;
    const offerPriceCop = offerPriceUsd * exchangeRate;
    const savedCop = savedUsd * exchangeRate;

    const isValidProductCount = totalItemsCount >= 2;
    const isValidPrice = offerPriceUsd > 0 && offerPriceUsd < regularTotalUsd;

    return {
      regularTotalUsdFormatted: formatUSD(regularTotalUsd),
      regularTotalCopFormatted: formatCOP(regularTotalCop),
      offerPriceUsdFormatted: formatUSD(offerPriceUsd),
      offerPriceCopFormatted: formatCOP(offerPriceCop),
      savedUsdFormatted: formatUSD(savedUsd),
      savedCopFormatted: formatCOP(savedCop),
      savedPercentage: `${savedPercentage}%`,
      regularTotalUsd,
      offerPriceUsd,
      savedUsd,
      totalItemsCount,
      isValidProductCount,
      isValidPrice,
      isValid: isValidProductCount && isValidPrice
    };
  }
};