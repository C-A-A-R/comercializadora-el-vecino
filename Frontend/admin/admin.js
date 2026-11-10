import { Router } from './core/router.js';
import { AuthGuard } from './core/guards.js';
import { renderSidebar } from './components/layout/Sidebar.js';
import { renderHeader, bindHeaderEvents } from './components/layout/Header.js';
import { renderAdminFooter } from './components/layout/Footer.js';
import { DashboardView } from './modules/dashboard/dashboard.view.js';
import { ProductListView } from './modules/products/product-list.view.js';
import { ProductFormView } from './modules/products/product-form.view.js';
import { CategoryListView } from './modules/categories/category-list.view.js';
import { PromotionsHubView } from './modules/promotions/promotions-hub.view.js';
import { PromotionFormView } from './modules/promotions/promotion-form.view.js';
import { ComboFormView } from './modules/combos/combo-form.view.js';
import { SpecialDatesView } from './modules/special-dates/special-dates.view.js';
import { ReviewListView } from './modules/reviews/review-list.view.js';
import { ReportView } from './modules/reports/report.view.js';

/**
 * Objeto de operaciones globales adaptado a la arquitectura modular
 */
export const AdminOps = {
  init() {
    console.log('[AdminOps] Inicializando operaciones del panel...');
    return AuthGuard.checkAccess('admin');
  }
};

if (typeof window !== 'undefined') {
  window.AdminOps = AdminOps;
}

const appTarget = document.getElementById('app');

/**
 * Construye la estructura base (Layout + Shell) alrededor del contenido dinámico
 */
function buildShell(contentHtml) {
  return `
    ${renderSidebar()}
    <div class="flex-1 flex flex-col min-w-0 min-h-screen">
      ${renderHeader()}
      <main id="main-content" class="p-4 md:p-6 flex-1 min-w-0 overflow-y-auto">
        ${contentHtml}
      </main>
      ${renderAdminFooter()}
    </div>
  `;
}

/**
 * Extensión del enrutador para soportar renderizado asíncrono y parámetros dinámicos
 */
export class AsyncRouter extends Router {
  async resolve() {
    const hash = window.location.hash.replace('#', '') || '/dashboard';
    
    let routeKey = hash;
    let paramId = null;

    if (hash.startsWith('/products/edit/')) {
      routeKey = '/products/edit';
      paramId = hash.split('/products/edit/')[1];
    } else if (hash.startsWith('/combos/edit/')) {
      routeKey = '/combos/edit';
      paramId = hash.split('/combos/edit/')[1];
    } else if (hash.startsWith('/promotions/edit/')) {
      routeKey = '/promotions/edit';
      paramId = hash.split('/promotions/edit/')[1];
    } else if (hash === '/banners' || hash.startsWith('/banners/')) {
      // Redireccionar banners al panel principal
      window.location.hash = '#/dashboard';
      return;
    }

    const route = this.routes[routeKey] || this.routes['404'];

    if (route) {
      if (route.guard && !route.guard()) {
        if (this.routes['403']) {
          this.target.innerHTML = typeof this.routes['403'].render === 'function' 
            ? this.routes['403'].render() 
            : await this.routes['403'].renderAsync();
        }
        return;
      }

      this.target.innerHTML = route.renderAsync 
        ? await route.renderAsync(paramId) 
        : route.render(paramId);

      if (route.afterRender) route.afterRender(paramId);
    }
  }
}

