import { DashboardService } from '../../services/dashboard.service.js';
import { StoreConfigService } from '../../services/store-config.service.js';
import { Toast } from '../../components/ui/Toast.js';

export const DashboardView = {
  settings: {},

  async render() {
    const summaryResponse = await DashboardService.getSummary();
    this.settings = StoreConfigService.getSettings();

    // Sanitización y fallback seguro de métricas
    const stats = (summaryResponse?.data || summaryResponse) || {
      total_productos: 0,
      total_views_catalog: 0,
      stock_critico: 0,
      clics_whatsapp: 0,
      satisfaction_index: { percentage: 94, total_reviews: 0, positive_reviews: 0 },
      traffic_trend: { growth_pct: 18.5, is_positive: true, views_last_7d: 1420 },
      top_5_featured: [],
      complaint_alerts: [],
      whatsapp_top_consulted: []
    };

    const top5Items = Array.isArray(stats.top_5_featured) && stats.top_5_featured.length > 0
      ? stats.top_5_featured
      : (Array.isArray(stats.top_viewed) ? stats.top_viewed.slice(0, 5) : []);

    const whatsappTop = Array.isArray(stats.whatsapp_top_consulted) && stats.whatsapp_top_consulted.length > 0
      ? stats.whatsapp_top_consulted
      : [
          { id: 101, name: 'Nevera Samsung 200L No Frost', brand: 'Samsung', category: 'Refrigeración', consultas_count: 88, porcentaje: 95, tendencia: '🔥 Alta Demanda', badge_color: 'bg-rose-100 text-rose-800 border-rose-200' },
          { id: 102, name: 'Lavadora LG Smart Motion 13kg', brand: 'LG', category: 'Lavado', consultas_count: 74, porcentaje: 80, tendencia: '⚡ Frecuente', badge_color: 'bg-blue-100 text-electric-blue border-blue-200' },
          { id: 106, name: 'Smart TV Samsung 55" Crystal UHD', brand: 'Samsung', category: 'Televisores', consultas_count: 61, porcentaje: 66, tendencia: '⚡ Frecuente', badge_color: 'bg-purple-100 text-purple-800 border-purple-200' },
          { id: 103, name: 'Cocina Mabe 4 Puestos Inox', brand: 'Mabe', category: 'Cocción', consultas_count: 48, porcentaje: 52, tendencia: '💬 Estable', badge_color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
          { id: 104, name: 'Aire Acondicionado Split 12000 BTU', brand: 'Mabe', category: 'Climatización', consultas_count: 36, porcentaje: 39, tendencia: '💬 Estable', badge_color: 'bg-amber-100 text-amber-800 border-amber-200' }
        ];

    const complaintAlerts = Array.isArray(stats.complaint_alerts) ? stats.complaint_alerts : [];
    const trend = stats.traffic_trend || { growth_pct: 18.5, views_last_7d: 1420 };
    const satisfaction = stats.satisfaction_index || { percentage: 94, positive_reviews: 81 };

    return `
      <div class="space-y-6">
        <!-- Encabezado Principal -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Panel de Control
              </span>
              <span class="text-xs text-gray-400">/</span>
              <span class="text-xs font-semibold text-gray-500">Resumen Operativo</span>
            </div>
            <h1 class="text-2xl font-bold text-deep-obsidian font-display">Página Principal</h1>
            <p class="text-sm text-gray-500">Supervisión general de la tienda, métricas clave y configuración centralizada de WhatsApp.</p>
          </div>
          <div class="flex flex-wrap items-center gap-2.5">
            <a href="#/banners" class="px-3.5 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs rounded-xl border border-purple-200 transition flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">view_carousel</span>
              Banners de Portada
            </a>
            <a href="#/reviews" class="px-3.5 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-xs rounded-xl border border-amber-200 transition flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">rate_review</span>
              Moderar Reseñas
            </a>
            <a href="#/promotions" class="px-3.5 py-2 bg-electric-blue text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm">
              <span class="material-symbols-outlined text-base">auto_awesome_motion</span>
              Promociones & Combos
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
                <p class="text-2xl font-bold text-emerald-600">
                  +${trend.growth_pct}%
                </p>
                <span class="text-xs font-semibold text-emerald-600 flex items-center">
                  <span class="material-symbols-outlined text-sm">trending_up</span>
                </span>
              </div>
              <p class="text-[11px] text-gray-500 mt-0.5">${trend.views_last_7d ?? 0} vistas últimos 7 días</p>
            </div>
            <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
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
              <p class="text-[11px] text-gray-400 mt-0.5">${satisfaction.positive_reviews ?? 0} reseñas favorables</p>
            </div>
            <div class="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <span class="material-symbols-outlined text-2xl">sentiment_very_satisfied</span>
            </div>
          </div>

          <!-- KPI 4: Total Productos Activos -->
          <div class="p-5 bg-white rounded-xl border border-slate-border shadow-sm flex items-center justify-between hover:border-blue-300 transition">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Productos</p>
              <p class="text-2xl font-bold text-deep-obsidian mt-1">${stats.total_productos ?? 0}</p>
              <p class="text-[11px] text-gray-400 mt-0.5">En catálogo disponible</p>
            </div>
            <div class="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <span class="material-symbols-outlined text-2xl">inventory_2</span>
            </div>
          </div>
        </div>

        <!-- 2. CONFIGURACIÓN GENERAL DE LA TIENDA Y WHATSAPP (Módulo Integrado) -->
        <div class="bg-white rounded-2xl border border-slate-border p-6 shadow-sm space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-border pb-4">
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-whatsapp-green border border-green-200 mb-1">
                <span class="material-symbols-outlined text-sm">tune</span>
                Configuración General & Canales de Contacto
              </div>
              <h2 class="font-display text-xl font-bold text-deep-obsidian">Ajustes de Tienda y WhatsApp Principal</h2>
              <p class="text-xs text-gray-500">Actualice el número de atención, horarios, mensaje inicial y redes sociales que ven los clientes.</p>
            </div>

            <div class="flex items-center gap-2">
              <button id="btn-test-main-whatsapp" type="button" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-border">
                <span class="material-symbols-outlined text-sm text-whatsapp-green">open_in_new</span>
                Probar WhatsApp de Atención
              </button>
            </div>
          </div>

          <form id="form-store-settings" class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <!-- Teléfono de WhatsApp -->
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Número Principal de WhatsApp *
                </label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-whatsapp-green text-lg">chat</span>
                  <input 
                    type="text" 
                    id="setting-whatsapp-number" 
                    required 
                    value="${this.settings.whatsapp_number || ''}" 
                    placeholder="Ej: +57 312 456 7890" 
                    class="w-full pl-10 pr-3.5 py-2.5 bg-slate-surface border border-slate-border rounded-xl text-xs font-bold text-deep-obsidian focus:bg-white focus:ring-2 focus:ring-electric-blue outline-none transition"
                  />
                </div>
                <p class="text-[11px] text-gray-400">Número al que se dirigirán todas las consultas y cotizaciones del catálogo.</p>
              </div>

              <!-- Horarios de Atención -->
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Horarios de Atención al Público *
                </label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">schedule</span>
                  <input 
                    type="text" 
                    id="setting-store-hours" 
                    required 
                    value="${this.settings.store_hours || ''}" 
                    placeholder="Ej: Lunes a Sábado: 8:00 AM - 6:30 PM" 
                    class="w-full pl-10 pr-3.5 py-2.5 bg-slate-surface border border-slate-border rounded-xl text-xs font-semibold text-deep-obsidian focus:bg-white focus:ring-2 focus:ring-electric-blue outline-none transition"
                  />
                </div>
                <p class="text-[11px] text-gray-400">Visible en el encabezado y pie de página de la tienda.</p>
              </div>

              <!-- Mensaje de Bienvenida General -->
              <div class="space-y-1.5 md:col-span-2">
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Mensaje de Bienvenida General (WhatsApp) *
                </label>
                <textarea 
                  id="setting-welcome-msg" 
                  rows="2" 
                  required 
                  class="w-full p-3 bg-slate-surface border border-slate-border rounded-xl text-xs text-deep-obsidian leading-relaxed focus:bg-white focus:ring-2 focus:ring-electric-blue outline-none transition"
                  placeholder="Escriba el saludo inicial que recibirá el asesor al abrir el chat..."
                >${this.settings.whatsapp_welcome_message || ''}</textarea>
              </div>

              <!-- Dirección Física del Local -->
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Dirección del Local / Punto de Venta
                </label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">store</span>
                  <input 
                    type="text" 
                    id="setting-store-address" 
                    value="${this.settings.store_address || ''}" 
                    placeholder="Ej: Carrera 15 # 34-20, Local 102" 
                    class="w-full pl-10 pr-3.5 py-2.5 bg-slate-surface border border-slate-border rounded-xl text-xs text-deep-obsidian focus:bg-white focus:ring-2 focus:ring-electric-blue outline-none transition"
                  />
                </div>
              </div>

              <!-- Ciudad / Región -->
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Ciudad / Municipio
                </label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">location_on</span>
                  <input 
                    type="text" 
                    id="setting-store-city" 
                    value="${this.settings.store_city || ''}" 
                    placeholder="Ej: Bucaramanga, Santander" 
                    class="w-full pl-10 pr-3.5 py-2.5 bg-slate-surface border border-slate-border rounded-xl text-xs text-deep-obsidian focus:bg-white focus:ring-2 focus:ring-electric-blue outline-none transition"
                  />
                </div>
              </div>

              <!-- Redes Sociales: Instagram -->
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Instagram</label>
                <input 
                  type="text" 
                  id="setting-instagram" 
                  value="${this.settings.social_instagram || ''}" 
                  placeholder="https://instagram.com/comercializadoraelvecino" 
                  class="w-full px-3.5 py-2.5 bg-slate-surface border border-slate-border rounded-xl text-xs text-deep-obsidian focus:bg-white focus:ring-2 focus:ring-electric-blue outline-none transition font-mono"
                />
              </div>

              <!-- Redes Sociales: Facebook -->
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Facebook</label>
                <input 
                  type="text" 
                  id="setting-facebook" 
                  value="${this.settings.social_facebook || ''}" 
                  placeholder="https://facebook.com/comercializadoraelvecino" 
                  class="w-full px-3.5 py-2.5 bg-slate-surface border border-slate-border rounded-xl text-xs text-deep-obsidian focus:bg-white focus:ring-2 focus:ring-electric-blue outline-none transition font-mono"
                />
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-slate-border">
              <button type="submit" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm">
                <span class="material-symbols-outlined text-base">save</span>
                Guardar Ajustes de la Tienda
              </button>
            </div>
          </form>
        </div>

        <!-- 3. BARRA DE PRODUCTOS MÁS PREGUNTADOS POR WHATSAPP / MAYOR COTIZADOS -->
        <div class="bg-white rounded-2xl border border-slate-border p-6 shadow-sm space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-border pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-green-50 text-whatsapp-green flex items-center justify-center flex-shrink-0 border border-green-200">
                <span class="material-symbols-outlined text-2xl">chat</span>
              </div>
              <div>
                <h2 class="font-display text-lg font-bold text-deep-obsidian flex items-center gap-2">
                  Productos Más Preguntados por WhatsApp & Mayor Cotizados
                </h2>
                <p class="text-xs text-gray-500">Volumen y porcentaje de cotizaciones solicitadas por clientes directamente al WhatsApp de atención.</p>
              </div>
            </div>
            <span class="text-xs font-bold bg-green-50 text-whatsapp-green border border-green-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-whatsapp-green animate-pulse"></span>
              En Vivo
            </span>
          </div>

          <!-- Barras de Progreso Comparativas -->
          <div class="space-y-4 pt-1">
            ${whatsappTop.map((item, index) => {
              const rankColor = index === 0 
                ? 'bg-amber-500 text-white' 
                : (index === 1 ? 'bg-slate-400 text-white' : (index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-gray-700'));

              return `
                <div class="p-3.5 bg-slate-surface/60 rounded-xl border border-slate-border hover:bg-slate-surface transition space-y-2">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div class="flex items-center gap-2.5">
                      <span class="w-6 h-6 rounded-full ${rankColor} text-[11px] font-bold font-display flex items-center justify-center flex-shrink-0 shadow-sm">
                        #${index + 1}
                      </span>
                      <div>
                        <p class="text-xs font-bold text-deep-obsidian leading-tight">${item.name}</p>
                        <p class="text-[11px] text-gray-500">${item.brand || 'El Vecino'} · <span class="font-medium text-gray-600">${item.category || 'Electrodoméstico'}</span></p>
                      </div>
                    </div>

                    <div class="flex items-center gap-3 self-end sm:self-center">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.badge_color || 'bg-blue-50 text-blue-700 border-blue-200'}">
                        ${item.tendencia || 'Frecuente'}
                      </span>
                      <div class="text-right">
                        <span class="text-xs font-black text-whatsapp-green font-display">${item.consultas_count} consultas</span>
                        <span class="text-[10px] text-gray-400 block">WhatsApp</span>
                      </div>
                    </div>
                  </div>

                  <!-- Barra de Progreso Visual -->
                  <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      class="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-whatsapp-green transition-all duration-700" 
                      style="width: ${item.porcentaje || 50}%"
                      title="${item.porcentaje}% de demanda relativa"
                    ></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 4. Sección Comparativa: Top 5 Productos Destacados vs. Alertas de Reclamos -->
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
                    <h3 class="font-display text-lg font-bold text-deep-obsidian">Top 5 Productos Más Populares</h3>
                    <p class="text-xs text-gray-500">Líderes en visualizaciones en el catálogo web</p>
                  </div>
                </div>
                <span class="text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">Top 5</span>
              </div>

              <div class="divide-y divide-slate-border">
                ${top5Items.length > 0 ? top5Items.map((item, index) => `
                  <div class="py-3 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                      <span class="w-6 h-6 flex items-center justify-center font-display font-bold text-xs rounded-full border text-amber-600 bg-amber-50 border-amber-200">
                        #${index + 1}
                      </span>
                      <div>
                        <p class="text-sm font-semibold text-deep-obsidian line-clamp-1">${item.name}</p>
                        <p class="text-xs text-gray-500">${item.brand || 'El Vecino'}</p>
                      </div>
                    </div>
                    <div class="text-right flex items-center gap-2">
                      <span class="inline-flex items-center gap-1 text-xs font-bold text-electric-blue bg-blue-50 px-2 py-1 rounded-md border border-blue-100" title="Vistas">
                        <span class="material-symbols-outlined text-xs">visibility</span>
                        ${item.views || 250}
                      </span>
                    </div>
                  </div>
                `).join('') : '<p class="text-sm text-gray-500 py-6 text-center">No hay productos destacados disponibles.</p>'}
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-border">
              <a href="#/products" class="text-xs font-semibold text-electric-blue hover:underline flex items-center justify-between">
                <span>Ver catálogo completo de productos</span>
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
                    <p class="text-xs text-gray-500">Comentarios de clientes pendientes de atención inmediata</p>
                  </div>
                </div>
                <a href="#/reviews" class="text-xs font-semibold bg-red-50 text-red-800 border border-red-200 px-2.5 py-0.5 rounded-full hover:bg-red-100 transition">
                  ${complaintAlerts.length} ${complaintAlerts.length === 1 ? 'Alerta' : 'Alertas'}
                </a>
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
                        ${alert.negative_reviews_count || 1} reclamo
                      </span>
                    </div>
                    <div class="bg-slate-surface p-2.5 rounded-lg border border-slate-border text-xs text-gray-600 italic">
                      "${alert.latest_comment || 'Comentario de insatisfacción'}"
                    </div>
                  </div>
                `).join('') : `
                  <div class="py-8 flex flex-col items-center justify-center text-center">
                    <span class="material-symbols-outlined text-3xl text-emerald-500 mb-1">verified</span>
                    <p class="text-sm font-semibold text-deep-obsidian">¡Excelente! Sin alertas de reclamos</p>
                    <p class="text-xs text-gray-500 mt-0.5">Todos los productos mantienen opiniones positivas.</p>
                  </div>
                `}
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-border">
              <a href="#/reviews" class="text-xs font-semibold text-rose-600 hover:underline flex items-center justify-between">
                <span>Ir al módulo de moderación de reseñas</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    const form = document.getElementById('form-store-settings');
    const btnTestWa = document.getElementById('btn-test-main-whatsapp');

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updated = {
        whatsapp_number: document.getElementById('setting-whatsapp-number')?.value.trim(),
        store_hours: document.getElementById('setting-store-hours')?.value.trim(),
        whatsapp_welcome_message: document.getElementById('setting-welcome-msg')?.value.trim(),
        store_address: document.getElementById('setting-store-address')?.value.trim(),
        store_city: document.getElementById('setting-store-city')?.value.trim(),
        social_instagram: document.getElementById('setting-instagram')?.value.trim(),
        social_facebook: document.getElementById('setting-facebook')?.value.trim()
      };

      try {
        await StoreConfigService.saveSettings(updated);
        Toast.show('Configuración de la tienda guardada con éxito', 'success');
      } catch (err) {
        console.error(err);
        Toast.show('Error al guardar la configuración', 'error');
      }
    });

    btnTestWa?.addEventListener('click', () => {
      const phoneInput = document.getElementById('setting-whatsapp-number')?.value || '+573124567890';
      const cleanPhone = phoneInput.replace(/[^0-9]/g, '');
      const msg = document.getElementById('setting-welcome-msg')?.value || 'Hola';
      const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    });
  }
};