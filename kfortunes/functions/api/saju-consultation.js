// Cloudflare Pages Function - Saju Consultation Report API
// 사주 상담 컨설팅 보고서 API (상세 분석)

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
    const {
      sajuData = {},         // 사주 데이터
      consultationType = 'general',  // 상담 유형: general, career, love, wealth, health
      specificQuestion = '', // 구체적인 질문
      currentSituation = '', // 현재 상황
      language = 'ko'
    } = body;

    if (!sajuData || !sajuData.fourPillars) {
      return new Response(JSON.stringify({
        error: language === 'ko' ? '사주 데이터가 필요합니다' : 'Saju data is required'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // MOCK_MODE: 결제 연동 전까지 샘플 데이터 반환
    const useMockMode = env.MOCK_MODE === 'true' || !env.OPENAI_API_KEY;

    let report;

    if (useMockMode) {
      // Mock 데이터 반환 (API 호출 없음)
      report = getMockSajuConsultationReport(sajuData, consultationType, language);
      return new Response(JSON.stringify({ success: true, report }), {
        status: 200,
        headers: corsHeaders
      });
    }

    const apiKey = env.OPENAI_API_KEY;
    const prompt = buildSajuConsultationPrompt({
      sajuData,
      consultationType,
      specificQuestion,
      currentSituation,
      language
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: getSajuConsultationSystemPrompt(consultationType, language)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API Error:', error);
      return new Response(JSON.stringify({
        error: language === 'ko' ? '상담 보고서 생성에 실패했습니다' : 'Failed to generate consultation report'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    const data = await response.json();
    const reportText = data.choices[0]?.message?.content;

    report = parseSajuConsultationReport(reportText);

    return new Response(JSON.stringify({ success: true, report }), {
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

function getSajuConsultationSystemPrompt(consultationType, language) {
  const typeDescriptions = {
    ko: {
      general: '종합 운세 상담',
      career: '직업/사업 상담',
      love: '연애/결혼 상담',
      wealth: '재물/투자 상담',
      health: '건강 상담'
    },
    en: {
      general: 'General Fortune Consultation',
      career: 'Career/Business Consultation',
      love: 'Love/Marriage Consultation',
      wealth: 'Wealth/Investment Consultation',
      health: 'Health Consultation'
    }
  };

  const prompts = {
    ko: `당신은 30년 경력의 사주명리학 대가입니다. "${typeDescriptions.ko[consultationType] || '종합 운세 상담'}"을 진행합니다.

상담자의 사주팔자를 심층 분석하여 전문적이고 구체적인 상담 보고서를 작성해주세요.
통찰력 있는 조언과 함께 실질적으로 도움이 되는 방향을 제시해주세요.

응답은 반드시 아래 JSON 형식으로 해주세요:
{
  "title": "상담 보고서 제목",
  "executiveSummary": "핵심 요약 (3-4문장)",
  "sajuAnalysis": {
    "dayMasterAnalysis": "일간(日干) 분석 - 본인의 핵심 기질과 성향",
    "fiveElementsBalance": "오행 균형 분석 및 보완점",
    "tenGodsAnalysis": "십신(十神) 분석 - 주요 기운과 영향",
    "majorPatterns": ["특이 격국이나 패턴 분석"]
  },
  "mainConsultation": {
    "currentPhase": "현재 대운/세운 분석",
    "coreAdvice": "핵심 조언 (구체적으로 3-4문장)",
    "opportunities": ["기회가 되는 시기와 분야 3가지"],
    "challenges": ["주의해야 할 점 3가지"],
    "actionItems": ["구체적인 실천 사항 3-5가지"]
  },
  "timing": {
    "luckyMonths": ["좋은 달과 이유"],
    "cautionMonths": ["주의할 달과 이유"],
    "importantDates": ["중요한 시기 예측"]
  },
  "relationships": {
    "compatibleElements": "잘 맞는 오행/띠",
    "beneficialPeople": "귀인이 될 사람의 특성",
    "avoidTypes": "조심해야 할 유형"
  },
  "fengShui": {
    "luckyDirection": "길방위",
    "luckyColors": ["행운의 색상들"],
    "luckyNumbers": ["행운의 숫자들"],
    "enhancingElements": "보완하면 좋은 오행 아이템"
  },
  "yearlyOutlook": {
    "year2025": "2025년 전망",
    "year2026": "2026년 전망",
    "fiveYearTrend": "향후 5년 흐름"
  },
  "specialMessage": "상담자에게 전하는 특별한 메시지"
}`,

    en: `You are a master of Korean Saju (Four Pillars) with 30 years of experience. You are conducting a "${typeDescriptions.en[consultationType] || 'General Fortune Consultation'}".

Provide a professional and detailed consultation report based on deep analysis of the client's Four Pillars.
Give insightful advice with practical guidance.

Response MUST be in this exact JSON format:
{
  "title": "Consultation Report Title",
  "executiveSummary": "Executive summary (3-4 sentences)",
  "sajuAnalysis": {
    "dayMasterAnalysis": "Day Master analysis - core temperament and tendencies",
    "fiveElementsBalance": "Five Elements balance analysis and areas to strengthen",
    "tenGodsAnalysis": "Ten Gods analysis - major energies and influences",
    "majorPatterns": ["Special formations or pattern analysis"]
  },
  "mainConsultation": {
    "currentPhase": "Current Major/Annual luck cycle analysis",
    "coreAdvice": "Core advice (specific, 3-4 sentences)",
    "opportunities": ["3 opportune times and areas"],
    "challenges": ["3 points of caution"],
    "actionItems": ["3-5 specific action items"]
  },
  "timing": {
    "luckyMonths": ["Favorable months and reasons"],
    "cautionMonths": ["Months requiring caution and reasons"],
    "importantDates": ["Important timing predictions"]
  },
  "relationships": {
    "compatibleElements": "Compatible elements/zodiac signs",
    "beneficialPeople": "Characteristics of helpful people",
    "avoidTypes": "Types to be cautious with"
  },
  "fengShui": {
    "luckyDirection": "Auspicious direction",
    "luckyColors": ["Lucky colors"],
    "luckyNumbers": ["Lucky numbers"],
    "enhancingElements": "Elements to enhance"
  },
  "yearlyOutlook": {
    "year2025": "2025 outlook",
    "year2026": "2026 outlook",
    "fiveYearTrend": "Five-year trend"
  },
  "specialMessage": "Special message for the client"
}`
  };

  return prompts[language] || prompts.ko;
}

function buildSajuConsultationPrompt({ sajuData, consultationType, specificQuestion, currentSituation, language }) {
  const {
    birthDate = {},
    birthTime = '',
    gender = 'unknown',
    dayMaster = {},
    fourPillars = {},
    elementBalance = {},
    tenGods = {}
  } = sajuData || {};

  const safe = (obj, ...keys) => {
    let val = obj;
    for (const key of keys) {
      val = val?.[key];
      if (val === undefined) return '?';
    }
    return val;
  };

  const formatPillar = (pillar, name) => {
    if (!pillar) return `- ${name}: 정보 없음`;
    return `- ${name}: ${safe(pillar, 'stem')}${safe(pillar, 'branch')} (${safe(pillar, 'korean') || ''}) [${safe(pillar, 'element') || ''}]`;
  };

  const isKo = language === 'ko';

  const consultationTypeNames = {
    ko: {
      general: '종합 운세',
      career: '직업/사업운',
      love: '연애/결혼운',
      wealth: '재물/투자운',
      health: '건강운'
    },
    en: {
      general: 'General Fortune',
      career: 'Career/Business',
      love: 'Love/Marriage',
      wealth: 'Wealth/Investment',
      health: 'Health'
    }
  };

  return `
=== ${isKo ? '상담 요청 정보' : 'Consultation Request'} ===
${isKo ? '상담 유형' : 'Consultation Type'}: ${consultationTypeNames[language]?.[consultationType] || consultationType}

=== ${isKo ? '생년월일시' : 'Birth Information'} ===
- ${isKo ? '생년월일' : 'Birth Date'}: ${safe(birthDate, 'year')}년 ${safe(birthDate, 'month')}월 ${safe(birthDate, 'day')}일
- ${isKo ? '태어난 시간' : 'Birth Time'}: ${birthTime || (isKo ? '미상' : 'Unknown')}
- ${isKo ? '성별' : 'Gender'}: ${gender === 'male' ? (isKo ? '남성' : 'Male') : gender === 'female' ? (isKo ? '여성' : 'Female') : (isKo ? '미상' : 'Unknown')}

=== ${isKo ? '사주팔자 (四柱八字)' : 'Four Pillars'} ===
${formatPillar(fourPillars.year, isKo ? '년주 (年柱)' : 'Year Pillar')}
${formatPillar(fourPillars.month, isKo ? '월주 (月柱)' : 'Month Pillar')}
${formatPillar(fourPillars.day, isKo ? '일주 (日柱)' : 'Day Pillar')}
${formatPillar(fourPillars.hour, isKo ? '시주 (時柱)' : 'Hour Pillar')}

=== ${isKo ? '일간 (日干) 분석' : 'Day Master'} ===
- ${isKo ? '일간' : 'Day Master'}: ${safe(dayMaster, 'stem')} (${safe(dayMaster, 'korean') || ''})
- ${isKo ? '오행' : 'Element'}: ${safe(dayMaster, 'element')}
- ${isKo ? '음양' : 'Yin/Yang'}: ${dayMaster?.yin ? (isKo ? '음(陰)' : 'Yin') : (isKo ? '양(陽)' : 'Yang')}

=== ${isKo ? '오행 분포' : 'Five Elements Distribution'} ===
- ${isKo ? '목(木) 나무' : 'Wood'}: ${safe(elementBalance, 'wood') || 0}
- ${isKo ? '화(火) 불' : 'Fire'}: ${safe(elementBalance, 'fire') || 0}
- ${isKo ? '토(土) 흙' : 'Earth'}: ${safe(elementBalance, 'earth') || 0}
- ${isKo ? '금(金) 쇠' : 'Metal'}: ${safe(elementBalance, 'metal') || 0}
- ${isKo ? '수(水) 물' : 'Water'}: ${safe(elementBalance, 'water') || 0}

${tenGods && Object.keys(tenGods).length > 0 ? `
=== ${isKo ? '십신 (十神)' : 'Ten Gods'} ===
${Object.entries(tenGods).map(([key, val]) => `- ${key}: ${val}`).join('\n')}
` : ''}

${currentSituation ? `
=== ${isKo ? '현재 상황' : 'Current Situation'} ===
${currentSituation}
` : ''}

${specificQuestion ? `
=== ${isKo ? '구체적인 질문' : 'Specific Question'} ===
${specificQuestion}
` : ''}

${isKo ? '위 사주를 심층 분석하여 상세한 상담 보고서를 작성해주세요.' : 'Please provide a detailed consultation report based on the above Four Pillars analysis.'}`;
}

function parseSajuConsultationReport(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse saju consultation report:', e);
  }

  return {
    title: "사주 상담 보고서",
    executiveSummary: text.substring(0, 400),
    sajuAnalysis: {
      dayMasterAnalysis: "분석 중 오류가 발생했습니다.",
      fiveElementsBalance: "분석 중 오류가 발생했습니다.",
      tenGodsAnalysis: "분석 중 오류가 발생했습니다.",
      majorPatterns: []
    },
    mainConsultation: {
      currentPhase: "분석 중 오류가 발생했습니다.",
      coreAdvice: "다시 시도해주세요.",
      opportunities: [],
      challenges: [],
      actionItems: []
    },
    timing: {
      luckyMonths: [],
      cautionMonths: [],
      importantDates: []
    },
    relationships: {
      compatibleElements: "분석 중 오류가 발생했습니다.",
      beneficialPeople: "분석 중 오류가 발생했습니다.",
      avoidTypes: "분석 중 오류가 발생했습니다."
    },
    fengShui: {
      luckyDirection: "동쪽",
      luckyColors: ["파란색"],
      luckyNumbers: ["3", "8"],
      enhancingElements: "수(水) 기운 보완"
    },
    yearlyOutlook: {
      year2025: "분석 중 오류가 발생했습니다.",
      year2026: "분석 중 오류가 발생했습니다.",
      fiveYearTrend: "분석 중 오류가 발생했습니다."
    },
    specialMessage: "상담 보고서 생성에 실패했습니다. 다시 시도해주세요."
  };
}

// Mock 데이터 생성 함수 (결제 연동 전까지 사용)
function getMockSajuConsultationReport(sajuData, consultationType, language) {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  const consultationTitles = {
    ko: {
      general: '종합 운세 상담 보고서',
      career: '직업/사업 운세 상담 보고서',
      love: '연애/결혼 운세 상담 보고서',
      wealth: '재물/투자 운세 상담 보고서',
      health: '건강 운세 상담 보고서'
    },
    en: {
      general: 'Comprehensive Fortune Consultation Report',
      career: 'Career/Business Fortune Report',
      love: 'Love/Marriage Fortune Report',
      wealth: 'Wealth/Investment Fortune Report',
      health: 'Health Fortune Report'
    }
  };

  const mockData = {
    ko: {
      title: consultationTitles.ko[consultationType] || consultationTitles.ko.general,
      executiveSummary: `화(火) 기운이 강한 일간으로, 열정적이고 추진력 있는 성격의 소유자입니다. ${currentYear}년은 그동안 쌓아온 역량이 빛을 발하는 해로, 특히 상반기에 중요한 기회가 찾아올 것으로 보입니다. 전반적으로 긍정적인 흐름이지만, 급한 성격을 다스리고 신중하게 결정하면 더 큰 성과를 얻을 수 있습니다.`,
      sajuAnalysis: {
        dayMasterAnalysis: "일간 병화(丙火)는 태양과 같은 밝고 따뜻한 기운을 가집니다. 리더십이 뛰어나고 주변에 활력을 주는 성격으로, 새로운 일을 시작하는 데 두려움이 없습니다. 다만 지나친 열정이 때로는 성급함으로 이어질 수 있으니 주의가 필요합니다.",
        fiveElementsBalance: "화(火) 기운이 3개로 가장 강하고, 토(土)가 2개로 적당합니다. 수(水)와 금(金) 기운이 각 1개씩으로 다소 부족하여, 이를 보완하면 운의 균형이 더 좋아집니다. 파란색 계열의 옷이나 소품, 금속 액세서리 착용을 권장합니다.",
        tenGodsAnalysis: "편재(偏財)가 강하여 재물에 대한 감각이 뛰어나고 투자 기회를 잘 포착합니다. 식신(食神)의 기운도 있어 창의력과 표현력이 좋습니다. 정관(正官)이 약하므로 조직 내 안정보다는 자유로운 환경에서 더 빛을 발합니다.",
        majorPatterns: [
          "신강(身强) 사주 - 주체성이 강하고 독립적 성향",
          "식신생재(食神生財) 구조 - 재능으로 재물을 얻는 구조",
          "화토상생(火土相生) - 노력이 결실로 이어지는 흐름"
        ]
      },
      mainConsultation: {
        currentPhase: `${currentYear}년은 을사(乙巳)년으로, 본인의 화(火) 기운과 조화를 이루는 해입니다. 특히 상반기 (음력 2-4월)에 좋은 기운이 집중되어 있으니, 이 시기에 중요한 결정이나 시작을 하면 좋습니다.`,
        coreAdvice: "급할수록 돌아가라는 말을 명심하세요. 본인의 장점인 추진력을 살리되, 중요한 결정 전에는 반드시 하루 정도 숙고하는 시간을 가지세요. 주변의 조언을 경청하되 최종 결정은 본인의 직관을 믿으세요. 올해는 협력이 키워드입니다.",
        opportunities: [
          "3월: 새로운 프로젝트나 이직 기회가 찾아옵니다",
          "6월: 인맥을 통한 좋은 소식이 있습니다",
          "9월: 재물운이 상승하는 시기로 투자 검토에 좋습니다"
        ],
        challenges: [
          "5월: 건강 관리에 신경 쓰세요, 과로 주의",
          "8월: 대인관계에서 오해가 생길 수 있으니 소통에 주의",
          "11월: 급한 결정은 피하고 신중하게 판단하세요"
        ],
        actionItems: [
          "매일 아침 10분 명상으로 마음의 여유 찾기",
          "월 1회 이상 새로운 사람과 만남의 기회 만들기",
          "분기별 재무 상태 점검 및 저축 목표 설정",
          "주 3회 이상 규칙적인 운동으로 건강 관리",
          "중요한 결정 전 최소 24시간 숙고 시간 갖기"
        ]
      },
      timing: {
        luckyMonths: [
          "음력 2월 (양력 3월): 새로운 시작에 최적, 면접/계약에 좋음",
          "음력 5월 (양력 6월): 인연운 상승, 좋은 사람을 만날 기회",
          "음력 8월 (양력 9월): 재물운 최고조, 투자/사업 확장에 적합"
        ],
        cautionMonths: [
          "음력 4월 (양력 5월): 건강 주의, 무리한 일정 피하기",
          "음력 10월 (양력 11월): 급한 결정 금물, 서류 꼼꼼히 확인"
        ],
        importantDates: [
          `${currentYear}년 3월 중순: 중요한 기회의 시작점`,
          `${currentYear}년 6월 초: 인생의 귀인을 만날 수 있는 시기`,
          `${currentYear}년 9월 말: 재물과 관련된 좋은 소식`
        ]
      },
      relationships: {
        compatibleElements: "수(水) 기운의 사람 (임, 계 일간) - 본인의 화 기운을 적절히 조절해주어 균형을 맞춰줍니다. 목(木) 기운의 사람 (갑, 을 일간) - 서로 상생하여 좋은 시너지를 냅니다.",
        beneficialPeople: "차분하고 신중한 성격의 사람이 귀인이 됩니다. 특히 수(水) 관련 직종(음료, 유통, IT)에 종사하는 사람과의 인연이 좋습니다. 나이가 5-10세 많은 선배나 멘토의 조언을 귀담아 들으세요.",
        avoidTypes: "같은 화(火) 기운이 강한 사람과는 충돌할 수 있습니다. 지나치게 급하거나 감정적인 사람과의 동업이나 깊은 관계는 신중히 고려하세요."
      },
      fengShui: {
        luckyDirection: "북쪽 (水 기운) - 사무실이나 책상을 북쪽을 향하게 배치하면 집중력 향상",
        luckyColors: ["파란색 - 수 기운으로 화를 조절", "검정색 - 안정감 부여", "흰색/은색 - 금 기운 보완"],
        luckyNumbers: ["1", "6 (수의 숫자)", "4", "9 (금의 숫자)"],
        enhancingElements: "책상 위에 작은 수반이나 수정 장식을 두면 좋습니다. 금속 재질의 펜이나 시계 착용을 권장합니다. 파란색 계열의 지갑이나 핸드폰 케이스 사용이 재물운에 도움됩니다."
      },
      yearlyOutlook: {
        year2025: `${currentYear}년 을사(乙巳)년은 전반적으로 상승 기운입니다. 상반기에 좋은 기회가 집중되어 있고, 하반기는 상반기의 성과를 다지는 시기입니다. 특히 직업/사업 운이 좋아 새로운 도전에 유리합니다.`,
        year2026: `${nextYear}년 병오(丙午)년은 화 기운이 더욱 강해지는 해입니다. 에너지가 넘치지만 과유불급을 명심하세요. 건강 관리와 휴식의 균형이 중요하며, 하반기에 좋은 소식이 있을 것입니다.`,
        fiveYearTrend: `향후 5년간 전반적으로 상승세입니다. ${currentYear}-${currentYear+1}년에 기반을 다지고, ${currentYear+2}-${currentYear+3}년에 크게 도약하며, ${currentYear+4}년에 안정기에 접어듭니다. 꾸준한 노력이 뒷받침된다면 원하는 목표를 이룰 수 있는 좋은 시기입니다.`
      },
      specialMessage: "당신은 태양처럼 밝은 에너지를 가진 분입니다. 그 빛으로 주변을 밝히되, 때로는 달빛처럼 부드러운 면도 보여주세요. 올해는 특히 '함께'라는 단어를 기억하세요. 혼자 달리기보다 함께 걸으면 더 멀리 갈 수 있습니다. 당신의 앞날에 행운이 함께하길 바랍니다."
    },
    en: {
      title: consultationTitles.en[consultationType] || consultationTitles.en.general,
      executiveSummary: `With strong Fire energy in your day master, you possess a passionate and driven personality. ${currentYear} is a year where your accumulated efforts will shine, with significant opportunities especially in the first half. While the overall flow is positive, practicing patience and making deliberate decisions will yield even greater results.`,
      sajuAnalysis: {
        dayMasterAnalysis: "Your Day Master represents bright, warm energy like the sun. You have excellent leadership qualities and energize those around you. However, excessive passion can sometimes lead to hastiness, requiring mindful awareness.",
        fiveElementsBalance: "Fire element is strongest with 3 counts, Earth is moderate with 2. Water and Metal elements are somewhat lacking with 1 each. Balancing these through blue clothing/accessories and metal items is recommended.",
        tenGodsAnalysis: "Strong Indirect Wealth indicates excellent financial intuition and investment opportunities. Food God energy brings creativity and expressiveness. Weak Direct Officer suggests you thrive in flexible environments rather than rigid organizational structures.",
        majorPatterns: [
          "Strong Self structure - independent and self-directed nature",
          "Food God generates Wealth - talents lead to prosperity",
          "Fire-Earth mutual generation - efforts bear fruit"
        ]
      },
      mainConsultation: {
        currentPhase: `${currentYear} harmonizes well with your Fire energy. Positive energy concentrates in the first half (lunar months 2-4), making it ideal for important decisions or new beginnings.`,
        coreAdvice: "Remember that haste makes waste. Leverage your strength of drive, but always take a day to reflect before major decisions. Listen to advice from others, but trust your intuition for final calls. Collaboration is your keyword this year.",
        opportunities: [
          "March: New project or career change opportunities arise",
          "June: Good news through your network connections",
          "September: Peak wealth luck - good time to review investments"
        ],
        challenges: [
          "May: Focus on health management, avoid overwork",
          "August: Potential misunderstandings in relationships - communicate carefully",
          "November: Avoid hasty decisions, judge matters carefully"
        ],
        actionItems: [
          "Practice 10-minute morning meditation for mental clarity",
          "Create networking opportunities at least monthly",
          "Review finances and set savings goals quarterly",
          "Exercise regularly (3+ times weekly) for health maintenance",
          "Take at least 24 hours before making important decisions"
        ]
      },
      timing: {
        luckyMonths: [
          "Lunar Feb (March): Optimal for new starts, good for interviews/contracts",
          "Lunar May (June): Rising relationship luck, meet beneficial people",
          "Lunar Aug (September): Peak wealth luck, suitable for investment/expansion"
        ],
        cautionMonths: [
          "Lunar Apr (May): Health caution, avoid overloaded schedules",
          "Lunar Oct (November): No hasty decisions, review documents carefully"
        ],
        importantDates: [
          `Mid-March ${currentYear}: Starting point for important opportunities`,
          `Early June ${currentYear}: Time to meet life's benefactors`,
          `Late September ${currentYear}: Good news related to wealth`
        ]
      },
      relationships: {
        compatibleElements: "Water element people (Ren, Gui day masters) - help balance your Fire energy. Wood element people (Jia, Yi day masters) - create positive synergy through mutual generation.",
        beneficialPeople: "Calm and deliberate personalities will be your benefactors. Connections with those in Water-related fields (beverages, distribution, IT) are favorable. Value advice from mentors 5-10 years senior.",
        avoidTypes: "May clash with others having strong Fire energy. Carefully consider partnerships or deep relationships with overly hasty or emotional individuals."
      },
      fengShui: {
        luckyDirection: "North (Water energy) - Position office/desk facing north for improved focus",
        luckyColors: ["Blue - Water energy to regulate Fire", "Black - provides stability", "White/Silver - supplements Metal energy"],
        luckyNumbers: ["1", "6 (Water numbers)", "4", "9 (Metal numbers)"],
        enhancingElements: "Place a small water feature or crystal decoration on your desk. Wearing metal pens or watches is recommended. Blue wallets or phone cases support wealth luck."
      },
      yearlyOutlook: {
        year2025: `${currentYear} brings overall ascending energy. Good opportunities concentrate in the first half, while the second half consolidates gains. Career/business luck is especially favorable for new ventures.`,
        year2026: `${nextYear} intensifies Fire energy further. While energy abounds, remember moderation. Balance health management with rest. Good news awaits in the latter half.`,
        fiveYearTrend: `The next 5 years show overall upward momentum. Build foundations in ${currentYear}-${currentYear+1}, make major leaps in ${currentYear+2}-${currentYear+3}, and enter stability in ${currentYear+4}. With consistent effort, this is an excellent period to achieve your goals.`
      },
      specialMessage: "You possess bright energy like the sun. Illuminate those around you, but also show gentleness like moonlight sometimes. This year, remember the word 'together.' Walking together takes you farther than running alone. May fortune accompany your path ahead."
    }
  };

  return mockData[language] || mockData.en;
}
