export class Router {
  constructor(routes, renderTarget) {
    this.routes = routes;
    this.target = renderTarget;
    window.addEventListener('hashchange', () => this.resolve());
  }

  init() {
    this.resolve();
  }

  navigate(path) {
    window.location.hash = path;
  }

  resolve() {
    const hash = window.location.hash.replace('#', '') || '/dashboard';
    const route = this.routes[hash] || this.routes['404'];

    if (route) {
      if (route.guard && !route.guard()) {
        if (this.routes['403']) {
          this.target.innerHTML = this.routes['403'].render();
        } else {
          this.target.innerHTML = '<h1 class="p-8 text-2xl font-bold">403 - Acceso no autorizado</h1>';
        }
        return;
      }
      this.target.innerHTML = route.render();
      if (route.afterRender) route.afterRender();
    }
  }
}