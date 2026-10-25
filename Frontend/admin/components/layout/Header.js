// components/layout/Header.js
import { AuthGuard } from '../../core/guards.js';
import { STORAGE_KEYS } from '../../core/constants.js';

export function renderHeader() {
  const user = AuthGuard.getUser() || { name: 'Usuario', role: 'admin' };
  
  return `
    <header class="admin-header">
      <div class="flex items-center gap-4">
        <!-- Botón de menú móvil -->
        <button id="toggle-sidebar" class="mobile-menu-btn" aria-label="Abrir menú">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <span class="font-display text-xl font-bold text-deep-obsidian">Panel de Control</span>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="text-right">
          <p class="text-sm font-semibold text-deep-obsidian">${user.name}</p>
          <p class="text-xs text-gray-500 capitalize">${user.role}</p>
        </div>
        <button id="logout-btn" class="p-2 text-gray-500 hover:text-red-600 transition" title="Cerrar sesión" aria-label="Cerrar sesión">
          <span class="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  `;
}

export function bindHeaderEvents() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    const newBtn = logoutBtn.cloneNode(true);
    logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);

    newBtn.addEventListener('click', () => {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_info');
      sessionStorage.removeItem('el_vecino_jwt_token');
      sessionStorage.removeItem('el_vecino_user');
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('el_vecino_jwt_token');
      localStorage.removeItem('el_vecino_user');
      
      const redirectUrl = window.location.pathname.includes('/Frontend/')
        ? window.location.pathname.replace(/\/admin\/.*$/, '/loguin.html?redirect=admin')
        : '../loguin.html?redirect=admin';
      window.location.href = redirectUrl;
    });
  }
}