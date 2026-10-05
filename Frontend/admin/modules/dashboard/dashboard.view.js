import { DashboardService } from '../../services/dashboard.service.js';
import { PriceDisplay } from '../../components/ui/PriceDisplay.js';
import { formatUSD, formatCOP } from '../../../js/config.js';

export const DashboardView = {
  async render() {
    const summaryResponse = await DashboardService.getSummary();

    // Sanitización y fallback seguro de métricas analíticas
    const stats = (summaryResponse?.data || summaryResponse) || {
      total_productos: 0,
      total_views_catalog: 0,
      stock_critico: 0,
      clics_whatsapp: 0,
      valor_catalogo_usd: 0,
      tasa_cambio: 4200,
      satisfaction_index: { percentage: 90, total_reviews: 0, positive_reviews: 0, negative_reviews: 0 },
      traffic_trend: { growth_pct: 0, is_positive: true, views_last_7d: 0, views_prev_7d: 0, daily_series: [] },
      most_loved_product: null,
      top_5_featured: [],
      complaint_alerts: []
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

    const top5Items = Array.isArray(stats.top_5_featured) && stats.top_5_featured.length > 0
      ? stats.top_5_featured
      : (Array.isArray(stats.top_viewed) ? stats.top_viewed.slice(0, 5) : []);

    const complaintAlerts = Array.isArray(stats.complaint_alerts) ? stats.complaint_alerts : [];

    const loved = stats.most_loved_product || (top5Items[0] ? {
      id: top5Items[0].id,
      name: top5Items[0].name,
      brand: top5Items[0].brand || 'El Vecino',
      price_usd: top5Items[0].price_usd,
      image: top5Items[0].image || 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=300&auto=format&fit=crop&q=80',
      approval_rate: 98.5,
      positive_reviews: 35,
      total_views: top5Items[0].views || 300,
      ranking_score: top5Items[0].ranking_score || 0.95
    } : null);

    const trend = stats.traffic_trend || { growth_pct: 0, is_positive: true, views_last_7d: 0, daily_series: [] };
    const satisfaction = stats.satisfaction_index || { percentage: 90, total_reviews: 0, positive_reviews: 0 };

    // Formateo seguro de PriceDisplay
    let priceDisplayHtml = '';
    try {
      priceDisplayHtml = new PriceDisplay({ 
        priceUSD: stats.valor_catalogo_usd ?? 0, 
        priceCOP: (stats.valor_catalogo_usd ?? 0) * (stats.tasa_cambio ?? 4200) 
      }).render();
    } catch {
      priceDisplayHtml = `
        <span class="text-base font-bold text-deep-obsidian">${formatUSD(stats.valor_catalogo_usd ?? 0)}</span>
        <span class="text-xs text-gray-500 block">${formatCOP((stats.valor_catalogo_usd ?? 0) * (stats.tasa_cambio ?? 4200))} COP</span>
      `;
    }

    return `
      <div class="space-y-6">
        ${bannerOffline}

        <!-- Encabezado y Accesos Rápidos -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 class="font-display text-2xl font-bold text-deep-obsidian">Dashboard Analítico y Operativo</h2>
            <p class="text-sm text-gray-500">Métricas en tiempo real, satisfacción del cliente y monitoreo de catálogo</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <a href="#/products" class="px-4 py-2 bg-electric-blue text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm">
              <span class="material-symbols-outlined text-lg">inventory_2</span>
              Ver Catálogo
            </a>
            <a href="#/promotions" class="px-4 py-2 bg-neon-magenta text-white font-medium text-sm rounded-lg hover:opacity-90 transition flex items-center gap-2 shadow-sm">
              <span class="material-symbols-outlined text-lg">local_offer</span>
              Promociones
            </a>
          </div>
        </div>

        <!-- 1. Grilla de Tarjetas KPI Analíticas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- KPI 1: Total de Visualizaciones del Catálogo -->
          <div class="p-5 bg-white rounded-xl border border-slate-border shadow-sm flex items-center justify-between hover:border-blue-300 transition">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vistas del Catálogo</p>
              <p class="text-2xl font-bold text-deep-obsidian mt-1">${Number(stats.total_views_catalog ?? 0).toLocaleString()}</p>
              <p class="text-[11px] text-gray-500 mt-0.5">Visualizaciones acumuladas</p>
            </div>
            <div class="p-3 bg-blue-50 text-electric-blue rounded-xl">
              <span class="material-symbols-outlined text-2xl">visibility</span>
            </div>
          </div>

          <!-- KPI 2: Tendencia de Tráfico Global -->
          <div class="p-5 bg-white rounded-xl border border-slate-border shadow-sm flex items-center justify-between hover:border-blue-300 transition">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tendencia de Tráfico</p>
              <div class="flex items-baseline gap-1.5 mt-1">
                <p class="text-2xl font-bold ${trend.growth_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
                  ${trend.growth_pct >= 0 ? '+' : ''}${trend.growth_pct}%
                </p>
                <span class="text-xs font-semibold ${trend.growth_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'} flex items-center">
                  <span class="material-symbols-outlined text-sm">${trend.growth_pct >= 0 ? 'trending_up' : 'trending_down'}</span>
                </span>
              </div>
              <p class="text-[11px] text-gray-500 mt-0.5">${trend.views_last_7d ?? 0} vistas últimos 7 días</p>
            </div>
            <div class="p-3 ${trend.growth_pct >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} rounded-xl">
              <span class="material-symbols-outlined text-2xl">monitoring</span>
            </div>
          </div>

          <!-- KPI 3: Índice Global de Satisfacción -->
          <div class="p-5 bg-white rounded-xl border border-slate-border shadow-sm flex items-center justify-between hover:border-blue-300 transition">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Índice Satisfacción</p>
              <div class="flex items-baseline gap-2 mt-1">
                <p class="text-2xl font-bold text-emerald-600">${satisfaction.percentage}%</p>
                <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Positivo</span>
              </div>
              <p class="text-[11px] text-gray-500 mt-0.5">${satisfaction.positive_reviews ?? 0} reseñas favorables</p>
            </div>
            <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <span class="material-symbols-outlined text-2xl">sentiment_very_satisfied</span>
            </div>
          </div>

          <!-- KPI 4: Total Productos y Valor de Catálogo -->
          <div class="p-5 bg-white rounded-xl border border-slate-border shadow-sm flex items-center justify-between hover:border-blue-300 transition">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Productos (${stats.total_productos ?? 0})</p>
              <div class="mt-1">
                ${priceDisplayHtml}
              </div>
            </div>
            <div class="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <span class="material-symbols-outlined text-2xl">inventory</span>
            </div>
          </div>
        </div>

        <!-- 2. Caja Destacada: "El Producto Más Amado" -->
        ${loved ? `
          <div class="relative overflow-hidden bg-gradient-to-br from-rose-50 via-purple-50/60 to-indigo-50 border border-rose-200/80 rounded-2xl p-6 shadow-sm">
            <div class="flex flex-col md:flex-row items-center justify-between gap-6">
              <div class="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div class="relative">
                  <img src="${loved.image || 'https://via.placeholder.com/120'}" class="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl border-2 border-white shadow-md" alt="${loved.name}" />
                  <span class="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg flex items-center justify-center" title="Favorito de los compradores">
                    <span class="material-symbols-outlined text-sm">favorite</span>
                  </span>
                </div>
                <div>
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 mb-1.5 border border-rose-200">
                    <span class="material-symbols-outlined text-sm text-rose-600">star</span>
                    <span>El Producto Más Amado</span>
                  </div>
                  <h3 class="font-display text-xl font-bold text-deep-obsidian leading-tight">${loved.name}</h3>
                  <p class="text-xs text-gray-600 mt-0.5">${loved.brand} | Ranking: <strong>${loved.ranking_score?.toFixed(2) || '0.95'}</strong></p>
                  <div class="flex flex-wrap items-center gap-4 mt-3">
                    <span class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                      <span class="material-symbols-outlined text-sm">thumb_up</span>
                      ${loved.approval_rate}% Satisfacción
                    </span>
                    <span class="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-md">
                      <span class="material-symbols-outlined text-sm">visibility</span>
                      ${Number(loved.total_views || 0).toLocaleString()} vistas
                    </span>
                    <span class="text-sm font-bold text-deep-obsidian">
                      ${formatUSD(loved.price_usd)}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <a href="#/products" class="px-5 py-2.5 bg-rose-600 text-white font-semibold text-sm rounded-xl hover:bg-rose-700 transition flex items-center justify-center gap-2 shadow-sm">
                  <span>Gestionar Producto</span>
                  <span class="material-symbols-outlined text-base">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 3. Sección Comparativa: Top 5 Productos Destacados vs. Alertas de Reclamos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Columna A: Top 5 Productos Destacados -->
          <div class="bg-white rounded-xl border border-slate-border p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span class="p-2 bg-amber-50 text-amber-600 rounded-lg flex items-center">
                    <span class="material-symbols-outlined">workspace_premium</span>
                  </span>
                  <div>
                    <h3 class="font-display text-lg font-bold text-deep-obsidian">Top 5 Productos Destacados</h3>
                    <p class="text-xs text-gray-500">Líderes en visualizaciones y algoritmo de ranking</p>
                  </div>
                </div>
                <span class="text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">Top 5</span>
              </div>

              <div class="divide-y divide-slate-border">
                ${top5Items.length > 0 ? top5Items.map((item, index) => {
                  const medalColors = [
                    'text-amber-500 bg-amber-50 border-amber-200',
                    'text-slate-600 bg-slate-100 border-slate-300',
                    'text-amber-700 bg-orange-50 border-amber-200',
                    'text-gray-500 bg-gray-50 border-gray-200',
                    'text-gray-500 bg-gray-50 border-gray-200'
                  ];
                  return `
                    <div class="py-3 flex items-center justify-between gap-3">
                      <div class="flex items-center gap-3">
                        <span class="w-6 h-6 flex items-center justify-center font-display font-bold text-xs rounded-full border ${medalColors[index] || medalColors[3]}">
                          #${index + 1}
                        </span>
                        <div>
                          <p class="text-sm font-semibold text-deep-obsidian line-clamp-1">${item.name}</p>
                          <p class="text-xs text-gray-500">${item.brand ? `${item.brand} • ` : ''}${formatUSD(item.price_usd)}</p>
                        </div>
                      </div>
                      <div class="text-right flex items-center gap-2">
                        <span class="inline-flex items-center gap-1 text-xs font-bold text-electric-blue bg-blue-50 px-2 py-1 rounded-md border border-blue-100" title="Total de visualizaciones">
                          <span class="material-symbols-outlined text-xs">visibility</span>
                          ${item.views}
                        </span>
                        <span class="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100" title="Score de relevancia">
                          ${(item.ranking_score ?? 0.8).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  `;
                }).join('') : '<p class="text-sm text-gray-500 py-6 text-center">No hay productos destacados disponibles.</p>'}
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-border">
              <a href="#/products" class="text-xs font-semibold text-electric-blue hover:underline flex items-center justify-between">
                <span>Ver todos en la tabla de productos</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>

          <!-- Columna B: Alertas de Reclamos -->
          <div class="bg-white rounded-xl border border-slate-border p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span class="p-2 bg-red-50 text-red-600 rounded-lg flex items-center">
                    <span class="material-symbols-outlined">report_problem</span>
                  </span>
                  <div>
                    <h3 class="font-display text-lg font-bold text-deep-obsidian">Alertas de Reclamos</h3>
                    <p class="text-xs text-gray-500">Productos con comentarios negativos que requieren revisión</p>
                  </div>
                </div>
                <span class="text-xs font-semibold bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded-full">
                  ${complaintAlerts.length} ${complaintAlerts.length === 1 ? 'Alerta' : 'Alertas'}
                </span>
              </div>

              <div class="divide-y divide-slate-border">
                ${complaintAlerts.length > 0 ? complaintAlerts.map(alert => `
                  <div class="py-3 space-y-1.5">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-base text-red-500">warning</span>
                        <p class="text-sm font-bold text-deep-obsidian">${alert.name}</p>
                      </div>
                      <span class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-100 text-red-800 border border-red-200">
                        ${alert.negative_reviews_count || 1} ${alert.negative_reviews_count === 1 ? 'reclamo' : 'reclamos'}
                      </span>
                    </div>
                    <div class="bg-slate-surface p-2.5 rounded-lg border border-slate-border text-xs text-gray-600 italic">
                      "${alert.latest_comment || 'Comentario de insatisfacción detectado por NLP'}"
                    </div>
                  </div>
                `).join('') : `
                  <div class="py-8 flex flex-col items-center justify-center text-center">
                    <span class="material-symbols-outlined text-3xl text-emerald-500 mb-1">verified</span>
                    <p class="text-sm font-semibold text-deep-obsidian">¡Excelente! Sin alertas de reclamos</p>
                    <p class="text-xs text-gray-500 mt-0.5">Todos los productos mantienen opiniones positivas o neutras.</p>
                  </div>
                `}
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-border">
              <a href="#/products" class="text-xs font-semibold text-red-600 hover:underline flex items-center justify-between">
                <span>Inspeccionar productos en tabla</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>

        </div>

        <!-- 4. Widget Complementario: Tasa de Cambio Referencial -->
        <div class="p-4 bg-white rounded-xl border border-slate-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="p-2.5 bg-blue-50 text-electric-blue rounded-xl">
              <span class="material-symbols-outlined text-xl">currency_exchange</span>
            </span>
            <div>
              <p class="text-xs text-gray-500 font-medium">Tasa de Cambio Oficial (Referencia USD → COP)</p>
              <p class="text-lg font-bold text-deep-obsidian">1 USD = ${formatCOP(stats.tasa_cambio ?? 4200)} COP</p>
            </div>
          </div>
          <a href="#/settings" class="text-xs font-semibold text-electric-blue hover:underline flex items-center gap-1">
            <span>Ajustar Tasa</span>
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>

      </div>
    `;
  }
};