/**
 * cart-modal.js - Quotation slide-over drawer and WhatsApp quote trigger
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
            <span class="material-symbols-outlined text-electric-blue text-[24px]">shopping_bag</span>
            <span>Cotización</span>
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
          <div class="cart-summary-row">
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
            <span>Enviar Cotización por WhatsApp</span>
          </button>
          <button class="btn-clear-cart" id="btnClearCart" type="button">
            Vaciar lista de cotización
          </button>
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
    this.backdrop.classList.remove('open');
    document.body.style.overflow = '';
  },

  render() {
    const cart = window.Storage?.getCart() || [];
    const cartBody = document.getElementById('cartBody');
    const cartFooter = document.getElementById('cartFooter');
    const cartHeaderPill = document.getElementById('cartHeaderPill');
    const cartTotalItems = document.getElementById('cartTotalItems');
    const cartSubtotal = document.getElementById('cartSubtotal');

    if (!cartBody) return;

    const totalCount = window.Storage.getCartCount();
    if (cartHeaderPill) cartHeaderPill.textContent = totalCount;

    if (cart.length === 0) {
      if (cartFooter) cartFooter.style.display = 'none';
      const isModule = window.location.pathname.includes('/client/modules/');
      const rootPrefix = isModule ? '../../../' : './';

      cartBody.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">
            <span class="material-symbols-outlined text-[36px]">production_quantity_limits</span>
          </div>
          <div class="cart-empty-title">Tu cotización está vacía</div>
          <p class="cart-empty-desc">
            Agrega equipos y electrodomésticos desde el catálogo para generar tu solicitud formal por WhatsApp con precios de bodega directa.
          </p>
          <a href="${rootPrefix}client/modules/product/product.html" class="btn-nav-whatsapp mt-2" onclick="CartModal.close()">
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
      const total = window.Storage.getCartTotal();
      cartSubtotal.textContent = window.CONFIG.formatCurrency(total);
    }

    cartBody.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img class="cart-item-img" src="${item.image || 'https://placehold.co/100'}" alt="${item.name}">
        <div class="cart-item-info">
          <div>
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-sku">SKU: ${item.sku || 'N/A'}</div>
          </div>
          <div class="cart-item-price">${window.CONFIG.formatCurrency(item.price)}</div>
          <div class="cart-item-controls">
            <div class="qty-stepper">
              <button class="qty-btn" onclick="CartModal.changeQty('${item.id}', ${(item.quantity || 1) - 1})">
                <span class="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <input class="qty-input" type="text" readonly value="${item.quantity || 1}">
              <button class="qty-btn" onclick="CartModal.changeQty('${item.id}', ${(item.quantity || 1) + 1})">
                <span class="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
            <button class="btn-remove-item" onclick="CartModal.removeItem('${item.id}')" title="Eliminar">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  changeQty(productId, newQty) {
    window.Storage.updateCartQty(productId, newQty);
    this.render();
  },

  removeItem(productId) {
    window.Storage.removeFromCart(productId);
    this.render();
    if (window.Toast) {
      window.Toast.info('Producto retirado de la cotización');
    }
  },

  bindEvents() {
    // Backdrop click to close
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    const btnClose = document.getElementById('btnCloseCart');
    if (btnClose) btnClose.addEventListener('click', () => this.close());

    // Send WhatsApp quote
    const btnSend = document.getElementById('btnSendQuoteWhatsapp');
    if (btnSend) {
      btnSend.addEventListener('click', () => {
        const cart = window.Storage.getCart();
        if (cart.length === 0) return;

        const notesInput = document.getElementById('cartCustomerNotes');
        const notes = notesInput ? notesInput.value : '';

        const url = window.OrderService.buildWhatsAppQuoteUrl(cart, notes);
        window.open(url, '_blank');

        if (window.Toast) {
          window.Toast.success('Redirigiendo a WhatsApp con tu cotización...');
        }
        this.close();
      });
    }

    // Clear cart
    const btnClear = document.getElementById('btnClearCart');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (confirm('¿Deseas vaciar todos los productos de tu lista de cotización?')) {
          window.Storage.clearCart();
          this.render();
          if (window.Toast) window.Toast.info('Lista de cotización vaciada.');
        }
      });
    }

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
