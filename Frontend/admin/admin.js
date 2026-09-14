import { Router } from './core/router.js';
import { AuthGuard } from './core/guards.js';
import { renderSidebar } from './components/layout/Sidebar.js';
import { renderHeader, bindHeaderEvents } from './components/layout/Header.js';
import { DashboardView } from './modules/dashboard/dashboard.view.js';
import { ProductListView } from './modules/products/product-list.view.js';
import { ProductFormView } from './modules/products/product-form.view.js';
import { CategoryListView } from './modules/categories/category-list.view.js';
import { PromotionListView } from './modules/promotions/promotion-list.view.js';
import { PromotionFormView } from './modules/promotions/promotion-form.view.js';
import { ComboListView } from './modules/combos/combo-list.view.js';
import { ComboFormView } from './modules/combos/combo-form.view.js';

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
    <div class="flex-1 flex flex-col min-w-0">
      ${renderHeader()}
      <main id="main-content" class="p-6 flex-1 overflow-y-auto">
        ${contentHtml}
      </main>
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

// Configuración de rutas SPA bajo la arquitectura definida en el SPEC
const routes = {
  '/dashboard': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => buildShell(await DashboardView.render()),
    afterRender: () => bindHeaderEvents()
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
    renderAsync: async () => buildShell(await PromotionListView.render()),
    afterRender: () => {
      bindHeaderEvents();
      PromotionListView.bindEvents();
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
  '/combos': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => buildShell(await ComboListView.render()),
    afterRender: () => {
      bindHeaderEvents();
      ComboListView.bindEvents();
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
        <a href="#/dashboard" class="inline-block px-4 py-2 bg-electric-blue text-white rounded-lg text-sm font-medium">Volver al Dashboard</a>
      </div>
    `),
    afterRender: () => bindHeaderEvents()
  }
};

// Inicialización del enrutador asíncrono
document.addEventListener('DOMContentLoaded', () => {
  if (AdminOps.init()) {
    const router = new AsyncRouter(routes, appTarget);
    router.init();
  }
});