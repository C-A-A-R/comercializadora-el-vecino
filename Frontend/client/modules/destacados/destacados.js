/**
 * destacados.js - Featured products controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.Navbar) window.Navbar.mount('#navbar-mount', 'destacados');
  if (window.Footer) window.Footer.mount('#footer-mount');

  const container = document.getElementById('featuredProductsGrid');

  async function loadFeatured() {
    try {
      const products = await window.DestacadosApi.getFeaturedProducts();
      renderFeatured(products);
    } catch (error) {
      console.error('[destacados.js] Error al cargar destacados:', error);
    }
  }

  function renderFeatured(products) {
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-gray-500">
          No hay productos destacados en este momento.
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(prod => window.ProductCard.renderHTML(prod)).join('');
  }

  loadFeatured();
});
