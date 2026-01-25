// Cloudflare Pages Function - Eye Health Consultation API
// 눈 건강 고민 상담 컨설팅 보고서 API

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
      symptoms = [],      // 증상들: ['dry_eye', 'eye_strain', 'blurry_vision', ...]
      duration = '',      // 증상 지속 기간
      lifestyle = {},     // 생활습관: screenTime, sleepHours, workType, ...
      age = '',           // 나이
      concerns = '',      // 추가 고민 사항 (자유 텍스트)
      language = 'ko'     // 언어
    } = body;

    if (!symptoms || symptoms.length === 0) {
      return new Response(JSON.stringify({
        error: language === 'ko' ? '증상을 선택해주세요' : 'Please select at least one symptom'
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
      report = getMockEyeReport(symptoms, language);
    } else {
      const apiKey = env.OPENAI_API_KEY;
      const prompt = buildEyeConsultationPrompt({ symptoms, duration, lifestyle, age, concerns, language });

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
              content: getEyeSystemPrompt(language)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2500
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI API Error:', error);
        return new Response(JSON.stringify({
          error: language === 'ko' ? '보고서 생성에 실패했습니다' : 'Failed to generate report'
        }), {
          status: 500,
          headers: corsHeaders
        });
      }

      const data = await response.json();
      const reportText = data.choices[0]?.message?.content;
      report = parseEyeReport(reportText);
    }

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

function getEyeSystemPrompt(language) {
  const jsonFormat = `{
  "summary": "...",
  "analysis": {
    "mainIssue": "...",
    "possibleCauses": ["...", "...", "..."],
    "riskLevel": "low/medium/high"
  },
  "recommendations": {
    "immediate": ["...", "...", "..."],
    "lifestyle": ["...", "...", "..."],
    "exercises": ["...", "..."]
  },
  "products": {
    "eyeDrops": "...",
    "supplements": "...",
    "accessories": "..."
  },
  "warnings": ["..."],
  "weeklyPlan": {
    "day1_3": "...",
    "day4_7": "...",
    "ongoing": "..."
  },
  "doctorVisit": {
    "needed": true/false,
    "urgency": "routine/soon/urgent",
    "reason": "..."
  }
}`;

  const prompts = {
    ko: `당신은 20년 경력의 안과 전문의 수준의 AI 상담사입니다. 사용자의 눈 건강 고민을 분석하고 맞춤형 컨설팅 보고서를 제공합니다.

가이드라인:
- 증상을 구체적으로 분석하고 가능한 원인을 명확히 설명
- 실천 가능한 구체적인 조언 제공
- 심각한 증상은 반드시 안과 전문의 진료 권장
- 한국에서 구매 가능한 제품 추천

응답은 반드시 유효한 JSON 형식으로:
${jsonFormat}

각 필드 설명:
- summary: 전체 상담 요약 (2-3문장, 따뜻한 톤)
- analysis.mainIssue: 주요 문제점 분석
- analysis.possibleCauses: 가능한 원인 3가지
- analysis.riskLevel: 위험도 (low/medium/high)
- recommendations.immediate: 즉시 실천할 조언 3가지
- recommendations.lifestyle: 생활습관 개선 3가지
- recommendations.exercises: 눈 운동 2-3가지 (구체적 방법)
- products.eyeDrops: 추천 인공눈물 타입 (히알루론산, 방부제 무첨가 등)
- products.supplements: 추천 영양제 (루테인, 오메가3 등)
- products.accessories: 추천 보조용품 (블루라이트 안경 등)
- warnings: 주의사항 및 병원 방문 필요 시점
- weeklyPlan: 주간 실천 계획
- doctorVisit: 병원 방문 권장 여부와 긴급도`,

    en: `You are an AI eye health consultant with expertise equivalent to 20 years of ophthalmology experience. Analyze user's eye health concerns and provide personalized consulting reports.

Guidelines:
- Analyze symptoms specifically and explain possible causes clearly
- Provide actionable, concrete advice
- Always recommend ophthalmologist for serious symptoms
- Recommend products available internationally

Response MUST be valid JSON:
${jsonFormat}

Field descriptions:
- summary: Overall consultation summary (2-3 sentences, warm tone)
- analysis.mainIssue: Main issue analysis
- analysis.possibleCauses: 3 possible causes
- analysis.riskLevel: Risk level (low/medium/high)
- recommendations.immediate: 3 immediate actionable tips
- recommendations.lifestyle: 3 lifestyle improvements
- recommendations.exercises: 2-3 eye exercises (specific methods)
- products.eyeDrops: Recommended artificial tears type
- products.supplements: Recommended supplements (lutein, omega-3, etc.)
- products.accessories: Recommended accessories
- warnings: Cautions and when to visit doctor
- weeklyPlan: Weekly action plan
- doctorVisit: Doctor visit recommendation with urgency`,

    ja: `あなたは20年の経験を持つ眼科専門AIコンサルタントです。ユーザーの目の健康に関する悩みを分析し、カスタマイズされたコンサルティングレポートを提供します。

ガイドライン：
- 症状を具体的に分析し、考えられる原因を明確に説明
- 実践可能な具体的なアドバイスを提供
- 深刻な症状には必ず眼科専門医の受診を推奨
- 日本で購入可能な製品を推奨

回答は必ず有効なJSON形式で：
${jsonFormat}

各フィールドの説明：
- summary: 相談全体の要約（2-3文、温かいトーン）
- analysis.mainIssue: 主な問題の分析
- analysis.possibleCauses: 考えられる原因3つ
- analysis.riskLevel: リスクレベル（low/medium/high）
- recommendations.immediate: すぐに実践できる3つのアドバイス
- recommendations.lifestyle: 生活習慣の改善3つ
- recommendations.exercises: 目の運動2-3つ（具体的な方法）
- products: 推奨製品（目薬、サプリ、アクセサリー）
- warnings: 注意事項と病院受診が必要な場合
- weeklyPlan: 週間実践計画
- doctorVisit: 病院受診の推奨と緊急度`,

    zh: `您是一位拥有20年眼科经验的AI健康顾问。分析用户的眼睛健康问题，提供个性化的咨询报告。

指南：
- 具体分析症状并清楚解释可能的原因
- 提供可执行的具体建议
- 严重症状务必建议就医
- 推荐可购买的产品

回复必须是有效的JSON格式：
${jsonFormat}

字段说明：
- summary: 咨询总结（2-3句，温暖的语气）
- analysis.mainIssue: 主要问题分析
- analysis.possibleCauses: 3个可能的原因
- analysis.riskLevel: 风险等级（low/medium/high）
- recommendations.immediate: 3个立即可行的建议
- recommendations.lifestyle: 3个生活习惯改善
- recommendations.exercises: 2-3个眼部运动（具体方法）
- products: 推荐产品（眼药水、营养品、配件）
- warnings: 注意事项及何时就医
- weeklyPlan: 周计划
- doctorVisit: 就医建议及紧急程度`
  };

  return prompts[language] || prompts.en;
}

function buildEyeConsultationPrompt({ symptoms, duration, lifestyle, age, concerns, language }) {
  const symptomNames = {
    ko: {
      dry_eye: '안구건조증',
      eye_strain: '눈 피로/통증',
      blurry_vision: '시야 흐림',
      red_eye: '충혈',
      itchy_eye: '눈 가려움',
      floaters: '비문증 (날파리증)',
      light_sensitivity: '빛 민감성',
      headache: '눈 관련 두통',
      double_vision: '복시',
      twitching: '눈꺼풀 떨림'
    },
    en: {
      dry_eye: 'Dry Eyes',
      eye_strain: 'Eye Strain/Pain',
      blurry_vision: 'Blurry Vision',
      red_eye: 'Red Eyes',
      itchy_eye: 'Itchy Eyes',
      floaters: 'Floaters',
      light_sensitivity: 'Light Sensitivity',
      headache: 'Eye-related Headaches',
      double_vision: 'Double Vision',
      twitching: 'Eyelid Twitching'
    },
    ja: {
      dry_eye: 'ドライアイ',
      eye_strain: '眼精疲労',
      blurry_vision: '視界のぼやけ',
      red_eye: '充血',
      itchy_eye: '目のかゆみ',
      floaters: '飛蚊症',
      light_sensitivity: '光過敏',
      headache: '目の疲れからくる頭痛',
      double_vision: '複視',
      twitching: 'まぶたの痙攣'
    },
    zh: {
      dry_eye: '干眼症',
      eye_strain: '眼疲劳',
      blurry_vision: '视力模糊',
      red_eye: '眼睛充血',
      itchy_eye: '眼睛痒',
      floaters: '飞蚊症',
      light_sensitivity: '畏光',
      headache: '眼源性头痛',
      double_vision: '复视',
      twitching: '眼皮跳动'
    }
  };

  const names = symptomNames[language] || symptomNames.ko;
  const symptomList = symptoms.map(s => names[s] || s).join(', ');

  const isKo = language === 'ko';

  return `
${isKo ? '환자 정보' : 'Patient Information'}:
- ${isKo ? '나이' : 'Age'}: ${age || (isKo ? '미제공' : 'Not provided')}
- ${isKo ? '증상' : 'Symptoms'}: ${symptomList}
- ${isKo ? '증상 지속 기간' : 'Duration'}: ${duration || (isKo ? '미제공' : 'Not provided')}

${isKo ? '생활습관' : 'Lifestyle'}:
- ${isKo ? '일일 스크린 사용 시간' : 'Daily screen time'}: ${lifestyle.screenTime || (isKo ? '미제공' : 'Not provided')}
- ${isKo ? '수면 시간' : 'Sleep hours'}: ${lifestyle.sleepHours || (isKo ? '미제공' : 'Not provided')}
- ${isKo ? '직업/작업 환경' : 'Work environment'}: ${lifestyle.workType || (isKo ? '미제공' : 'Not provided')}
- ${isKo ? '콘택트렌즈 착용' : 'Contact lens use'}: ${lifestyle.contactLens ? (isKo ? '예' : 'Yes') : (isKo ? '아니오' : 'No')}
- ${isKo ? '흡연 여부' : 'Smoking'}: ${lifestyle.smoking ? (isKo ? '예' : 'Yes') : (isKo ? '아니오' : 'No')}

${isKo ? '추가 고민 사항' : 'Additional concerns'}:
${concerns || (isKo ? '없음' : 'None')}

${isKo ? '위 정보를 바탕으로 눈 건강 컨설팅 보고서를 작성해주세요.' : 'Please provide an eye health consultation report based on the above information.'}`;
}

function parseEyeReport(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse eye report:', e);
  }

  return {
    summary: text.substring(0, 300),
    analysis: {
      mainIssue: "분석을 완료할 수 없습니다.",
      possibleCauses: [],
      riskLevel: "medium"
    },
    recommendations: {
      immediate: ["휴식을 취하세요", "인공눈물을 사용하세요"],
      lifestyle: ["스크린 사용 시간을 줄이세요"],
      exercises: ["눈 깜빡이기 운동"]
    },
    products: {
      eyeDrops: "방부제 없는 인공눈물",
      supplements: "루테인",
      accessories: "블루라이트 차단 안경"
    },
    warnings: ["증상이 지속되면 안과 진료를 받으세요"],
    weeklyPlan: {
      day1_3: "인공눈물 사용 시작",
      day4_7: "눈 운동 루틴 정착",
      ongoing: "정기적인 휴식"
    },
    doctorVisit: {
      needed: true,
      urgency: "routine",
      reason: "정확한 진단을 위해"
    }
  };
}

// Mock 데이터 생성 함수 (결제 연동 전까지 사용)
function getMockEyeReport(symptoms, language) {
  const isKo = language === 'ko';
  const isJa = language === 'ja';
  const isZh = language === 'zh';

  const mockData = {
    ko: {
      summary: "제출해주신 증상을 분석한 결과, 디지털 기기 사용으로 인한 눈 피로와 안구건조 증상이 주요 원인으로 보입니다. 적절한 휴식과 생활습관 개선으로 충분히 관리 가능한 상태입니다.",
      analysis: {
        mainIssue: "장시간 스크린 사용으로 인한 디지털 눈 피로 증후군 (Computer Vision Syndrome)",
        possibleCauses: [
          "하루 8시간 이상의 디지털 기기 사용",
          "불충분한 눈 깜빡임 (정상의 60% 수준으로 감소)",
          "부적절한 조명 환경 및 화면과의 거리"
        ],
        riskLevel: "medium"
      },
      recommendations: {
        immediate: [
          "20-20-20 규칙 실천: 20분마다 20피트(6m) 거리를 20초간 바라보기",
          "인공눈물 점안: 방부제 없는 제품으로 2-3시간마다 사용",
          "화면 밝기를 주변 환경과 맞추고, 블루라이트 필터 활성화"
        ],
        lifestyle: [
          "수면 시간 확보: 최소 7시간 이상의 양질의 수면",
          "물 섭취량 증가: 하루 2L 이상으로 체내 수분 유지",
          "실내 습도 40-60% 유지 (가습기 활용)"
        ],
        exercises: [
          "눈 깜빡이기 운동: 의식적으로 10초에 1회 깜빡이기 연습",
          "팔밍(Palming): 손바닥으로 눈을 가리고 1분간 휴식",
          "원근 조절 운동: 가까운 물체와 먼 물체를 번갈아 5초씩 응시"
        ]
      },
      products: {
        eyeDrops: "히알루론산 성분의 방부제 무첨가 인공눈물 (리프레쉬, 시스테인 등)",
        supplements: "루테인 20mg + 지아잔틴 4mg 복합제, 오메가3 (EPA+DHA 1000mg 이상)",
        accessories: "블루라이트 차단 안경 (차단율 40% 이상), 모니터 높이 조절 스탠드"
      },
      warnings: [
        "시야에 번쩍이는 빛이 보이거나 급격한 시력 저하 시 즉시 안과 방문",
        "눈 통증이 심하거나 충혈이 3일 이상 지속되면 전문의 상담 필요",
        "콘택트렌즈 착용자는 착용 시간을 8시간 이내로 제한"
      ],
      weeklyPlan: {
        day1_3: "인공눈물 사용 시작, 20-20-20 규칙 알람 설정, 취침 1시간 전 스크린 사용 중단",
        day4_7: "눈 운동 루틴 정착 (아침/점심/저녁 각 5분), 업무 환경 개선 (모니터 위치, 조명)",
        ongoing: "주 1회 눈 상태 체크, 월 1회 인공눈물 사용량 점검, 6개월마다 정기 안과 검진"
      },
      doctorVisit: {
        needed: true,
        urgency: "routine",
        reason: "현재 증상은 자가 관리로 개선 가능하나, 정확한 안구건조증 정도 측정 및 기저 질환 확인을 위해 3개월 내 안과 검진을 권장합니다."
      }
    },
    en: {
      summary: "Based on your symptoms, digital eye strain and dry eye syndrome appear to be the main causes. These conditions are manageable with proper rest and lifestyle adjustments.",
      analysis: {
        mainIssue: "Digital Eye Strain / Computer Vision Syndrome from prolonged screen use",
        possibleCauses: [
          "Extended digital device usage (8+ hours daily)",
          "Reduced blink rate (down to 60% of normal)",
          "Poor lighting conditions and improper screen distance"
        ],
        riskLevel: "medium"
      },
      recommendations: {
        immediate: [
          "Follow the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds",
          "Use preservative-free artificial tears every 2-3 hours",
          "Adjust screen brightness to match surroundings, enable blue light filter"
        ],
        lifestyle: [
          "Ensure 7+ hours of quality sleep",
          "Increase water intake to 2L+ daily",
          "Maintain indoor humidity at 40-60%"
        ],
        exercises: [
          "Conscious blinking: Practice blinking once every 10 seconds",
          "Palming: Cover eyes with palms and rest for 1 minute",
          "Focus shifting: Alternate between near and far objects for 5 seconds each"
        ]
      },
      products: {
        eyeDrops: "Preservative-free artificial tears with hyaluronic acid (Refresh, Systane)",
        supplements: "Lutein 20mg + Zeaxanthin 4mg complex, Omega-3 (EPA+DHA 1000mg+)",
        accessories: "Blue light blocking glasses (40%+ blocking), Monitor height adjustment stand"
      },
      warnings: [
        "Seek immediate care if you see flashing lights or experience sudden vision loss",
        "Consult a doctor if eye pain is severe or redness persists for 3+ days",
        "Contact lens wearers should limit wear time to 8 hours"
      ],
      weeklyPlan: {
        day1_3: "Start artificial tears, set 20-20-20 rule reminders, stop screen use 1 hour before bed",
        day4_7: "Establish eye exercise routine (5 min morning/noon/evening), improve workspace ergonomics",
        ongoing: "Weekly eye health check, monthly review of eye drop usage, eye exam every 6 months"
      },
      doctorVisit: {
        needed: true,
        urgency: "routine",
        reason: "While symptoms are manageable with self-care, an eye exam within 3 months is recommended to measure dry eye severity and rule out underlying conditions."
      }
    }
  };

  // 일본어, 중국어는 영어 데이터 사용 (간략화)
  return mockData[language] || mockData.en;
}
