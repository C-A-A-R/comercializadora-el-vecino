export const DASHBOARD_MOCK = {
  total_productos: 48,
  total_views_catalog: 14850,
  stock_critico: 6,
  destacados: 12,
  promos_activas: 4,
  clics_whatsapp: 128,
  valor_catalogo_usd: 35400.00,
  tasa_cambio: 4200.00,
  satisfaction_index: {
    percentage: 94.2,
    total_reviews: 86,
    positive_reviews: 81,
    neutral_reviews: 3,
    negative_reviews: 2
  },
  traffic_trend: {
    growth_pct: 18.5,
    is_positive: true,
    views_last_7d: 1420,
    views_prev_7d: 1198,
    daily_series: [
      { date: '2026-09-08', day: 'Lun', views: 180 },
      { date: '2026-09-09', day: 'Mar', views: 195 },
      { date: '2026-09-10', day: 'Mié', views: 210 },
      { date: '2026-09-11', day: 'Jue', views: 190 },
      { date: '2026-09-12', day: 'Vie', views: 240 },
      { date: '2026-09-13', day: 'Sáb', views: 225 },
      { date: '2026-09-14', day: 'Dom', views: 180 }
    ]
  },
  most_loved_product: {
    id: 101,
    name: 'Nevera Samsung 200L No Frost',
    brand: 'Samsung',
    price_usd: 650.00,
    image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=300&auto=format&fit=crop&q=80',
    sentiment_score: 0.98,
    approval_rate: 98.5,
    positive_reviews: 42,
    total_views: 342,
    ranking_score: 0.94,
    badge: 'Top Customer Choice'
  },
  top_5_featured: [
    { id: 101, name: 'Nevera Samsung 200L No Frost', brand: 'Samsung', views: 342, price_usd: 650.00, ranking_score: 0.94, is_featured: true },
    { id: 102, name: 'Lavadora LG Smart Motion 13kg', brand: 'LG', views: 289, price_usd: 520.00, ranking_score: 0.88, is_featured: true },
    { id: 103, name: 'Cocina Mabe 4 Puestos Inox', brand: 'Mabe', views: 215, price_usd: 310.00, ranking_score: 0.82, is_featured: true },
    { id: 106, name: 'Smart TV Samsung 55" Crystal UHD', brand: 'Samsung', views: 205, price_usd: 480.00, ranking_score: 0.79, is_featured: true },
    { id: 105, name: 'Microondas Oster 20L Digital', brand: 'Oster', views: 164, price_usd: 95.00, ranking_score: 0.75, is_featured: false }
  ],
  top_viewed: [
    { id: 101, name: 'Nevera Samsung 200L No Frost', views: 342, price_usd: 650.00, ranking_score: 0.94 },
    { id: 102, name: 'Lavadora LG Smart Motion 13kg', views: 289, price_usd: 520.00, ranking_score: 0.88 },
    { id: 103, name: 'Cocina Mabe 4 Puestos Inox', views: 215, price_usd: 310.00, ranking_score: 0.82 },
    { id: 106, name: 'Smart TV Samsung 55" Crystal UHD', views: 205, price_usd: 480.00, ranking_score: 0.79 },
    { id: 105, name: 'Microondas Oster 20L Digital', views: 164, price_usd: 95.00, ranking_score: 0.75 }
  ],
  complaint_alerts: [
    {
      id: 104,
      name: 'Aire Acondicionado Split 12000 BTU',
      brand: 'Mabe',
      negative_reviews_count: 2,
      sentiment_score: 0.38,
      latest_comment: 'El compresor emite vibración excesiva tras 3 días de uso continuo.',
      warning_level: 'alta'
    }
  ]
};