/**
 * router.js - SPA Router adaptado para la consola B2B de Comercializadora El Vecino.
 * Soporta renderizado asíncrono, parámetros dinámicos (:id), guards y navegación activa.
 */
export class Router {
  constructor(routes, renderTarget) {
    this.routes = routes;
    this.target = typeof renderTarget === 'string' 
      ? document.querySelector(renderTarget) 
      : renderTarget;
    this.currentView = null;

    window.addEventListener('hashchange', () => this.resolve());
  }

  init() {
    this.resolve();
  }

  navigate(path) {
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    window.location.hash = formattedPath;
  }

  /**
   * Resuelve la ruta actual evaluando coincidencias exactas o parámetros dinámicos
   */
  matchRoute(hash) {
    // 1. Coincidencia exacta
    if (this.routes[hash]) {
      return { route: this.routes[hash], param: null, routeKey: hash };
    }

    // 2. Coincidencia dinámica tipo /modulo/accion/:id (ej. /products/edit/123)
    const dynamicMatch = hash.match(/^(\/[^\/]+\/[^\/]+)\/(.+)$/);
    if (dynamicMatch) {
      const baseRoute = dynamicMatch[1];
      const paramId = dynamicMatch[2];
      if (this.routes[baseRoute]) {
        return { route: this.routes[baseRoute], param: paramId, routeKey: baseRoute };
      }
    }

    // 3. Fallback 404
    return { 
      route: this.routes['404'] || this.routes['/404'], 
      param: null, 
      routeKey: '404' 
    };
  }

  async resolve() {
    let hash = window.location.hash.replace('#', '').trim();
    if (!hash || hash === '/') {
      hash = '/dashboard';
    } else if (!hash.startsWith('/')) {
      hash = `/${hash}`;
    }

    const { route, param, routeKey } = this.matchRoute(hash);

    if (!route) {
      if (this.target) {
        this.target.innerHTML = `
          <div class="p-8 text-center text-gray-400">
            <h1 class="text-3xl font-bold font-outfit text-white mb-2">404</h1>
            <p>La vista <code class="text-electric-blue">${hash}</code> no está registrada.</p>
          </div>`;
      }
      return;
    }

    // Evaluación del Guard de seguridad
    if (route.guard && typeof route.guard === 'function' && !route.guard()) {
      const forbiddenRoute = this.routes['403'] || this.routes['/403'];
      if (forbiddenRoute && this.target) {
        this.target.innerHTML = forbiddenRoute.renderAsync 
          ? await forbiddenRoute.renderAsync() 
          : forbiddenRoute.render();
        if (forbiddenRoute.afterRender) forbiddenRoute.afterRender();
      } else if (this.target) {
        this.target.innerHTML = `
          <div class="p-8 text-center text-red-500 font-bold text-xl">
            403 - Acceso no autorizado
          </div>`;
      }
      return;
    }

    // Destruir suscripciones/eventos de la vista anterior si existe
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }

    // Renderizar la vista activa (Soporta render síncrono y asíncrono)
    if (this.target) {
      if (typeof route.renderAsync === 'function') {
        this.target.innerHTML = await route.renderAsync(param);
      } else if (typeof route.render === 'function') {
        this.target.innerHTML = route.render(param);
      } else if (typeof route === 'function') {
        this.target.innerHTML = await route(param);
      } else if (typeof route === 'string') {
        this.target.innerHTML = route;
      }
    }

    // Ejecutar lifecycle posterior (afterRender)
    if (typeof route.afterRender === 'function') {
      route.afterRender(param);
    }

    this.currentView = route;

    // Actualizar estilos del menú de navegación lateral
    this.updateActiveNav(routeKey !== '404' ? routeKey : hash);
  }

  /**
   * Resalta el elemento activo en el Sidebar
   */
  updateActiveNav(currentPath) {
    const navLinks = document.querySelectorAll('aside nav a[data-path], aside nav a[href]');
    
    navLinks.forEach(link => {
      const linkPath = link.getAttribute('data-path') || link.getAttribute('href')?.replace('#', '');
      if (!linkPath) return;

      const normLink = linkPath.startsWith('/') ? linkPath : `/${linkPath}`;
      const isMatch = normLink === currentPath || currentPath.startsWith(normLink + '/');

      if (isMatch) {
        link.className = 'flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg text-white bg-electric-blue/20 text-electric-blue border border-electric-blue/30 transition-all';
      } else {
        link.className = 'flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg text-gray-400 hover:text-white hover:bg-surface-dark transition-all';
      }
    });
  }
}