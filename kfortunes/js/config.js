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
      price: 0,
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
      model: 'gpt-4o-mini',
      polarProductId: null
    },
    compatibility: {
      name: 'Celebrity Compatibility AI',
      price: 0,
      currency: 'USD',
      features: [
        'AI-powered compatibility analysis',
        'Relationship dynamics breakdown',
        'Best match areas',
        'Advice for connection'
      ],
      endpoint: '/api/compatibility',
      model: 'gpt-4o-mini',
      polarProductId: null
    }
  },

  polar: {
    enabled: false,  // Polar 결제 비활성화 — 무료 서비스 전환
    theme: 'dark'
  },

  models: {
    current: 'gpt-4o-mini',
    next: 'gpt-4o'
  },

  api: {
    statusEndpoint: '/api/status',
    checkoutEndpoint: '/api/create-checkout'
  },

  hasPurchased(tier) {
    try {
      const purchases = JSON.parse(localStorage.getItem('kstar_purchases_v4') || '{}');
      return !!purchases[tier];
    } catch { return false; }
  },

  storePurchase(tier) {
    try {
      const purchases = JSON.parse(localStorage.getItem('kstar_purchases_v4') || '{}');
      purchases[tier] = Date.now();
      localStorage.setItem('kstar_purchases_v4', JSON.stringify(purchases));
    } catch { /* ignore */ }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = KStarConfig;
}
