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
      price: 3.99,
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
      polarProductId: '890a8668-83bc-472e-885b-30947705856e'
    },
    compatibility: {
      name: 'Celebrity Compatibility AI',
      price: 1.99,
      currency: 'USD',
      features: [
        'AI-powered compatibility analysis',
        'Relationship dynamics breakdown',
        'Best match areas',
        'Advice for connection'
      ],
      endpoint: '/api/compatibility',
      model: 'gpt-4o',
      polarProductId: '1d44431d-b9e5-4073-aa5c-837debe7bb9d'
    }
  },

  polar: {
    enabled: true,  // false = paywall 비활성화, true = 결제 활성화
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
