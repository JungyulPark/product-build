// Cloudflare Pages Function - Celebrity Compatibility AI Analysis
// GPT를 통한 셀럽 궁합 분석 API (Free tier)

// --- RATE LIMITING ---
const rateLimiter = require('../utils/rateLimiter.js');

// --- LOGGING ---
const logger = require('../utils/logger.js');

// --- CONFIG ---
const COMPATIBILITY_CONFIG = {
  model: 'gpt-4o-mini',     // Free tier — cost-efficient model
  maxTokens: 1500,
  temperature: 0.8,
  timeoutMs: 15000,           // 15 second API timeout
  maxRequestSize: 15000,      // 15KB max request size
};

// --- INPUT VALIDATION ---
const SUPPORTED_LANGUAGES = ['en', 'ko', 'ja', 'zh', 'vi'];

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .slice(0, 1000);
}

function sanitizeObject(obj) {
  if (obj === null || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }
  if (Array.isArray(obj)) {
    return obj.slice(0, 100).map(sanitizeObject);
  }
  const sanitized = {};
  for (const [key, value] of Object.entries(obj).slice(0, 50)) {
    sanitized[sanitizeString(key)] = sanitizeObject(value);
  }
  return sanitized;
}

function validateUserSajuData(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['userSajuData must be an object'] };
  }
  // Basic validation for dayMaster
  if (data.dayMaster && typeof data.dayMaster !== 'object') {
    errors.push('dayMaster must be an object');
  }
  return { valid: errors.length === 0, errors };
}

function validateCelebrityData(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['celebrityData must be an object'] };
  }
  if (!data.name || typeof data.name !== 'string') {
    errors.push('celebrityData.name is required and must be a string');
  }
  return { valid: errors.length === 0, errors };
}

