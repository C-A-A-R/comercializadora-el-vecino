import { SocialShowcaseService } from '../../services/social-showcase.service.js';
import { Toast } from '../../components/ui/Toast.js';

export const SocialShowcaseView = {
  currentFilter: 'all',

  async render() {
    return `
      <div class="space-y-6">
        <!-- Encabezado y Métricas Rápidas -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-deep-obsidian font-display">Vitrina & Moderación de Redes Sociales</h1>
            <p class="text-sm text-gray-500">Métricas de videos y filtro de seguridad contra comentarios negativos / amenazantes.</p>
          </div>
          <button id="refresh-social-btn" class="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <span class="material-symbols-outlined text-sm">refresh</span> Actualizar Feed
          </button>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <span class="text-xs font-semibold text-gray-500 block">Total Reels / Demos</span>
              <span id="kpi-reels" class="text-xl font-bold text-deep-obsidian">0</span>
            </div>
            <div class="w-10 h-10 rounded-lg bg-blue-50 text-electric-blue flex items-center justify-center">
              <span class="material-symbols-outlined">movie</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <span class="text-xs font-semibold text-gray-500 block">Alcance / Visualizaciones</span>
              <span id="kpi-views" class="text-xl font-bold text-deep-obsidian">0</span>
            </div>
            <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <span class="material-symbols-outlined">visibility</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <span class="text-xs font-semibold text-gray-500 block">Cierres WhatsApp vía RRSS</span>
              <span id="kpi-conversions" class="text-xl font-bold text-emerald-600">0</span>
            </div>
            <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span class="material-symbols-outlined">chat</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-red-200 bg-red-50/30 shadow-sm flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-red-600 block">Alertas / Comentarios Críticos</span>
              <span id="kpi-critical" class="text-xl font-bold text-red-600">0</span>
            </div>
            <div class="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center animate-pulse">
              <span class="material-symbols-outlined">warning</span>
            </div>
          </div>
        </div>

        <!-- Sección Principal: Moderación de Interacciones / Comentarios -->
        <div class="bg-white rounded-xl border border-slate-border shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 class="text-base font-bold text-deep-obsidian flex items-center gap-2">
                <span class="material-symbols-outlined text-red-500">security</span>
                Filtro Anti-Riesgo y Moderación de Comentarios
              </h2>
              <p class="text-xs text-gray-500">Monitoreo en tiempo real de interacciones con detección de palabras de riesgo.</p>
            </div>

            <!-- Filtros de Sentimiento -->
            <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button data-filter="all" class="filter-tab px-3 py-1.5 rounded-md bg-white text-gray-800 shadow-sm">Todos</button>
              <button data-filter="critical" class="filter-tab px-3 py-1.5 rounded-md text-red-600 hover:bg-white/50">🚨 Amenazas / Riesgo</button>
              <button data-filter="negative" class="filter-tab px-3 py-1.5 rounded-md text-amber-700 hover:bg-white/50">⚠️️ Quejas / Negativos</button>
              <button data-filter="positive" class="filter-tab px-3 py-1.5 rounded-md text-emerald-700 hover:bg-white/50">✨ Oportunidad Venta</button>
            </div>
          </div>

          <!-- Listado de Comentarios -->
          <div id="comments-container" class="divide-y divide-slate-border">
            <div class="p-8 text-center text-gray-400 text-sm">Cargando comentarios de redes sociales...</div>
          </div>
        </div>

        <!-- Galería de Demos y Reels Publicados -->
        <div class="space-y-4">
          <h2 class="text-lg font-bold text-deep-obsidian font-display">Demos & Reels Activos en Catálogo</h2>
          <div id="reels-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Cargado dinámicamente -->
          </div>
        </div>
      </div>
    `;
  },

  async bindEvents() {
    await this.loadMetrics();
    await this.loadComments();
    await this.loadReels();

    // Eventos de Filtro
    document.querySelectorAll('.filter-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-tab').forEach(b => {
          b.classList.remove('bg-white', 'text-gray-800', 'shadow-sm');
          b.classList.add('text-gray-600');
        });
        e.target.classList.add('bg-white', 'text-gray-800', 'shadow-sm');
        e.target.classList.remove('text-gray-600');

        this.currentFilter = e.target.getAttribute('data-filter');
        this.loadComments();
      });
    });

    document.getElementById('refresh-social-btn')?.addEventListener('click', () => {
      this.bindEvents();
      Toast.show({ message: 'Sincronizando feed de redes sociales...', type: 'info' });
    });
  },

  async loadMetrics() {
    const data = await SocialShowcaseService.getMetrics();
    document.getElementById('kpi-reels').textContent = data.totalReels;
    document.getElementById('kpi-views').textContent = data.totalViews;
    document.getElementById('kpi-conversions').textContent = data.whatsappConversions;
    document.getElementById('kpi-critical').textContent = data.pendingCriticalComments;
  },

  async loadComments() {
    const container = document.getElementById('comments-container');
    const comments = await SocialShowcaseService.getComments(this.currentFilter);

    if (comments.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-gray-400 text-sm">No hay comentarios en este filtro.</div>`;
      return;
    }

    container.innerHTML = comments.map(c => {
      let badgeStyle = 'bg-gray-100 text-gray-700';
      let badgeText = 'Normal';
      let borderLeft = 'border-l-4 border-slate-300';

      if (c.sentiment === 'CRITICAL') {
        badgeStyle = 'bg-red-100 text-red-800 border border-red-200 font-bold';
        badgeText = '🚨 Amenaza / Riesgo Alto';
        borderLeft = 'border-l-4 border-red-500 bg-red-50/20';
      } else if (c.sentiment === 'NEGATIVE') {
        badgeStyle = 'bg-amber-100 text-amber-800 font-semibold';
        badgeText = '⚠️ Queja / Negativo';
        borderLeft = 'border-l-4 border-amber-500';
      } else if (c.sentiment === 'POSITIVE') {
        badgeStyle = 'bg-emerald-100 text-emerald-800 font-semibold';
        badgeText = '✨ Oportunidad Comercial';
        borderLeft = 'border-l-4 border-emerald-500';
      }

      return `
        <div class="p-4 ${borderLeft} flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
          <div class="space-y-1 max-w-2xl">
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm text-gray-900">${c.author}</span>
              <span class="text-xs text-gray-400">• en ${c.platform} (${c.reelTitle})</span>
              <span class="text-[11px] px-2 py-0.5 rounded ${badgeStyle}">${badgeText}</span>
            </div>
            <p class="text-sm text-gray-800 leading-snug font-medium">"${c.text}"</p>
            <div class="flex items-center gap-2 text-[11px] text-gray-500 pt-1">
              <span>Palabras Clave Detectadas:</span>
              ${c.keywords.map(k => `<span class="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">${k}</span>`).join('')}
              <span class="ml-2 text-gray-400">${c.date}</span>
            </div>
          </div>

          <!-- Acciones Rápidas -->
          <div class="flex items-center gap-2 self-end md:self-center">
            ${c.sentiment === 'CRITICAL' ? `
              <button onclick="alert('Iniciando protocolo de contención / Bloqueo')" class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 shadow-sm">
                Ocultar / Bloquear
              </button>
            ` : ''}
            
            ${c.sentiment === 'POSITIVE' ? `
              <button onclick="alert('Abriendo WhatsApp para enviar plantilla')" class="px-3 py-1.5 bg-whatsapp-green text-white rounded-lg text-xs font-semibold hover:opacity-90 shadow-sm flex items-center gap-1">
                Responder por WA
              </button>
            ` : ''}

            <button onclick="alert('Comentario marcado como revisado')" class="px-3 py-1.5 bg-slate-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-slate-300">
              Marcar Atendido
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  async loadReels() {
    const grid = document.getElementById('reels-grid');
    const reels = await SocialShowcaseService.getReels();

    grid.innerHTML = reels.map(r => `
      <div class="bg-white border border-slate-border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
        <div class="relative">
          <img src="${r.thumbnail}" alt="${r.title}" class="w-full h-40 object-cover" />
          <span class="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            ${r.platform}
          </span>
        </div>
        <div class="p-4 space-y-2">
          <h3 class="font-bold text-sm text-gray-800 line-clamp-1">${r.title}</h3>
          <p class="text-xs text-electric-blue font-medium">Producto: ${r.productName}</p>
          <div class="flex justify-between items-center text-xs text-gray-500 border-t border-slate-100 pt-2">
            <span>👁️️ ${r.views} vistas</span>
            <span>❤️ ${r.likes} me gusta</span>
          </div>
        </div>
      </div>
    `).join('');
  }
};