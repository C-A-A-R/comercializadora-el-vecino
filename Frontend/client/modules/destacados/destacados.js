/**
 * destacados.js - Featured products controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.Navbar) window.Navbar.mount('#navbar-mount', 'destacados');
  if (window.Footer) window.Footer.mount('#footer-mount');

  const container = document.getElementById('featuredProductsGrid');

  async function loadFeatured() {
    try {
      if (container) {
        container.innerHTML = `
          <div class="col-span-full py-16 text-center text-gray-500">
            <span class="material-symbols-outlined text-4xl animate-spin text-electric-blue">progress_activity</span>
            <p class="mt-2 font-medium">Consultando líneas destacadas en bodega...</p>
          </div>
        `;
      }
      const products = await window.DestacadosApi.getFeaturedProducts();
      renderFeatured(products);
    } catch (error) {
      console.error('[destacados.js] Error al cargar destacados:', error);
      if (container) {
        container.innerHTML = `
          <div class="col-span-full py-12 text-center text-red-500">
            <span class="material-symbols-outlined text-4xl">error</span>
            <p class="mt-2">No se pudieron cargar los productos destacados.</p>
          </div>
        `;
      }
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
