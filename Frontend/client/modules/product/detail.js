/**
 * detail.js - Product technical detail controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.Navbar) window.Navbar.mount('#navbar-mount', 'catalogo');
  if (window.Footer) window.Footer.mount('#footer-mount');

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 'prod-01';
  const commentStorageKey = `el_vecino_comments_${productId}`;

  let currentProduct = null;
  let quantity = 1;

  function formatSpec(spec, index) {
    if (!spec) return { label: `Especificación ${index + 1}`, value: '' };
    if (typeof spec === 'object') {
      const label = spec.label || spec.feature_name || spec.name || spec.title || `Característica ${index + 1}`;
      const value = spec.value || spec.feature_value || spec.val || '';
      return { label, value };
    }
    if (typeof spec === 'string') {
      const parts = spec.split(':');
      if (parts.length > 1) {
        return {
          label: parts[0].trim(),
          value: parts.slice(1).join(':').trim()
        };
      }
      return {
        label: `Característica ${index + 1}`,
        value: spec.trim()
      };
    }
    return { label: `Especificación ${index + 1}`, value: String(spec) };
  }

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
      return `
        <article class="comment-card">
          <div class="comment-header">
            <div>
              <h3>${(comment.name || 'Cliente').trim()}</h3>
              <span>${comment.date || 'Hace poco'}</span>
            </div>
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
      const textInput = document.getElementById('commentText');

      const name = (nameInput?.value || '').trim() || 'Cliente';
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
        text,
        date: 'Hoy'
      });

      saveProductComments(comments);
      await renderComments();

      commentForm.reset();
      const ratingInput = document.getElementById('commentRating');
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
    if (!p) return;
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

    // Badge & Category (SKU removed)
    const badgeEl = document.getElementById('detailBadge');
    if (badgeEl) badgeEl.textContent = p.badge || 'LÍNEA PREMIUM';

    const catEl = document.getElementById('detailCategory');
    if (catEl) catEl.textContent = p.categoryName || p.category || 'Garantía Directa';

    // Title
    const titleEl = document.getElementById('detailTitle');
    if (titleEl) titleEl.textContent = p.name;

    // Description: Limited to 120 characters with "Ver más" / "Ver menos" toggle
    const fullDesc = (p.description || p.summary || '').trim();
    const descEl = document.getElementById('detailDesc');
    const toggleBtn = document.getElementById('btnToggleDesc');
    const toggleBtnText = document.getElementById('btnToggleDescText');
    let isDescExpanded = false;
    const MAX_CHARS = 120;

    function updateDesc() {
      if (!descEl) return;
      if (!fullDesc) {
        descEl.textContent = 'Equipo técnico de alta gama para distribución oficial de bodega.';
        if (toggleBtn) toggleBtn.style.display = 'none';
        return;
      }
      if (fullDesc.length <= MAX_CHARS) {
        descEl.textContent = fullDesc;
        if (toggleBtn) toggleBtn.style.display = 'none';
      } else {
        if (toggleBtn) toggleBtn.style.display = 'inline-flex';
        if (isDescExpanded) {
          descEl.textContent = fullDesc + ' ';
          if (toggleBtnText) toggleBtnText.textContent = 'Ver menos';
        } else {
          descEl.textContent = fullDesc.slice(0, MAX_CHARS).trim() + '... ';
          if (toggleBtnText) toggleBtnText.textContent = 'Ver más';
        }
      }
    }

    updateDesc();
    if (toggleBtn) {
      toggleBtn.onclick = (e) => {
        e.preventDefault();
        isDescExpanded = !isDescExpanded;
        updateDesc();
      };
    }

    // Warranty
    const warrantyEl = document.getElementById('detailWarranty');
    if (warrantyEl) warrantyEl.textContent = p.warranty || 'Respaldo Certificado: Factura oficial con garantía legal de bodega';

    // Características Principales (Side grid next to photo)
    const mainFeatures = [];
    if (p.brand) {
      mainFeatures.push({ label: 'Marca', value: p.brand, icon: 'branding_watermark' });
    }
    if (p.capacity) {
      mainFeatures.push({ label: 'Capacidad', value: p.capacity, icon: 'inventory_2' });
    }
    if (p.voltage) {
      mainFeatures.push({ label: 'Voltaje', value: p.voltage, icon: 'bolt' });
    }

    const hasDims = (p.height_cm && Number(p.height_cm) > 0) || (p.width_cm && Number(p.width_cm) > 0) || (p.depth_cm && Number(p.depth_cm) > 0);
    if (hasDims) {
      const dims = `${p.height_cm || 0} x ${p.width_cm || 0} x ${p.depth_cm || 0} cm`;
      mainFeatures.push({ label: 'Medidas (Al x An x Pr)', value: dims, icon: 'aspect_ratio' });
    }
    if (p.weight && Number(p.weight) > 0) {
      const wStr = `${p.weight} kg ${p.weight_type ? `(${p.weight_type})` : ''}`;
      mainFeatures.push({ label: 'Peso', value: wStr, icon: 'scale' });
    }

    // Supplement with key items from p.specs if needed
    if (Array.isArray(p.specs)) {
      p.specs.forEach((s, i) => {
        if (mainFeatures.length >= 4) return;
        const item = formatSpec(s, i);
        const exists = mainFeatures.some(m => m.label.toLowerCase() === item.label.toLowerCase());
        if (!exists && item.value) {
          let icon = 'verified';
          const lowLabel = item.label.toLowerCase();
          if (lowLabel.includes('capacidad')) icon = 'inventory_2';
          else if (lowLabel.includes('motor') || lowLabel.includes('compresor')) icon = 'engineering';
          else if (lowLabel.includes('tecnología') || lowLabel.includes('inverter')) icon = 'auto_awesome';
          else if (lowLabel.includes('acabado') || lowLabel.includes('color')) icon = 'palette';
          mainFeatures.push({ label: item.label, value: item.value, icon });
        }
      });
    }

    const featuresGrid = document.getElementById('detailMainFeaturesGrid');
    if (featuresGrid) {
      if (mainFeatures.length > 0) {
        featuresGrid.innerHTML = mainFeatures.slice(0, 4).map(f => `
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 hover:border-blue-300 transition-colors">
            <div class="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-electric-blue shadow-xs">
              <span class="material-symbols-outlined text-[18px]">${f.icon}</span>
            </div>
            <div class="min-w-0 flex-1">
              <span class="text-[10px] uppercase font-bold text-gray-500 tracking-wider block truncate">${f.label}</span>
              <span class="text-xs font-bold text-deep-obsidian truncate block" title="${f.value}">${f.value}</span>
            </div>
          </div>
        `).join('');
      } else {
        featuresGrid.innerHTML = `
          <div class="col-span-2 text-xs text-gray-500 py-1">
            Consulte características principales con nuestro asesor de bodega.
          </div>
        `;
      }
    }

    // Demás Ficha Técnica (Full engineering table below)
    const specsTable = document.getElementById('detailSpecsTable');
    if (specsTable) {
      const tableRows = [];
      if (p.brand) tableRows.push({ label: 'Marca / Fabricante', value: p.brand });
      if (p.capacity) tableRows.push({ label: 'Capacidad de Carga / Volumen', value: p.capacity });
      if (p.voltage) tableRows.push({ label: 'Alimentación Eléctrica / Voltaje', value: p.voltage });
      if (hasDims) tableRows.push({ label: 'Dimensiones Físicas (Alto x Ancho x Profundo)', value: `${p.height_cm || 0} cm x ${p.width_cm || 0} cm x ${p.depth_cm || 0} cm` });
      if (p.weight && Number(p.weight) > 0) tableRows.push({ label: 'Peso del Equipo', value: `${p.weight} kg ${p.weight_type ? `(${p.weight_type})` : ''}` });

      if (Array.isArray(p.specs)) {
        p.specs.forEach((spec, i) => {
          const item = formatSpec(spec, i);
          if (!tableRows.some(r => r.label.toLowerCase() === item.label.toLowerCase())) {
            tableRows.push(item);
          }
        });
      }

      tableRows.push({ label: 'Respaldo y Garantía', value: p.warranty || 'Garantía Oficial Directa con Factura Legal' });
      tableRows.push({ label: 'Inspección de Lote', value: 'Revisión técnica de precintos y seriales en bodega' });
      tableRows.push({ label: 'Modalidad de Entrega', value: 'Despacho directo y embalaje de seguridad' });

      specsTable.innerHTML = `
        <thead>
          <tr class="bg-slate-50 text-left text-xs uppercase text-gray-500 font-bold border-b border-slate-border">
            <th class="py-3 px-4">Parámetro / Especificación</th>
            <th class="py-3 px-4">Detalle Técnico Certificado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm">
          ${tableRows.map(row => `
            <tr class="hover:bg-slate-50 transition-colors">
              <td class="py-3 px-4 font-semibold text-deep-obsidian w-2/5">${row.label}</td>
              <td class="py-3 px-4 text-gray-700">${row.value}</td>
            </tr>
          `).join('')}
        </tbody>
      `;
    }

    updateWhatsappQuoteButton();
    initImageZoomAndFullscreen();
  }

  function updateWhatsappQuoteButton() {
    const btnQuote = document.getElementById('btnDetailQuoteWhatsapp');
    if (btnQuote && currentProduct) {
      if (window.OrderService?.buildDirectProductQuoteUrl) {
        btnQuote.href = window.OrderService.buildDirectProductQuoteUrl(currentProduct, quantity);
      } else {
        const phone = window.CONFIG?.WHATSAPP_PHONE || window.CONFIG?.whatsappNumber || '573001234567';
        const msg = `¡Hola Comercializadora EL VECINO! Me interesa solicitar cotización del equipo: *${currentProduct.name}*. Cantidad: ${quantity} unidad(es).`;
        btnQuote.href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      }
    }
  }

  // Lupa & Fullscreen Lightbox Controller
  let zoomInitialized = false;
  function initImageZoomAndFullscreen() {
    if (zoomInitialized) return;
    zoomInitialized = true;

    const galleryMain = document.querySelector('.detail-gallery-main');
    const mainImg = document.getElementById('detailMainImg');
    const lens = document.getElementById('detailZoomLens');
    const zoomPortal = document.getElementById('detailZoomResult');
    const zoomImage = document.getElementById('detailZoomImage');

    if (galleryMain && mainImg && lens && zoomPortal && zoomImage) {
      function moveLens(e) {
        if (window.innerWidth < 1024) {
          lens.classList.remove('active');
          zoomPortal.classList.remove('active');
          return;
        }

        const imgRect = mainImg.getBoundingClientRect();
        const galleryRect = galleryMain.getBoundingClientRect();
        const canvasRect = zoomImage.getBoundingClientRect();

        // Cursor relative to the actual rendered image
        const mouseX = e.clientX - imgRect.left;
        const mouseY = e.clientY - imgRect.top;

        // If outside the actual image, hide lens & portal
        if (mouseX < 0 || mouseX > imgRect.width || mouseY < 0 || mouseY > imgRect.height) {
          lens.classList.remove('active');
          zoomPortal.classList.remove('active');
          return;
        }

        lens.classList.add('active');
        zoomPortal.classList.add('active');

        const currentSrc = mainImg.src;
        if (zoomImage.style.backgroundImage !== `url("${currentSrc}")`) {
          zoomImage.style.backgroundImage = `url("${currentSrc}")`;
        }

        // Exact zoom magnification factor (2.5x)
        const zoomFactor = 2.5;

        // Compute lens width & height strictly matching the zoom viewport aspect ratio
        const lensW = Math.max(50, Math.min(imgRect.width * 0.7, canvasRect.width / zoomFactor));
        const lensH = Math.max(50, Math.min(imgRect.height * 0.7, canvasRect.height / zoomFactor));
        lens.style.width = `${Math.round(lensW)}px`;
        lens.style.height = `${Math.round(lensH)}px`;

        // Calculate clamped lens position on image
        let lensX = mouseX - lensW / 2;
        let lensY = mouseY - lensH / 2;
        lensX = Math.max(0, Math.min(imgRect.width - lensW, lensX));
        lensY = Math.max(0, Math.min(imgRect.height - lensH, lensY));

        // Position lens inside galleryMain
        lens.style.left = `${Math.round((imgRect.left - galleryRect.left) + lensX)}px`;
        lens.style.top = `${Math.round((imgRect.top - galleryRect.top) + lensY)}px`;

        // Exact 1:1 pixel scaling with ZERO slip
        const ratioX = canvasRect.width / lensW;
        const ratioY = canvasRect.height / lensH;

        const bgW = imgRect.width * ratioX;
        const bgH = imgRect.height * ratioY;
        const bgX = - (lensX * ratioX);
        const bgY = - (lensY * ratioY);

        zoomImage.style.backgroundSize = `${bgW.toFixed(1)}px ${bgH.toFixed(1)}px`;
        zoomImage.style.backgroundPosition = `${bgX.toFixed(1)}px ${bgY.toFixed(1)}px`;
      }

      galleryMain.addEventListener('mousemove', moveLens);
      galleryMain.addEventListener('mouseenter', (e) => {
        if (window.innerWidth >= 1024) {
          moveLens(e);
        }
      });
      galleryMain.addEventListener('mouseleave', () => {
        lens.classList.remove('active');
        zoomPortal.classList.remove('active');
      });
    }

    // Fullscreen Lightbox
    const modal = document.getElementById('detailFullscreenModal');
    const btnOpenFullscreen = document.getElementById('btnOpenFullscreen');
    const btnCloseFullscreen = document.getElementById('btnCloseFullscreen');
    const fullscreenBackdrop = document.getElementById('fullscreenBackdrop');
    const fullscreenImg = document.getElementById('fullscreenImg');
    const fullscreenTitle = document.getElementById('fullscreenTitle');
    const fullscreenBadge = document.getElementById('fullscreenBadge');

    const btnZoomIn = document.getElementById('btnFullscreenZoomIn');
    const btnZoomOut = document.getElementById('btnFullscreenZoomOut');
    const btnReset = document.getElementById('btnFullscreenReset');

    let currentScale = 1;

    function updateScale(scale) {
      currentScale = Math.max(0.6, Math.min(4, scale));
      if (fullscreenImg) {
        fullscreenImg.style.transform = `scale(${currentScale})`;
      }
    }

    function openFullscreen() {
      if (!modal || !fullscreenImg || !mainImg) return;
      fullscreenImg.src = mainImg.src;
      if (fullscreenTitle) fullscreenTitle.textContent = currentProduct?.name || 'Vista de Producto';
      if (fullscreenBadge) fullscreenBadge.textContent = currentProduct?.badge || 'LÍNEA PREMIUM';
      updateScale(1);
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    function closeFullscreen() {
      if (!modal) return;
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }

    if (btnOpenFullscreen) btnOpenFullscreen.addEventListener('click', openFullscreen);
    if (btnCloseFullscreen) btnCloseFullscreen.addEventListener('click', closeFullscreen);
    if (fullscreenBackdrop) fullscreenBackdrop.addEventListener('click', closeFullscreen);

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => updateScale(currentScale + 0.3));
    }
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => updateScale(currentScale - 0.3));
    }
    if (btnReset) {
      btnReset.addEventListener('click', () => updateScale(1));
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.style.display !== 'none') {
        closeFullscreen();
      }
    });
  }

  // Quantity controls
  const btnQtyMinus = document.getElementById('btnQtyMinus');
  const btnQtyPlus = document.getElementById('btnQtyPlus');
  const qtyDisplay = document.getElementById('detailQtyDisplay');

  if (btnQtyMinus) {
    btnQtyMinus.addEventListener('click', () => {
      if (quantity > 1) {
        quantity--;
        if (qtyDisplay) qtyDisplay.textContent = quantity;
        updateWhatsappQuoteButton();
      }
    });
  }

  if (btnQtyPlus) {
    btnQtyPlus.addEventListener('click', () => {
      if (quantity < 99) {
        quantity++;
        if (qtyDisplay) qtyDisplay.textContent = quantity;
        updateWhatsappQuoteButton();
      }
    });
  }

  // Add to Quote Cart
  const btnAddToCart = document.getElementById('btnDetailAddToCart');
  if (btnAddToCart) {
    btnAddToCart.addEventListener('click', () => {
      if (currentProduct) {
        if (window.Storage?.addToCart) {
          window.Storage.addToCart(currentProduct, quantity);
        }
        if (window.Toast) {
          window.Toast.success(`${quantity} unidad(es) de "${currentProduct.name}" añadidas a la cotización.`);
        }
        if (window.Navbar?.updateCartBadge) {
          window.Navbar.updateCartBadge();
        }
        if (window.CartModal && typeof window.CartModal.open === 'function') {
          window.CartModal.open();
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
