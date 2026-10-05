import { WhatsAppService } from '../../services/whatsapp-crm.service.js';
import { Toast } from '../../components/ui/Toast.js';

export const WhatsAppCrmView = {
  async render() {
    return `
      <div class="space-y-6">
        <!-- Encabezado del Módulo -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-deep-obsidian font-display">CRM & Métricas de WhatsApp</h1>
            <p class="text-sm text-gray-500">Gestión inmediata de conversaciones, embudo de ventas y prospectos activos.</p>
          </div>
          <a id="btn-open-wa-direct" 
             href="https://wa.me/" 
             target="_blank" 
             class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors">
            <span class="material-symbols-outlined text-base">chat</span>
            Abrir WhatsApp Web
          </a>
        </div>

        <!-- KPIs de Rendimiento -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <span class="text-xs font-semibold text-gray-500 block">Leads Activos (Pendientes)</span>
              <span id="kpi-wa-leads" class="text-2xl font-bold text-emerald-600">0</span>
            </div>
            <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              +18
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <span class="text-xs font-semibold text-gray-500 block">Tiempo Medio de Respuesta</span>
              <span id="kpi-wa-time" class="text-2xl font-bold text-deep-obsidian">0m</span>
            </div>
            <div class="w-10 h-10 rounded-lg bg-blue-50 text-electric-blue flex items-center justify-center">
              <span class="material-symbols-outlined">timer</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <span class="text-xs font-semibold text-gray-500 block">Tasa de Conversión</span>
              <span id="kpi-wa-conv" class="text-2xl font-bold text-deep-obsidian">0%</span>
            </div>
            <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <span class="material-symbols-outlined">trending_up</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex items-center justify-between">
            <div>
              <span class="text-xs font-semibold text-gray-500 block">Monto en Negociación</span>
              <span id="kpi-wa-value" class="text-2xl font-bold text-emerald-700">$0.00</span>
            </div>
            <div class="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <span class="material-symbols-outlined">attach_money</span>
            </div>
          </div>
        </div>

        <!-- Embudo / Listado de Contactos Prioritarios -->
        <div class="bg-white rounded-xl border border-slate-border shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 class="text-base font-bold text-deep-obsidian flex items-center gap-2">
                <span class="material-symbols-outlined text-emerald-600">mark_chat_unread</span>
                Bandeja de Contacto Inmediato (Pipeline de Venta)
              </h2>
              <p class="text-xs text-gray-500">Haz clic en responder para iniciar la conversación en WhatsApp con la plantilla precalculada.</p>
            </div>
          </div>

          <!-- Tabla de Prospectos -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-sm">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-border text-xs text-gray-500 uppercase tracking-wider font-semibold">
                  <th class="py-3 px-4">Cliente / Contacto</th>
                  <th class="py-3 px-4">Interés / Producto</th>
                  <th class="py-3 px-4">Origen</th>
                  <th class="py-3 px-4">Último Mensaje</th>
                  <th class="py-3 px-4">Estado</th>
                  <th class="py-3 px-4 text-right">Acción Rápida</th>
                </tr>
              </thead>
              <tbody id="wa-leads-tbody" class="divide-y divide-slate-border">
                <tr>
                  <td colspan="6" class="p-6 text-center text-gray-400">Cargando bandeja de WhatsApp...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  async bindEvents() {
    await this.loadMetrics();
    await this.loadLeads();
  },

  async loadMetrics() {
    const metrics = await WhatsAppService.getMetrics();
    document.getElementById('kpi-wa-leads').textContent = metrics.activeLeads;
    document.getElementById('kpi-wa-time').textContent = metrics.avgResponseTime;
    document.getElementById('kpi-wa-conv').textContent = metrics.conversionRate;
    document.getElementById('kpi-wa-value').textContent = `$${metrics.pipelineValueUSD.toFixed(2)}`;
  },

  async loadLeads() {
    const tbody = document.getElementById('wa-leads-tbody');
    const leads = await WhatsAppService.getLeads();

    if (leads.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-gray-400">Sin mensajes pendientes.</td></tr>`;
      return;
    }

    tbody.innerHTML = leads.map(lead => {
      let statusBadge = 'bg-slate-100 text-slate-700';
      let statusLabel = 'Nuevo Lead';

      if (lead.status === 'NEW') {
        statusBadge = 'bg-blue-100 text-blue-800 font-bold animate-pulse';
        statusLabel = '🔴 Sin Atender';
      } else if (lead.status === 'IN_TALKS') {
        statusBadge = 'bg-amber-100 text-amber-800 font-semibold';
        statusLabel = '💬 En Negociación';
      } else if (lead.status === 'CLOSED') {
        statusBadge = 'bg-emerald-100 text-emerald-800 font-bold';
        statusLabel = '✅ Venta Cerrada';
      }

      // Codificación de URL para enlace directo de WhatsApp con mensaje personalizado
      const defaultMessage = encodeURIComponent(`Hola ${lead.customerName}, te escribimos de Comercializadora El Vecino respecto a tu consulta por: ${lead.productInterest}. ¿Cómo te podemos ayudar?`);
      const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
      const waLink = `https://wa.me/${cleanPhone}?text=${defaultMessage}`;

      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="py-3 px-4 font-semibold text-gray-900">
            <div>${lead.customerName}</div>
            <div class="text-xs text-gray-400 font-normal">${lead.phone}</div>
          </td>
          <td class="py-3 px-4 font-medium text-electric-blue">
            ${lead.productInterest}
            <div class="text-[11px] text-gray-400 font-normal">Valor est.: $${lead.estimatedValue.toFixed(2)}</div>
          </td>
          <td class="py-3 px-4 text-xs text-gray-500">
            <span class="bg-slate-100 px-2 py-1 rounded-md border border-slate-200">${lead.origin}</span>
          </td>
          <td class="py-3 px-4 text-xs text-gray-700 max-w-xs truncate">
            "${lead.lastMessage}"
            <div class="text-[10px] text-gray-400">${lead.timeAgo}</div>
          </td>
          <td class="py-3 px-4">
            <span class="text-xs px-2.5 py-1 rounded-full ${statusBadge}">${statusLabel}</span>
          </td>
          <td class="py-3 px-4 text-right">
            <a href="${waLink}" target="_blank" 
               class="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors">
              <span class="material-symbols-outlined text-sm">send</span> Chat Directo
            </a>
          </td>
        </tr>
      `;
    }).join('');
  }
};