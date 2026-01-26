// Korean Saju (Four Pillars) Calculator
// 사주팔자 계산기

const Saju = {
  // 천간 (Heavenly Stems)
  STEMS: [
    { hanja: '甲', korean: '갑', element: 'wood', yin: false },
    { hanja: '乙', korean: '을', element: 'wood', yin: true },
    { hanja: '丙', korean: '병', element: 'fire', yin: false },
    { hanja: '丁', korean: '정', element: 'fire', yin: true },
    { hanja: '戊', korean: '무', element: 'earth', yin: false },
    { hanja: '己', korean: '기', element: 'earth', yin: true },
    { hanja: '庚', korean: '경', element: 'metal', yin: false },
    { hanja: '辛', korean: '신', element: 'metal', yin: true },
    { hanja: '壬', korean: '임', element: 'water', yin: false },
    { hanja: '癸', korean: '계', element: 'water', yin: true }
  ],

  // 지지 (Earthly Branches)
  BRANCHES: [
    { hanja: '子', korean: '자', animal: 'Rat', element: 'water', yin: false },
    { hanja: '丑', korean: '축', animal: 'Ox', element: 'earth', yin: true },
    { hanja: '寅', korean: '인', animal: 'Tiger', element: 'wood', yin: false },
    { hanja: '卯', korean: '묘', animal: 'Rabbit', element: 'wood', yin: true },
    { hanja: '辰', korean: '진', animal: 'Dragon', element: 'earth', yin: false },
    { hanja: '巳', korean: '사', animal: 'Snake', element: 'fire', yin: true },
    { hanja: '午', korean: '오', animal: 'Horse', element: 'fire', yin: false },
    { hanja: '未', korean: '미', animal: 'Sheep', element: 'earth', yin: true },
    { hanja: '申', korean: '신', animal: 'Monkey', element: 'metal', yin: false },
    { hanja: '酉', korean: '유', animal: 'Rooster', element: 'metal', yin: true },
    { hanja: '戌', korean: '술', animal: 'Dog', element: 'earth', yin: false },
    { hanja: '亥', korean: '해', animal: 'Pig', element: 'water', yin: true }
  ],

  // 오행 (Five Elements)
  ELEMENTS: {
    wood: { korean: '목(木)', color: '#22c55e', generates: 'fire', controls: 'earth' },
    fire: { korean: '화(火)', color: '#ef4444', generates: 'earth', controls: 'metal' },
    earth: { korean: '토(土)', color: '#eab308', generates: 'metal', controls: 'water' },
    metal: { korean: '금(金)', color: '#a1a1aa', generates: 'water', controls: 'wood' },
    water: { korean: '수(水)', color: '#3b82f6', generates: 'wood', controls: 'fire' }
  },

  // 시주 계산을 위한 시간대별 지지 매핑
  HOUR_BRANCHES: [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 0],

  // 년주 계산
  calculateYearPillar(year) {
    const stemIndex = (year - 4) % 10;
    const branchIndex = (year - 4) % 12;
    return {
      stem: this.STEMS[stemIndex],
      branch: this.BRANCHES[branchIndex]
    };
  },

  // 월주 계산 (음력 기준 간략화)
  calculateMonthPillar(year, month) {
    const yearStem = (year - 4) % 10;
    const monthStemBase = (yearStem % 5) * 2;
    const stemIndex = (monthStemBase + month - 1) % 10;
    const branchIndex = (month + 1) % 12;
    return {
      stem: this.STEMS[stemIndex],
      branch: this.BRANCHES[branchIndex]
    };
  },

  // 일주 계산 (간략화된 공식)
  calculateDayPillar(year, month, day) {
    // 기준일: 1900년 1월 31일 = 갑자일
    const baseDate = new Date(1900, 0, 31);
    const targetDate = new Date(year, month - 1, day);
    const diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));

    const stemIndex = ((diffDays % 10) + 10) % 10;
    const branchIndex = ((diffDays % 12) + 12) % 12;

    return {
      stem: this.STEMS[stemIndex],
      branch: this.BRANCHES[branchIndex]
    };
  },

  // 시주 계산
  calculateHourPillar(dayStem, hour) {
    if (hour === null || hour === undefined || hour === '') {
      return null;
    }

    const hourNum = parseInt(hour);
    const branchIndex = this.HOUR_BRANCHES[hourNum];
    const dayStemIndex = this.STEMS.findIndex(s => s.hanja === dayStem.hanja);
    const stemBase = (dayStemIndex % 5) * 2;
    const stemIndex = (stemBase + branchIndex) % 10;

    return {
      stem: this.STEMS[stemIndex],
      branch: this.BRANCHES[branchIndex]
    };
  },

  // 사주팔자 계산
  calculate(year, month, day, hour, gender) {
    const yearPillar = this.calculateYearPillar(year);
    const monthPillar = this.calculateMonthPillar(year, month);
    const dayPillar = this.calculateDayPillar(year, month, day);
    const hourPillar = this.calculateHourPillar(dayPillar.stem, hour);

    // 오행 분석
    const elementCount = this.analyzeElements(yearPillar, monthPillar, dayPillar, hourPillar);

    // 일간 (Day Master) - 가장 중요한 요소
    const dayMaster = dayPillar.stem;

    return {
      fourPillars: {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        hour: hourPillar
      },
      dayMaster,
      elementCount,
      gender,
      interpretation: this.getInterpretation(dayMaster, elementCount, gender)
    };
  },

  // 오행 분석
  analyzeElements(year, month, day, hour) {
    const count = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

    const pillars = [year, month, day];
    if (hour) pillars.push(hour);

    pillars.forEach(pillar => {
      count[pillar.stem.element]++;
      count[pillar.branch.element]++;
    });

    return count;
  },

  // 해석 생성
  getInterpretation(dayMaster, elementCount, gender) {
    const element = dayMaster.element;
    const isYin = dayMaster.yin;

    // 일간별 기본 성격
    const personalities = {
      wood: {
        false: "You are like a tall tree - ambitious, growth-oriented, and natural leader. You have strong willpower and never give up easily.",
        true: "You are like gentle grass - flexible, artistic, and adaptable. You grow around obstacles rather than fighting them."
      },
      fire: {
        false: "You are like the sun - warm, passionate, and charismatic. You light up any room and inspire others.",
        true: "You are like candlelight - warm, nurturing, and detail-oriented. You bring comfort to those around you."
      },
      earth: {
        false: "You are like a mountain - stable, reliable, and trustworthy. People depend on you for support.",
        true: "You are like fertile soil - nurturing, patient, and productive. You help others grow."
      },
      metal: {
        false: "You are like a sword - decisive, principled, and righteous. You have a strong sense of justice.",
        true: "You are like a jewel - refined, elegant, and detail-oriented. You appreciate beauty and quality."
      },
      water: {
        false: "You are like the ocean - deep, wise, and resourceful. You can adapt to any situation.",
        true: "You are like a gentle stream - intuitive, empathetic, and flowing. You connect with others easily."
      }
    };

    // 가장 강한/약한 오행 찾기
    const sortedElements = Object.entries(elementCount).sort((a, b) => b[1] - a[1]);
    const strongest = sortedElements[0][0];
    const weakest = sortedElements[sortedElements.length - 1][0];

    // 직업 추천
    const careers = {
      wood: ["Education", "Writing", "Fashion", "Environment", "Healthcare"],
      fire: ["Marketing", "Entertainment", "Politics", "Sports", "Media"],
      earth: ["Real Estate", "Agriculture", "Construction", "Finance", "HR"],
      metal: ["Technology", "Law", "Engineering", "Finance", "Military"],
      water: ["Consulting", "Research", "Travel", "Trade", "Arts"]
    };

    // 연애 스타일
    const loveStyles = {
      wood: "You seek growth and intellectual connection in relationships. You need a partner who supports your ambitions.",
      fire: "You're passionate and expressive in love. You need excitement and emotional connection.",
      earth: "You're loyal and committed. You seek stability and long-term security in relationships.",
      metal: "You're principled in love. You have high standards and seek a refined, quality relationship.",
      water: "You're deeply emotional and intuitive. You seek a soulful, understanding connection."
    };

    // 행운의 요소
    const luckyElement = this.ELEMENTS[element].generates;
    const unluckyElement = Object.keys(this.ELEMENTS).find(
      e => this.ELEMENTS[e].controls === element
    );

    return {
      personality: personalities[element][isYin],
      career: careers[strongest],
      love: loveStyles[element],
      strength: `Your ${this.ELEMENTS[strongest].korean} energy is strong, giving you ${this.getElementStrength(strongest)}.`,
      weakness: `Your ${this.ELEMENTS[weakest].korean} energy needs attention. Consider ${this.getElementAdvice(weakest)}.`,
      luckyElement: {
        element: luckyElement,
        korean: this.ELEMENTS[luckyElement].korean,
        color: this.ELEMENTS[luckyElement].color
      },
      unluckyElement: {
        element: unluckyElement,
        korean: this.ELEMENTS[unluckyElement].korean
      },
      luckyNumbers: this.getLuckyNumbers(element),
      luckyColors: this.getLuckyColors(luckyElement),
      luckyDirection: this.getLuckyDirection(luckyElement)
    };
  },

  getElementStrength(element) {
    const strengths = {
      wood: "creativity and growth potential",
      fire: "charisma and leadership",
      earth: "stability and trustworthiness",
      metal: "precision and determination",
      water: "wisdom and adaptability"
    };
    return strengths[element];
  },

  getElementAdvice(element) {
    const advice = {
      wood: "spending time in nature and pursuing creative hobbies",
      fire: "expressing yourself more and seeking joy",
      earth: "building routines and seeking stability",
      metal: "setting clear goals and organizing your life",
      water: "reflecting more and trusting your intuition"
    };
    return advice[element];
  },

  getLuckyNumbers(element) {
    const numbers = {
      wood: [3, 8],
      fire: [2, 7],
      earth: [5, 10],
      metal: [4, 9],
      water: [1, 6]
    };
    return numbers[element];
  },

  getLuckyColors(element) {
    const colors = {
      wood: ["Green", "Brown"],
      fire: ["Red", "Pink", "Orange"],
      earth: ["Yellow", "Brown", "Beige"],
      metal: ["White", "Gold", "Silver"],
      water: ["Blue", "Black", "Navy"]
    };
    return colors[element];
  },

  getLuckyDirection(element) {
    const directions = {
      wood: "East",
      fire: "South",
      earth: "Center",
      metal: "West",
      water: "North"
    };
    return directions[element];
  },

  // 궁합 계산
  calculateCompatibility(person1, person2) {
    const p1 = this.calculate(person1.year, person1.month, person1.day, person1.hour, person1.gender);
    const p2 = this.calculate(person2.year, person2.month, person2.day, person2.hour, person2.gender);

    let score = 50; // 기본 점수

    const e1 = p1.dayMaster.element;
    const e2 = p2.dayMaster.element;

    // 상생 관계 (서로 생해주는 관계)
    if (this.ELEMENTS[e1].generates === e2 || this.ELEMENTS[e2].generates === e1) {
      score += 25;
    }

    // 같은 오행
    if (e1 === e2) {
      score += 15;
    }

    // 상극 관계 (충돌)
    if (this.ELEMENTS[e1].controls === e2 || this.ELEMENTS[e2].controls === e1) {
      score -= 15;
    }

    // 음양 조화
    if (p1.dayMaster.yin !== p2.dayMaster.yin) {
      score += 10;
    }

    // 띠 궁합 (삼합)
    const triads = [
      ['Rat', 'Dragon', 'Monkey'],
      ['Ox', 'Snake', 'Rooster'],
      ['Tiger', 'Horse', 'Dog'],
      ['Rabbit', 'Sheep', 'Pig']
    ];

    const animal1 = p1.fourPillars.year.branch.animal;
    const animal2 = p2.fourPillars.year.branch.animal;

    for (const triad of triads) {
      if (triad.includes(animal1) && triad.includes(animal2)) {
        score += 10;
        break;
      }
    }

    // 점수 범위 제한
    score = Math.max(20, Math.min(100, score));

    return {
      score,
      person1: p1,
      person2: p2,
      analysis: this.getCompatibilityAnalysis(score, p1, p2)
    };
  },

  getCompatibilityAnalysis(score, p1, p2) {
    let rating, emoji, description;

    if (score >= 85) {
      rating = "Excellent";
      emoji = "💕";
      description = "A heavenly match! Your energies complement each other perfectly.";
    } else if (score >= 70) {
      rating = "Very Good";
      emoji = "💖";
      description = "Strong compatibility with great potential for lasting harmony.";
    } else if (score >= 55) {
      rating = "Good";
      emoji = "💗";
      description = "Solid foundation with room for growth through understanding.";
    } else if (score >= 40) {
      rating = "Moderate";
      emoji = "💛";
      description = "Requires effort but can work with mutual respect and patience.";
    } else {
      rating = "Challenging";
      emoji = "🤔";
      description = "Different energies may create friction, but opposites can attract!";
    }

    return {
      rating,
      emoji,
      description,
      strengths: this.getRelationshipStrengths(p1, p2),
      challenges: this.getRelationshipChallenges(p1, p2)
    };
  },

  getRelationshipStrengths(p1, p2) {
    const strengths = [];
    const e1 = p1.dayMaster.element;
    const e2 = p2.dayMaster.element;

    if (this.ELEMENTS[e1].generates === e2) {
      strengths.push(`Person 1's ${this.ELEMENTS[e1].korean} nurtures Person 2's ${this.ELEMENTS[e2].korean}`);
    }
    if (this.ELEMENTS[e2].generates === e1) {
      strengths.push(`Person 2's ${this.ELEMENTS[e2].korean} nurtures Person 1's ${this.ELEMENTS[e1].korean}`);
    }
    if (p1.dayMaster.yin !== p2.dayMaster.yin) {
      strengths.push("Balanced Yin-Yang energy creates harmony");
    }
    if (e1 === e2) {
      strengths.push(`Shared ${this.ELEMENTS[e1].korean} element creates deep understanding`);
    }

    if (strengths.length === 0) {
      strengths.push("Different perspectives can bring growth");
    }

    return strengths;
  },

  getRelationshipChallenges(p1, p2) {
    const challenges = [];
    const e1 = p1.dayMaster.element;
    const e2 = p2.dayMaster.element;

    if (this.ELEMENTS[e1].controls === e2) {
      challenges.push(`Person 1's ${this.ELEMENTS[e1].korean} may overwhelm Person 2's ${this.ELEMENTS[e2].korean}`);
    }
    if (this.ELEMENTS[e2].controls === e1) {
      challenges.push(`Person 2's ${this.ELEMENTS[e2].korean} may overwhelm Person 1's ${this.ELEMENTS[e1].korean}`);
    }
    if (p1.dayMaster.yin === p2.dayMaster.yin) {
      challenges.push("Similar Yin/Yang energy may need balance");
    }

    if (challenges.length === 0) {
      challenges.push("Minor adjustments may be needed for perfect harmony");
    }

    return challenges;
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Saju;
}
