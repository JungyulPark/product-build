// Cloudflare Pages Function - GPT Fortune API
// 사주 운세 분석 API (Basic tier: $2.99)

// --- CONFIG ---
const FORTUNE_CONFIG = {
  model: 'gpt-4o',           // Basic tier model
  maxTokens: 2000,
  temperature: 0.7,
  timeoutMs: 15000,           // 15 second API timeout
};

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    const { sajuData, language = 'en' } = body;

    if (!sajuData) {
      return new Response(JSON.stringify({ error: 'Missing saju data' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // MOCK_MODE: 결제 연동 전까지 샘플 데이터 반환
    const useMockMode = env.MOCK_MODE === 'true' || !env.OPENAI_API_KEY;

    let fortune;

    if (useMockMode) {
      // Mock 데이터 반환 (API 호출 없음)
      fortune = getMockFortuneData(sajuData, language);
    } else {
      const apiKey = env.OPENAI_API_KEY;
      const prompt = buildFortunePrompt(sajuData, language);

      // API call with timeout and error handling
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FORTUNE_CONFIG.timeoutMs);

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: FORTUNE_CONFIG.model,
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
            temperature: FORTUNE_CONFIG.temperature,
            max_tokens: FORTUNE_CONFIG.maxTokens
          }),
          signal: controller.signal
        });

        clearTimeout(timeout);

        // Handle rate limiting
        if (response.status === 429) {
          console.error('OpenAI rate limit hit');
          fortune = getMockFortuneData(sajuData, language);
          fortune._source = 'fallback';
          return new Response(JSON.stringify({ success: true, fortune }), {
            status: 200,
            headers: corsHeaders
          });
        }

        if (!response.ok) {
          const error = await response.text();
          console.error('OpenAI API Error:', response.status, error);
          // Fallback to mock data instead of returning error
          fortune = getMockFortuneData(sajuData, language);
          fortune._source = 'fallback';
          return new Response(JSON.stringify({ success: true, fortune }), {
            status: 200,
            headers: corsHeaders
          });
        }

        const data = await response.json();
        const fortuneText = data.choices[0]?.message?.content;
        fortune = parseFortuneResponse(fortuneText);
        fortune._source = 'gpt';
      } catch (fetchError) {
        clearTimeout(timeout);
        if (fetchError.name === 'AbortError') {
          console.error('OpenAI API timeout after', FORTUNE_CONFIG.timeoutMs, 'ms');
        } else {
          console.error('OpenAI fetch error:', fetchError.message);
        }
        // Fallback to mock data on any fetch failure
        fortune = getMockFortuneData(sajuData, language);
        fortune._source = 'fallback';
      }
    }

    return new Response(JSON.stringify({ success: true, fortune }), {
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

// Handle OPTIONS for CORS
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
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  const prompts = {
    en: `You are an expert Korean Saju (四柱命理) fortune teller with 30 years of experience. Analyze the Four Pillars data and provide a personalized fortune reading.

Guidelines:
- Be specific and insightful based on the actual saju elements
- Use warm, encouraging tone while being honest about challenges
- Reference the actual elements (Wood, Fire, Earth, Metal, Water) in your analysis
- Current year is ${currentYear}, provide outlook for ${currentYear}-${nextYear}

Response MUST be valid JSON:
{
  "personality": {
    "core": "Core personality trait in 1 sentence",
    "strengths": "Key strengths based on day master",
    "growth": "Area for personal growth"
  },
  "career": {
    "outlook": "Career outlook for this year",
    "suitable": "Suitable career fields based on elements",
    "advice": "Actionable career advice"
  },
  "love": {
    "outlook": "Love/relationship outlook",
    "compatibility": "Compatible element types",
    "advice": "Relationship advice"
  },
  "health": {
    "focus": "Health areas to focus on based on weak elements",
    "tips": "Practical health tips"
  },
  "wealth": {
    "outlook": "Financial outlook for this period",
    "opportunity": "Best opportunities for wealth",
    "caution": "Financial caution"
  },
  "yearFortune": {
    "overall": "Overall ${currentYear} fortune summary",
    "bestMonths": "Best months and why",
    "challenges": "Potential challenges to navigate"
  },
  "luckyTips": {
    "colors": ["primary lucky color", "secondary color"],
    "direction": "Lucky direction with reason",
    "numbers": ["lucky number 1", "lucky number 2"],
    "day": "Best day of week"
  },
  "specialAdvice": "One personalized piece of wisdom for this person"
}`,

    ko: `당신은 30년 경력의 사주명리 전문가입니다. 사주팔자를 분석하여 맞춤형 운세를 제공해주세요.

가이드라인:
- 실제 사주 구성요소(목, 화, 토, 금, 수)를 기반으로 구체적으로 분석
- 따뜻하고 격려하는 톤으로, 하지만 주의점도 솔직하게 전달
- 현재 연도는 ${currentYear}년, ${currentYear}-${nextYear}년 전망 제공
- 한국어로 자연스럽게 작성

응답은 반드시 유효한 JSON 형식으로:
{
  "personality": {
    "core": "핵심 성격 특성 (1문장)",
    "strengths": "일간 기반 강점",
    "growth": "성장 포인트"
  },
  "career": {
    "outlook": "올해 직업운 전망",
    "suitable": "오행 기반 적합한 직종/분야",
    "advice": "실천 가능한 커리어 조언"
  },
  "love": {
    "outlook": "연애/관계 전망",
    "compatibility": "잘 맞는 오행 타입",
    "advice": "연애 조언"
  },
  "health": {
    "focus": "약한 오행 기반 주의할 건강 부분",
    "tips": "실천 건강 팁"
  },
  "wealth": {
    "outlook": "재물운 전망",
    "opportunity": "재물 기회가 오는 시기/방법",
    "caution": "재정 주의사항"
  },
  "yearFortune": {
    "overall": "${currentYear}년 종합운 요약",
    "bestMonths": "좋은 달과 이유",
    "challenges": "극복해야 할 과제"
  },
  "luckyTips": {
    "colors": ["메인 행운색", "서브 행운색"],
    "direction": "행운의 방위와 이유",
    "numbers": ["행운의 숫자1", "행운의 숫자2"],
    "day": "최고의 요일"
  },
  "specialAdvice": "이 사람에게 전하는 특별한 한마디"
}`,

    ja: `あなたは30年のキャリアを持つ四柱推命の専門家です。四柱データを分析し、パーソナライズされた運勢を提供してください。

ガイドライン:
- 実際の五行（木・火・土・金・水）に基づいて具体的に分析
- 温かく励ましながらも、注意点は正直に伝える
- 現在は${currentYear}年、${currentYear}-${nextYear}年の展望を提供

回答は必ず有効なJSON形式で:
{
  "personality": {
    "core": "核心的な性格特性（1文）",
    "strengths": "日干に基づく強み",
    "growth": "成長ポイント"
  },
  "career": {
    "outlook": "今年のキャリア展望",
    "suitable": "五行に基づく適職",
    "advice": "実践可能なアドバイス"
  },
  "love": {
    "outlook": "恋愛・人間関係の展望",
    "compatibility": "相性の良い五行タイプ",
    "advice": "恋愛アドバイス"
  },
  "health": {
    "focus": "弱い五行に基づく注意点",
    "tips": "実践的な健康アドバイス"
  },
  "wealth": {
    "outlook": "金運の展望",
    "opportunity": "財運のチャンス",
    "caution": "財政上の注意点"
  },
  "yearFortune": {
    "overall": "${currentYear}年の総合運",
    "bestMonths": "良い月とその理由",
    "challenges": "克服すべき課題"
  },
  "luckyTips": {
    "colors": ["メインラッキーカラー", "サブカラー"],
    "direction": "ラッキー方角と理由",
    "numbers": ["ラッキーナンバー1", "ラッキーナンバー2"],
    "day": "最良の曜日"
  },
  "specialAdvice": "この方への特別なメッセージ"
}`,

    zh: `你是一位拥有30年经验的四柱命理专家。分析四柱数据，提供个性化的运势解读。

指南：
- 基于实际五行（木、火、土、金、水）进行具体分析
- 温暖鼓励的同时，也要诚实地指出需要注意的地方
- 当前是${currentYear}年，提供${currentYear}-${nextYear}年展望

回复必须是有效的JSON格式：
{
  "personality": {
    "core": "核心性格特质（1句话）",
    "strengths": "基于日干的优势",
    "growth": "成长方向"
  },
  "career": {
    "outlook": "今年事业展望",
    "suitable": "基于五行的适合领域",
    "advice": "可执行的建议"
  },
  "love": {
    "outlook": "感情/人际关系展望",
    "compatibility": "相配的五行类型",
    "advice": "感情建议"
  },
  "health": {
    "focus": "基于弱势五行的健康关注点",
    "tips": "实用健康建议"
  },
  "wealth": {
    "outlook": "财运展望",
    "opportunity": "财富机会",
    "caution": "理财注意事项"
  },
  "yearFortune": {
    "overall": "${currentYear}年综合运势",
    "bestMonths": "最佳月份及原因",
    "challenges": "需要克服的挑战"
  },
  "luckyTips": {
    "colors": ["主幸运色", "副幸运色"],
    "direction": "幸运方位及原因",
    "numbers": ["幸运数字1", "幸运数字2"],
    "day": "最佳星期"
  },
  "specialAdvice": "给这位朋友的特别寄语"
}`,

    vi: `Bạn là chuyên gia Tứ Trụ với 30 năm kinh nghiệm. Phân tích dữ liệu Tứ Trụ và cung cấp vận mệnh cá nhân hóa.

Hướng dẫn:
- Phân tích cụ thể dựa trên Ngũ Hành thực tế (Mộc, Hỏa, Thổ, Kim, Thủy)
- Ấm áp khích lệ nhưng cũng thành thật về những điều cần lưu ý
- Năm hiện tại là ${currentYear}, cung cấp triển vọng ${currentYear}-${nextYear}

Phản hồi phải là JSON hợp lệ:
{
  "personality": {
    "core": "Đặc điểm tính cách cốt lõi (1 câu)",
    "strengths": "Điểm mạnh dựa trên Nhật Chủ",
    "growth": "Điểm cần phát triển"
  },
  "career": {
    "outlook": "Triển vọng sự nghiệp năm nay",
    "suitable": "Lĩnh vực phù hợp theo Ngũ Hành",
    "advice": "Lời khuyên thiết thực"
  },
  "love": {
    "outlook": "Triển vọng tình cảm/quan hệ",
    "compatibility": "Loại Ngũ Hành tương hợp",
    "advice": "Lời khuyên tình cảm"
  },
  "health": {
    "focus": "Điểm cần chú ý sức khỏe",
    "tips": "Mẹo sức khỏe thực tế"
  },
  "wealth": {
    "outlook": "Triển vọng tài chính",
    "opportunity": "Cơ hội tài lộc",
    "caution": "Lưu ý tài chính"
  },
  "yearFortune": {
    "overall": "Vận may tổng quan ${currentYear}",
    "bestMonths": "Tháng tốt nhất và lý do",
    "challenges": "Thử thách cần vượt qua"
  },
  "luckyTips": {
    "colors": ["Màu may mắn chính", "Màu phụ"],
    "direction": "Hướng may mắn và lý do",
    "numbers": ["Số may mắn 1", "Số may mắn 2"],
    "day": "Ngày tốt nhất trong tuần"
  },
  "specialAdvice": "Lời nhắn đặc biệt dành cho bạn"
}`
  };

  return prompts[language] || prompts.en;
}

function buildFortunePrompt(sajuData, language) {
  const {
    birthDate = {},
    gender = 'unknown',
    dayMaster = {},
    fourPillars = {},
    elementBalance = {}
  } = sajuData || {};

  // Safe access helper
  const safe = (obj, ...keys) => {
    let val = obj;
    for (const key of keys) {
      val = val?.[key];
      if (val === undefined) return '?';
    }
    return val;
  };

  const formatPillar = (pillar, name) => {
    if (!pillar) return `- ${name}: Unknown`;
    return `- ${name}: ${safe(pillar, 'stem')}${safe(pillar, 'branch')} (${safe(pillar, 'korean')})`;
  };

  return `
Birth Date: ${safe(birthDate, 'year')}년 ${safe(birthDate, 'month')}월 ${safe(birthDate, 'day')}일
Gender: ${gender === 'male' ? 'Male/남성' : gender === 'female' ? 'Female/여성' : 'Unknown'}

Four Pillars (四柱/사주):
${formatPillar(fourPillars.year, 'Year Pillar (年柱)')}
${formatPillar(fourPillars.month, 'Month Pillar (月柱)')}
${formatPillar(fourPillars.day, 'Day Pillar (日柱)')}
${formatPillar(fourPillars.hour, 'Hour Pillar (時柱)')}

Day Master (日干/일간): ${safe(dayMaster, 'stem')} (${safe(dayMaster, 'korean')}) - ${safe(dayMaster, 'element')} ${dayMaster?.yin ? 'Yin/음' : 'Yang/양'}

Five Elements Balance (五行/오행):
- Wood (木): ${safe(elementBalance, 'wood') || 0}
- Fire (火): ${safe(elementBalance, 'fire') || 0}
- Earth (土): ${safe(elementBalance, 'earth') || 0}
- Metal (金): ${safe(elementBalance, 'metal') || 0}
- Water (水): ${safe(elementBalance, 'water') || 0}

Please analyze this Saju chart and provide a detailed fortune reading.`;
}

function parseFortuneResponse(text) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Validate required structure
      if (parsed.personality && parsed.career) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse fortune response:', e);
  }

  // Return default structure if parsing fails
  const currentYear = new Date().getFullYear();
  return {
    personality: {
      core: "분석 중 오류가 발생했습니다.",
      strengths: "다시 시도해주세요.",
      growth: ""
    },
    career: {
      outlook: "분석을 완료할 수 없습니다.",
      suitable: "",
      advice: "다시 시도해주세요."
    },
    love: {
      outlook: "분석을 완료할 수 없습니다.",
      compatibility: "",
      advice: ""
    },
    health: {
      focus: "분석을 완료할 수 없습니다.",
      tips: ""
    },
    wealth: {
      outlook: "분석을 완료할 수 없습니다.",
      opportunity: "",
      caution: ""
    },
    yearFortune: {
      overall: `${currentYear}년 운세 분석에 실패했습니다.`,
      bestMonths: "",
      challenges: ""
    },
    luckyTips: {
      colors: ["파란색", "흰색"],
      direction: "동쪽",
      numbers: ["3", "7"],
      day: "수요일"
    },
    specialAdvice: "다시 시도해주세요."
  };
}

