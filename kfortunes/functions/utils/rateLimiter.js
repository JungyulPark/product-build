/**
 * Rate Limiter Utility for Cloudflare Workers
 * Cloudflare KV를 사용한 IP 기반 Rate Limiting
 */

const CONFIG = {
  // Rate limit settings
  maxRequests: 10,        // Maximum requests per window
  windowMs: 60 * 1000,    // Time window in milliseconds (1 minute)

  // KV key prefix
  keyPrefix: 'ratelimit:',

  // Error messages
  messages: {
    en: 'Too many requests. Please try again later.',
    ko: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    ja: 'リクエストが多すぎます。しばらくしてから再度お試しください。',
    zh: '请求过多。请稍后再试。',
    vi: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.'
  }
};

/**
 * Get client IP address from request
 * @param {Request} request - The incoming request
 * @returns {string} - Client IP address
 */
function getClientIP(request) {
  // Cloudflare provides the real client IP in CF-Connecting-IP header
  return request.headers.get('CF-Connecting-IP') ||
         request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
         request.headers.get('X-Real-IP') ||
         'unknown';
}

/**
 * Generate rate limit key for KV storage
 * @param {string} ip - Client IP address
 * @param {string} endpoint - API endpoint (e.g., 'fortune', 'compatibility')
 * @returns {string} - KV key
 */
function generateKey(ip, endpoint = 'default') {
  return `${CONFIG.keyPrefix}${endpoint}:${ip}`;
}

/**
 * Check if request should be rate limited
 * @param {Object} env - Cloudflare environment with KV bindings
 * @param {Request} request - The incoming request
 * @param {string} endpoint - API endpoint name
 * @returns {Object} - { allowed: boolean, remaining: number, resetTime: number }
 */
async function checkRateLimit(env, request, endpoint = 'default') {
  const ip = getClientIP(request);
  const key = generateKey(ip, endpoint);
  const now = Date.now();

  // If KV is not available, allow the request (graceful degradation)
  if (!env || !env.RATE_LIMIT_KV) {
    return {
      allowed: true,
      remaining: CONFIG.maxRequests,
      resetTime: now + CONFIG.windowMs,
      kvAvailable: false
    };
  }

  try {
    // Get current rate limit data from KV
    const data = await env.RATE_LIMIT_KV.get(key, { type: 'json' });

    if (!data) {
      // First request from this IP
      const newData = {
        count: 1,
        windowStart: now
      };

      // Store with expiration (window duration in seconds)
      await env.RATE_LIMIT_KV.put(key, JSON.stringify(newData), {
        expirationTtl: Math.ceil(CONFIG.windowMs / 1000)
      });

      return {
        allowed: true,
        remaining: CONFIG.maxRequests - 1,
        resetTime: now + CONFIG.windowMs,
        kvAvailable: true
      };
    }

    // Check if window has expired
    const windowExpired = (now - data.windowStart) >= CONFIG.windowMs;

    if (windowExpired) {
      // Start new window
      const newData = {
        count: 1,
        windowStart: now
      };

      await env.RATE_LIMIT_KV.put(key, JSON.stringify(newData), {
        expirationTtl: Math.ceil(CONFIG.windowMs / 1000)
      });

      return {
        allowed: true,
        remaining: CONFIG.maxRequests - 1,
        resetTime: now + CONFIG.windowMs,
        kvAvailable: true
      };
    }

    // Window still active, check count
    if (data.count >= CONFIG.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: data.windowStart + CONFIG.windowMs,
        kvAvailable: true
      };
    }

    // Increment count
    const updatedData = {
      count: data.count + 1,
      windowStart: data.windowStart
    };

    const remainingTtl = Math.ceil((data.windowStart + CONFIG.windowMs - now) / 1000);
    await env.RATE_LIMIT_KV.put(key, JSON.stringify(updatedData), {
      expirationTtl: remainingTtl > 0 ? remainingTtl : 1
    });

    return {
      allowed: true,
      remaining: CONFIG.maxRequests - updatedData.count,
      resetTime: data.windowStart + CONFIG.windowMs,
      kvAvailable: true
    };

  } catch (error) {
    // On error, allow the request (graceful degradation)
    console.error('Rate limit check error:', error);
    return {
      allowed: true,
      remaining: CONFIG.maxRequests,
      resetTime: now + CONFIG.windowMs,
      kvAvailable: false,
      error: error.message
    };
  }
}

/**
 * Create rate limit response with appropriate headers
 * @param {Object} rateLimitResult - Result from checkRateLimit
 * @param {string} language - Language code for error message
 * @returns {Response} - 429 Too Many Requests response
 */
function createRateLimitResponse(rateLimitResult, language = 'en') {
  const message = CONFIG.messages[language] || CONFIG.messages.en;
  const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      errorCode: 'RATE_LIMIT_EXCEEDED',
      retryAfter: retryAfter > 0 ? retryAfter : 1
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter > 0 ? retryAfter : 1),
        'X-RateLimit-Limit': String(CONFIG.maxRequests),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetTime / 1000)),
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}

/**
 * Add rate limit headers to a response
 * @param {Response} response - The original response
 * @param {Object} rateLimitResult - Result from checkRateLimit
 * @returns {Response} - Response with rate limit headers
 */
function addRateLimitHeaders(response, rateLimitResult) {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('X-RateLimit-Limit', String(CONFIG.maxRequests));
  newHeaders.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
  newHeaders.set('X-RateLimit-Reset', String(Math.ceil(rateLimitResult.resetTime / 1000)));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

/**
 * Rate limit middleware for Cloudflare Pages Functions
 * @param {Object} context - Cloudflare Pages Function context
 * @param {string} endpoint - API endpoint name
 * @param {string} language - Language code
 * @returns {Response|null} - Returns 429 response if rate limited, null otherwise
 */
async function rateLimitMiddleware(context, endpoint, language = 'en') {
  const { env, request } = context;

  const result = await checkRateLimit(env, request, endpoint);

  if (!result.allowed) {
    return createRateLimitResponse(result, language);
  }

  // Store result in context for later use (adding headers to response)
  context.rateLimitResult = result;

  return null;
}

// Export for use in Cloudflare Pages Functions
module.exports = {
  CONFIG,
  getClientIP,
  generateKey,
  checkRateLimit,
  createRateLimitResponse,
  addRateLimitHeaders,
  rateLimitMiddleware
};
