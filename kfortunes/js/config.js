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
      name: 'Basic AI Analysis',
      price: 2.99,
      currency: 'USD',
      features: [
        'GPT personality deep dive',
        'Career & business guidance',
        'Love & relationship forecast',
        'Health & wellness tips',
        'Wealth & financial outlook',
        '2025-2026 year forecast'
      ],
      endpoint: '/api/fortune',
      model: 'gpt-4o',
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
        'Relationship compatibility deep dive'
      ],
      endpoint: '/api/saju-consultation',
      model: 'gpt-4o',  // Upgrade to gpt-5.2 when available
      polarProductId: null  // TODO: Set after Polar product creation
    }
  },

  api: {
    statusEndpoint: '/api/status'
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KStarConfig;
}
