// KStar Match - Central Configuration
// Tier pricing, models, endpoints, and Polar checkout links

const KStarConfig = {
  tiers: {
    free: {
      name: 'Free',
      price: 0,
      features: [
        'Four Pillars calculation',
        'Five Elements balance',
        'Day Master personality',
        'K-Star Saju Twin match',
        'Lucky elements'
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
        'Love & relationship forecast',
        'Health & wellness tips',
        'Wealth & financial outlook',
        'Year forecast'
      ],
      endpoint: '/api/fortune',
      model: 'gpt-4o',
      // Polar checkout link - SET AFTER CREATING PRODUCT IN POLAR DASHBOARD
      polarCheckoutLink: null
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
      // Polar checkout link - SET AFTER CREATING PRODUCT IN POLAR DASHBOARD
      polarCheckoutLink: null
    }
  },

  // Polar configuration
  polar: {
    // Set to true when Polar checkout links are configured
    enabled: false,
    theme: 'dark'
  },

  // Model upgrade plan
  models: {
    current: 'gpt-4o',
    next: 'gpt-5.0'
  },

  api: {
    statusEndpoint: '/api/status'
  },

  // Check if a tier purchase is stored
  hasPurchased(tier) {
    try {
      const purchases = JSON.parse(localStorage.getItem('kstar_purchases') || '{}');
      return !!purchases[tier];
    } catch { return false; }
  },

  // Store a purchase
  storePurchase(tier) {
    try {
      const purchases = JSON.parse(localStorage.getItem('kstar_purchases') || '{}');
      purchases[tier] = Date.now();
      localStorage.setItem('kstar_purchases', JSON.stringify(purchases));
    } catch { /* ignore */ }
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KStarConfig;
}
