export const SocialShowcaseService = {
  async getMetrics() {
    return {
      totalReels: 28,
      totalViews: '142.5K',
      whatsappConversions: 312,
      pendingCriticalComments: 4
    };
  },

  async getReels() {
    return [
      {
        id: 1,
        title: 'Demo Nevera Samsung No Frost - Uso Comercial',
        platform: 'TikTok',
        views: '45.2K',
        likes: '3.1K',
        productName: 'Nevera Samsung 400L',
        productId: 101,
        thumbnail: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 2,
        title: 'Combo Lavadora + Secadora en Acción',
        platform: 'Instagram Reel',
        views: '28.9K',
        likes: '1.8K',
        productName: 'Combo Lavado Mabe',
        productId: 102,
        thumbnail: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=400&q=80'
      }
    ];
  },

  async getComments(filter = 'all') {
    const comments = [
      {
        id: 101,
        author: '@user_9921',
        platform: 'TikTok',
        reelTitle: 'Demo Nevera Samsung',
        text: 'Son unos estafadores, me vendieron un equipo defectuoso y no responden en la tienda. Voy a ir con la policía.',
        sentiment: 'CRITICAL', // CRITICAL, NEGATIVE, POSITIVE
        keywords: ['estafadores', 'policía', 'defectuoso'],
        date: 'Hace 10 min',
        status: 'pending' // pending, resolved, dismissed
      },
      {
        id: 102,
        author: '@marta_gomez',
        platform: 'Instagram',
        reelTitle: 'Combo Lavado Mabe',
        text: 'Pésima atención por WhatsApp, tardan horas en dar los precios en USD.',
        sentiment: 'NEGATIVE',
        keywords: ['pésima atención', 'tardan'],
        date: 'Hace 35 min',
        status: 'pending'
      },
      {
        id: 103,
        author: '@carlos_tech',
        platform: 'TikTok',
        reelTitle: 'Demo Nevera Samsung',
        text: '¿Ese precio de $450 USD incluye envío gratis en San Cristóbal?',
        sentiment: 'POSITIVE',
        keywords: ['envío', 'precio'],
        date: 'Hace 1 hora',
        status: 'pending'
      }
    ];

    if (filter === 'all') return comments;
    return comments.filter(c => c.sentiment === filter.toUpperCase());
  }
};