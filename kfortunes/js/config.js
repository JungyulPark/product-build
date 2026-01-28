// KStar Match - Central Configuration
// Tier pricing, models, endpoints, and Polar product mapping

const KStarConfig = {
  tiers: {
    free: {
      name: 'Free',
      price: 0,
      features: [
        'Personality profile',
        'Five Elements balance',
        'Day Master personality',
        'K-Star personality match',
        'Compatible elements'
      ],
      endpoint: null,
      model: null
    },
    basic: {
      name: 'AI Analysis',
      price: 2.99,
      currency: 'USD',
      features: [
        'AI personality deep dive',
        'Career & business guidance',
        'Love & relationship insights',
        'Health & wellness tips',
        'Wealth & financial insights',
        'Year outlook'
      ],
      endpoint: '/api/fortune',
      model: 'gpt-4o',
      polarProductId: '066396ed-5c5e-46f7-8d71-8d0ca7863b9c'
    },
    compatibility: {
      name: 'Celebrity Compatibility AI',
      price: 0.99,
      currency: 'USD',
      features: [
        'AI-powered compatibility analysis',
        'Relationship dynamics breakdown',
        'Best match areas',
        'Advice for connection'
      ],
      endpoint: '/api/compatibility',
      model: 'gpt-4o',
      polarProductId: 'adc1562e-875f-4ea9-816f-12780a3305e8'
    }
  },

  polar: {
    enabled: true,
    theme: 'dark'
  },

  models: {
    current: 'gpt-4o',
    next: 'gpt-5.0'
  },

  api: {
    statusEndpoint: '/api/status',
    checkoutEndpoint: '/api/create-checkout'
  },

  hasPurchased(tier) {
    try {
      const purchases = JSON.parse(localStorage.getItem('kstar_purchases') || '{}');
      return !!purchases[tier];
    } catch { return false; }
  },

  storePurchase(tier) {
    try {
      const purchases = JSON.parse(localStorage.getItem('kstar_purchases') || '{}');
      purchases[tier] = Date.now();
      localStorage.setItem('kstar_purchases', JSON.stringify(purchases));
    } catch { /* ignore */ }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = KStarConfig;
}