// Mock 데이터 생성 함수 (결제 연동 전까지 사용)
function getMockFortuneData(sajuData, language) {
  const currentYear = new Date().getFullYear();
  const dayMasterElement = sajuData?.dayMaster?.element || 'Fire';

  const mockData = {
    ko: {
      personality: {
        core: "화(火) 기운이 강한 열정적이고 추진력 있는 성격의 소유자입니다",
        strengths: "리더십이 뛰어나고 새로운 도전을 두려워하지 않는 용기가 있습니다. 주변 사람들에게 활력을 주는 밝은 에너지를 가지고 있어요.",
        growth: "때로는 급한 성격이 일을 그르칠 수 있으니, 중요한 결정 전에는 한 템포 쉬어가는 여유가 필요합니다"
      },
      career: {
        outlook: `${currentYear}년은 그동안 쌓아온 역량이 빛을 발하는 해입니다. 상반기에 중요한 기회가 찾아올 가능성이 높아요.`,
        suitable: "창의성을 발휘할 수 있는 기획/마케팅 분야, 또는 리더십을 살릴 수 있는 관리직이 적합합니다",
        advice: "동료들과의 협력을 강화하고, 본인의 아이디어를 적극적으로 어필하세요"
      },
      love: {
        outlook: "솔직하고 열정적인 표현이 관계에 긍정적인 영향을 미칩니다. 진심 어린 소통이 핵심이에요.",
        compatibility: "수(水) 또는 목(木) 기운의 사람과 좋은 조화를 이룹니다",
        advice: "상대방의 이야기에 더 귀 기울이고, 감정을 차분하게 전달하는 연습을 해보세요"
      },
      health: {
        focus: "화(火) 기운이 강해 심장, 혈압 관련 건강에 신경 쓰세요. 스트레스 관리가 중요합니다.",
        tips: "규칙적인 유산소 운동과 충분한 수분 섭취를 권장합니다. 매운 음식은 적당히!"
      },
      wealth: {
        outlook: "안정적인 수입과 함께 예상치 못한 부수입의 기회도 있습니다",
        opportunity: "인맥을 통한 투자 정보나 부업 기회가 생길 수 있어요. 3월, 8월에 주목하세요.",
        caution: "충동적인 큰 지출은 자제하고, 저축 습관을 유지하세요"
      },
      yearFortune: {
        overall: `${currentYear}년은 성장과 도약의 해입니다. 그동안의 노력이 결실을 맺는 시기이니 자신감을 가지세요.`,
        bestMonths: "3월(새로운 시작), 6월(인연운 상승), 9월(재물운 상승)에 좋은 기회가 찾아옵니다",
        challenges: "5월과 11월에는 건강 관리와 대인관계에 조금 더 신경 쓰세요"
      },
      luckyTips: {
        colors: ["파란색 - 화 기운을 중화시켜 안정감 제공", "초록색 - 목 기운으로 창의력 향상"],
        direction: "동쪽 - 목(木) 기운을 받아 성장 에너지 강화",
        numbers: ["3 - 발전과 성장의 숫자", "8 - 재물과 풍요의 숫자"],
        day: "수요일 - 수(水) 기운으로 균형 유지"
      },
      specialAdvice: "올해는 '급할수록 돌아가라'는 말을 기억하세요. 신중함이 더 큰 성공을 가져다줍니다. 주변 사람들의 조언에 귀 기울이되, 최종 결정은 본인의 직관을 믿으세요."
    },
    en: {
      personality: {
        core: "You possess a passionate and driven personality with strong Fire energy",
        strengths: "Natural leadership abilities and courage to embrace new challenges. Your bright energy inspires those around you.",
        growth: "Sometimes quick temper may hinder progress - practice pausing before important decisions"
      },
      career: {
        outlook: `${currentYear} is a year where your accumulated skills will shine. High chances of important opportunities in the first half.`,
        suitable: "Creative fields like planning/marketing, or management positions that utilize your leadership",
        advice: "Strengthen collaboration with colleagues and actively promote your ideas"
      },
      love: {
        outlook: "Your honest and passionate expression positively impacts relationships. Sincere communication is key.",
        compatibility: "Great harmony with Water or Wood element people",
        advice: "Practice listening more and expressing emotions calmly"
      },
      health: {
        focus: "With strong Fire energy, pay attention to heart and blood pressure health. Stress management is important.",
        tips: "Regular cardio exercise and adequate hydration recommended. Go easy on spicy foods!"
      },
      wealth: {
        outlook: "Stable income with unexpected additional income opportunities",
        opportunity: "Investment tips or side business opportunities may come through connections. Watch March and August.",
        caution: "Avoid impulsive large purchases and maintain saving habits"
      },
      yearFortune: {
        overall: `${currentYear} is a year of growth and advancement. Your efforts will bear fruit - have confidence!`,
        bestMonths: "March (new beginnings), June (relationship luck), September (wealth luck) bring good opportunities",
        challenges: "Pay extra attention to health and relationships in May and November"
      },
      luckyTips: {
        colors: ["Blue - neutralizes Fire energy for stability", "Green - Wood energy for creativity"],
        direction: "East - receive Wood energy for growth",
        numbers: ["3 - number of development and growth", "8 - number of wealth and abundance"],
        day: "Wednesday - Water energy for balance"
      },
      specialAdvice: "Remember 'haste makes waste' this year. Prudence brings greater success. Listen to advice from others, but trust your intuition for final decisions."
    }
  };

  return mockData[language] || mockData.en;
}
