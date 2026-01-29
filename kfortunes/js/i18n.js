// KStar Match Internationalization (i18n) System
// 다국어 지원 시스템

const i18n = {
  currentLang: 'en',

  languages: {
    en: { name: 'English', flag: '🇺🇸' },
    ko: { name: '한국어', flag: '🇰🇷' },
    ja: { name: '日本語', flag: '🇯🇵' },
    zh: { name: '中文', flag: '🇨🇳' },
    vi: { name: 'Tiếng Việt', flag: '🇻🇳' }
  },

  translations: {
    // ============================================
    // ENGLISH
    // ============================================
    en: {
      // Header & Navigation
      nav_fortune: 'Personality',
      nav_compatibility: 'Compatibility',
      nav_about: 'About',

      // Hero Section
      hero_badge: '✨ Free Personality Analysis · Find Your K-Star Match!',
      hero_title: 'KStar Match',
      hero_tagline: 'Which K-Star Matches Your Personality?',
      hero_subtitle: 'Check if you share similar personality traits with your favorite K-Pop idols & K-Drama stars! BTS, BLACKPINK, IU, Park Seo-joon... Who\'s your Personality Twin?',

      // Form
      form_title: 'Enter Your Birth Information',
      form_year: 'Year',
      form_month: 'Month',
      form_day: 'Day',
      form_hour: 'Birth Hour (Optional)',
      form_hour_unknown: "I don't know",
      form_hour_hint: 'Knowing your birth hour gives more accurate results',
      form_gender: 'Gender',
      form_male: 'Male',
      form_female: 'Female',
      form_submit: '⭐ Discover My K-Star Match',
      form_analyzing: 'Analyzing...',

      // Features
      feature_personality: 'Personality Analysis',
      feature_personality_desc: 'Discover your true nature based on your birth profile',
      feature_career: 'Career & Wealth',
      feature_career_desc: 'Find your path to success and prosperity',
      feature_love: 'Love & Relationships',
      feature_love_desc: 'Explore relationship compatibility insights',

      // Result Page
      result_title: 'Your Cosmic Profile',
      result_birth_date: 'Birth Date',
      result_day_master: 'Day Master',
      result_four_pillars: 'Four Pillars (四柱)',
      result_year_pillar: 'Year',
      result_month_pillar: 'Month',
      result_day_pillar: 'Day',
      result_hour_pillar: 'Hour',
      result_elements: 'Five Elements Balance',
      result_celebrity: 'Celebrity Personality Match',
      result_celebrity_desc: 'You share similar personality traits with:',
      result_personality: 'Personality',
      result_career: 'Career Paths',
      result_love: 'Love & Relationships',
      result_strength: 'Your Strength',
      result_weakness: 'Growth Area',
      result_lucky: 'Lucky Elements',
      result_share: '📤 Share Result',
      result_compatibility: '💕 Check Compatibility',
      result_new: '⭐ New Analysis',

      // Loading
      loading_text: 'Analyzing your personality patterns...',
      loading_subtext: 'Building your personality profile',

      // Compatibility
      compat_badge: '💕 Compatibility Test',
      compat_title: 'Check Your Compatibility',
      compat_subtitle: 'Discover your compatibility based on Korean traditions. Enter both birth dates to reveal your personality match.',
      compat_person1: '👤 Person 1',
      compat_person2: '👤 Person 2',
      compat_submit: '💕 Calculate Compatibility',
      compat_clear: '🔄 Clear Form',
      compat_result: '💕 Your Compatibility',
      compat_strengths: '💪 Strengths',
      compat_challenges: '🌱 Challenges',
      compat_share: '📤 Share Result',
      compat_yinyang: 'Yin-Yang Balance',
      compat_yinyang_desc: 'Complementary energies create harmony and attraction',
      compat_elements: 'Five Elements',
      compat_elements_desc: 'Element interactions reveal relationship dynamics',
      compat_zodiac: 'Zodiac Harmony',
      compat_zodiac_desc: 'Chinese zodiac compatibility adds another layer',

      // Share Modal
      share_title: '📤 Share Your Compatibility',
      share_desc: 'Share your love compatibility result!',

      // About Page
      about_badge: '📚 About Four Pillars',
      about_title: 'The Art of KStar Match',
      about_subtitle: "Discover the wisdom of Four Pillars (四柱), Korea's traditional system of personality analysis.",
      about_cta_fortune: '⭐ Get Your Free Analysis',
      about_cta_compat: '💕 Check Compatibility',

      // Footer
      footer_copyright: '© 2026 KStar Match. All rights reserved.',
      footer_disclaimer: 'This is for entertainment purposes only. Not a substitute for professional advice.',
      footer_privacy: 'Privacy Policy',
      footer_terms: 'Terms of Service',
      footer_contact: 'Contact',
      footer_faq: 'FAQ',

      // Months
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

      // Zodiac Hours
      zodiac_hours: [
        '23:00 - 01:00 (Rat 子)',
        '01:00 - 03:00 (Ox 丑)',
        '03:00 - 05:00 (Tiger 寅)',
        '05:00 - 07:00 (Rabbit 卯)',
        '07:00 - 09:00 (Dragon 辰)',
        '09:00 - 11:00 (Snake 巳)',
        '11:00 - 13:00 (Horse 午)',
        '13:00 - 15:00 (Sheep 未)',
        '15:00 - 17:00 (Monkey 申)',
        '17:00 - 19:00 (Rooster 酉)',
        '19:00 - 21:00 (Dog 戌)',
        '21:00 - 23:00 (Pig 亥)'
      ]
    },

    // ============================================
    // KOREAN (한국어)
    // ============================================
    ko: {
      // Header & Navigation
      nav_fortune: '성격분석',
      nav_compatibility: '궁합',
      nav_about: '소개',

      // Hero Section
      hero_badge: '✨ 무료 성격 분석 · 나의 K-Star 매칭!',
      hero_title: 'KStar Match',
      hero_tagline: '나와 닮은 K-Star는 누구일까?',
      hero_subtitle: 'BTS, BLACKPINK, IU, 박서준... 내가 좋아하는 K-Pop 아이돌, K-Drama 스타와 비슷한 성격인지 확인해보세요!',

      // Form
      form_title: '생년월일을 입력하세요',
      form_year: '년도',
      form_month: '월',
      form_day: '일',
      form_hour: '태어난 시간 (선택)',
      form_hour_unknown: '모름',
      form_hour_hint: '태어난 시간을 알면 더 정확한 결과를 얻을 수 있습니다',
      form_gender: '성별',
      form_male: '남성',
      form_female: '여성',
      form_submit: '⭐ 내 K-Star 찾기',
      form_analyzing: '분석 중...',

      // Features
      feature_personality: '성격 분석',
      feature_personality_desc: '생년월일로 알아보는 당신의 진정한 성격',
      feature_career: '직업 & 재물',
      feature_career_desc: '성공과 번영으로 가는 길을 찾으세요',
      feature_love: '연애 & 인간관계',
      feature_love_desc: '연애 성향을 알아보세요',

      // Result Page
      result_title: '나의 성격 프로필',
      result_birth_date: '생년월일',
      result_day_master: '일간',
      result_four_pillars: '네 기둥 (四柱)',
      result_year_pillar: '년주',
      result_month_pillar: '월주',
      result_day_pillar: '일주',
      result_hour_pillar: '시주',
      result_elements: '오행 균형',
      result_celebrity: '유명인 성격 매치',
      result_celebrity_desc: '당신과 비슷한 성격의 유명인:',
      result_personality: '성격',
      result_career: '적합한 직업',
      result_love: '연애 & 인간관계',
      result_strength: '강점',
      result_weakness: '보완할 점',
      result_lucky: '행운 요소',
      result_share: '📤 결과 공유',
      result_compatibility: '💕 궁합 보기',
      result_new: '⭐ 다시 보기',

      // Loading
      loading_text: '성격 패턴을 분석하고 있습니다...',
      loading_subtext: '성격 패턴을 분석 중입니다',

      // Compatibility
      compat_badge: '💕 궁합 테스트',
      compat_title: '우리의 궁합은?',
      compat_subtitle: '두 사람의 생년월일을 입력하여 성격 궁합을 알아보세요.',
      compat_person1: '👤 첫 번째 사람',
      compat_person2: '👤 두 번째 사람',
      compat_submit: '💕 궁합 보기',
      compat_clear: '🔄 초기화',
      compat_result: '💕 궁합 결과',
      compat_strengths: '💪 장점',
      compat_challenges: '🌱 도전 과제',
      compat_share: '📤 결과 공유',
      compat_yinyang: '음양 균형',
      compat_yinyang_desc: '상호 보완적인 에너지가 조화와 끌림을 만듭니다',
      compat_elements: '오행',
      compat_elements_desc: '오행의 상호작용이 관계의 역동성을 보여줍니다',
      compat_zodiac: '띠 궁합',
      compat_zodiac_desc: '12지지 궁합이 또 다른 차원을 더합니다',

      // Share Modal
      share_title: '📤 궁합 결과 공유',
      share_desc: '사랑 궁합 결과를 공유해보세요!',

      // About Page
      about_badge: '📚 서비스 소개',
      about_title: 'KStar Match 소개',
      about_subtitle: '한국의 전통적인 성격 분석 시스템을 발견하세요.',
      about_cta_fortune: '⭐ 무료로 성격 분석 보기',
      about_cta_compat: '💕 궁합 보기',

      // Footer
      footer_copyright: '© 2026 KStar Match. All rights reserved.',
      footer_disclaimer: '이것은 오락 목적으로만 제공됩니다. 전문적인 조언을 대체하지 않습니다.',
      footer_privacy: '개인정보처리방침',
      footer_terms: '이용약관',
      footer_contact: '문의하기',
      footer_faq: 'FAQ',

      // Months
      months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],

      // Zodiac Hours
      zodiac_hours: [
        '23:00 - 01:00 (자시 子)',
        '01:00 - 03:00 (축시 丑)',
        '03:00 - 05:00 (인시 寅)',
        '05:00 - 07:00 (묘시 卯)',
        '07:00 - 09:00 (진시 辰)',
        '09:00 - 11:00 (사시 巳)',
        '11:00 - 13:00 (오시 午)',
        '13:00 - 15:00 (미시 未)',
        '15:00 - 17:00 (신시 申)',
        '17:00 - 19:00 (유시 酉)',
        '19:00 - 21:00 (술시 戌)',
        '21:00 - 23:00 (해시 亥)'
      ]
    },

    // ============================================
    // JAPANESE (日本語)
    // ============================================
    ja: {
      // Header & Navigation
      nav_fortune: '性格分析',
      nav_compatibility: '相性',
      nav_about: '紹介',

      // Hero Section
      hero_badge: '✨ 無料性格分析 · K-Starソウルメイトを見つけよう！',
      hero_title: 'KStar Match',
      hero_tagline: '私に似たK-Starは誰？',
      hero_subtitle: 'BTS、BLACKPINK、IU、パク・ソジュン...好きなK-Popアイドルやドラマスターと性格が似ているか確認しよう！',

      // Form
      form_title: '生年月日を入力してください',
      form_year: '年',
      form_month: '月',
      form_day: '日',
      form_hour: '生まれた時間（任意）',
      form_hour_unknown: '分からない',
      form_hour_hint: '生まれた時間が分かるとより正確な結果が得られます',
      form_gender: '性別',
      form_male: '男性',
      form_female: '女性',
      form_submit: '⭐ K-Starを見つける',
      form_analyzing: '分析中...',

      // Features
      feature_personality: '性格分析',
      feature_personality_desc: '生年月日であなたの本当の性格を発見',
      feature_career: 'キャリア＆財運',
      feature_career_desc: '成功と繁栄への道を見つけましょう',
      feature_love: '恋愛＆人間関係',
      feature_love_desc: 'あなたの恋愛傾向を理解しましょう',

      // Result Page
      result_title: 'あなたの性格プロフィール',
      result_birth_date: '生年月日',
      result_day_master: '日干',
      result_four_pillars: '四柱',
      result_year_pillar: '年柱',
      result_month_pillar: '月柱',
      result_day_pillar: '日柱',
      result_hour_pillar: '時柱',
      result_elements: '五行バランス',
      result_celebrity: '有名人性格マッチ',
      result_celebrity_desc: 'あなたと似たエネルギーを持つ有名人:',
      result_personality: '性格',
      result_career: '適職',
      result_love: '恋愛＆人間関係',
      result_strength: '強み',
      result_weakness: '成長ポイント',
      result_lucky: 'ラッキー要素',
      result_share: '📤 結果をシェア',
      result_compatibility: '💕 相性を見る',
      result_new: '⭐ もう一度',

      // Loading
      loading_text: '宇宙のエネルギーを分析中...',
      loading_subtext: '性格パターンを分析中',

      // Compatibility
      compat_badge: '💕 相性診断',
      compat_title: '運命の相手ですか？',
      compat_subtitle: '二人の生年月日を入力して性格相性を見る。',
      compat_person1: '👤 1人目',
      compat_person2: '👤 2人目',
      compat_submit: '💕 相性を見る',
      compat_clear: '🔄 リセット',
      compat_result: '💕 相性結果',
      compat_strengths: '💪 強み',
      compat_challenges: '🌱 課題',
      compat_share: '📤 結果をシェア',
      compat_yinyang: '陰陽バランス',
      compat_yinyang_desc: '相互補完のエネルギーが調和と魅力を生み出します',
      compat_elements: '五行',
      compat_elements_desc: '五行の相互作用が関係性のダイナミクスを明らかにします',
      compat_zodiac: '干支の相性',
      compat_zodiac_desc: '干支の相性がさらに深い層を加えます',

      // Share Modal
      share_title: '📤 相性結果をシェア',
      share_desc: '恋愛相性の結果をシェアしましょう！',

      // About Page
      about_badge: '📚 サービス紹介',
      about_title: 'KStar Matchの芸術',
      about_subtitle: '韓国の伝統的な性格分析システムを発見してください。',
      about_cta_fortune: '⭐ 無料で診断する',
      about_cta_compat: '💕 相性を見る',

      // Footer
      footer_copyright: '© 2026 KStar Match. All rights reserved.',
      footer_disclaimer: 'これは娯楽目的のみです。専門的なアドバイスの代わりにはなりません。',
      footer_privacy: 'プライバシーポリシー',
      footer_terms: '利用規約',
      footer_contact: 'お問い合わせ',
      footer_faq: 'FAQ',

      // Months
      months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],

      // Zodiac Hours
      zodiac_hours: [
        '23:00 - 01:00 (子の刻)',
        '01:00 - 03:00 (丑の刻)',
        '03:00 - 05:00 (寅の刻)',
        '05:00 - 07:00 (卯の刻)',
        '07:00 - 09:00 (辰の刻)',
        '09:00 - 11:00 (巳の刻)',
        '11:00 - 13:00 (午の刻)',
        '13:00 - 15:00 (未の刻)',
        '15:00 - 17:00 (申の刻)',
        '17:00 - 19:00 (酉の刻)',
        '19:00 - 21:00 (戌の刻)',
        '21:00 - 23:00 (亥の刻)'
      ]
    },

    // ============================================
    // CHINESE (中文)
    // ============================================
    zh: {
      // Header & Navigation
      nav_fortune: '性格分析',
      nav_compatibility: '合婚',
      nav_about: '关于',

      // Hero Section
      hero_badge: '✨ 免费性格分析 · 找到你的K-Star灵魂伴侣！',
      hero_title: 'KStar Match',
      hero_tagline: '跟我性格相似的K-Star是谁？',
      hero_subtitle: 'BTS、BLACKPINK、IU、朴叙俊...看看你和喜欢的K-Pop偶像、韩剧明星性格是否相似！',

      // Form
      form_title: '输入您的出生信息',
      form_year: '年',
      form_month: '月',
      form_day: '日',
      form_hour: '出生时辰（可选）',
      form_hour_unknown: '不知道',
      form_hour_hint: '知道出生时辰可以获得更准确的结果',
      form_gender: '性别',
      form_male: '男',
      form_female: '女',
      form_submit: '⭐ 找到我的K-Star',
      form_analyzing: '分析中...',

      // Features
      feature_personality: '性格分析',
      feature_personality_desc: '通过出生日期发现你真正的性格',
      feature_career: '事业与财运',
      feature_career_desc: '找到通往成功和繁荣的道路',
      feature_love: '爱情与人际关系',
      feature_love_desc: '了解你的感情倾向',

      // Result Page
      result_title: '你的性格档案',
      result_birth_date: '出生日期',
      result_day_master: '日主',
      result_four_pillars: '四柱',
      result_year_pillar: '年柱',
      result_month_pillar: '月柱',
      result_day_pillar: '日柱',
      result_hour_pillar: '时柱',
      result_elements: '五行平衡',
      result_celebrity: '名人性格匹配',
      result_celebrity_desc: '与你有相似能量的名人：',
      result_personality: '性格',
      result_career: '适合职业',
      result_love: '爱情与人际关系',
      result_strength: '优势',
      result_weakness: '成长方向',
      result_lucky: '幸运元素',
      result_share: '📤 分享结果',
      result_compatibility: '💕 查看合婚',
      result_new: '⭐ 重新分析',

      // Loading
      loading_text: '正在分析宇宙能量...',
      loading_subtext: '正在分析你的性格模式',

      // Compatibility
      compat_badge: '💕 合婚测试',
      compat_title: '你们是天生一对吗？',
      compat_subtitle: '请输入两人的出生日期，查看性格配对。',
      compat_person1: '👤 第一人',
      compat_person2: '👤 第二人',
      compat_submit: '💕 查看合婚',
      compat_clear: '🔄 清空',
      compat_result: '💕 合婚结果',
      compat_strengths: '💪 优势',
      compat_challenges: '🌱 挑战',
      compat_share: '📤 分享结果',
      compat_yinyang: '阴阳平衡',
      compat_yinyang_desc: '互补的能量创造和谐与吸引力',
      compat_elements: '五行',
      compat_elements_desc: '五行的相互作用揭示关系动态',
      compat_zodiac: '生肖配对',
      compat_zodiac_desc: '生肖配对增添另一层面',

      // Share Modal
      share_title: '📤 分享合婚结果',
      share_desc: '分享您的爱情合婚结果！',

      // About Page
      about_badge: '📚 服务介绍',
      about_title: 'KStar Match的艺术',
      about_subtitle: '探索韩国传统的性格分析系统。',
      about_cta_fortune: '⭐ 免费测试',
      about_cta_compat: '💕 查看合婚',

      // Footer
      footer_copyright: '© 2026 KStar Match. 保留所有权利。',
      footer_disclaimer: '仅供娱乐目的。不能替代专业建议。',
      footer_privacy: '隐私政策',
      footer_terms: '服务条款',
      footer_contact: '联系我们',
      footer_faq: '常见问题',

      // Months
      months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],

      // Zodiac Hours
      zodiac_hours: [
        '23:00 - 01:00 (子时)',
        '01:00 - 03:00 (丑时)',
        '03:00 - 05:00 (寅时)',
        '05:00 - 07:00 (卯时)',
        '07:00 - 09:00 (辰时)',
        '09:00 - 11:00 (巳时)',
        '11:00 - 13:00 (午时)',
        '13:00 - 15:00 (未时)',
        '15:00 - 17:00 (申时)',
        '17:00 - 19:00 (酉时)',
        '19:00 - 21:00 (戌时)',
        '21:00 - 23:00 (亥时)'
      ]
    },

    // ============================================
    // VIETNAMESE (Tiếng Việt)
    // ============================================
    vi: {
      // Header & Navigation
      nav_fortune: 'Tính cách',
      nav_compatibility: 'Hợp tuổi',
      nav_about: 'Giới thiệu',

      // Hero Section
      hero_badge: '✨ Phân tích miễn phí · Tìm K-Star tri kỷ của bạn!',
      hero_title: 'KStar Match',
      hero_tagline: 'K-Star nào giống tính cách tôi?',
      hero_subtitle: 'BTS, BLACKPINK, IU, Park Seo-joon... Xem bạn có tính cách giống thần tượng K-Pop và sao K-Drama yêu thích không!',

      // Form
      form_title: 'Nhập thông tin ngày sinh',
      form_year: 'Năm',
      form_month: 'Tháng',
      form_day: 'Ngày',
      form_hour: 'Giờ sinh (Tùy chọn)',
      form_hour_unknown: 'Không biết',
      form_hour_hint: 'Biết giờ sinh sẽ cho kết quả chính xác hơn',
      form_gender: 'Giới tính',
      form_male: 'Nam',
      form_female: 'Nữ',
      form_submit: '⭐ Tìm K-Star của tôi',
      form_analyzing: 'Đang phân tích...',

      // Features
      feature_personality: 'Phân tích Tính cách',
      feature_personality_desc: 'Khám phá bản chất thật của bạn qua ngày sinh',
      feature_career: 'Sự nghiệp & Tài lộc',
      feature_career_desc: 'Tìm con đường đến thành công và thịnh vượng',
      feature_love: 'Tình yêu & Mối quan hệ',
      feature_love_desc: 'Hiểu xu hướng tình cảm của bạn',

      // Result Page
      result_title: 'Hồ sơ tính cách của bạn',
      result_birth_date: 'Ngày sinh',
      result_day_master: 'Nhật chủ',
      result_four_pillars: 'Tứ Trụ (四柱)',
      result_year_pillar: 'Năm',
      result_month_pillar: 'Tháng',
      result_day_pillar: 'Ngày',
      result_hour_pillar: 'Giờ',
      result_elements: 'Cân bằng Ngũ hành',
      result_celebrity: 'Người nổi tiếng cùng tính cách',
      result_celebrity_desc: 'Bạn có năng lượng tương tự với:',
      result_personality: 'Tính cách',
      result_career: 'Nghề nghiệp phù hợp',
      result_love: 'Tình yêu & Mối quan hệ',
      result_strength: 'Điểm mạnh',
      result_weakness: 'Điểm cần cải thiện',
      result_lucky: 'Yếu tố may mắn',
      result_share: '📤 Chia sẻ kết quả',
      result_compatibility: '💕 Xem hợp tuổi',
      result_new: '⭐ Xem lại',

      // Loading
      loading_text: 'Đang phân tích năng lượng vũ trụ...',
      loading_subtext: 'Đang phân tích tính cách của bạn',

      // Compatibility
      compat_badge: '💕 Kiểm tra hợp tuổi',
      compat_title: 'Các bạn có duyên số không?',
      compat_subtitle: 'Nhập ngày sinh của cả hai để xem tương hợp tính cách.',
      compat_person1: '👤 Người 1',
      compat_person2: '👤 Người 2',
      compat_submit: '💕 Xem hợp tuổi',
      compat_clear: '🔄 Xóa',
      compat_result: '💕 Kết quả hợp tuổi',
      compat_strengths: '💪 Điểm mạnh',
      compat_challenges: '🌱 Thử thách',
      compat_share: '📤 Chia sẻ kết quả',
      compat_yinyang: 'Cân bằng Âm Dương',
      compat_yinyang_desc: 'Năng lượng bổ sung tạo sự hài hòa và thu hút',
      compat_elements: 'Ngũ Hành',
      compat_elements_desc: 'Sự tương tác ngũ hành cho thấy động lực mối quan hệ',
      compat_zodiac: 'Tương hợp Con giáp',
      compat_zodiac_desc: 'Tương hợp con giáp thêm một tầng ý nghĩa',

      // Share Modal
      share_title: '📤 Chia sẻ kết quả hợp tuổi',
      share_desc: 'Chia sẻ kết quả hợp tuổi tình yêu của bạn!',

      // About Page
      about_badge: '📚 Giới thiệu dịch vụ',
      about_title: 'Nghệ thuật KStar Match',
      about_subtitle: 'Khám phá hệ thống phân tích tính cách truyền thống của Hàn Quốc.',
      about_cta_fortune: '⭐ Xem miễn phí',
      about_cta_compat: '💕 Xem hợp tuổi',

      // Footer
      footer_copyright: '© 2026 KStar Match. Đã đăng ký bản quyền.',
      footer_disclaimer: 'Chỉ mang tính giải trí. Không thay thế lời khuyên chuyên nghiệp.',
      footer_privacy: 'Chính sách bảo mật',
      footer_terms: 'Điều khoản dịch vụ',
      footer_contact: 'Liên hệ',
      footer_faq: 'FAQ',

      // Months
      months: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],

      // Zodiac Hours
      zodiac_hours: [
        '23:00 - 01:00 (Giờ Tý)',
        '01:00 - 03:00 (Giờ Sửu)',
        '03:00 - 05:00 (Giờ Dần)',
        '05:00 - 07:00 (Giờ Mão)',
        '07:00 - 09:00 (Giờ Thìn)',
        '09:00 - 11:00 (Giờ Tỵ)',
        '11:00 - 13:00 (Giờ Ngọ)',
        '13:00 - 15:00 (Giờ Mùi)',
        '15:00 - 17:00 (Giờ Thân)',
        '17:00 - 19:00 (Giờ Dậu)',
        '19:00 - 21:00 (Giờ Tuất)',
        '21:00 - 23:00 (Giờ Hợi)'
      ]
    }
  },

  // Get translation
  t(key) {
    const lang = this.translations[this.currentLang];
    return lang && lang[key] ? lang[key] : this.translations.en[key] || key;
  },

  // Set language
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('kfortunes-lang', lang);
      }
      this.updatePage();
      return true;
    }
    return false;
  },

  // Initialize language from storage (English default)
  init() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('kfortunes-lang');
      if (saved && this.translations[saved]) {
        this.currentLang = saved;
      }
    }
    // English is the default (currentLang: 'en')
    // Users can select their preferred language from the dropdown
    this.updatePage();
  },

  // Update page content with translations
  updatePage() {
    // Skip DOM updates if not in browser environment
    if (typeof document === 'undefined') {
      return;
    }

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      if (translation) {
        el.textContent = translation;
      }
    });

    // Update placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = this.t(key);
      if (translation) {
        el.placeholder = translation;
      }
    });

    // Update HTML lang attribute
    document.documentElement.lang = this.currentLang;

    // Update language selector display
    const langDisplay = document.getElementById('current-lang');
    if (langDisplay) {
      const langInfo = this.languages[this.currentLang];
      langDisplay.textContent = langInfo.flag + ' ' + langInfo.name;
    }
  }
};

// Initialize on DOM ready (browser only)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    i18n.init();
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18n;
}
