import { formatUSD } from '../../../js/config.js';

export const ComboBuilder = {
  calculateTotals(selectedItems, comboPriceUsd) {
    let regularTotalUsd = 0;
    let totalItemsCount = 0;

    selectedItems.forEach(item => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.product?.price_usd) || 0;
      regularTotalUsd += price * qty;
      totalItemsCount += qty;
    });

    const offerPriceUsd = Number(comboPriceUsd) || 0;
    const savedUsd = Math.max(0, regularTotalUsd - offerPriceUsd);
    const savedPercentage = regularTotalUsd > 0 && offerPriceUsd < regularTotalUsd
      ? ((savedUsd / regularTotalUsd) * 100).toFixed(1)
      : 0;

    const isValidProductCount = totalItemsCount >= 2;
    const isValidPrice = offerPriceUsd > 0 && offerPriceUsd < regularTotalUsd;

    return {
      regularTotalUsdFormatted: formatUSD(regularTotalUsd),
      offerPriceUsdFormatted: formatUSD(offerPriceUsd),
      savedUsdFormatted: formatUSD(savedUsd),
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