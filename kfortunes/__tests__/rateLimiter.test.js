/**
 * Rate Limiter Unit Tests
 * Rate Limiting 유틸리티 단위 테스트
 */

const path = require('path');
const rateLimiter = require(path.join(__dirname, '../functions/utils/rateLimiter.js'));

describe('Rate Limiter', () => {

  describe('CONFIG', () => {
    test('should have default configuration values', () => {
      expect(rateLimiter.CONFIG).toBeDefined();
      expect(rateLimiter.CONFIG.maxRequests).toBe(10);
      expect(rateLimiter.CONFIG.windowMs).toBe(60000);
      expect(rateLimiter.CONFIG.keyPrefix).toBe('ratelimit:');
    });

    test('should have error messages for all supported languages', () => {
      const languages = ['en', 'ko', 'ja', 'zh', 'vi'];
      languages.forEach(lang => {
        expect(rateLimiter.CONFIG.messages[lang]).toBeDefined();
        expect(typeof rateLimiter.CONFIG.messages[lang]).toBe('string');
        expect(rateLimiter.CONFIG.messages[lang].length).toBeGreaterThan(0);
      });
    });
  });

  describe('getClientIP()', () => {
    test('should return CF-Connecting-IP when available', () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header) => {
            if (header === 'CF-Connecting-IP') return '1.2.3.4';
            return null;
          })
        }
      };

      expect(rateLimiter.getClientIP(mockRequest)).toBe('1.2.3.4');
    });

    test('should fallback to X-Forwarded-For when CF-Connecting-IP not available', () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header) => {
            if (header === 'X-Forwarded-For') return '5.6.7.8, 9.10.11.12';
            return null;
          })
        }
      };

      expect(rateLimiter.getClientIP(mockRequest)).toBe('5.6.7.8');
    });

    test('should fallback to X-Real-IP when others not available', () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header) => {
            if (header === 'X-Real-IP') return '13.14.15.16';
            return null;
          })
        }
      };

      expect(rateLimiter.getClientIP(mockRequest)).toBe('13.14.15.16');
    });

    test('should return "unknown" when no IP headers available', () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null)
        }
      };

      expect(rateLimiter.getClientIP(mockRequest)).toBe('unknown');
    });
  });

  describe('generateKey()', () => {
    test('should generate key with default endpoint', () => {
      const key = rateLimiter.generateKey('1.2.3.4');
      expect(key).toBe('ratelimit:default:1.2.3.4');
    });

    test('should generate key with custom endpoint', () => {
      const key = rateLimiter.generateKey('1.2.3.4', 'fortune');
      expect(key).toBe('ratelimit:fortune:1.2.3.4');
    });

    test('should handle compatibility endpoint', () => {
      const key = rateLimiter.generateKey('5.6.7.8', 'compatibility');
      expect(key).toBe('ratelimit:compatibility:5.6.7.8');
    });
  });

  describe('checkRateLimit()', () => {
    const mockRequest = {
      headers: {
        get: jest.fn((header) => {
          if (header === 'CF-Connecting-IP') return '1.2.3.4';
          return null;
        })
      }
    };

    test('should allow request when KV is not available (graceful degradation)', async () => {
      const result = await rateLimiter.checkRateLimit(null, mockRequest, 'fortune');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(rateLimiter.CONFIG.maxRequests);
      expect(result.kvAvailable).toBe(false);
    });

    test('should allow request when env.RATE_LIMIT_KV is undefined', async () => {
      const env = {};
      const result = await rateLimiter.checkRateLimit(env, mockRequest, 'fortune');

      expect(result.allowed).toBe(true);
      expect(result.kvAvailable).toBe(false);
    });

    test('should allow first request from new IP when KV is available', async () => {
      const mockKV = {
        get: jest.fn().mockResolvedValue(null),
        put: jest.fn().mockResolvedValue(undefined)
      };

      const env = { RATE_LIMIT_KV: mockKV };
      const result = await rateLimiter.checkRateLimit(env, mockRequest, 'fortune');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(rateLimiter.CONFIG.maxRequests - 1);
      expect(result.kvAvailable).toBe(true);
      expect(mockKV.put).toHaveBeenCalled();
    });

    test('should allow subsequent requests within limit', async () => {
      const now = Date.now();
      const mockData = {
        count: 5,
        windowStart: now
      };

      const mockKV = {
        get: jest.fn().mockResolvedValue(mockData),
        put: jest.fn().mockResolvedValue(undefined)
      };

      const env = { RATE_LIMIT_KV: mockKV };
      const result = await rateLimiter.checkRateLimit(env, mockRequest, 'fortune');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(rateLimiter.CONFIG.maxRequests - 6);
    });

    test('should reject request when rate limit exceeded', async () => {
      const now = Date.now();
      const mockData = {
        count: 10,
        windowStart: now
      };

      const mockKV = {
        get: jest.fn().mockResolvedValue(mockData),
        put: jest.fn().mockResolvedValue(undefined)
      };

      const env = { RATE_LIMIT_KV: mockKV };
      const result = await rateLimiter.checkRateLimit(env, mockRequest, 'fortune');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    test('should reset window after expiration', async () => {
      const expiredWindowStart = Date.now() - 120000; // 2 minutes ago
      const mockData = {
        count: 10,
        windowStart: expiredWindowStart
      };

      const mockKV = {
        get: jest.fn().mockResolvedValue(mockData),
        put: jest.fn().mockResolvedValue(undefined)
      };

      const env = { RATE_LIMIT_KV: mockKV };
      const result = await rateLimiter.checkRateLimit(env, mockRequest, 'fortune');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(rateLimiter.CONFIG.maxRequests - 1);
    });

    test('should handle KV errors gracefully', async () => {
      const mockKV = {
        get: jest.fn().mockRejectedValue(new Error('KV error')),
        put: jest.fn()
      };

      const env = { RATE_LIMIT_KV: mockKV };
      const result = await rateLimiter.checkRateLimit(env, mockRequest, 'fortune');

      expect(result.allowed).toBe(true);
      expect(result.kvAvailable).toBe(false);
      expect(result.error).toBe('KV error');
    });
  });

  describe('createRateLimitResponse()', () => {
    test('should create 429 response with correct headers', () => {
      const rateLimitResult = {
        resetTime: Date.now() + 30000
      };

      const response = rateLimiter.createRateLimitResponse(rateLimitResult, 'en');

      expect(response.status).toBe(429);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Retry-After')).toBeDefined();
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    });

    test('should return English error message by default', async () => {
      const rateLimitResult = {
        resetTime: Date.now() + 30000
      };

      const response = rateLimiter.createRateLimitResponse(rateLimitResult, 'en');
      const body = await response.json();

      expect(body.success).toBe(false);
      expect(body.error).toBe(rateLimiter.CONFIG.messages.en);
      expect(body.errorCode).toBe('RATE_LIMIT_EXCEEDED');
    });

    test('should return Korean error message when language is ko', async () => {
      const rateLimitResult = {
        resetTime: Date.now() + 30000
      };

      const response = rateLimiter.createRateLimitResponse(rateLimitResult, 'ko');
      const body = await response.json();

      expect(body.error).toBe(rateLimiter.CONFIG.messages.ko);
    });

    test('should return Japanese error message when language is ja', async () => {
      const rateLimitResult = {
        resetTime: Date.now() + 30000
      };

      const response = rateLimiter.createRateLimitResponse(rateLimitResult, 'ja');
      const body = await response.json();

      expect(body.error).toBe(rateLimiter.CONFIG.messages.ja);
    });

    test('should return retryAfter in seconds', async () => {
      const rateLimitResult = {
        resetTime: Date.now() + 30000
      };

      const response = rateLimiter.createRateLimitResponse(rateLimitResult, 'en');
      const body = await response.json();

      expect(body.retryAfter).toBeGreaterThan(0);
      expect(body.retryAfter).toBeLessThanOrEqual(31);
    });
  });

  describe('addRateLimitHeaders()', () => {
    test('should add rate limit headers to response', () => {
      const originalResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

      const rateLimitResult = {
        remaining: 5,
        resetTime: Date.now() + 30000
      };

      const newResponse = rateLimiter.addRateLimitHeaders(originalResponse, rateLimitResult);

      expect(newResponse.status).toBe(200);
      expect(newResponse.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(newResponse.headers.get('X-RateLimit-Remaining')).toBe('5');
      expect(newResponse.headers.get('X-RateLimit-Reset')).toBeDefined();
    });

    test('should preserve original response body', async () => {
      const originalBody = { success: true, data: 'test' };
      const originalResponse = new Response(JSON.stringify(originalBody), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

      const rateLimitResult = {
        remaining: 3,
        resetTime: Date.now() + 15000
      };

      const newResponse = rateLimiter.addRateLimitHeaders(originalResponse, rateLimitResult);
      const body = await newResponse.json();

      expect(body.success).toBe(true);
      expect(body.data).toBe('test');
    });

    test('should preserve original status code', () => {
      const originalResponse = new Response('Created', {
        status: 201,
        statusText: 'Created'
      });

      const rateLimitResult = {
        remaining: 9,
        resetTime: Date.now() + 60000
      };

      const newResponse = rateLimiter.addRateLimitHeaders(originalResponse, rateLimitResult);

      expect(newResponse.status).toBe(201);
    });
  });

  describe('rateLimitMiddleware()', () => {
    test('should return null when request is allowed', async () => {
      const context = {
        env: null,
        request: {
          headers: {
            get: jest.fn(() => '1.2.3.4')
          }
        }
      };

      const result = await rateLimiter.rateLimitMiddleware(context, 'fortune', 'en');

      expect(result).toBeNull();
      expect(context.rateLimitResult).toBeDefined();
      expect(context.rateLimitResult.allowed).toBe(true);
    });

    test('should return 429 response when rate limited', async () => {
      const now = Date.now();
      const mockData = {
        count: 10,
        windowStart: now
      };

      const mockKV = {
        get: jest.fn().mockResolvedValue(mockData),
        put: jest.fn()
      };

      const context = {
        env: { RATE_LIMIT_KV: mockKV },
        request: {
          headers: {
            get: jest.fn((header) => {
              if (header === 'CF-Connecting-IP') return '1.2.3.4';
              return null;
            })
          }
        }
      };

      const result = await rateLimiter.rateLimitMiddleware(context, 'fortune', 'en');

      expect(result).not.toBeNull();
      expect(result.status).toBe(429);
    });

    test('should store rateLimitResult in context when allowed', async () => {
      const mockKV = {
        get: jest.fn().mockResolvedValue(null),
        put: jest.fn().mockResolvedValue(undefined)
      };

      const context = {
        env: { RATE_LIMIT_KV: mockKV },
        request: {
          headers: {
            get: jest.fn((header) => {
              if (header === 'CF-Connecting-IP') return '5.6.7.8';
              return null;
            })
          }
        }
      };

      await rateLimiter.rateLimitMiddleware(context, 'compatibility', 'ko');

      expect(context.rateLimitResult).toBeDefined();
      expect(context.rateLimitResult.allowed).toBe(true);
      expect(context.rateLimitResult.kvAvailable).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty X-Forwarded-For header', () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header) => {
            if (header === 'X-Forwarded-For') return '';
            return null;
          })
        }
      };

      expect(rateLimiter.getClientIP(mockRequest)).toBe('unknown');
    });

    test('should handle X-Forwarded-For with only spaces', () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header) => {
            if (header === 'X-Forwarded-For') return '   ';
            return null;
          })
        }
      };

      expect(rateLimiter.getClientIP(mockRequest)).toBe('unknown');
    });

    test('should handle very old window start', async () => {
      const veryOldWindowStart = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
      const mockData = {
        count: 1000,
        windowStart: veryOldWindowStart
      };

      const mockKV = {
        get: jest.fn().mockResolvedValue(mockData),
        put: jest.fn().mockResolvedValue(undefined)
      };

      const mockRequest = {
        headers: {
          get: jest.fn(() => '1.2.3.4')
        }
      };

      const env = { RATE_LIMIT_KV: mockKV };
      const result = await rateLimiter.checkRateLimit(env, mockRequest, 'fortune');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(rateLimiter.CONFIG.maxRequests - 1);
    });

    test('should handle rate limit response with expired reset time', async () => {
      const rateLimitResult = {
        resetTime: Date.now() - 1000 // Already expired
      };

      const response = rateLimiter.createRateLimitResponse(rateLimitResult, 'en');
      const body = await response.json();

      expect(body.retryAfter).toBe(1); // Minimum retry time
    });
  });
});