// Configuración de rutas SPA bajo la arquitectura modular
const routes = {
  '/dashboard': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => buildShell(await DashboardView.render()),
    afterRender: () => {
      bindHeaderEvents();
      DashboardView.bindEvents();
    }
  },
  '/products': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => buildShell(await ProductListView.render()),
    afterRender: () => {
      bindHeaderEvents();
      ProductListView.bindEvents();
    }
  },
  '/products/new': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => buildShell(await ProductFormView.render()),
    afterRender: () => {
      bindHeaderEvents();
      ProductFormView.bindEvents();
    }
  },
  '/products/edit': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async (id) => buildShell(await ProductFormView.render(id)),
    afterRender: () => {
      bindHeaderEvents();
      ProductFormView.bindEvents();
    }
  },
  '/categories': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => buildShell(await CategoryListView.render()),
    afterRender: () => {
      bindHeaderEvents();
      CategoryListView.bindEvents();
    }
  },
  '/promotions': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => buildShell(await PromotionsHubView.render()),
    afterRender: () => {
      bindHeaderEvents();
      PromotionsHubView.bindEvents();
    }
  },
  '/promotions/new': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => buildShell(await PromotionFormView.render()),
    afterRender: () => {
      bindHeaderEvents();
      PromotionFormView.bindEvents();
    }
  },
  '/promotions/edit': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async (id) => buildShell(await PromotionFormView.render(id)),
    afterRender: () => {
      bindHeaderEvents();
      PromotionFormView.bindEvents();
    }
  },
  '/combos': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => buildShell(await PromotionsHubView.render()),
    afterRender: () => {
      bindHeaderEvents();
      PromotionsHubView.bindEvents();
    }
  },
  '/combos/new': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => buildShell(await ComboFormView.render()),
    afterRender: () => {
      bindHeaderEvents();
      ComboFormView.bindEvents();
    }
  },
  '/combos/edit': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async (id) => buildShell(await ComboFormView.render(id)),
    afterRender: () => {
      bindHeaderEvents();
      ComboFormView.bindEvents();
    }
  },
  '/special-dates': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => buildShell(await SpecialDatesView.render()),
    afterRender: () => {
      bindHeaderEvents();
      SpecialDatesView.bindEvents();
    }
  },
  '/reviews': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => buildShell(await ReviewListView.render()),
    afterRender: () => {
      bindHeaderEvents();
      ReviewListView.bindEvents();
    }
  },
  '/reports': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => buildShell(await ReportView.render()),
    afterRender: () => {
      bindHeaderEvents();
      ReportView.bindEvents();
    }
  },
  '403': {
    render: () => buildShell(`
      <div class="p-8 text-center space-y-4">
        <span class="material-symbols-outlined text-6xl text-red-500">gpp_maybe</span>
        <h1 class="font-display text-3xl font-bold text-deep-obsidian">403 - Acceso Denegado</h1>
        <p class="text-gray-600 max-w-md mx-auto">No posees los permisos necesarios con tu rol actual para acceder a este módulo.</p>
      </div>
    `),
    afterRender: () => bindHeaderEvents()
  },
  '404': {
    render: () => buildShell(`
      <div class="p-8 text-center space-y-4">
        <span class="material-symbols-outlined text-6xl text-gray-400">find_in_page</span>
        <h1 class="font-display text-3xl font-bold text-deep-obsidian">404 - Ruta no encontrada</h1>
        <a href="#/dashboard" class="inline-block px-4 py-2 bg-electric-blue text-white rounded-lg text-sm font-medium">Volver a la Página Principal</a>
      </div>
    `),
    afterRender: () => bindHeaderEvents()
  }
};

/**
 * Control del Drawer en pantallas móviles (responsive)
 */
function setupMobileDrawer() {
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('#open-sidebar');
    if (openBtn) {
      const sidebar = document.getElementById('sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');
      if (sidebar) sidebar.classList.remove('-translate-x-full');
      if (backdrop) backdrop.classList.remove('hidden');
      return;
    }

    const closeBtn = e.target.closest('#toggle-sidebar');
    const backdropClick = e.target.id === 'sidebar-backdrop';
    const navLink = e.target.closest('#sidebar nav a');

    if (closeBtn || backdropClick || navLink) {
      const sidebar = document.getElementById('sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');
      if (sidebar && window.innerWidth < 768) {
        sidebar.classList.add('-translate-x-full');
      }
      if (backdrop) backdrop.classList.add('hidden');
    }
  });
}

// Inicialización robusta del enrutador asíncrono
function startAdminApp() {
  console.log('[admin.js] Ejecutando bootstrap del panel...');
  if (AdminOps.init()) {
    const router = new AsyncRouter(routes, appTarget);
    router.init();
    window.adminRouter = router;
    setupMobileDrawer();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startAdminApp);
} else {
  startAdminApp();
}
