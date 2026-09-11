/**
 * detail.js - Product technical detail controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.Navbar) window.Navbar.mount('#navbar-mount', 'catalogo');
  if (window.Footer) window.Footer.mount('#footer-mount');

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 'prod-001';

  let currentProduct = null;
  let quantity = 1;

  async function init() {
    try {
      currentProduct = await window.ProductApi.getProductById(productId);
      if (!currentProduct) {
        const all = await window.ProductApi.getProducts();
        currentProduct = all[0];
      }
      renderProductDetail(currentProduct);
      loadRelatedProducts(currentProduct);
    } catch (error) {
      console.error('[detail.js] Error al cargar producto:', error);
    }
  }

  function renderProductDetail(p) {
    document.title = `${p.name} — Comercializadora EL VECINO`;

    // Breadcrumb
    const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = p.name;

    // Image
    const mainImg = document.getElementById('detailMainImg');
    if (mainImg) {
      mainImg.src = p.image || 'https://placehold.co/500';
      mainImg.alt = p.name;
    }

    // Badge & SKU
    const badgeEl = document.getElementById('detailBadge');
    if (badgeEl) badgeEl.textContent = p.badge || 'EQUIPO SELLADO';

    const skuEl = document.getElementById('detailSku');
    if (skuEl) skuEl.textContent = `SKU: ${p.sku || 'N/A'}`;

    // Title & Description
    const titleEl = document.getElementById('detailTitle');
    if (titleEl) titleEl.textContent = p.name;

    const descEl = document.getElementById('detailDesc');
    if (descEl) descEl.textContent = p.description || '';

    // Price
    const priceEl = document.getElementById('detailPrice');
    if (priceEl) priceEl.textContent = window.CONFIG.formatCurrency(p.price);

    const oldPriceEl = document.getElementById('detailOldPrice');
    if (oldPriceEl) {
      if (p.originalPrice) {
        oldPriceEl.textContent = window.CONFIG.formatCurrency(p.originalPrice);
        oldPriceEl.style.display = 'inline';
      } else {
        oldPriceEl.style.display = 'none';
      }
    }

    // Warranty
    const warrantyEl = document.getElementById('detailWarranty');
    if (warrantyEl) warrantyEl.textContent = p.warranty || 'Garantía oficial directa';

    // Specs List & Specs Table
    const specsList = document.getElementById('detailSpecsList');
    if (specsList && p.specs) {
      specsList.innerHTML = p.specs.map(s => `
        <li class="flex items-center gap-2 text-sm text-gray-700">
          <span class="material-symbols-outlined text-electric-blue text-[18px]">verified</span>
          <span>${s}</span>
        </li>
      `).join('');
    }

    const specsTable = document.getElementById('detailSpecsTable');
    if (specsTable && p.specs) {
      specsTable.innerHTML = p.specs.map((spec, i) => {
        const parts = spec.split(':');
        const label = parts.length > 1 ? parts[0] : `Especificación ${i + 1}`;
        const val = parts.length > 1 ? parts.slice(1).join(':') : parts[0];
        return `
          <tr>
            <td>${label.trim()}</td>
            <td>${val.trim()}</td>
          </tr>
        `;
      }).join('');
    }

    updateWhatsappQuoteButton();
  }

  function updateWhatsappQuoteButton() {
    const btnQuote = document.getElementById('btnDetailQuoteWhatsapp');
    if (btnQuote && currentProduct) {
      const url = window.OrderService.buildDirectProductQuoteUrl(currentProduct, quantity);
      btnQuote.href = url;
    }
  }

  // Stepper events
  const qtyInput = document.getElementById('detailQtyInput');
  const btnMinus = document.getElementById('btnDetailQtyMinus');
  const btnPlus = document.getElementById('btnDetailQtyPlus');

  if (btnMinus) {
    btnMinus.addEventListener('click', () => {
      if (quantity > 1) {
        quantity--;
        if (qtyInput) qtyInput.value = quantity;
        updateWhatsappQuoteButton();
      }
    });
  }

  if (btnPlus) {
    btnPlus.addEventListener('click', () => {
      quantity++;
      if (qtyInput) qtyInput.value = quantity;
      updateWhatsappQuoteButton();
    });
  }

  // Add to Quote Cart
  const btnAddToCart = document.getElementById('btnDetailAddToCart');
  if (btnAddToCart) {
    btnAddToCart.addEventListener('click', () => {
      if (currentProduct) {
        window.Storage.addToCart(currentProduct, quantity);
        if (window.Toast) {
          window.Toast.success(`${quantity} unid. de "${currentProduct.name}" añadidas a la cotización.`);
        }
      }
    });
  }

  // Load related products
  async function loadRelatedProducts(p) {
    const relatedContainer = document.getElementById('relatedProductsContainer');
    if (!relatedContainer) return;

    try {
      const all = await window.ProductApi.getProducts();
      const related = all.filter(item => item.id !== p.id && item.category === p.category).slice(0, 3);
      if (related.length === 0) {
        related.push(...all.filter(item => item.id !== p.id).slice(0, 3));
      }
      relatedContainer.innerHTML = related.map(prod => window.ProductCard.renderHTML(prod)).join('');
    } catch (e) {
      console.warn('[detail.js] Error cargando relacionados:', e);
    }
  }

  init();
});
