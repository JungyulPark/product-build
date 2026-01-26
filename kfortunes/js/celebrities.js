// K-Fortunes Celebrity Saju Database
// 유명인 사주 데이터베이스 (확장판 + 일주 매칭)

const Celebrities = {
  // 유명인 데이터 (일간 + 음양 기준으로 분류)
  // dayMaster: element, yin: true/false (음/양)
  // 갑(양목), 을(음목), 병(양화), 정(음화), 무(양토), 기(음토), 경(양금), 신(음금), 임(양수), 계(음수)
  data: [
    // ============================================
    // 🌳 WOOD Day Masters (목)
    // ============================================
    // 甲 갑 (Yang Wood 양목)
    { name: "BTS Jungkook", korean: "정국", dayMaster: "wood", yin: false, stem: "甲", birthYear: 1997, category: "K-Pop", image: "🎤", popularity: 100 },
    { name: "Stray Kids Bang Chan", korean: "방찬", dayMaster: "wood", yin: false, stem: "甲", birthYear: 1997, category: "K-Pop", image: "🎤", popularity: 92 },
    { name: "Leonardo DiCaprio", korean: "레오나르도 디카프리오", dayMaster: "wood", yin: false, stem: "甲", birthYear: 1974, category: "Actor", image: "🎬", popularity: 95 },
    { name: "Mark Zuckerberg", korean: "마크 저커버그", dayMaster: "wood", yin: false, stem: "甲", birthYear: 1984, category: "Tech", image: "💻", popularity: 85 },
    { name: "Barack Obama", korean: "버락 오바마", dayMaster: "wood", yin: false, stem: "甲", birthYear: 1961, category: "President", image: "🏛️", popularity: 90 },
    { name: "Cristiano Ronaldo", korean: "크리스티아누 호날두", dayMaster: "wood", yin: false, stem: "甲", birthYear: 1985, category: "Athlete", image: "⚽", popularity: 98 },
    { name: "Ed Sheeran", korean: "에드 시런", dayMaster: "wood", yin: false, stem: "甲", birthYear: 1991, category: "Singer", image: "🎸", popularity: 88 },
    { name: "Gong Yoo", korean: "공유", dayMaster: "wood", yin: false, stem: "甲", birthYear: 1979, category: "Actor", image: "🎬", popularity: 93 },

    // 乙 을 (Yin Wood 음목)
    { name: "IU", korean: "아이유", dayMaster: "wood", yin: true, stem: "乙", birthYear: 1993, category: "K-Pop", image: "🎵", popularity: 99 },
    { name: "aespa Karina", korean: "카리나", dayMaster: "wood", yin: true, stem: "乙", birthYear: 2000, category: "K-Pop", image: "🎵", popularity: 96 },
    { name: "TWICE Nayeon", korean: "나연", dayMaster: "wood", yin: true, stem: "乙", birthYear: 1995, category: "K-Pop", image: "🎵", popularity: 95 },
    { name: "Taylor Swift", korean: "테일러 스위프트", dayMaster: "wood", yin: true, stem: "乙", birthYear: 1989, category: "Singer", image: "🎤", popularity: 100 },
    { name: "Ariana Grande", korean: "아리아나 그란데", dayMaster: "wood", yin: true, stem: "乙", birthYear: 1993, category: "Singer", image: "🎤", popularity: 95 },
    { name: "Zendaya", korean: "젠데이아", dayMaster: "wood", yin: true, stem: "乙", birthYear: 1996, category: "Actor", image: "🎬", popularity: 92 },
    { name: "Song Hye-kyo", korean: "송혜교", dayMaster: "wood", yin: true, stem: "乙", birthYear: 1981, category: "Actor", image: "🎬", popularity: 94 },
    { name: "Naomi Osaka", korean: "오사카 나오미", dayMaster: "wood", yin: true, stem: "乙", birthYear: 1997, category: "Athlete", image: "🎾", popularity: 85 },

    // ============================================
    // 🔥 FIRE Day Masters (화)
    // ============================================
    // 丙 병 (Yang Fire 양화)
    { name: "BTS V", korean: "뷔", dayMaster: "fire", yin: false, stem: "丙", birthYear: 1995, category: "K-Pop", image: "🎤" },
    { name: "SEVENTEEN Hoshi", korean: "호시", dayMaster: "fire", yin: false, stem: "丙", birthYear: 1996, category: "K-Pop", image: "🎤" },
    { name: "Steve Jobs", korean: "스티브 잡스", dayMaster: "fire", yin: false, stem: "丙", birthYear: 1955, category: "Tech", image: "💡" },
    { name: "Donald Trump", korean: "도널드 트럼프", dayMaster: "fire", yin: false, stem: "丙", birthYear: 1946, category: "President", image: "🏛️" },
    { name: "Drake", korean: "드레이크", dayMaster: "fire", yin: false, stem: "丙", birthYear: 1986, category: "Singer", image: "🎤" },
    { name: "Tom Holland", korean: "톰 홀랜드", dayMaster: "fire", yin: false, stem: "丙", birthYear: 1996, category: "Actor", image: "🎬" },
    { name: "Park Seo-joon", korean: "박서준", dayMaster: "fire", yin: false, stem: "丙", birthYear: 1988, category: "Actor", image: "🎬" },
    { name: "LeBron James", korean: "르브론 제임스", dayMaster: "fire", yin: false, stem: "丙", birthYear: 1984, category: "Athlete", image: "🏀" },

    // 丁 정 (Yin Fire 음화)
    { name: "BLACKPINK Jennie", korean: "제니", dayMaster: "fire", yin: true, stem: "丁", birthYear: 1996, category: "K-Pop", image: "🎵" },
    { name: "LE SSERAFIM Kazuha", korean: "카즈하", dayMaster: "fire", yin: true, stem: "丁", birthYear: 2003, category: "K-Pop", image: "🎵" },
    { name: "IVE Wonyoung", korean: "장원영", dayMaster: "fire", yin: true, stem: "丁", birthYear: 2004, category: "K-Pop", image: "🎵" },
    { name: "Beyoncé", korean: "비욘세", dayMaster: "fire", yin: true, stem: "丁", birthYear: 1981, category: "Singer", image: "👑" },
    { name: "Billie Eilish", korean: "빌리 아일리시", dayMaster: "fire", yin: true, stem: "丁", birthYear: 2001, category: "Singer", image: "🎵" },
    { name: "Emma Watson", korean: "엠마 왓슨", dayMaster: "fire", yin: true, stem: "丁", birthYear: 1990, category: "Actor", image: "🎬" },
    { name: "Han So-hee", korean: "한소희", dayMaster: "fire", yin: true, stem: "丁", birthYear: 1994, category: "Actor", image: "🎬" },
    { name: "Serena Williams", korean: "세레나 윌리엄스", dayMaster: "fire", yin: true, stem: "丁", birthYear: 1981, category: "Athlete", image: "🎾" },

    // ============================================
    // 🌍 EARTH Day Masters (토)
    // ============================================
    // 戊 무 (Yang Earth 양토)
    { name: "BTS RM", korean: "RM", dayMaster: "earth", yin: false, stem: "戊", birthYear: 1994, category: "K-Pop", image: "🎤" },
    { name: "EXO Baekhyun", korean: "백현", dayMaster: "earth", yin: false, stem: "戊", birthYear: 1992, category: "K-Pop", image: "🎤" },
    { name: "Elon Musk", korean: "일론 머스크", dayMaster: "earth", yin: false, stem: "戊", birthYear: 1971, category: "Tech", image: "🚀" },
    { name: "Joe Biden", korean: "조 바이든", dayMaster: "earth", yin: false, stem: "戊", birthYear: 1942, category: "President", image: "🏛️" },
    { name: "The Weeknd", korean: "더 위켄드", dayMaster: "earth", yin: false, stem: "戊", birthYear: 1990, category: "Singer", image: "🎤" },
    { name: "Bruno Mars", korean: "브루노 마스", dayMaster: "earth", yin: false, stem: "戊", birthYear: 1985, category: "Singer", image: "🎤" },
    { name: "Timothée Chalamet", korean: "티모시 샬라메", dayMaster: "earth", yin: false, stem: "戊", birthYear: 1995, category: "Actor", image: "🎬" },
    { name: "Lee Min-ho", korean: "이민호", dayMaster: "earth", yin: false, stem: "戊", birthYear: 1987, category: "Actor", image: "🎬" },

    // 己 기 (Yin Earth 음토)
    { name: "BLACKPINK Rosé", korean: "로제", dayMaster: "earth", yin: true, stem: "己", birthYear: 1997, category: "K-Pop", image: "🎵" },
    { name: "aespa Winter", korean: "윈터", dayMaster: "earth", yin: true, stem: "己", birthYear: 2001, category: "K-Pop", image: "🎵" },
    { name: "Red Velvet Irene", korean: "아이린", dayMaster: "earth", yin: true, stem: "己", birthYear: 1991, category: "K-Pop", image: "🎵" },
    { name: "Son Heung-min", korean: "손흥민", dayMaster: "earth", yin: true, stem: "己", birthYear: 1992, category: "Athlete", image: "⚽" },
    { name: "Kim Yuna", korean: "김연아", dayMaster: "earth", yin: true, stem: "己", birthYear: 1990, category: "Athlete", image: "⛸️" },
    { name: "Oprah Winfrey", korean: "오프라 윈프리", dayMaster: "earth", yin: true, stem: "己", birthYear: 1954, category: "Media", image: "📺" },
    { name: "Dua Lipa", korean: "두아 리파", dayMaster: "earth", yin: true, stem: "己", birthYear: 1995, category: "Singer", image: "🎵" },
    { name: "Jennifer Lawrence", korean: "제니퍼 로렌스", dayMaster: "earth", yin: true, stem: "己", birthYear: 1990, category: "Actor", image: "🎬" },
    { name: "Kim Tae-ri", korean: "김태리", dayMaster: "earth", yin: true, stem: "己", birthYear: 1990, category: "Actor", image: "🎬" },

    // ============================================
    // ⚔️ METAL Day Masters (금)
    // ============================================
    // 庚 경 (Yang Metal 양금)
    { name: "BTS Suga", korean: "슈가", dayMaster: "metal", yin: false, stem: "庚", birthYear: 1993, category: "K-Pop", image: "🎤" },
    { name: "Stray Kids Hyunjin", korean: "현진", dayMaster: "metal", yin: false, stem: "庚", birthYear: 2000, category: "K-Pop", image: "🎤" },
    { name: "Bill Gates", korean: "빌 게이츠", dayMaster: "metal", yin: false, stem: "庚", birthYear: 1955, category: "Tech", image: "💻" },
    { name: "Jeff Bezos", korean: "제프 베조스", dayMaster: "metal", yin: false, stem: "庚", birthYear: 1964, category: "Tech", image: "📦" },
    { name: "Xi Jinping", korean: "시진핑", dayMaster: "metal", yin: false, stem: "庚", birthYear: 1953, category: "President", image: "🏛️" },
    { name: "Justin Bieber", korean: "저스틴 비버", dayMaster: "metal", yin: false, stem: "庚", birthYear: 1994, category: "Singer", image: "🎤" },
    { name: "Chris Hemsworth", korean: "크리스 헴스워스", dayMaster: "metal", yin: false, stem: "庚", birthYear: 1983, category: "Actor", image: "🎬" },
    { name: "Hyun Bin", korean: "현빈", dayMaster: "metal", yin: false, stem: "庚", birthYear: 1982, category: "Actor", image: "🎬" },
    { name: "Lionel Messi", korean: "리오넬 메시", dayMaster: "metal", yin: false, stem: "庚", birthYear: 1987, category: "Athlete", image: "⚽" },
    { name: "Roger Federer", korean: "로저 페더러", dayMaster: "metal", yin: false, stem: "庚", birthYear: 1981, category: "Athlete", image: "🎾" },

    // 辛 신 (Yin Metal 음금)
    { name: "NewJeans Minji", korean: "민지", dayMaster: "metal", yin: true, stem: "辛", birthYear: 2004, category: "K-Pop", image: "🎵" },
    { name: "LE SSERAFIM Chaewon", korean: "채원", dayMaster: "metal", yin: true, stem: "辛", birthYear: 2000, category: "K-Pop", image: "🎵" },
    { name: "ITZY Yeji", korean: "예지", dayMaster: "metal", yin: true, stem: "辛", birthYear: 2000, category: "K-Pop", image: "🎵" },
    { name: "Lady Gaga", korean: "레이디 가가", dayMaster: "metal", yin: true, stem: "辛", birthYear: 1986, category: "Singer", image: "🎤" },
    { name: "Adele", korean: "아델", dayMaster: "metal", yin: true, stem: "辛", birthYear: 1988, category: "Singer", image: "🎵" },
    { name: "Margot Robbie", korean: "마고 로비", dayMaster: "metal", yin: true, stem: "辛", birthYear: 1990, category: "Actor", image: "🎬" },
    { name: "Son Ye-jin", korean: "손예진", dayMaster: "metal", yin: true, stem: "辛", birthYear: 1982, category: "Actor", image: "🎬" },

    // ============================================
    // 💧 WATER Day Masters (수)
    // ============================================
    // 壬 임 (Yang Water 양수)
    { name: "BTS Jin", korean: "진", dayMaster: "water", yin: false, stem: "壬", birthYear: 1992, category: "K-Pop", image: "🎤" },
    { name: "BTS J-Hope", korean: "제이홉", dayMaster: "water", yin: false, stem: "壬", birthYear: 1994, category: "K-Pop", image: "🎤" },
    { name: "BTS Jimin", korean: "지민", dayMaster: "water", yin: false, stem: "壬", birthYear: 1995, category: "K-Pop", image: "🎤" },
    { name: "Albert Einstein", korean: "알베르트 아인슈타인", dayMaster: "water", yin: false, stem: "壬", birthYear: 1879, category: "Scientist", image: "🔬" },
    { name: "Warren Buffett", korean: "워렌 버핏", dayMaster: "water", yin: false, stem: "壬", birthYear: 1930, category: "Investor", image: "💰" },
    { name: "Harry Styles", korean: "해리 스타일스", dayMaster: "water", yin: false, stem: "壬", birthYear: 1994, category: "Singer", image: "🎤" },
    { name: "Post Malone", korean: "포스트 말론", dayMaster: "water", yin: false, stem: "壬", birthYear: 1995, category: "Singer", image: "🎤" },
    { name: "Robert Downey Jr.", korean: "로버트 다우니 주니어", dayMaster: "water", yin: false, stem: "壬", birthYear: 1965, category: "Actor", image: "🎬" },
    { name: "Park Bo-gum", korean: "박보검", dayMaster: "water", yin: false, stem: "壬", birthYear: 1993, category: "Actor", image: "🎬" },
    { name: "Michael Jordan", korean: "마이클 조던", dayMaster: "water", yin: false, stem: "壬", birthYear: 1963, category: "Athlete", image: "🏀" },

    // 癸 계 (Yin Water 음수)
    { name: "BLACKPINK Lisa", korean: "리사", dayMaster: "water", yin: true, stem: "癸", birthYear: 1997, category: "K-Pop", image: "🎵" },
    { name: "NewJeans Hanni", korean: "하니", dayMaster: "water", yin: true, stem: "癸", birthYear: 2004, category: "K-Pop", image: "🎵" },
    { name: "IVE Yujin", korean: "안유진", dayMaster: "water", yin: true, stem: "癸", birthYear: 2003, category: "K-Pop", image: "🎵" },
    { name: "Angela Merkel", korean: "앙겔라 메르켈", dayMaster: "water", yin: true, stem: "癸", birthYear: 1954, category: "President", image: "🏛️" },
    { name: "Rihanna", korean: "리한나", dayMaster: "water", yin: true, stem: "癸", birthYear: 1988, category: "Singer", image: "🎤" },
    { name: "Selena Gomez", korean: "셀레나 고메즈", dayMaster: "water", yin: true, stem: "癸", birthYear: 1992, category: "Singer", image: "🎵" },
    { name: "Scarlett Johansson", korean: "스칼렛 요한슨", dayMaster: "water", yin: true, stem: "癸", birthYear: 1984, category: "Actor", image: "🎬" },
    { name: "Suzy", korean: "수지", dayMaster: "water", yin: true, stem: "癸", birthYear: 1994, category: "Actor", image: "🎬" },
    { name: "Simone Biles", korean: "시몬 바일스", dayMaster: "water", yin: true, stem: "癸", birthYear: 1997, category: "Athlete", image: "🤸" },
  ],

  // 천간 정보
  stems: {
    '甲': { element: 'wood', yin: false, korean: '갑', english: 'Yang Wood' },
    '乙': { element: 'wood', yin: true, korean: '을', english: 'Yin Wood' },
    '丙': { element: 'fire', yin: false, korean: '병', english: 'Yang Fire' },
    '丁': { element: 'fire', yin: true, korean: '정', english: 'Yin Fire' },
    '戊': { element: 'earth', yin: false, korean: '무', english: 'Yang Earth' },
    '己': { element: 'earth', yin: true, korean: '기', english: 'Yin Earth' },
    '庚': { element: 'metal', yin: false, korean: '경', english: 'Yang Metal' },
    '辛': { element: 'metal', yin: true, korean: '신', english: 'Yin Metal' },
    '壬': { element: 'water', yin: false, korean: '임', english: 'Yang Water' },
    '癸': { element: 'water', yin: true, korean: '계', english: 'Yin Water' }
  },

  // 정확한 일간 매칭 (음양 구분)
  findMatches(dayMaster) {
    const element = dayMaster.element;
    const isYin = dayMaster.yin;
    const stem = dayMaster.hanja; // 천간 한자 (甲乙丙丁戊己庚辛壬癸)

    // 1순위: 정확히 같은 천간 (甲=甲, 乙=乙, etc.)
    const exactStemMatches = this.data.filter(c => c.stem === stem);

    // 2순위: 같은 오행 + 같은 음양
    const sameYinYang = this.data.filter(c =>
      c.dayMaster === element && c.yin === isYin && c.stem !== stem
    );

    // 3순위: 같은 오행 + 다른 음양
    const differentYinYang = this.data.filter(c =>
      c.dayMaster === element && c.yin !== isYin
    );

    return {
      exact: exactStemMatches,      // 완전 일치
      similar: sameYinYang,         // 같은 음양
      related: differentYinYang     // 같은 오행
    };
  },

  // 우선순위 기반 랜덤 매치 선택
  getRandomMatch(dayMaster, count = 2) {
    const matches = this.findMatches(dayMaster);

    // 우선순위: exact > similar > related
    let pool = [];

    if (matches.exact.length >= count) {
      pool = matches.exact;
    } else if (matches.exact.length + matches.similar.length >= count) {
      pool = [...matches.exact, ...matches.similar];
    } else {
      pool = [...matches.exact, ...matches.similar, ...matches.related];
    }

    // 셔플 후 선택
    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  // 매치 타입 반환 (UI에서 표시용)
  getMatchType(celebrity, dayMaster) {
    if (celebrity.stem === dayMaster.hanja) {
      return { type: 'exact', label: '완벽 일치', emoji: '🎯' };
    } else if (celebrity.yin === dayMaster.yin) {
      return { type: 'similar', label: '같은 음양', emoji: '✨' };
    } else {
      return { type: 'related', label: '같은 오행', emoji: '🔮' };
    }
  },

  // 개선된 매치 메시지 생성
  getMatchMessage(celebrity, dayMaster) {
    const element = dayMaster.element;
    const stemInfo = this.stems[dayMaster.hanja];
    const matchType = this.getMatchType(celebrity, dayMaster);

    const elementNames = {
      wood: { ko: '목(木)', en: 'Wood' },
      fire: { ko: '화(火)', en: 'Fire' },
      earth: { ko: '토(土)', en: 'Earth' },
      metal: { ko: '금(金)', en: 'Metal' },
      water: { ko: '수(水)', en: 'Water' }
    };

    const yinYangEn = dayMaster.yin ? 'Yin' : 'Yang';

    if (matchType.type === 'exact') {
      return `${matchType.emoji} You share the exact same Day Master: ${yinYangEn} ${elementNames[element].en}!`;
    } else if (matchType.type === 'similar') {
      return `${matchType.emoji} Both of you have ${yinYangEn} ${elementNames[element].en} energy!`;
    } else {
      return `🔮 You share the ${elementNames[element].en} elemental energy!`;
    }
  },

  // 🔮 연예인 궁합 계산 (프리미엄 기능)
  calculateCelebrityCompatibility(userDayMaster, celebrity) {
    const matchType = this.getMatchType(celebrity, userDayMaster);
    const userElement = userDayMaster.element;
    const celebElement = celebrity.dayMaster;

    // 기본 점수 계산
    let baseScore = 50;

    // 매치 타입에 따른 점수
    if (matchType.type === 'exact') {
      baseScore = 85 + Math.floor(Math.random() * 10); // 85-94%
    } else if (matchType.type === 'similar') {
      baseScore = 70 + Math.floor(Math.random() * 15); // 70-84%
    } else {
      baseScore = 55 + Math.floor(Math.random() * 15); // 55-69%
    }

    // 오행 상생/상극 관계
    const elementRelations = {
      wood: { generates: 'fire', controls: 'earth', generatedBy: 'water', controlledBy: 'metal' },
      fire: { generates: 'earth', controls: 'metal', generatedBy: 'wood', controlledBy: 'water' },
      earth: { generates: 'metal', controls: 'water', generatedBy: 'fire', controlledBy: 'wood' },
      metal: { generates: 'water', controls: 'wood', generatedBy: 'earth', controlledBy: 'fire' },
      water: { generates: 'wood', controls: 'fire', generatedBy: 'metal', controlledBy: 'earth' }
    };

    const relation = elementRelations[userElement];
    let relationBonus = 0;
    let relationDesc = '';

    if (celebElement === relation.generates) {
      relationBonus = 8;
      relationDesc = 'You naturally support and nurture their energy';
    } else if (celebElement === relation.generatedBy) {
      relationBonus = 10;
      relationDesc = 'They bring out the best in you';
    } else if (celebElement === relation.controls) {
      relationBonus = -5;
      relationDesc = 'Dynamic tension creates exciting chemistry';
    } else if (celebElement === relation.controlledBy) {
      relationBonus = -3;
      relationDesc = 'They challenge you to grow';
    } else {
      relationBonus = 5;
      relationDesc = 'Natural harmony and understanding';
    }

    const totalScore = Math.min(98, Math.max(45, baseScore + relationBonus));

    // 세부 점수 계산
    const personality = totalScore + Math.floor(Math.random() * 10) - 5;
    const emotional = totalScore + Math.floor(Math.random() * 12) - 6;
    const longTerm = totalScore + Math.floor(Math.random() * 8) - 4;

    // 프리미엄 분석 내용
    const premiumAnalysis = this.generatePremiumAnalysis(userDayMaster, celebrity, totalScore);

    return {
      overall: Math.min(98, Math.max(40, totalScore)),
      personality: Math.min(98, Math.max(35, personality)),
      emotional: Math.min(98, Math.max(35, emotional)),
      longTerm: Math.min(98, Math.max(35, longTerm)),
      relationDesc: relationDesc,
      matchType: matchType,
      premiumAnalysis: premiumAnalysis
    };
  },

  // 프리미엄 분석 생성
  generatePremiumAnalysis(userDayMaster, celebrity, score) {
    const celebName = celebrity.name;
    const userYinYang = userDayMaster.yin ? 'Yin' : 'Yang';
    const celebYinYang = celebrity.yin ? 'Yin' : 'Yang';

    const elementTraits = {
      wood: { trait: 'growth-oriented', strength: 'creativity', challenge: 'flexibility' },
      fire: { trait: 'passionate', strength: 'charisma', challenge: 'patience' },
      earth: { trait: 'stable', strength: 'reliability', challenge: 'spontaneity' },
      metal: { trait: 'principled', strength: 'determination', challenge: 'adaptability' },
      water: { trait: 'intuitive', strength: 'wisdom', challenge: 'boundaries' }
    };

    const userTraits = elementTraits[userDayMaster.element];
    const celebTraits = elementTraits[celebrity.dayMaster];

    return {
      intro: `Your connection with ${celebName} is marked by ${score > 80 ? 'exceptional' : score > 65 ? 'strong' : 'interesting'} cosmic alignment.`,
      strengths: [
        `Both share ${userYinYang === celebYinYang ? 'similar' : 'complementary'} energy patterns`,
        `Your ${userTraits.strength} meets their ${celebTraits.strength}`,
        `Potential for ${score > 75 ? 'deep understanding' : 'growth together'}`
      ],
      challenges: [
        `Balance ${userTraits.challenge} with their ${celebTraits.challenge}`,
        `Navigate different ${userYinYang === celebYinYang ? 'expression styles' : 'energy levels'}`
      ],
      advice: score > 80
        ? `A highly favorable cosmic connection! You would naturally understand each other's rhythms.`
        : score > 65
        ? `A promising match with room for beautiful growth and mutual inspiration.`
        : `An intriguing connection that offers unique lessons and unexpected chemistry.`,
      luckyDate: this.generateLuckyDate(userDayMaster.element, celebrity.dayMaster)
    };
  },

  // 행운의 만남 날짜 생성
  generateLuckyDate(userElement, celebElement) {
    const luckyDays = {
      wood: ['Monday', 'Thursday'],
      fire: ['Tuesday', 'Sunday'],
      earth: ['Saturday', 'Wednesday'],
      metal: ['Friday', 'Monday'],
      water: ['Wednesday', 'Thursday']
    };
    const day = luckyDays[userElement][Math.floor(Math.random() * 2)];
    const month = ['March', 'April', 'May', 'June', 'July', 'August'][Math.floor(Math.random() * 6)];
    return `${day}s in ${month} 2026`;
  },

  // ============================================
  // 🌟 K-Star Saju Twin Feature (바이럴 핵심 기능)
  // ============================================

  // 매칭 가중치 (PRD 기준)
  MATCHING_WEIGHTS: {
    dayMaster: 40,      // 일간 (가장 중요: 본질적 성격)
    sameElement: 20,    // 같은 오행 (일간 다를 때)
    yearBranch: 15,     // 띠 (12지지)
    popularity: 10      // 인기도 보너스
  },

  // 매칭 등급
  MATCH_GRADES: {
    DESTINY_TWIN: { min: 85, label: '운명적 쌍둥이', labelEn: 'Destiny Twin', stars: 5, emoji: '🌟' },
    SOUL_MATE: { min: 70, label: '영혼의 짝', labelEn: 'Soul Match', stars: 4, emoji: '✨' },
    SAME_ENERGY: { min: 55, label: '같은 기운', labelEn: 'Same Energy', stars: 3, emoji: '💫' },
    SIMILAR: { min: 40, label: '비슷한 에너지', labelEn: 'Similar Vibe', stars: 2, emoji: '🔮' },
    DIFFERENT: { min: 0, label: '다른 길', labelEn: 'Different Path', stars: 1, emoji: '🌙' }
  },

  // 12지지 (띠) 매핑
  yearBranches: ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'],

  // 출생년도에서 띠 계산
  getYearBranch(year) {
    const baseYear = 1900; // 1900년은 쥐띠
    const index = (year - baseYear) % 12;
    return this.yearBranches[index >= 0 ? index : index + 12];
  },

  // K-Star Twin 매칭 점수 계산
  calculateTwinScore(userSaju, celebrity) {
    let score = 0;
    const details = [];

    const userDayMaster = userSaju.dayMaster;
    const celebStem = celebrity.stem;
    const userElement = userDayMaster.element;
    const celebElement = celebrity.dayMaster;

    // 1. 일간 매칭 (40점)
    if (userDayMaster.hanja === celebStem) {
      score += 40;
      details.push({ type: 'dayMaster', points: 40, message: `Same Day Master: ${celebStem}` });
    } else if (userElement === celebElement) {
      score += 20;
      details.push({ type: 'element', points: 20, message: `Same Element: ${celebElement}` });
    }

    // 2. 띠 매칭 (15점)
    const userYear = userSaju.birthYear || new Date().getFullYear() - 25; // fallback
    const celebYear = celebrity.birthYear;
    const userBranch = this.getYearBranch(userYear);
    const celebBranch = this.getYearBranch(celebYear);

    if (userBranch === celebBranch) {
      score += 15;
      details.push({ type: 'yearBranch', points: 15, message: `Same Zodiac: ${userBranch}` });
    } else if (this.isTriangleMatch(userBranch, celebBranch)) {
      score += 8;
      details.push({ type: 'triangle', points: 8, message: `Zodiac Harmony` });
    }

    // 3. 음양 조화 (10점)
    if (userDayMaster.yin === celebrity.yin) {
      score += 10;
      details.push({ type: 'yinyang', points: 10, message: userDayMaster.yin ? 'Both Yin Energy' : 'Both Yang Energy' });
    }

    // 4. 인기도 보너스 (최대 5점)
    const popularityBonus = Math.floor((celebrity.popularity || 80) / 20);
    score += popularityBonus;

    // 점수 보정 (최소 25, 최대 98)
    score = Math.max(25, Math.min(98, score + Math.floor(Math.random() * 10)));

    return {
      score,
      details,
      grade: this.getMatchGrade(score)
    };
  },

  // 삼합 (Triangle Harmony) 체크
  isTriangleMatch(branch1, branch2) {
    const triangles = [
      ['Rat', 'Dragon', 'Monkey'],      // 수삼합
      ['Ox', 'Snake', 'Rooster'],       // 금삼합
      ['Tiger', 'Horse', 'Dog'],        // 화삼합
      ['Rabbit', 'Goat', 'Pig']         // 목삼합
    ];
    return triangles.some(group => group.includes(branch1) && group.includes(branch2));
  },

  // 매칭 등급 결정
  getMatchGrade(score) {
    if (score >= this.MATCH_GRADES.DESTINY_TWIN.min) return this.MATCH_GRADES.DESTINY_TWIN;
    if (score >= this.MATCH_GRADES.SOUL_MATE.min) return this.MATCH_GRADES.SOUL_MATE;
    if (score >= this.MATCH_GRADES.SAME_ENERGY.min) return this.MATCH_GRADES.SAME_ENERGY;
    if (score >= this.MATCH_GRADES.SIMILAR.min) return this.MATCH_GRADES.SIMILAR;
    return this.MATCH_GRADES.DIFFERENT;
  },

  // K-Star 카테고리 (한국 연예인 우선)
  kstarCategories: ['K-Pop', 'Actor', 'Athlete'],

  // 한국 연예인인지 확인
  isKoreanStar(celebrity) {
    // K-Pop, Actor (한국 배우), 한국 운동선수 카테고리
    const koreanCategories = ['K-Pop'];
    const koreanNames = ['손흥민', '김연아', '류현진', '공유', '송혜교', '현빈', '박서준', '이민호', '김태리', '한소희', '수지'];

    if (koreanCategories.includes(celebrity.category)) return true;
    if (koreanNames.includes(celebrity.korean)) return true;
    // 한글 이름이 있으면 한국 연예인으로 간주
    if (celebrity.korean && /[가-힣]/.test(celebrity.korean)) {
      // 외국인 제외 (번역된 이름)
      const foreignNames = ['테일러', '아리아나', '젠데이아', '레오나르도', '마크 저커버그', '버락 오바마', '크리스티아누', '에드 시런', '오사카', '비욘세', '빌리', '엠마', '세레나', '일론', '조 바이든', '더 위켄드', '브루노', '티모시', '오프라', '두아', '제니퍼', '레이디 가가', '아델', '마고', '앙겔라', '리한나', '셀레나', '스칼렛', '시몬'];
      const isForeign = foreignNames.some(name => celebrity.korean.includes(name));
      return !isForeign;
    }
    return false;
  },

  // 최고의 K-Star Twin 찾기 (한국 연예인 우선)
  findBestTwin(userSaju, count = 3) {
    const allMatches = this.data.map(celeb => ({
      celebrity: celeb,
      ...this.calculateTwinScore(userSaju, celeb),
      isKorean: this.isKoreanStar(celeb)
    }));

    // 한국 연예인 우선, 그 다음 점수순 정렬
    return allMatches
      .sort((a, b) => {
        // 한국 연예인 우선
        if (a.isKorean && !b.isKorean) return -1;
        if (!a.isKorean && b.isKorean) return 1;
        // 같은 국적이면 점수순
        return b.score - a.score;
      })
      .slice(0, count);
  },

  // 일간별 매칭 메시지
  getTwinMessage(dayMasterHanja, score) {
    const messages = {
      '甲': {
        high: "You're both natural leaders with strong Yang Wood energy! Like a tall tree, you both have the drive to grow and reach for the sky.",
        medium: "You share the Wood element's creative and growth-oriented nature. Your paths align beautifully."
      },
      '乙': {
        high: "Both of you possess the graceful Yin Wood energy! Like flexible bamboo, you're adaptable yet resilient artists at heart.",
        medium: "You share the Wood element's artistic sensibility. There's a natural creative connection."
      },
      '丙': {
        high: "Twins of the blazing sun! You both radiate Yang Fire's charisma and passion that lights up any room.",
        medium: "Fire energy flows through both of you. Your warmth and enthusiasm are contagious."
      },
      '丁': {
        high: "You share the gentle Yin Fire energy! Like a candle flame, you both illuminate with subtle yet profound brilliance.",
        medium: "The Fire element connects you both with intelligence and quiet passion."
      },
      '戊': {
        high: "Mountain twins! You both embody Yang Earth's reliability and unwavering strength.",
        medium: "Earth energy grounds you both. Stability and trustworthiness define your characters."
      },
      '己': {
        high: "Fertile soil twins! You share Yin Earth's nurturing nature and practical wisdom.",
        medium: "Earth element connects you with groundedness and care for others."
      },
      '庚': {
        high: "Steel twins! Yang Metal energy gives you both decisive action and strong principles.",
        medium: "Metal element connects you with determination and a sense of justice."
      },
      '辛': {
        high: "Precious gem twins! Yin Metal's refinement and sensitivity shine through you both.",
        medium: "Metal element gives you both elegance and attention to detail."
      },
      '壬': {
        high: "Ocean twins! Yang Water's wisdom and adaptability flow through you both.",
        medium: "Water element connects you with deep intuition and flexibility."
      },
      '癸': {
        high: "Rain twins! Yin Water's creativity and spiritual depth unite you both.",
        medium: "Water element blesses you both with imagination and emotional intelligence."
      }
    };

    const stemMessages = messages[dayMasterHanja] || messages['甲'];
    return score >= 70 ? stemMessages.high : stemMessages.medium;
  },

  // 공유 텍스트 생성
  generateShareText(celebrity, score, grade) {
    const text = {
      ko: `🔮 나와 사주가 같은 K-스타는 ${celebrity.korean}!\n\n⭐ 매칭 점수: ${score}%\n${grade.emoji} ${grade.label}\n\n나도 확인하기 👉`,
      en: `🔮 My K-Star Saju Twin is ${celebrity.name}!\n\n⭐ Match Score: ${score}%\n${grade.emoji} ${grade.labelEn}\n\n#KFortunes #Saju #KStar`
    };
    return text;
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Celebrities;
}
