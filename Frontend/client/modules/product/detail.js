/**
 * detail.js - Product technical detail controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.Navbar) window.Navbar.mount('#navbar-mount', 'catalogo');
  if (window.Footer) window.Footer.mount('#footer-mount');

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 'prod-001';
  const commentStorageKey = `el_vecino_comments_${productId}`;

  let currentProduct = null;
  let quantity = 1;

  function getDefaultComments() {
    return [
      {
        name: 'María G.',
        rating: 5,
        text: 'Muy buena compra, la calidad es excelente y llegó en tiempo récord.',
        date: 'Hace 2 días'
      },
      {
        name: 'Andrés M.',
        rating: 4,
        text: 'Funciona muy bien y tiene un diseño moderno. Lo recomiendo.',
        date: 'Hace 1 semana'
      },
      {
        name: 'Sofía C.',
        rating: 5,
        text: 'La atención fue rápida y el producto se ve igual que en la foto.',
        date: 'Hace 2 semanas'
      }
    ];
  }

  function getProductComments() {
    try {
      const saved = localStorage.getItem(commentStorageKey);
      if (!saved) return getDefaultComments();
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length ? parsed : getDefaultComments();
    } catch (error) {
      console.warn('[detail.js] No se pudieron cargar comentarios:', error);
      return getDefaultComments();
    }
  }

  function saveProductComments(comments) {
    localStorage.setItem(commentStorageKey, JSON.stringify(comments.slice(0, 12)));
  }

  async function renderComments() {
    const listEl = document.getElementById('commentsList');
    if (!listEl) return;

    let comments = [];
    if (currentProduct?.id) {
      try {
        const backendReviews = await window.ProductApi.getReviews(currentProduct.id);
        if (Array.isArray(backendReviews) && backendReviews.length > 0) {
          comments = backendReviews.map(r => ({
            name: 'Cliente Verificado',
            rating: 5,
            text: r.comment,
            date: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Reciente'
          }));
        }
      } catch (e) {
        console.warn('[detail.js] Fallback a comentarios locales:', e);
      }
    }

    if (!comments.length) {
      comments = getProductComments();
    }

    if (!comments.length) {
      listEl.innerHTML = '<p class="comment-empty">Sé el primero en dejar un comentario sobre este producto.</p>';
      return;
    }

    listEl.innerHTML = comments.map(comment => {
      const stars = Array.from({ length: 5 }, (_, index) => {
        const filled = index < Number(comment.rating || 0);
        return `<span class="material-symbols-outlined ${filled ? 'text-amber-400' : 'text-gray-300'}">star</span>`;
      }).join('');

      return `
        <article class="comment-card">
          <div class="comment-header">
            <div>
              <h3>${(comment.name || 'Cliente').trim()}</h3>
              <span>${comment.date || 'Hace poco'}</span>
            </div>
            <div class="comment-stars">${stars}</div>
          </div>
          <p>${(comment.text || '').trim()}</p>
        </article>
      `;
    }).join('');
  }

  const commentForm = document.getElementById('productCommentForm');
  if (commentForm) {
    commentForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const nameInput = document.getElementById('commentName');
      const ratingInput = document.getElementById('commentRating');
      const textInput = document.getElementById('commentText');

      const name = (nameInput?.value || '').trim() || 'Cliente';
      const rating = Number(ratingInput?.value || 5);
      const text = (textInput?.value || '').trim();

      if (!text) return;

      // Enviar reseña a backend si hay producto activo
      if (currentProduct?.id) {
        try {
          await window.ProductApi.createReview(currentProduct.id, text);
          if (window.Toast) {
            window.Toast.success('Tu comentario ha sido registrado con éxito.');
          }
        } catch (e) {
          console.warn('[detail.js] Error al enviar reseña a API, guardando en local:', e);
        }
      }

      const comments = getProductComments();
      comments.unshift({
        name,
        rating,
        text,
        date: 'Hoy'
      });

      saveProductComments(comments);
      await renderComments();

      commentForm.reset();
      if (ratingInput) ratingInput.value = '5';
    });
  }

  async function init() {
    try {
      currentProduct = await window.ProductApi.getProductById(productId);
      if (!currentProduct) {
        const all = await window.ProductApi.getProducts();
        currentProduct = all[0];
      }
      if (currentProduct?.id) {
        window.ProductApi.registerView(currentProduct.id);
      }
      renderProductDetail(currentProduct);
      await renderComments();
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
