# Rate Limiting Setup Guide
# Rate Limiting 설정 가이드

## Overview / 개요

This guide explains how to set up Cloudflare KV for rate limiting in the KFortunes application.

이 가이드는 KFortunes 애플리케이션의 Rate Limiting을 위한 Cloudflare KV 설정 방법을 설명합니다.

## Prerequisites / 사전 요구사항

- Cloudflare account with Pages project deployed
- Access to Cloudflare Dashboard

## Step 1: Create KV Namespace

### Via Cloudflare Dashboard:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** > **KV**
3. Click **Create a namespace**
4. Name it: `RATE_LIMIT_KV`
5. Click **Add**

### Via Wrangler CLI (optional):

```bash
wrangler kv:namespace create "RATE_LIMIT_KV"
```

## Step 2: Bind KV to Pages Function

1. Go to **Workers & Pages** in Cloudflare Dashboard
2. Select your **kfortunes** Pages project
3. Go to **Settings** > **Functions** > **KV namespace bindings**
4. Click **Add binding**
5. Configure:
   - **Variable name**: `RATE_LIMIT_KV`
   - **KV namespace**: Select the namespace you created
6. Click **Save**

## Step 3: Deploy

After binding, redeploy your Pages project:

```bash
npx wrangler pages deploy .
```

Or push to your Git repository if using Git integration.

## Configuration / 설정

The rate limiter is configured with these defaults in `functions/utils/rateLimiter.js`:

```javascript
const CONFIG = {
  maxRequests: 10,        // Maximum requests per window
  windowMs: 60 * 1000,    // Time window (1 minute)
  keyPrefix: 'ratelimit:',
};
```

### Adjusting Limits

To change rate limits, modify the CONFIG in `rateLimiter.js`:

```javascript
// Example: 20 requests per 2 minutes
const CONFIG = {
  maxRequests: 20,
  windowMs: 2 * 60 * 1000,
  // ...
};
```

## How It Works / 동작 원리

1. **Request Arrives**: Client makes API request
2. **IP Extraction**: System gets client IP from headers (CF-Connecting-IP, X-Forwarded-For, X-Real-IP)
3. **KV Lookup**: System checks rate limit data in KV
4. **Decision**:
   - If under limit: Allow request, increment counter
   - If over limit: Return 429 response
5. **Window Reset**: Counter resets after window expires

## Graceful Degradation / 우아한 저하

If KV is unavailable (not configured or error), the system:
- Allows all requests through
- Logs warning for monitoring
- Does not block legitimate users

This ensures the application remains functional even without rate limiting.

## Response Headers / 응답 헤더

Successful responses include rate limit headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1706400000
```

Rate limited responses (429):

```json
{
  "success": false,
  "error": "Too many requests. Please try again later.",
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 45
}
```

Headers:
```
Retry-After: 45
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1706400000
```

## Multilingual Error Messages

Error messages are available in 5 languages:
- English (en)
- Korean (ko)
- Japanese (ja)
- Chinese (zh)
- Vietnamese (vi)

## Testing / 테스트

Run unit tests:

```bash
npm test -- --testPathPattern=rateLimiter
```

Test locally without KV (graceful degradation mode):
- Rate limiting will be disabled
- All requests will be allowed
- Check console for warnings

## Monitoring / 모니터링

Monitor rate limiting via:

1. **Cloudflare KV Metrics**: Dashboard > Workers & Pages > KV > Analytics
2. **Application Logs**: Check for `Rate limit check error` messages
3. **Response Headers**: Track X-RateLimit-Remaining in responses

## Troubleshooting / 문제 해결

### Rate limiting not working

1. Verify KV namespace is bound correctly
2. Check variable name is exactly `RATE_LIMIT_KV`
3. Ensure deployment is complete after binding

### All requests being rate limited

1. Check if KV data is corrupted
2. Clear KV namespace and redeploy
3. Verify system clock is correct

### KV errors in logs

1. Check Cloudflare service status
2. Verify KV namespace exists
3. System will fallback to allowing requests
