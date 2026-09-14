// components/layout/Header.js
import { AuthGuard } from '../../core/guards.js';
import { STORAGE_KEYS } from '../../core/constants.js';

export function renderHeader() {
  const user = AuthGuard.getUser() || { name: 'Usuario', role: 'admin' };

  return `
    <header class="bg-white border-b border-slate-border px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button id="open-sidebar" class="md:hidden text-deep-obsidian" aria-label="Abrir menú">
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
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    
    // Redirección relativa al cerrar sesión
    window.location.href = '../loguin.html?redirect=admin';
  });
}