import { Router } from './core/router.js';
import { AuthGuard } from './core/guards.js';
import { bindHeaderEvents } from './components/layout/Header.js';
import { DashboardView } from './modules/dashboard/dashboard.view.js';
import { ProductListView } from './modules/products/product-list.view.js';
import { ProductFormView } from './modules/products/product-form.view.js';
import { CategoryListView } from './modules/categories/category-list.view.js';
import { PromotionListView } from './modules/promotions/promotion-list.view.js';
import { PromotionFormView } from './modules/promotions/promotion-form.view.js';
import { ComboListView } from './modules/combos/combo-list.view.js';
import { ComboFormView } from './modules/combos/combo-form.view.js';
import { SocialShowcaseView } from './modules/social-showcase/social-showcase.view.js';
import { WhatsAppCrmView } from './modules/whatsapp/whatsapp-crm.view.js';

export const AdminOps = {
  init() {
    console.log('[AdminOps] Inicializando operaciones del panel...');
    return AuthGuard.checkAccess('admin');
  }
};

if (typeof window !== 'undefined') {
  window.AdminOps = AdminOps;
}

// Control de visibilidad del mini menú de filtro global
function toggleDateFilter(show = true) {
  const filterContainer = document.getElementById('global-date-filter');
  if (filterContainer) {
    filterContainer.style.display = show ? 'flex' : 'none';
  }
}

// 1. Selector del contenedor principal de la aplicación
const appTarget = document.getElementById('app-content');

// 2. Mapeo directo de rutas en español con visibilidad de filtro según el contexto
const routes = {
  '/dashboard': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => await DashboardView.render(),
    afterRender: () => {
      toggleDateFilter(true); // Se muestra (Métricas generales)
      bindHeaderEvents();
    }
  },
  '/productos': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => await ProductListView.render(),
    afterRender: () => {
      toggleDateFilter(false); // Oculto en listados CRUD
      bindHeaderEvents();
      if (typeof ProductListView.bindEvents === 'function') {
        ProductListView.bindEvents();
      }
    }
  },
  '/productos/nuevo': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => await ProductFormView.render(),
    afterRender: () => {
      toggleDateFilter(false); // Oculto en formularios
      bindHeaderEvents();
      if (typeof ProductFormView.bindEvents === 'function') {
        ProductFormView.bindEvents();
      }
    }
  },
  '/productos/editar': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async (id) => await ProductFormView.render(id),
    afterRender: (id) => {
      toggleDateFilter(false);
      bindHeaderEvents();
      if (typeof ProductFormView.bindEvents === 'function') {
        ProductFormView.bindEvents(id);
      }
    }
  },
  '/categorias': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => await CategoryListView.render(),
    afterRender: () => {
      toggleDateFilter(false);
      bindHeaderEvents();
      if (typeof CategoryListView.bindEvents === 'function') {
        CategoryListView.bindEvents();
      }
    }
  },
  '/whatsapp': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => await WhatsAppCrmView.render(),
    afterRender: () => {
      toggleDateFilter(true); // Se muestra (Métricas de atención/conversión)
      bindHeaderEvents();
      if (typeof WhatsAppCrmView.bindEvents === 'function') {
        WhatsAppCrmView.bindEvents();
      }
    }
  },
  '/demos': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => await SocialShowcaseView.render(),
    afterRender: () => {
      toggleDateFilter(true); // Se muestra (Métricas de interacción/redes)
      bindHeaderEvents();
      if (typeof SocialShowcaseView.bindEvents === 'function') {
        SocialShowcaseView.bindEvents();
      }
    }
  },
  '/promos': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => await PromotionListView.render(),
    afterRender: () => {
      toggleDateFilter(false);
      bindHeaderEvents();
      if (typeof PromotionListView.bindEvents === 'function') {
        PromotionListView.bindEvents();
      }
    }
  },
  '/promociones/nueva': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => await PromotionFormView.render(),
    afterRender: () => {
      toggleDateFilter(false);
      bindHeaderEvents();
      if (typeof PromotionFormView.bindEvents === 'function') {
        PromotionFormView.bindEvents();
      }
    }
  },
  '/b2b': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => await ComboListView.render(),
    afterRender: () => {
      toggleDateFilter(false);
      bindHeaderEvents();
      if (typeof ComboListView.bindEvents === 'function') {
        ComboListView.bindEvents();
      }
    }
  },
  '/combos/nuevo': {
    guard: () => AuthGuard.checkAccess('admin'),
    renderAsync: async () => await ComboFormView.render(),
    afterRender: () => {
      toggleDateFilter(false);
      bindHeaderEvents();
      if (typeof ComboFormView.bindEvents === 'function') {
        ComboFormView.bindEvents();
      }
    }
  },
  '403': {
    render: () => `
      <div class="p-8 text-center space-y-4">
        <span class="material-symbols-outlined text-6xl text-red-500">gpp_maybe</span>
        <h1 class="font-outfit text-3xl font-bold text-white">403 - Acceso Denegado</h1>
        <p class="text-gray-400">No posees los privilegios administrativos requeridos.</p>
        <a href="#/dashboard" class="inline-block px-6 py-2.5 bg-electric-blue text-white font-bold rounded-xl text-sm">Volver al Inicio</a>
      </div>
    `
  },
  '404': {
    render: () => `
      <div class="p-8 text-center space-y-4">
        <span class="material-symbols-outlined text-6xl text-amber-500">search_off</span>
        <h1 class="font-outfit text-3xl font-bold text-white">404 - Módulo no encontrado</h1>
        <p class="text-gray-400">La ruta especificada no existe en la consola de administración.</p>
        <a href="#/dashboard" class="inline-block px-6 py-2.5 bg-electric-blue text-white font-bold rounded-xl text-sm">Volver al Inicio</a>
      </div>
    `
  }
};

// 3. Inicialización instanciando la clase Router
document.addEventListener('DOMContentLoaded', () => {
  if (appTarget) {
    const router = new Router(routes, appTarget);
    router.init();
  } else {
    console.error('[AdminOps] No se encontró el elemento contenedor #app-content');
  }
});