function validateLanguage(language) {
  if (!language) return { valid: true, sanitized: 'en' };
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return { valid: false, error: `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}` };
  }
  return { valid: true, sanitized: language };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const startTime = Date.now();

  // --- Logging Setup ---
  const reqLogger = logger.createRequestLogger(request);
  reqLogger.logRequest();

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // --- Rate Limiting Check ---
    const rateLimitResponse = await rateLimiter.rateLimitMiddleware(context, 'compatibility', 'en');
    if (rateLimitResponse) {
      reqLogger.warn('Rate limit exceeded');
      return rateLimitResponse;
    }

    // Check request size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > COMPATIBILITY_CONFIG.maxRequestSize) {
      return new Response(JSON.stringify({
        error: 'Request too large',
        maxSize: COMPATIBILITY_CONFIG.maxRequestSize
      }), {
        status: 413,
        headers: corsHeaders
      });
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return new Response(JSON.stringify({
        error: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const { userSajuData, celebrityData, language = 'en' } = body;

    // Validate language
    const langValidation = validateLanguage(language);
    if (!langValidation.valid) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: [langValidation.error]
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Validate userSajuData
    if (!userSajuData) {
      return new Response(JSON.stringify({ error: 'Missing userSajuData' }), {
        status: 400,
        headers: corsHeaders
      });
    }
    const userValidation = validateUserSajuData(userSajuData);
    if (!userValidation.valid) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: userValidation.errors
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Validate celebrityData
    if (!celebrityData) {
      return new Response(JSON.stringify({ error: 'Missing celebrityData' }), {
        status: 400,
        headers: corsHeaders
      });
    }
    const celebValidation = validateCelebrityData(celebrityData);
    if (!celebValidation.valid) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: celebValidation.errors
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Sanitize inputs
    const sanitizedUserData = sanitizeObject(userSajuData);
    const sanitizedCelebData = sanitizeObject(celebrityData);
    const sanitizedLanguage = langValidation.sanitized;

    // MOCK_MODE or no API key → return local calculation only
    const useMockMode = env.MOCK_MODE === 'true' || !env.OPENAI_API_KEY;

    let analysis;

    if (useMockMode) {
      reqLogger.info('Using mock mode', { reason: env.OPENAI_API_KEY ? 'MOCK_MODE=true' : 'No API key' });
      analysis = getMockCompatibilityData(sanitizedUserData, sanitizedCelebData, sanitizedLanguage);
    } else {
      const apiKey = env.OPENAI_API_KEY;
      const prompt = buildCompatibilityPrompt(sanitizedUserData, sanitizedCelebData, sanitizedLanguage);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), COMPATIBILITY_CONFIG.timeoutMs);

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: COMPATIBILITY_CONFIG.model,
            messages: [
              {
                role: 'system',
                content: getSystemPrompt(language)
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: COMPATIBILITY_CONFIG.temperature,
            max_tokens: COMPATIBILITY_CONFIG.maxTokens
          }),
          signal: controller.signal
        });

        const apiDuration = Date.now() - startTime;
        clearTimeout(timeout);

        if (response.status === 429) {
          reqLogger.logApiCall('OpenAI', false, apiDuration, { status: 429, error: 'rate_limit' });
          logger.errorTracker.track('OPENAI_RATE_LIMIT', { endpoint: 'compatibility' });
          analysis = getMockCompatibilityData(sanitizedUserData, sanitizedCelebData, sanitizedLanguage);
          analysis._source = 'fallback';
          reqLogger.logResponse(200, Date.now() - startTime);
          return new Response(JSON.stringify({ success: true, analysis }), {
            status: 200,
            headers: corsHeaders
          });
        }

        if (!response.ok) {
          const errorText = await response.text();
          reqLogger.logApiCall('OpenAI', false, apiDuration, { status: response.status, error: errorText.substring(0, 200) });
          logger.errorTracker.track('OPENAI_API_ERROR', { status: response.status, endpoint: 'compatibility' });
          analysis = getMockCompatibilityData(sanitizedUserData, sanitizedCelebData, sanitizedLanguage);
          analysis._source = 'fallback';
          reqLogger.logResponse(200, Date.now() - startTime);
          return new Response(JSON.stringify({ success: true, analysis }), {
            status: 200,
            headers: corsHeaders
          });
        }

        const data = await response.json();
        const analysisText = data.choices[0]?.message?.content;
        analysis = parseCompatibilityResponse(analysisText);
        analysis._source = 'gpt';
        reqLogger.logApiCall('OpenAI', true, apiDuration, { model: COMPATIBILITY_CONFIG.model });
      } catch (fetchError) {
        const apiDuration = Date.now() - startTime;
        clearTimeout(timeout);
        if (fetchError.name === 'AbortError') {
          reqLogger.logApiCall('OpenAI', false, apiDuration, { error: 'timeout', timeoutMs: COMPATIBILITY_CONFIG.timeoutMs });
          logger.errorTracker.track('OPENAI_TIMEOUT', { endpoint: 'compatibility' });
        } else {
          reqLogger.logApiCall('OpenAI', false, apiDuration, { error: fetchError.message });
          logger.errorTracker.track('OPENAI_FETCH_ERROR', { message: fetchError.message, endpoint: 'compatibility' });
        }
        analysis = getMockCompatibilityData(sanitizedUserData, sanitizedCelebData, sanitizedLanguage);
        analysis._source = 'fallback';
      }
    }

    // Log success and create response
    reqLogger.logResponse(200, Date.now() - startTime);
    logger.performanceMonitor.record('compatibility_request', Date.now() - startTime);

    // Create response with rate limit headers
    const response = new Response(JSON.stringify({ success: true, analysis }), {
      status: 200,
      headers: corsHeaders
    });

    // Add rate limit headers if available
    if (context.rateLimitResult) {
      return rateLimiter.addRateLimitHeaders(response, context.rateLimitResult);
    }

    return response;

  } catch (error) {
    reqLogger.error('Request failed', error, { duration: `${Date.now() - startTime}ms` });
    logger.errorTracker.track('COMPATIBILITY_REQUEST_ERROR', { message: error.message });
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

function getSystemPrompt(language) {
  const prompts = {
    en: `You are an expert in Korean Saju (Four Pillars of Destiny) compatibility analysis. Analyze the romantic/friendship compatibility between a person and a celebrity based on their Saju elements.

Be fun, engaging, and insightful. Reference actual element interactions (mutual generation, mutual control) to explain the dynamics.

Response MUST be valid JSON:
{
  "overallScore": 85,
  "dynamics": "A brief 2-3 sentence summary of the relationship dynamics",
  "strengths": [
    "First strength of this pairing",
    "Second strength of this pairing",
    "Third strength of this pairing"
  ],
  "challenges": [
    "First challenge to navigate",
    "Second challenge to navigate"
  ],
  "romanticChemistry": "2-3 sentences about romantic potential",
  "friendshipPotential": "2-3 sentences about friendship potential",
  "advice": "A personalized piece of advice for connecting with this celebrity's energy",
  "luckyDateTip": "Best day/time for positive energy with this pairing"
}`,

    ko: `당신은 사주명리 궁합 전문가입니다. 사용자와 셀러브리티 사이의 사주 궁합을 분석해주세요.

재미있고 통찰력 있게, 실제 오행의 상생/상극 관계를 기반으로 분석해주세요.

응답은 반드시 유효한 JSON 형식으로:
{
  "overallScore": 85,
  "dynamics": "관계 역학 요약 (2-3문장)",
  "strengths": [
    "이 조합의 첫 번째 강점",
    "두 번째 강점",
    "세 번째 강점"
  ],
  "challenges": [
    "극복할 과제 1",
    "극복할 과제 2"
  ],
  "romanticChemistry": "로맨틱 케미 분석 (2-3문장)",
  "friendshipPotential": "우정 잠재력 (2-3문장)",
  "advice": "이 셀럽의 에너지와 연결되기 위한 조언",
  "luckyDateTip": "이 조합에 긍정적 에너지가 흐르는 날/시간"
}`
  };

  return prompts[language] || prompts.en;
}

function buildCompatibilityPrompt(userSajuData, celebrityData, language) {
  const userDM = userSajuData.dayMaster || {};
  const userFP = userSajuData.fourPillars || {};

  const formatPillar = (pillar, name) => {
    if (!pillar) return `- ${name}: Unknown`;
    return `- ${name}: ${pillar.stem || '?'}${pillar.branch || '?'} (${pillar.korean || '??'})`;
  };

  return `
=== USER's Saju (Four Pillars) ===
Day Master: ${userDM.stem || '?'} (${userDM.korean || '?'}) - ${userDM.element || '?'} ${userDM.yin ? 'Yin' : 'Yang'}
${formatPillar(userFP.year, 'Year Pillar')}
${formatPillar(userFP.month, 'Month Pillar')}
${formatPillar(userFP.day, 'Day Pillar')}
${formatPillar(userFP.hour, 'Hour Pillar')}
Gender: ${userSajuData.gender || 'Unknown'}

Five Elements Balance:
- Wood: ${userSajuData.elementBalance?.wood || 0}
- Fire: ${userSajuData.elementBalance?.fire || 0}
- Earth: ${userSajuData.elementBalance?.earth || 0}
- Metal: ${userSajuData.elementBalance?.metal || 0}
- Water: ${userSajuData.elementBalance?.water || 0}

=== CELEBRITY ===
Name: ${celebrityData.name} (${celebrityData.korean || ''})
Category: ${celebrityData.category || 'Entertainment'}
Day Master Element: ${celebrityData.dayMaster || '?'} ${celebrityData.yin ? 'Yin' : 'Yang'}
Heavenly Stem: ${celebrityData.stem || '?'}
Birth Year: ${celebrityData.birthYear || '?'}

Please analyze the Saju compatibility between this person and ${celebrityData.name}. Consider the five element interactions between their Day Masters and provide an engaging analysis.`;
}

function parseCompatibilityResponse(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.overallScore !== undefined && parsed.dynamics) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse compatibility response:', e);
  }

  return {
    overallScore: 75,
    dynamics: "An interesting cosmic pairing with unique energy dynamics.",
    strengths: ["Complementary energy patterns", "Mutual inspiration potential", "Balanced yin-yang dynamics"],
    challenges: ["Different expression styles", "Pace of life may differ"],
    romanticChemistry: "An intriguing connection with room for deep understanding.",
    friendshipPotential: "Natural potential for supportive and uplifting friendship.",
    advice: "Embrace the unique energy this pairing brings.",
    luckyDateTip: "Wednesdays and Fridays bring harmonious energy."
  };
}

