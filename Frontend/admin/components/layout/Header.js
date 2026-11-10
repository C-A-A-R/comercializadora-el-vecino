// components/layout/Header.js
import { AuthGuard } from '../../core/guards.js';
import { STORAGE_KEYS } from '../../core/constants.js';
import { SpecialDatesService } from '../../services/special-dates.service.js';
import { updateFavicon } from './Sidebar.js';

let cachedAlerts = [];

export function renderHeader() {
  const user = AuthGuard.getUser() || { name: 'Administrador', role: 'admin' };
  const alertCount = cachedAlerts.length;

  return `
    <header class="bg-white border-b border-slate-border px-4 md:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div class="flex items-center gap-3">
        <!-- Botón de apertura de drawer en móviles -->
        <button 
          id="open-sidebar" 
          type="button"
          class="md:hidden p-2 text-deep-obsidian hover:bg-slate-100 active:bg-slate-200 rounded-xl transition flex items-center justify-center cursor-pointer" 
          aria-label="Abrir menú de navegación"
        >
          <span class="material-symbols-outlined text-2xl">menu</span>
        </button>
        <div>
          <span class="font-display text-lg md:text-xl font-bold text-deep-obsidian block leading-tight">Panel de Control</span>
          <span class="text-[11px] text-gray-400 hidden sm:block">Comercializadora EL VECINO</span>
        </div>
      </div>

      <div class="flex items-center gap-2 md:gap-4">
        <!-- Botón de Notificaciones de Fechas Especiales -->
        <div class="relative" id="notifications-wrapper">
          <button 
            id="notifications-btn" 
            type="button" 
            class="relative p-2 text-gray-600 hover:text-electric-blue hover:bg-slate-100 rounded-xl transition cursor-pointer flex items-center justify-center" 
            title="Avisos y Fechas Especiales"
            aria-label="Notificaciones de fechas especiales"
            aria-expanded="false"
          >
            <span class="material-symbols-outlined text-2xl">notifications</span>
            ${alertCount > 0 ? `
              <span id="notifications-badge" class="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                ${alertCount}
              </span>
            ` : `
              <span id="notifications-badge" class="hidden absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                0
              </span>
            `}
          </button>

          <!-- Dropdown / Popover de Notificaciones -->
          <div 
            id="notifications-dropdown" 
            class="hidden absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-border py-3 z-50 text-left overflow-hidden transition-all duration-200"
          >
            <div class="px-4 pb-2.5 border-b border-slate-border flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-electric-blue text-lg">event_upcoming</span>
                <span class="text-xs font-bold text-deep-obsidian uppercase tracking-wider">Avisos de Temporada</span>
              </div>
              <a href="#/special-dates" class="text-[11px] font-bold text-electric-blue hover:underline">Ver todas</a>
            </div>

            <div id="notifications-list" class="max-h-80 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
              <div class="p-4 text-center text-xs text-gray-400">
                Cargando notificaciones...
              </div>
            </div>

            <div class="px-3 pt-2 border-t border-slate-border bg-slate-50/50 flex items-center justify-between">
              <button 
                id="btn-evaluate-alerts-now" 
                type="button" 
                class="text-[11px] font-bold text-gray-600 hover:text-electric-blue flex items-center gap-1 transition"
              >
                <span class="material-symbols-outlined text-sm">sync</span>
                Evaluar Recordatorios
              </button>
              <a href="#/special-dates" class="text-[11px] font-bold text-electric-blue hover:text-blue-800">
                Gestionar Fechas &rarr;
              </a>
            </div>
          </div>
        </div>

        <!-- Perfil de Usuario -->
        <div class="text-right hidden sm:block">
          <p class="text-xs md:text-sm font-semibold text-deep-obsidian leading-tight">${user.name}</p>
          <p class="text-[10px] text-gray-400 capitalize">${user.role}</p>
        </div>

        <!-- Botón Logout -->
        <button 
          id="logout-btn" 
          class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer" 
          title="Cerrar sesión" 
          aria-label="Cerrar sesión"
        >
          <span class="material-symbols-outlined text-xl md:text-2xl">logout</span>
        </button>
      </div>
    </header>
  `;
}

async function loadUpcomingAlerts() {
  try {
    cachedAlerts = await SpecialDatesService.getUpcomingAlerts();
    const badge = document.getElementById('notifications-badge');
    if (badge) {
      if (cachedAlerts.length > 0) {
        badge.textContent = cachedAlerts.length;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    const listEl = document.getElementById('notifications-list');
    if (!listEl) return;

    if (cachedAlerts.length === 0) {
      listEl.innerHTML = `
        <div class="p-6 text-center text-gray-400 space-y-1">
          <span class="material-symbols-outlined text-3xl text-gray-300">event_available</span>
          <p class="text-xs font-semibold text-gray-600">No hay fechas especiales próximas</p>
          <p class="text-[11px] text-gray-400">Todas las temporadas comerciales están al día.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = cachedAlerts.map(alert => `
      <div class="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 transition space-y-1">
        <div class="flex items-center justify-between">
          <span class="font-bold text-xs text-deep-obsidian flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            ${alert.name}
          </span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
            En ${alert.days_until} días
          </span>
        </div>
        <p class="text-[11px] text-gray-600 leading-tight">
          ${alert.suggested_strategy || alert.description || 'Temporada comercial activa'}
        </p>
        <p class="text-[10px] text-gray-400">
          Fecha: ${alert.next_occurrence_formatted}
        </p>
      </div>
    `).join('');
  } catch (err) {
    console.warn('[Header] Error cargando recordatorios:', err);
  }
}

export function bindHeaderEvents() {
  updateFavicon();

  // 1. Cargar notificaciones de fechas especiales
  loadUpcomingAlerts();

  // 2. Toggle del dropdown de notificaciones
  const notifBtn = document.getElementById('notifications-btn');
  const notifDropdown = document.getElementById('notifications-dropdown');
  if (notifBtn && notifDropdown) {
    notifBtn.onclick = (e) => {
      e.stopPropagation();
      const isHidden = notifDropdown.classList.contains('hidden');
      if (isHidden) {
        notifDropdown.classList.remove('hidden');
        notifBtn.setAttribute('aria-expanded', 'true');
        loadUpcomingAlerts();
      } else {
        notifDropdown.classList.add('hidden');
        notifBtn.setAttribute('aria-expanded', 'false');
      }
    };

    document.addEventListener('click', (e) => {
      if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
        notifDropdown.classList.add('hidden');
        notifBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 3. Botón de evaluar recordatorios bajo demanda
  document.getElementById('btn-evaluate-alerts-now')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    btn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span> Evaluando...';
    await SpecialDatesService.checkNow();
    await loadUpcomingAlerts();
    btn.innerHTML = '<span class="material-symbols-outlined text-sm">check</span> Al día';
    setTimeout(() => {
      btn.innerHTML = '<span class="material-symbols-outlined text-sm">sync</span> Evaluar Recordatorios';
    }, 2000);
  });

  // 4. Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
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
