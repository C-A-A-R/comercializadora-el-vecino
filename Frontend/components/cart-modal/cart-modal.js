/**
 * cart-modal.js - Quotation slide-over drawer and WhatsApp quote trigger
 * Comercializadora EL VECINO — Electric Neo-Tech
 */

const CartModal = {
  backdrop: null,

  init() {
    if (this.backdrop) return;

    this.backdrop = document.createElement('div');
    this.backdrop.className = 'cart-backdrop';
    this.backdrop.id = 'cartBackdrop';

    this.backdrop.innerHTML = `
      <div class="cart-drawer" id="cartDrawer">
        <!-- Header -->
        <div class="cart-header">
          <div class="cart-title">
            <span class="material-symbols-outlined text-electric-blue text-[24px]">shopping_cart</span>
            <span>Lista de Cotización</span>
            <span class="cart-count-pill" id="cartHeaderPill">0</span>
          </div>
          <button class="btn-close-cart" id="btnCloseCart" type="button" aria-label="Cerrar">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Items Container -->
        <div class="cart-body" id="cartBody">
          <!-- Rendered dynamically -->
        </div>

        <!-- Footer -->
        <div class="cart-footer" id="cartFooter" style="display:none;">
          <div class="cart-summary-row">
            <span>Total de Referencias:</span>
            <span class="font-bold text-deep-obsidian" id="cartTotalItems">0 unid.</span>
          </div>
          <div class="cart-summary-row" id="cartSubtotalRow">
            <span class="font-semibold text-deep-obsidian">Subtotal Estimado:</span>
            <span class="cart-summary-total" id="cartSubtotal">$ 0</span>
          </div>
          <textarea
            id="cartCustomerNotes"
            class="cart-notes-input"
            placeholder="Observaciones especiales, ciudad de entrega o consultas de cubicaje (opcional)..."
          ></textarea>
          <button class="btn-whatsapp-quote" id="btnSendQuoteWhatsapp" type="button">
            <span class="material-symbols-outlined text-[22px]">chat</span>
            <span>Cotizar todo por WhatsApp</span>
          </button>
          <button class="btn-clear-cart" id="btnClearCart" type="button">
            <span class="material-symbols-outlined text-[16px]">delete_sweep</span>
            <span>Vaciar lista de cotización</span>
          </button>
        </div>

        <!-- Modal de confirmación para vaciar el carrito -->
        <div class="cart-confirm-overlay" id="cartConfirmModal" style="display:none;" role="dialog" aria-modal="true" aria-labelledby="cartConfirmTitle">
          <div class="cart-confirm-card">
            <div class="cart-confirm-icon-box">
              <span class="material-symbols-outlined text-[32px]">delete_sweep</span>
            </div>
            <h3 class="cart-confirm-title" id="cartConfirmTitle">¿Vaciar lista de cotización?</h3>
            <p class="cart-confirm-desc">
              Se eliminarán todos los productos que has seleccionado para tu cotización. Esta acción no se puede deshacer.
            </p>
            <div class="cart-confirm-actions">
              <button type="button" class="btn-confirm-cancel" id="btnCancelClearCart">
                Cancelar
              </button>
              <button type="button" class="btn-confirm-accept" id="btnConfirmClearCart">
                <span class="material-symbols-outlined text-[18px]">delete</span>
                <span>Sí, vaciar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.backdrop);
    this.bindEvents();
    this.render();
  },

  open() {
    this.init();
    this.render();
    requestAnimationFrame(() => {
      this.backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  },

  close() {
    if (!this.backdrop) return;
    this.hideClearConfirm();
    this.backdrop.classList.remove('open');
    document.body.style.overflow = '';
  },

  showClearConfirm() {
    const modal = document.getElementById('cartConfirmModal');
    if (modal) {
      modal.style.display = 'flex';
      requestAnimationFrame(() => modal.classList.add('visible'));
    }
  },

  hideClearConfirm() {
    const modal = document.getElementById('cartConfirmModal');
    if (modal) {
      modal.classList.remove('visible');
      setTimeout(() => {
        if (!modal.classList.contains('visible')) {
          modal.style.display = 'none';
        }
      }, 200);
    }
  },

  confirmClearCart() {
    if (window.Storage?.clearCart) {
      window.Storage.clearCart();
    }
    this.hideClearConfirm();
    this.render();
    if (window.Toast) {
      window.Toast.info('Lista de cotización vaciada.');
    }
    if (window.Navbar?.updateCartBadge) {
      window.Navbar.updateCartBadge();
    }
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: 0 } }));
  },

  formatCurrency(amount) {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return 'Precio por cotizar';
    }
    if (window.CONFIG?.formatCurrency && typeof window.CONFIG.formatCurrency === 'function') {
      return window.CONFIG.formatCurrency(amount);
    }
    const num = Number(amount) || 0;
    return `$ ${num.toLocaleString('es-CO')}`;
  },

  render() {
    const cart = window.Storage?.getCart ? window.Storage.getCart() : [];
    const cartBody = document.getElementById('cartBody');
    const cartFooter = document.getElementById('cartFooter');
    const cartHeaderPill = document.getElementById('cartHeaderPill');
    const cartTotalItems = document.getElementById('cartTotalItems');
    const cartSubtotal = document.getElementById('cartSubtotal');

    if (!cartBody) return;

    const totalCount = window.Storage?.getCartCount ? window.Storage.getCartCount() : cart.reduce((acc, it) => acc + (it.quantity || 1), 0);
    if (cartHeaderPill) cartHeaderPill.textContent = totalCount;

    if (cart.length === 0) {
      if (cartFooter) cartFooter.style.display = 'none';
      const isModule = window.location.pathname.includes('/client/modules/');
      const rootPrefix = isModule ? '../../../' : './';

      cartBody.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">
            <span class="material-symbols-outlined text-[40px]">production_quantity_limits</span>
          </div>
          <div class="cart-empty-title">Tu cotización está vacía</div>
          <p class="cart-empty-desc">
            Agrega equipos y electrodomésticos desde el catálogo para generar tu solicitud formal por WhatsApp con precios de bodega directa.
          </p>
          <a href="${rootPrefix}client/modules/product/product.html" class="btn-explore-catalog" onclick="CartModal.close()">
            <span class="material-symbols-outlined text-[20px]">storefront</span>
            <span>Explorar Catálogo</span>
          </a>
        </div>
      `;
      return;
    }

    if (cartFooter) cartFooter.style.display = 'flex';
    if (cartTotalItems) cartTotalItems.textContent = `${totalCount} producto${totalCount > 1 ? 's' : ''}`;
    if (cartSubtotal) {
      const total = window.Storage?.getCartTotal ? window.Storage.getCartTotal() : 0;
      cartSubtotal.textContent = total > 0 ? this.formatCurrency(total) : 'A convenir';
    }

    cartBody.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img class="cart-item-img" src="${item.image || 'https://placehold.co/100'}" alt="${item.name}" loading="lazy">
        <div class="cart-item-info">
          <div>
            <div class="cart-item-title" title="${item.name}">${item.name}</div>
            ${item.sku ? `<div class="cart-item-sku">SKU: ${item.sku}</div>` : ''}
          </div>
          <div class="cart-item-price">${this.formatCurrency(item.price)}</div>
          <div class="cart-item-controls">
            <div class="qty-stepper">
              <button class="qty-btn" type="button" onclick="CartModal.changeQty('${item.id}', ${(item.quantity || 1) - 1})" aria-label="Disminuir cantidad">
                <span class="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <input class="qty-input" type="text" readonly value="${item.quantity || 1}" aria-label="Cantidad">
              <button class="qty-btn" type="button" onclick="CartModal.changeQty('${item.id}', ${(item.quantity || 1) + 1})" aria-label="Aumentar cantidad">
                <span class="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
            <button class="btn-remove-item" type="button" onclick="CartModal.removeItem('${item.id}')" title="Eliminar de cotización">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  changeQty(productId, newQty) {
    if (window.Storage?.updateCartQty) {
      window.Storage.updateCartQty(productId, newQty);
    }
    this.render();
    if (window.Navbar?.updateCartBadge) {
      window.Navbar.updateCartBadge();
    }
  },

  removeItem(productId) {
    if (window.Storage?.removeFromCart) {
      window.Storage.removeFromCart(productId);
    }
    this.render();
    if (window.Toast) {
      window.Toast.info('Producto retirado de la cotización');
    }
    if (window.Navbar?.updateCartBadge) {
      window.Navbar.updateCartBadge();
    }
  },

  bindEvents() {
    // Backdrop click to close
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    const btnClose = document.getElementById('btnCloseCart');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.close());
    }

    // Send WhatsApp quote
    const btnSend = document.getElementById('btnSendQuoteWhatsapp');
    if (btnSend) {
      btnSend.addEventListener('click', () => {
        const cart = window.Storage?.getCart ? window.Storage.getCart() : [];
        if (cart.length === 0) return;

        const notesInput = document.getElementById('cartCustomerNotes');
        const notes = notesInput ? notesInput.value : '';

        let url = '';
        if (window.OrderService?.buildWhatsAppQuoteUrl) {
          url = window.OrderService.buildWhatsAppQuoteUrl(cart, notes);
        } else {
          const phone = (window.CONFIG?.WHATSAPP_PHONE || window.CONFIG?.whatsappNumber || '584129227264').replace(/\D/g, '');
          let msg = `*SOLICITUD DE COTIZACIÓN COMERCIAL*\n*Comercializadora EL VECINO*\n\nHola, deseo cotizar disponibilidad de los siguientes ${cart.length} productos:\n\n`;
          cart.forEach((it, i) => {
            msg += `${i + 1}. *${it.name}* (Cant: ${it.quantity || 1})\n`;
          });
          if (notes) msg += `\nNota: ${notes}`;
          url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
        }

        window.open(url, '_blank');

        if (window.Toast) {
          window.Toast.success('Redirigiendo a WhatsApp con tu cotización...');
        }
        this.close();
      });
    }

    // Clear cart - Abre el modal de confirmación
    const btnClear = document.getElementById('btnClearCart');
    if (btnClear) {
      btnClear.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showClearConfirm();
      });
    }

    // Modal de confirmación: Botón Cancelar
    const btnCancelClear = document.getElementById('btnCancelClearCart');
    if (btnCancelClear) {
      btnCancelClear.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideClearConfirm();
      });
    }

    // Modal de confirmación: Botón Confirmar Vaciar
    const btnConfirmClear = document.getElementById('btnConfirmClearCart');
    if (btnConfirmClear) {
      btnConfirmClear.addEventListener('click', (e) => {
        e.stopPropagation();
        this.confirmClearCart();
      });
    }

    // Click en fondo del modal de confirmación para cerrar sólo el confirm
    const confirmOverlay = document.getElementById('cartConfirmModal');
    if (confirmOverlay) {
      confirmOverlay.addEventListener('click', (e) => {
        if (e.target === confirmOverlay) {
          this.hideClearConfirm();
        }
      });
    }

    // Tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const confirmModal = document.getElementById('cartConfirmModal');
        if (confirmModal && confirmModal.classList.contains('visible')) {
          this.hideClearConfirm();
          e.stopPropagation();
        } else if (this.backdrop && this.backdrop.classList.contains('open')) {
          this.close();
        }
      }
    });

    // Global listener when cart is updated externally
    window.addEventListener('cart:updated', () => {
      if (this.backdrop && this.backdrop.classList.contains('open')) {
        this.render();
      }
    });
  }
};

if (typeof window !== 'undefined') {
  window.CartModal = CartModal;
}
