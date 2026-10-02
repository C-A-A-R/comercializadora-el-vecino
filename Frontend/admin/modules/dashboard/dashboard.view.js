import { DashboardService } from '../../services/dashboard.service.js';
import { formatUSD } from '../../../js/config.js';

export const DashboardView = {
  async render() {
    const summaryResponse = await DashboardService.getSummary();

    const stats = summaryResponse?.data || {
      total_productos: 0,
      stock_critico: 0,
      clics_whatsapp: 0,
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

    return `
      <div class="space-y-6">
        ${bannerOffline}

        <!-- Tarjetas de Métricas Principales -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Total Productos</p>
              <p class="text-2xl font-bold text-deep-obsidian mt-1">${stats.total_productos ?? 0}</p>
            </div>
            <div class="p-3 bg-blue-50 text-electric-blue rounded-xl">
              <span class="material-symbols-outlined">inventory_2</span>
            </div>
          </div>

          <div class="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Stock Crítico (≤5)</p>
              <p class="text-2xl font-bold text-red-600 mt-1">${stats.stock_critico ?? 0}</p>
            </div>
            <div class="p-3 bg-red-50 text-red-600 rounded-xl">
              <span class="material-symbols-outlined">warning</span>
            </div>
          </div>

          <div class="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Clics WhatsApp (30D)</p>
              <p class="text-2xl font-bold text-whatsapp-green mt-1">${stats.clics_whatsapp ?? 0}</p>
            </div>
            <div class="p-3 bg-emerald-50 text-whatsapp-green rounded-xl">
              <span class="material-symbols-outlined">chat</span>
            </div>
          </div>

          <!-- Métrica B2B (Reemplaza a Valor Catálogo) -->
          <div class="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Cotizaciones de Combos</p>
              <p class="text-2xl font-bold text-purple-600 mt-1">42 <span class="text-xs font-normal text-gray-400">/mes</span></p>
            </div>
            <div class="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <span class="material-symbols-outlined">domain</span>
            </div>
          </div>
        </div>

        <!-- Sección Principal / Métricas B2B y Top Productos -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Top Productos Consultados -->
          <div class="lg:col-span-1 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <h3 class="font-display text-lg font-bold text-deep-obsidian mb-4">Top Productos Más Consultados</h3>
            <div class="divide-y divide-slate-100">
              ${topViewedItems.length > 0 ? topViewedItems.map((item, index) => `
                <div class="py-3 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                    <span class="font-display font-bold text-sm text-gray-400 w-5">#${index + 1}</span>
                    <div>
                      <p class="text-sm font-medium text-deep-obsidian">${item.name}</p>
                      <p class="text-xs text-gray-500">${formatUSD(item.price_usd)}</p>
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

          <!-- Módulo B2B & Demanda Comercial (Reemplaza a Tasa de Cambio) -->
          <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h3 class="font-display text-lg font-bold text-deep-obsidian">Estadísticas Generales</h3>
                  <p class="text-xs text-gray-500">Análisis comparativo de canales directos e interés por familias de productos</p>
                </div>
                <span class="material-symbols-outlined text-purple-600 bg-purple-50 p-2 rounded-lg">analytics</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                <!-- Gráfico Estático: Flujo de Demanda -->
                <div class="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-bold text-slate-700">Flujo de Productos</span>
                    <div class="flex items-center gap-2 text-[10px] text-gray-500">
                      <span class="inline-block w-2 h-2 rounded-full bg-blue-600"></span> Productos
                    </div>
                  </div>
                  
                  <!-- Barras de Gráfico -->
                  <div class="h-28 flex items-end justify-between gap-1 pt-4 px-2 border-b border-slate-200">
                    <div class="w-full bg-blue-500/80 h-[40%] rounded-t-sm"></div>
                    <div class="w-full bg-pink-500/80 h-[65%] rounded-t-sm"></div>
                    <div class="w-full bg-blue-500/80 h-[50%] rounded-t-sm"></div>
                    <div class="w-full bg-blue-600 h-[85%] rounded-t-sm"></div>
                    <div class="w-full bg-pink-500/80 h-[30%] rounded-t-sm"></div>
                    <div class="w-full bg-blue-500/80 h-[70%] rounded-t-sm"></div>
                    <div class="w-full bg-purple-600 h-[95%] rounded-t-sm"></div>
                    <div class="w-full bg-blue-500/80 h-[60%] rounded-t-sm"></div>
                  </div>
                  <p class="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
                    <span class="material-symbols-outlined text-xs">check_circle</span>
                    Tasa de respuesta efectiva en WhatsApp: 94.2% (antes de 5 minutos)
                  </p>
                </div>

                <!-- Indicador Circular: Interés por Familia -->
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span class="text-xs font-bold text-slate-700 mb-2">Interés por Familia</span>
                  <div class="relative w-20 h-20 rounded-full border-4 border-purple-500 border-t-blue-500 border-r-pink-500 flex items-center justify-center my-1">
                    <span class="text-xs font-bold text-deep-obsidian">100%</span>
                  </div>
                  <div class="text-[10px] text-gray-500 space-y-1 w-full text-left mt-2">
                    <div class="flex justify-between"><span>• Refrigeración</span><span class="font-bold">54%</span></div>
                    <div class="flex justify-between"><span>• Pantallas / Audio</span><span class="font-bold">28%</span></div>
                    <div class="flex justify-between"><span>• Cocina & Otros</span><span class="font-bold">18%</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span class="text-xs text-gray-500">Métricas del sistema</span>
              <a href="#/b2b" class="text-sm font-medium text-purple-600 hover:underline flex items-center gap-1">
                <span>Ir al Armador de Combos B2B</span>
                <span class="material-symbols-outlined text-base">arrow_forward</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    `;
  }
};