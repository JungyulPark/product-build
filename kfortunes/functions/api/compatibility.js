// Cloudflare Pages Function - Celebrity Compatibility AI Analysis
// GPT를 통한 셀럽 궁합 분석 API (Free tier)

// --- CONFIG ---
const COMPATIBILITY_CONFIG = {
  model: 'gpt-4o-mini',     // Free tier — cost-efficient model
  maxTokens: 1500,
  temperature: 0.8,
  timeoutMs: 15000,           // 15 second API timeout
};

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    const { userSajuData, celebrityData, language = 'en' } = body;

    if (!userSajuData || !celebrityData) {
      return new Response(JSON.stringify({ error: 'Missing user saju data or celebrity data' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // MOCK_MODE or no API key → return local calculation only
    const useMockMode = env.MOCK_MODE === 'true' || !env.OPENAI_API_KEY;

    let analysis;

    if (useMockMode) {
      analysis = getMockCompatibilityData(userSajuData, celebrityData, language);
    } else {
      const apiKey = env.OPENAI_API_KEY;
      const prompt = buildCompatibilityPrompt(userSajuData, celebrityData, language);

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

        clearTimeout(timeout);

        if (response.status === 429) {
          console.error('OpenAI rate limit hit');
          analysis = getMockCompatibilityData(userSajuData, celebrityData, language);
          analysis._source = 'fallback';
          return new Response(JSON.stringify({ success: true, analysis }), {
            status: 200,
            headers: corsHeaders
          });
        }

        if (!response.ok) {
          const error = await response.text();
          console.error('OpenAI API Error:', response.status, error);
          analysis = getMockCompatibilityData(userSajuData, celebrityData, language);
          analysis._source = 'fallback';
          return new Response(JSON.stringify({ success: true, analysis }), {
            status: 200,
            headers: corsHeaders
          });
        }

        const data = await response.json();
        const analysisText = data.choices[0]?.message?.content;
        analysis = parseCompatibilityResponse(analysisText);
        analysis._source = 'gpt';
      } catch (fetchError) {
        clearTimeout(timeout);
        if (fetchError.name === 'AbortError') {
          console.error('OpenAI API timeout after', COMPATIBILITY_CONFIG.timeoutMs, 'ms');
        } else {
          console.error('OpenAI fetch error:', fetchError.message);
        }
        analysis = getMockCompatibilityData(userSajuData, celebrityData, language);
        analysis._source = 'fallback';
      }
    }

    return new Response(JSON.stringify({ success: true, analysis }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Error:', error.message, error.stack);
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
