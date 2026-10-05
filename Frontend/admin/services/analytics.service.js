import { api } from '../../js/api.js';
import { CONFIG } from '../../js/config.js';

const MOCK_ANALYTICS = {
  top_products: [
    { id: 42, name: "Nevera 200L Samsung", total_views: 1420, views_24h: 85, views_7d: 410, views_30d: 1420 },
    { id: 18, name: "Cocina de Inducción", total_views: 980, views_24h: 32, views_7d: 210, views_30d: 980 },
    { id: 7, name: "Lavadora Secadora 12kg", total_views: 750, views_24h: 18, views_7d: 180, views_30d: 750 }
  ],
  trend_30d: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
    views: Math.floor(Math.random() * 80) + 20
  }))
};

export const AnalyticsService = {
  async getProductViews(filters = {}) {
    if (CONFIG.USE_MOCKS) return MOCK_ANALYTICS;
    const query = new URLSearchParams(filters).toString();
    return await api.get(`/analytics/views/?${query}`);
  },

  async exportViewsCsv(filters = {}) {
    const data = await this.getProductViews(filters);
    const rows = [
      ['ID', 'Producto', 'Vistas 24h', 'Vistas 7d', 'Vistas 30d', 'Total Vistas']
    ];

    data.top_products.forEach(p => {
      rows.push([p.id, `"${p.name}"`, p.views_24h, p.views_7d, p.views_30d, p.total_views]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_vistas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};