function getMockCompatibilityData(userSajuData, celebrityData, language) {
  const userElement = userSajuData.dayMaster?.element || 'fire';
  const celebElement = celebrityData.dayMaster || 'wood';
  const celebName = celebrityData.name || 'Celebrity';

  // Calculate a consistent score based on elements
  const elementInteractions = {
    'wood-fire': 82, 'fire-wood': 80,
    'fire-earth': 78, 'earth-fire': 76,
    'earth-metal': 81, 'metal-earth': 79,
    'metal-water': 83, 'water-metal': 77,
    'water-wood': 85, 'wood-water': 79,
    'wood-earth': 62, 'earth-wood': 60,
    'fire-metal': 58, 'metal-fire': 56,
    'earth-water': 64, 'water-earth': 61,
    'metal-wood': 59, 'wood-metal': 57,
    'water-fire': 63, 'fire-water': 65,
  };

  const key = `${userElement}-${celebElement}`;
  const sameElement = userElement === celebElement;
  const baseScore = sameElement ? 88 : (elementInteractions[key] || 70);
  const score = Math.min(98, Math.max(45, baseScore + Math.floor(Math.random() * 8) - 4));

  const mockData = {
    en: {
      overallScore: score,
      dynamics: sameElement
        ? `You and ${celebName} share the same ${userElement} element energy! This creates a deep sense of mutual understanding and natural resonance between you.`
        : `Your ${userElement} energy meets ${celebName}'s ${celebElement} energy, creating a ${score > 75 ? 'harmonious' : 'dynamic'} interplay of cosmic forces.`,
      strengths: [
        sameElement ? "Deep mutual understanding from shared elemental energy" : "Complementary energies that balance each other",
        "Natural attraction based on cosmic element alignment",
        score > 75 ? "Strong potential for lasting connection" : "Exciting chemistry from elemental tension"
      ],
      challenges: [
        sameElement ? "May be too similar - need to cultivate differences" : "Different energy rhythms require understanding",
        "Balancing personal space with togetherness"
      ],
      romanticChemistry: score > 80
        ? `Exceptional romantic potential! Your energies naturally complement and enhance each other, creating a magnetic attraction.`
        : score > 65
        ? `Good romantic chemistry with interesting dynamics. Your different energies create an exciting push-and-pull that keeps things fresh.`
        : `An unconventional pairing that offers unique romantic lessons. The contrast in your energies can spark unexpected passion.`,
      friendshipPotential: `A ${score > 75 ? 'strong' : 'promising'} foundation for friendship. ${sameElement ? 'Your shared energy creates instant rapport.' : 'Your different perspectives enrich each other\'s worldview.'}`,
      advice: score > 80
        ? `Trust the cosmic connection - your energies are naturally aligned with ${celebName}'s. Embrace the harmony!`
        : `Channel your ${userElement} energy mindfully around ${celebName}'s ${celebElement} presence. The contrast can be your greatest strength.`,
      luckyDateTip: "Wednesdays and full moon days amplify positive energy for this pairing."
    },
    ko: {
      overallScore: score,
      dynamics: sameElement
        ? `${celebName}과(와) 같은 ${userElement} 오행 에너지를 공유하고 있어요! 서로를 깊이 이해하는 자연스러운 공감대가 형성됩니다.`
        : `당신의 ${userElement} 에너지가 ${celebName}의 ${celebElement} 에너지를 만나 ${score > 75 ? '조화로운' : '역동적인'} 우주적 교류가 이루어집니다.`,
      strengths: [
        sameElement ? "같은 오행 에너지로 인한 깊은 상호 이해" : "서로를 균형잡아주는 상호 보완적 에너지",
        "우주적 오행 배열에 기반한 자연스러운 끌림",
        score > 75 ? "오래 지속되는 인연의 강한 잠재력" : "오행 간 긴장감에서 오는 흥미로운 케미"
      ],
      challenges: [
        sameElement ? "너무 비슷할 수 있어 차이점 발견이 필요" : "다른 에너지 리듬에 대한 이해 필요",
        "개인적 공간과 함께하는 시간의 균형"
      ],
      romanticChemistry: score > 80
        ? `뛰어난 로맨스 잠재력! 서로의 에너지가 자연스럽게 보완하고 강화하여 자석 같은 끌림을 만들어냅니다.`
        : score > 65
        ? `좋은 로맨틱 케미와 흥미로운 역동성이 있어요. 다른 에너지가 신선한 밀당을 만들어냅니다.`
        : `독특한 로맨스 레슨을 제공하는 비전형적 조합. 에너지의 대비가 예상치 못한 열정을 불러일으킬 수 있어요.`,
      friendshipPotential: `${score > 75 ? '탄탄한' : '유망한'} 우정의 기반. ${sameElement ? '공유하는 에너지가 즉각적인 공감을 만들어요.' : '서로 다른 관점이 세계관을 풍요롭게 해요.'}`,
      advice: score > 80
        ? `우주적 연결을 믿으세요 - ${celebName}의 에너지와 자연스럽게 정렬되어 있어요. 조화를 즐기세요!`
        : `${celebName}의 ${celebElement} 에너지 근처에서 당신의 ${userElement} 에너지를 의식적으로 활용하세요. 대비가 가장 큰 강점이 될 수 있어요.`,
      luckyDateTip: "수요일과 보름달이 뜨는 날이 이 조합의 긍정적 에너지를 증폭시킵니다."
    }
  };

  return mockData[language] || mockData.en;
}
