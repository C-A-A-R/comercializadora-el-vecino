import { DashboardService } from '../../services/dashboard.service.js';
import { PriceDisplay } from '../../components/ui/PriceDisplay.js';
import { formatUSD, formatCOP } from '../../../js/config.js';

export const DashboardView = {
  async render() {
    const summaryResponse = await DashboardService.getSummary();

    // Sanitización y fallback seguro de métricas
    const stats = summaryResponse?.data || {
      total_productos: 0,
      stock_critico: 0,
      clics_whatsapp: 0,
      valor_catalogo_usd: 0,
      tasa_cambio: 1,
      top_viewed: []
    };

    const isOffline = summaryResponse?.isOffline || false;

    const bannerOffline = isOffline ? `
      <div class="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg flex items-center gap-3">
        <span class="material-symbols-outlined text-amber-600">wifi_off</span>
        <div>
          <p class="text-sm font-semibold text-amber-800">Modo sin conexión</p>
          <p class="text-xs text-amber-700">Mostrando última información sincronizada en caché local.</p>
        </div>
      </div>
    ` : '';

    const topViewedItems = Array.isArray(stats.top_viewed) ? stats.top_viewed : [];

    // Formateo o instanciación segura de PriceDisplay
    let priceDisplayHtml = '';
    try {
      priceDisplayHtml = new PriceDisplay({ 
        priceUSD: stats.valor_catalogo_usd ?? 0, 
        priceCOP: (stats.valor_catalogo_usd ?? 0) * (stats.tasa_cambio ?? 1) 
      }).render();
    } catch {
      priceDisplayHtml = `
        <span class="text-base font-bold text-deep-obsidian">${formatUSD(stats.valor_catalogo_usd ?? 0)}</span>
        <span class="text-xs text-gray-500 block">${formatCOP((stats.valor_catalogo_usd ?? 0) * (stats.tasa_cambio ?? 1))} COP</span>
      `;
    }

    return `
      <div class="space-y-6">
        ${bannerOffline}

        <!-- Encabezado y Accesos Rápidos -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 class="font-display text-2xl font-bold text-deep-obsidian">Dashboard Operativo</h2>
            <p class="text-sm text-gray-500">Métricas en tiempo real e indicadores clave de rendimiento</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <a href="#/products" class="px-4 py-2 bg-electric-blue text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
              <span class="material-symbols-outlined text-lg">add</span>
              Nuevo Producto
            </a>
            <a href="#/promotions" class="px-4 py-2 bg-neon-magenta text-white font-medium text-sm rounded-lg hover:opacity-90 transition flex items-center gap-2">
              <span class="material-symbols-outlined text-lg">local_offer</span>
              Crear Promoción
            </a>
          </div>
        </div>

        <!-- Grilla de Tarjetas KPI -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Productos -->
          <div class="p-5 bg-white rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Total Productos</p>
              <p class="text-2xl font-bold text-deep-obsidian mt-1">${stats.total_productos ?? 0}</p>
            </div>
            <div class="p-3 bg-blue-50 text-electric-blue rounded-xl">
              <span class="material-symbols-outlined">inventory_2</span>
            </div>
          </div>

          <!-- Stock Crítico -->
          <div class="p-5 bg-white rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Stock Crítico (≤5)</p>
              <p class="text-2xl font-bold text-red-600 mt-1">${stats.stock_critico ?? 0}</p>
            </div>
            <div class="p-3 bg-red-50 text-red-600 rounded-xl">
              <span class="material-symbols-outlined">warning</span>
            </div>
          </div>

          <!-- Clics WhatsApp -->
          <div class="p-5 bg-white rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Clics WhatsApp (30d)</p>
              <p class="text-2xl font-bold text-whatsapp-green mt-1">${stats.clics_whatsapp ?? 0}</p>
            </div>
            <div class="p-3 bg-emerald-50 text-whatsapp-green rounded-xl">
              <span class="material-symbols-outlined">chat</span>
            </div>
          </div>

          <!-- Valor Catálogo USD -->
          <div class="p-5 bg-white rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Valor Catálogo</p>
              <div class="mt-1">
                ${priceDisplayHtml}
              </div>
            </div>
            <div class="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <span class="material-symbols-outlined">payments</span>
            </div>
          </div>
        </div>

        <!-- Sección Secundaria: Top Productos y Widget Tasa de Cambio -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Top 5 Productos Consultados -->
          <div class="lg:col-span-2 bg-white rounded-xl border border-slate-border p-5 shadow-sm">
            <h3 class="font-display text-lg font-bold text-deep-obsidian mb-4">Top Productos Más Consultados</h3>
            <div class="divide-y divide-slate-border">
              ${topViewedItems.length > 0 ? topViewedItems.map((item, index) => `
                <div class="py-3 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                    <span class="font-display font-bold text-sm text-gray-400 w-5">#${index + 1}</span>
                    <div>
                      <p class="text-sm font-medium text-deep-obsidian">${item.name}</p>
                      <p class="text-xs text-gray-500">${formatUSD(item.price_usd)} / ${formatCOP(item.price_usd * (stats.tasa_cambio ?? 1))} COP</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="inline-flex items-center gap-1 text-xs font-semibold text-electric-blue bg-blue-50 px-2.5 py-1 rounded-full">
                      <span class="material-symbols-outlined text-sm">visibility</span>
                      ${item.views}
                    </span>
                  </div>
                </div>
              `).join('') : '<p class="text-sm text-gray-500 py-4">No hay productos consultados para mostrar.</p>'}
            </div>
          </div>

          <!-- Tasa de Cambio Actual -->
          <div class="bg-white rounded-xl border border-slate-border p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-display text-lg font-bold text-deep-obsidian">Tasa de Cambio</h3>
                <span class="material-symbols-outlined text-gray-400">currency_exchange</span>
              </div>
              <p class="text-xs text-gray-500 mb-1">Tasa referencia USD → COP</p>
              <p class="text-3xl font-bold text-deep-obsidian">1 USD = ${formatCOP(stats.tasa_cambio ?? 1)} COP</p>
            </div>
            <div class="mt-6 pt-4 border-t border-slate-border">
              <a href="#/settings" class="text-sm font-medium text-electric-blue hover:underline flex items-center justify-between">
                <span>Ajustar tasa de cambio</span>
                <span class="material-symbols-outlined text-base">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};