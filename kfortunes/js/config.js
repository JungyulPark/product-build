// KStar Match - Central Configuration
// Tier pricing, models, endpoints, and Polar product ID mapping

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
      endpoint: null,  // Local calculation only
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
      model: 'gpt-4o',  // Current: gpt-4o → Target: gpt-5.0
      polarProductId: null  // TODO: Set after Polar product creation
    },
    premium: {
      name: 'Premium Consultation',
      price: 9.99,
      currency: 'USD',
      features: [
        'Comprehensive consultation report',
        'Five-year outlook',
        'Feng Shui recommendations',
        'Ten Gods analysis',
        'Timing & lucky dates',
        'Celebrity compatibility AI analysis'
      ],
      endpoint: '/api/saju-consultation',
      model: 'gpt-4o',  // Current: gpt-4o → Target: gpt-5.2
      polarProductId: null  // TODO: Set after Polar product creation
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
      endpoint: '/api/compatibility',  // TODO: Create endpoint
      model: 'gpt-4o',  // Current: gpt-4o → Target: gpt-5.0
      polarProductId: null  // TODO: Set after Polar product creation
    }
  },

  // Model upgrade plan
  models: {
    current: 'gpt-4o',
    next: 'gpt-5.0',        // Basic + Compatibility tier upgrade
    premium: 'gpt-5.2'      // Premium tier upgrade
  },

  api: {
    statusEndpoint: '/api/status'
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KStarConfig;
}
