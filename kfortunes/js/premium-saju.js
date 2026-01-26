// KStar Match Premium Saju Readings
// 프리미엄 사주 해석 시스템

const PremiumSaju = {
  // 프리미엄 가격
  PRICE: 4.99,
  CURRENCY: 'USD',

  // 일간별 상세 해석 (무료 버전용 확장)
  dayMasterDetails: {
    wood: {
      false: { // 갑목 (Yang Wood)
        nature: "Great Tree (大木)",
        description: "You are the towering pine tree standing firm on the mountain peak. Your ambition reaches toward the heavens, and your roots run deep with determination.",
        coreTraits: ["Natural leadership", "Strong willpower", "Growth-oriented mindset", "Protective instincts", "Pioneer spirit"],
        hiddenTalents: ["Strategic thinking", "Long-term planning", "Mentoring abilities"],
        lifeTheme: "Building lasting legacies and nurturing growth in others",
        bestYears: "Ages 30-50 when your wisdom and experience align",
        karmaLesson: "Learning to bend without breaking, accepting help from others"
      },
      true: { // 을목 (Yin Wood)
        nature: "Graceful Vine (藤木)",
        description: "You are the elegant vine that finds its way around any obstacle. Your adaptability is your greatest strength, and beauty flows through everything you do.",
        coreTraits: ["Artistic sensitivity", "Diplomatic nature", "Resilient flexibility", "Intuitive intelligence", "Gentle persistence"],
        hiddenTalents: ["Creative problem solving", "Emotional intelligence", "Aesthetic vision"],
        lifeTheme: "Creating beauty and harmony while navigating life's complexities",
        bestYears: "Ages 25-45 when creativity peaks",
        karmaLesson: "Standing firm in your truth while maintaining your gentle nature"
      }
    },
    fire: {
      false: { // 병화 (Yang Fire)
        nature: "Radiant Sun (太陽)",
        description: "You are the magnificent sun illuminating all of existence. Your warmth touches everyone, and your presence commands attention naturally.",
        coreTraits: ["Charismatic presence", "Generous spirit", "Passionate enthusiasm", "Natural optimism", "Inspiring leadership"],
        hiddenTalents: ["Public speaking", "Motivating others", "Vision casting"],
        lifeTheme: "Spreading light and inspiration to transform the world",
        bestYears: "Ages 20-40 when your fire burns brightest",
        karmaLesson: "Learning that even the sun must set, allowing others to shine"
      },
      true: { // 정화 (Yin Fire)
        nature: "Warm Candlelight (燭火)",
        description: "You are the intimate candlelight that creates sanctuary in darkness. Your warmth is personal, your light is focused, and your care is profound.",
        coreTraits: ["Nurturing warmth", "Detail-oriented", "Passionate dedication", "Emotional depth", "Refined elegance"],
        hiddenTalents: ["Creating intimate connections", "Precision work", "Emotional healing"],
        lifeTheme: "Providing comfort and guidance to those in your inner circle",
        bestYears: "Ages 30-50 when emotional maturity deepens",
        karmaLesson: "Balancing giving with receiving, not burning yourself out"
      }
    },
    earth: {
      false: { // 무토 (Yang Earth)
        nature: "Majestic Mountain (大山)",
        description: "You are the unmovable mountain that has stood for millennia. Your stability provides shelter, and your presence brings certainty to uncertain times.",
        coreTraits: ["Unshakeable reliability", "Protective strength", "Patient endurance", "Practical wisdom", "Grounding presence"],
        hiddenTalents: ["Crisis management", "Building institutions", "Long-term investments"],
        lifeTheme: "Being the foundation upon which others can build their dreams",
        bestYears: "Ages 40-60 when stability is most valued",
        karmaLesson: "Learning to move and change when necessary, avoiding stagnation"
      },
      true: { // 기토 (Yin Earth)
        nature: "Fertile Garden (田土)",
        description: "You are the nurturing garden soil that brings forth life. Everything you touch has the potential to grow, and your patience yields abundant harvests.",
        coreTraits: ["Nurturing patience", "Productive mindset", "Supportive nature", "Careful planning", "Generous giving"],
        hiddenTalents: ["Developing talent in others", "Resource management", "Creating systems"],
        lifeTheme: "Cultivating growth and abundance in all areas of life",
        bestYears: "Ages 35-55 when your investments mature",
        karmaLesson: "Knowing when to harvest and when to let things go"
      }
    },
    metal: {
      false: { // 경금 (Yang Metal)
        nature: "Righteous Sword (大劍)",
        description: "You are the legendary sword that cuts through illusion to reveal truth. Your justice is unwavering, and your decisions are final and fair.",
        coreTraits: ["Strong principles", "Decisive action", "Righteous judgment", "Ambitious drive", "Competitive spirit"],
        hiddenTalents: ["Strategic warfare", "System optimization", "Quality control"],
        lifeTheme: "Fighting for justice and cutting away what no longer serves",
        bestYears: "Ages 35-55 when authority is established",
        karmaLesson: "Tempering strength with mercy, understanding shades of gray"
      },
      true: { // 신금 (Yin Metal)
        nature: "Precious Jewel (寶石)",
        description: "You are the refined jewel that has been polished through pressure. Your beauty is rare, your standards are high, and your value is undeniable.",
        coreTraits: ["Refined taste", "Perfectionist standards", "Elegant expression", "Sensitive perception", "Artistic appreciation"],
        hiddenTalents: ["Quality assessment", "Aesthetic design", "Detailed craftsmanship"],
        lifeTheme: "Pursuing excellence and creating lasting beauty",
        bestYears: "Ages 30-50 when refinement reaches its peak",
        karmaLesson: "Accepting imperfection in yourself and others"
      }
    },
    water: {
      false: { // 임수 (Yang Water)
        nature: "Vast Ocean (大海)",
        description: "You are the boundless ocean containing infinite depths. Your wisdom is vast, your adaptability is legendary, and your influence touches distant shores.",
        coreTraits: ["Deep wisdom", "Vast perspective", "Powerful adaptability", "Mysterious depth", "Global thinking"],
        hiddenTalents: ["Strategic patience", "Reading situations", "Connecting disparate ideas"],
        lifeTheme: "Accumulating wisdom and flowing toward the greatest good",
        bestYears: "Ages 40-60 when wisdom is most profound",
        karmaLesson: "Learning to have boundaries, not absorbing everyone's problems"
      },
      true: { // 계수 (Yin Water)
        nature: "Gentle Stream (溪水)",
        description: "You are the gentle stream that nourishes everything it touches. Your intuition runs deep, your empathy knows no bounds, and your path finds the way.",
        coreTraits: ["Intuitive knowing", "Empathetic connection", "Gentle persistence", "Adaptable flow", "Creative imagination"],
        hiddenTalents: ["Psychic sensitivity", "Healing presence", "Artistic expression"],
        lifeTheme: "Following intuition to nourish and heal the world",
        bestYears: "Ages 25-45 when intuition is strongest",
        karmaLesson: "Maintaining your own direction, not being pulled by others' currents"
      }
    }
  },

  // 10년 대운 (Premium Only)
  generateDecadeForecast(sajuResult, currentYear) {
    const forecasts = [];
    const dayMaster = sajuResult.dayMaster;
    const baseElement = dayMaster.element;

    for (let i = 0; i < 10; i++) {
      const year = currentYear + i;
      const yearPillar = Saju.calculateYearPillar(year);
      const yearElement = yearPillar.stem.element;

      let luck, advice, focus;

      // 상생/상극 관계로 운세 결정
      if (Saju.ELEMENTS[yearElement].generates === baseElement) {
        luck = "Excellent";
        advice = "This year supports your growth. Take bold actions and pursue opportunities.";
        focus = ["Career advancement", "New beginnings", "Investment"];
      } else if (Saju.ELEMENTS[baseElement].generates === yearElement) {
        luck = "Good";
        advice = "A year of giving and teaching. Share your wisdom and support others.";
        focus = ["Mentoring", "Relationships", "Creative projects"];
      } else if (yearElement === baseElement) {
        luck = "Neutral";
        advice = "A year of self-reflection and consolidation. Strengthen your foundations.";
        focus = ["Self-improvement", "Health", "Planning"];
      } else if (Saju.ELEMENTS[yearElement].controls === baseElement) {
        luck = "Challenging";
        advice = "A year requiring patience and wisdom. Avoid major risks.";
        focus = ["Caution", "Learning", "Inner growth"];
      } else {
        luck = "Variable";
        advice = "Mixed energies require adaptability. Stay flexible and observant.";
        focus = ["Balance", "Adaptation", "Observation"];
      }

      forecasts.push({
        year,
        animal: yearPillar.branch.animal,
        element: yearElement,
        luck,
        advice,
        focus,
        luckyMonths: this.getLuckyMonths(baseElement, yearElement),
        cautionMonths: this.getCautionMonths(baseElement, yearElement)
      });
    }

    return forecasts;
  },

  getLuckyMonths(baseElement, yearElement) {
    // 상생 월 계산
    const generatingElement = Object.keys(Saju.ELEMENTS).find(
      e => Saju.ELEMENTS[e].generates === baseElement
    );
    // 간단히 계절 기반으로 반환
    const monthMap = {
      wood: [2, 3, 4],
      fire: [5, 6, 7],
      earth: [3, 6, 9, 12],
      metal: [8, 9, 10],
      water: [11, 12, 1]
    };
    return monthMap[generatingElement] || [1, 6, 12];
  },

  getCautionMonths(baseElement, yearElement) {
    const controllingElement = Object.keys(Saju.ELEMENTS).find(
      e => Saju.ELEMENTS[e].controls === baseElement
    );
    const monthMap = {
      wood: [2, 3, 4],
      fire: [5, 6, 7],
      earth: [3, 6, 9, 12],
      metal: [8, 9, 10],
      water: [11, 12, 1]
    };
    return monthMap[controllingElement] || [4, 7, 10];
  },

  // 상세 직업 분석 (Premium Only)
  generateCareerAnalysis(sajuResult) {
    const dayMaster = sajuResult.dayMaster;
    const element = dayMaster.element;
    const elementCount = sajuResult.elementCount;

    const careerDetails = {
      wood: {
        idealFields: ["Education", "Publishing", "Fashion Design", "Environmental Science", "Healthcare", "Counseling", "Architecture", "Startups"],
        strengths: "Innovation, growth mindset, ability to develop new ideas and nurture projects from conception",
        workStyle: "Prefers autonomy and growth opportunities. Thrives in environments that allow for creativity and expansion.",
        leadership: "Natural mentor who leads by example and inspires growth in team members",
        bestRoles: ["Founder/CEO", "Creative Director", "Teacher/Professor", "Counselor", "Designer"],
        avoidRoles: ["Repetitive administrative work", "Highly structured environments", "Jobs requiring conformity"],
        timingAdvice: "Best to start new ventures in spring (Feb-Apr). Avoid major career changes in autumn."
      },
      fire: {
        idealFields: ["Marketing", "Entertainment", "Politics", "Sports", "Media", "Public Relations", "Sales", "Motivational Speaking"],
        strengths: "Charisma, enthusiasm, ability to inspire and motivate others, natural presentation skills",
        workStyle: "Needs excitement and variety. Performs best when passionate about the work and in the spotlight.",
        leadership: "Charismatic leader who energizes teams and drives ambitious goals",
        bestRoles: ["Marketing Director", "Performer/Actor", "Sales Leader", "Public Speaker", "Entrepreneur"],
        avoidRoles: ["Behind-the-scenes work", "Highly analytical roles", "Isolated positions"],
        timingAdvice: "Peak performance in summer (May-Jul). Plan major presentations for this period."
      },
      earth: {
        idealFields: ["Real Estate", "Finance", "Agriculture", "Construction", "Human Resources", "Healthcare Administration", "Insurance", "Property Management"],
        strengths: "Reliability, patience, ability to build lasting structures and relationships, trustworthiness",
        workStyle: "Prefers stability and long-term projects. Excels in building systems and managing resources.",
        leadership: "Dependable leader who creates stable, trusting environments for teams",
        bestRoles: ["CFO", "HR Director", "Project Manager", "Real Estate Developer", "Operations Manager"],
        avoidRoles: ["High-risk ventures", "Rapidly changing environments", "Short-term projects"],
        timingAdvice: "Transitions between seasons (Mar, Jun, Sep, Dec) are your power periods."
      },
      metal: {
        idealFields: ["Technology", "Law", "Engineering", "Finance", "Military/Police", "Quality Assurance", "Surgery", "Precision Manufacturing"],
        strengths: "Precision, determination, ability to make tough decisions, strong sense of justice",
        workStyle: "Thrives in structured environments with clear goals. Excels at optimization and quality control.",
        leadership: "Decisive leader with high standards who drives excellence and accountability",
        bestRoles: ["CTO", "Lawyer/Judge", "Engineer", "Surgeon", "Quality Director", "Military Officer"],
        avoidRoles: ["Ambiguous roles", "Highly emotional environments", "Jobs requiring flexibility"],
        timingAdvice: "Autumn (Aug-Oct) is your peak season. Ideal for negotiations and important decisions."
      },
      water: {
        idealFields: ["Consulting", "Research", "International Trade", "Travel/Tourism", "Psychology", "Arts", "Technology", "Diplomacy"],
        strengths: "Adaptability, wisdom, ability to connect ideas and people, intuitive problem-solving",
        workStyle: "Flexible and adaptable. Excels in dynamic environments requiring creative problem-solving.",
        leadership: "Wise leader who navigates complexity and connects diverse teams and ideas",
        bestRoles: ["Consultant", "Researcher", "Diplomat", "Psychologist", "Artist", "Trader"],
        avoidRoles: ["Rigid hierarchies", "Routine work", "Isolated positions"],
        timingAdvice: "Winter (Nov-Jan) enhances your intuition. Best time for planning and strategy."
      }
    };

    return {
      ...careerDetails[element],
      currentBalance: this.analyzeCareerBalance(elementCount),
      salaryPotential: this.getSalaryPotential(element, elementCount),
      entrepreneurScore: this.getEntrepreneurScore(elementCount)
    };
  },

  analyzeCareerBalance(elementCount) {
    const total = Object.values(elementCount).reduce((a, b) => a + b, 0);
    const balance = {};
    for (const [elem, count] of Object.entries(elementCount)) {
      balance[elem] = Math.round((count / total) * 100);
    }
    return balance;
  },

  getSalaryPotential(element, elementCount) {
    // 금(Metal)과 수(Water)가 강하면 재물운 좋음
    const wealthScore = (elementCount.metal * 2 + elementCount.water * 1.5) / 10;
    if (wealthScore > 1) return "High earning potential - focus on negotiation";
    if (wealthScore > 0.5) return "Moderate earning potential - build skills for advancement";
    return "Steady income likely - consider side ventures for additional income";
  },

  getEntrepreneurScore(elementCount) {
    // 목(Wood)과 화(Fire)가 강하면 창업 적합
    const score = (elementCount.wood * 2 + elementCount.fire * 2 + elementCount.metal) / 10;
    if (score > 1) return { score: "High", advice: "Strong entrepreneurial energy - consider starting your own venture" };
    if (score > 0.6) return { score: "Moderate", advice: "Can succeed with proper partnership and planning" };
    return { score: "Low", advice: "Better suited for established organizations - consider intrapreneurship" };
  },

  // 상세 연애/결혼 분석 (Premium Only)
  generateLoveAnalysis(sajuResult) {
    const dayMaster = sajuResult.dayMaster;
    const element = dayMaster.element;
    const isYin = dayMaster.yin;
    const gender = sajuResult.gender;

    const loveDetails = {
      wood: {
        loveStyle: "You approach love like nurturing a garden - with patience, care, and expectation of growth. You need intellectual stimulation and shared dreams.",
        idealPartner: "Someone who supports your ambitions while having their own goals. Fire or Water elements complement you best.",
        attractionPattern: "You're attracted to passion (Fire) and wisdom (Water). Avoid partners who try to control you (Metal).",
        marriageTiming: "Best years for marriage: ages 26-32. Spring weddings are most auspicious.",
        challenges: "May prioritize career over relationship. Need to balance ambition with emotional availability.",
        intimacyStyle: "Romantic and creative. Values emotional connection and growth together.",
        redFlags: "Partners who stifle your growth, lack ambition, or are overly critical"
      },
      fire: {
        loveStyle: "You love passionately and expressively. Romance should feel exciting, and you need a partner who can match your intensity.",
        idealPartner: "Someone who appreciates your warmth and can handle your intensity. Earth or Wood elements balance you well.",
        attractionPattern: "Drawn to stability (Earth) and growth potential (Wood). May clash with Water's dampening energy.",
        marriageTiming: "Best years for marriage: ages 24-30. Summer celebrations suit your energy.",
        challenges: "May burn too hot too fast. Need to maintain passion while building lasting foundation.",
        intimacyStyle: "Passionate and expressive. Needs excitement and emotional connection.",
        redFlags: "Cold or emotionally distant partners, those who try to dim your light"
      },
      earth: {
        loveStyle: "You approach love with commitment and patience. Security and loyalty are paramount - you build relationships to last.",
        idealPartner: "Someone reliable and committed. Fire brings excitement, Metal brings refinement to your relationship.",
        attractionPattern: "Attracted to passion (Fire) and quality (Metal). May struggle with Water's unpredictability.",
        marriageTiming: "Best years for marriage: ages 28-35. Traditional ceremonies honor your values.",
        challenges: "May become too comfortable or resistant to change. Keep the spark alive.",
        intimacyStyle: "Sensual and devoted. Values physical comfort and long-term security.",
        redFlags: "Unreliable partners, those who avoid commitment, excessive risk-takers"
      },
      metal: {
        loveStyle: "You have high standards in love and seek quality over quantity. Loyalty and integrity are non-negotiable.",
        idealPartner: "Someone who meets your standards while softening your edges. Water nurtures you, Earth grounds you.",
        attractionPattern: "Drawn to depth (Water) and stability (Earth). May struggle with Wood's free spirit.",
        marriageTiming: "Best years for marriage: ages 27-33. Autumn weddings reflect your refined taste.",
        challenges: "High standards may limit options. Learn to see potential in partners.",
        intimacyStyle: "Refined and quality-focused. Values loyalty and mutual respect.",
        redFlags: "Dishonest partners, those who lack principles, emotionally chaotic people"
      },
      water: {
        loveStyle: "You love deeply and intuitively. Emotional connection and understanding are essential - you seek a soulmate.",
        idealPartner: "Someone emotionally intelligent who can match your depth. Wood inspires you, Metal structures you.",
        attractionPattern: "Attracted to growth (Wood) and strength (Metal). Fire's intensity may overwhelm you.",
        marriageTiming: "Best years for marriage: ages 25-31. Winter or waterside ceremonies suit you.",
        challenges: "May absorb partner's emotions too much. Maintain your own identity.",
        intimacyStyle: "Deeply emotional and intuitive. Seeks spiritual and emotional union.",
        redFlags: "Emotionally unavailable partners, those who dismiss your intuition"
      }
    };

    return {
      ...loveDetails[element],
      compatibleElements: this.getCompatibleElements(element),
      currentLoveLuck: this.getCurrentLoveLuck(sajuResult),
      marriageYearAnalysis: this.getMarriageYearAnalysis(sajuResult)
    };
  },

  getCompatibleElements(element) {
    const compatibility = {
      wood: { best: ["water", "fire"], good: ["wood"], challenging: ["metal", "earth"] },
      fire: { best: ["wood", "earth"], good: ["fire"], challenging: ["water", "metal"] },
      earth: { best: ["fire", "metal"], good: ["earth"], challenging: ["wood", "water"] },
      metal: { best: ["earth", "water"], good: ["metal"], challenging: ["fire", "wood"] },
      water: { best: ["metal", "wood"], good: ["water"], challenging: ["earth", "fire"] }
    };
    return compatibility[element];
  },

  getCurrentLoveLuck(sajuResult) {
    const year = new Date().getFullYear();
    const yearPillar = Saju.calculateYearPillar(year);
    const dayMaster = sajuResult.dayMaster;

    if (Saju.ELEMENTS[yearPillar.stem.element].generates === dayMaster.element) {
      return { level: "Excellent", advice: "Great year for meeting someone special or deepening existing relationships" };
    } else if (dayMaster.element === yearPillar.stem.element) {
      return { level: "Good", advice: "Focus on self-love and clarity about what you want in relationships" };
    } else {
      return { level: "Moderate", advice: "Focus on personal growth; love will follow when you're ready" };
    }
  },

  getMarriageYearAnalysis(sajuResult) {
    const currentYear = new Date().getFullYear();
    const goodYears = [];

    for (let i = 0; i < 5; i++) {
      const year = currentYear + i;
      const yearPillar = Saju.calculateYearPillar(year);
      if (Saju.ELEMENTS[yearPillar.stem.element].generates === sajuResult.dayMaster.element ||
          yearPillar.stem.element === sajuResult.dayMaster.element) {
        goodYears.push({ year, reason: `${yearPillar.branch.animal} year supports your energy` });
      }
    }

    return goodYears.length > 0 ? goodYears : [{ year: currentYear + 2, reason: "Neutral year - focus on relationship quality" }];
  },

  // 프리미엄 보고서 생성 (결제 후)
  generatePremiumReport(sajuResult) {
    const currentYear = new Date().getFullYear();

    return {
      generatedAt: new Date().toISOString(),
      basicInfo: {
        dayMaster: sajuResult.dayMaster,
        fourPillars: sajuResult.fourPillars,
        elementBalance: sajuResult.elementCount
      },
      detailedPersonality: this.dayMasterDetails[sajuResult.dayMaster.element][sajuResult.dayMaster.yin],
      decadeForecast: this.generateDecadeForecast(sajuResult, currentYear),
      careerAnalysis: this.generateCareerAnalysis(sajuResult),
      loveAnalysis: this.generateLoveAnalysis(sajuResult),
      healthAdvice: this.generateHealthAdvice(sajuResult),
      luckyElements: this.generateLuckyElements(sajuResult),
      monthlyForecast: this.generateMonthlyForecast(sajuResult, currentYear),
      specialAdvice: this.generateSpecialAdvice(sajuResult)
    };
  },

  generateHealthAdvice(sajuResult) {
    const element = sajuResult.dayMaster.element;
    const healthMap = {
      wood: {
        organs: "Liver, Gallbladder, Eyes",
        strengths: "Good regenerative ability and flexibility",
        weaknesses: "Prone to stress-related issues, eye strain, muscle tension",
        advice: "Practice stretching, spend time in nature, protect your eyes from screens",
        bestExercise: "Yoga, hiking, swimming",
        dietTips: "Green vegetables, sour foods help balance. Reduce alcohol."
      },
      fire: {
        organs: "Heart, Small Intestine, Blood circulation",
        strengths: "Strong vitality and enthusiasm",
        weaknesses: "Prone to burnout, heart palpitations, insomnia",
        advice: "Manage stress, get adequate rest, practice meditation",
        bestExercise: "Cardio in moderation, dancing, team sports",
        dietTips: "Bitter foods help balance. Stay hydrated. Avoid excessive spicy food."
      },
      earth: {
        organs: "Stomach, Spleen, Digestive system",
        strengths: "Good constitution and stamina",
        weaknesses: "Prone to digestive issues, weight gain, worry",
        advice: "Maintain regular eating schedule, avoid overthinking, gentle exercise",
        bestExercise: "Walking, tai chi, gentle yoga",
        dietTips: "Sweet foods in moderation. Eat warm, cooked foods. Avoid raw cold foods."
      },
      metal: {
        organs: "Lungs, Large Intestine, Skin",
        strengths: "Strong immune foundation",
        weaknesses: "Prone to respiratory issues, skin problems, grief",
        advice: "Practice deep breathing, protect from dry air, process emotions",
        bestExercise: "Breathing exercises, martial arts, mountain hiking",
        dietTips: "Pungent foods help. Include garlic, ginger. Keep lungs moist."
      },
      water: {
        organs: "Kidneys, Bladder, Bones",
        strengths: "Good adaptability and recovery",
        weaknesses: "Prone to kidney issues, bone problems, fear/anxiety",
        advice: "Stay warm, protect lower back, maintain good sleep habits",
        bestExercise: "Swimming, water aerobics, gentle stretching",
        dietTips: "Salty foods in moderation. Black foods (beans, sesame) support kidneys."
      }
    };
    return healthMap[element];
  },

  generateLuckyElements(sajuResult) {
    const element = sajuResult.dayMaster.element;
    const luckyElement = Saju.ELEMENTS[element].generates;

    return {
      luckyColors: Saju.getLuckyColors(luckyElement),
      luckyNumbers: Saju.getLuckyNumbers(element),
      luckyDirection: Saju.getLuckyDirection(luckyElement),
      luckyDays: this.getLuckyDays(element),
      luckyItems: this.getLuckyItems(luckyElement),
      luckyActivities: this.getLuckyActivities(luckyElement)
    };
  },

  getLuckyDays(element) {
    const dayMap = {
      wood: ["Thursday (木요일)", "Friday"],
      fire: ["Tuesday (火요일)", "Sunday"],
      earth: ["Saturday (土요일)", "Wednesday"],
      metal: ["Friday (金요일)", "Monday"],
      water: ["Wednesday (水요일)", "Monday"]
    };
    return dayMap[element];
  },

  getLuckyItems(element) {
    const itemMap = {
      wood: ["Plants", "Wooden jewelry", "Green jade", "Books"],
      fire: ["Candles", "Red accessories", "Crystals", "Artwork"],
      earth: ["Ceramics", "Yellow/brown stones", "Square shapes", "Maps"],
      metal: ["Silver jewelry", "White accessories", "Coins", "Bells"],
      water: ["Water features", "Blue gems", "Mirrors", "Flowing fabrics"]
    };
    return itemMap[element];
  },

  getLuckyActivities(element) {
    const activityMap = {
      wood: ["Gardening", "Learning new skills", "Morning walks", "Creative writing"],
      fire: ["Social gatherings", "Presentations", "Outdoor activities", "Cooking"],
      earth: ["Meditation", "Organizing", "Cooking", "Family time"],
      metal: ["Decluttering", "Financial planning", "Precision crafts", "Music"],
      water: ["Swimming", "Reading", "Journaling", "Night walks"]
    };
    return activityMap[element];
  },

  generateMonthlyForecast(sajuResult, year) {
    const months = [];
    const dayMaster = sajuResult.dayMaster;

    for (let month = 1; month <= 12; month++) {
      const monthPillar = Saju.calculateMonthPillar(year, month);
      const monthElement = monthPillar.stem.element;

      let rating, focus;
      if (Saju.ELEMENTS[monthElement].generates === dayMaster.element) {
        rating = 5;
        focus = "Excellent month for progress and new beginnings";
      } else if (dayMaster.element === monthElement) {
        rating = 4;
        focus = "Good month for self-reflection and consolidation";
      } else if (Saju.ELEMENTS[dayMaster.element].generates === monthElement) {
        rating = 3;
        focus = "Month for giving back and supporting others";
      } else if (Saju.ELEMENTS[monthElement].controls === dayMaster.element) {
        rating = 2;
        focus = "Challenging month - proceed with caution";
      } else {
        rating = 3;
        focus = "Neutral month - stay adaptable";
      }

      months.push({ month, rating, focus, element: monthElement });
    }

    return months;
  },

  generateSpecialAdvice(sajuResult) {
    const element = sajuResult.dayMaster.element;
    const gender = sajuResult.gender;

    return {
      lifeMotto: this.getLifeMotto(element),
      avoidances: this.getAvoidances(element),
      bestDecisions: this.getBestDecisionTimes(element),
      spiritualPath: this.getSpiritualPath(element),
      legacyAdvice: this.getLegacyAdvice(element, gender)
    };
  },

  getLifeMotto(element) {
    const mottos = {
      wood: "Grow without limits, bend without breaking",
      fire: "Shine your light, warm the world",
      earth: "Build foundations that last generations",
      metal: "Cut through illusion, forge your path",
      water: "Flow with wisdom, adapt with grace"
    };
    return mottos[element];
  },

  getAvoidances(element) {
    const avoid = {
      wood: ["Rigid environments", "Controlling people", "Autumn major decisions"],
      fire: ["Cold relationships", "Isolation", "Winter major decisions"],
      earth: ["Unstable situations", "Rushing", "High-risk speculation"],
      metal: ["Chaotic environments", "Emotional manipulation", "Summer major decisions"],
      water: ["Rigid structures", "Drought of creativity", "Late summer major decisions"]
    };
    return avoid[element];
  },

  getBestDecisionTimes(element) {
    const times = {
      wood: "Early morning (5-7 AM), Spring season",
      fire: "Midday (11 AM-1 PM), Summer season",
      earth: "Transitional times, Between seasons",
      metal: "Evening (5-7 PM), Autumn season",
      water: "Night (9-11 PM), Winter season"
    };
    return times[element];
  },

  getSpiritualPath(element) {
    const paths = {
      wood: "Growth through learning and teaching. Meditation in nature enhances your spirit.",
      fire: "Transformation through passion and service. Heart-centered practices suit you.",
      earth: "Grounding through stability and nurturing. Earthing and body-based practices help.",
      metal: "Purification through discipline and refinement. Breathwork and precision practices suit you.",
      water: "Wisdom through intuition and flow. Water meditation and dream work enhance your gifts."
    };
    return paths[element];
  },

  getLegacyAdvice(element, gender) {
    const legacy = {
      wood: "Your legacy is in the growth you inspire in others. Plant seeds of knowledge and watch forests grow.",
      fire: "Your legacy is in the inspiration you provide. Light candles in others that continue to burn.",
      earth: "Your legacy is in the foundations you build. Create structures that support future generations.",
      metal: "Your legacy is in the standards you set. Forge paths of excellence for others to follow.",
      water: "Your legacy is in the wisdom you share. Let your insights flow into the collective knowledge."
    };
    return legacy[element];
  }
};

// Stripe 결제 관련 함수
const PremiumPayment = {
  // Stripe Public Key (테스트 키 - 실제 운영시 라이브 키로 교체)
  STRIPE_PUBLIC_KEY: 'pk_test_REPLACE_WITH_YOUR_KEY',

  // 결제 초기화
  async initializePayment() {
    if (typeof Stripe === 'undefined') {
      console.error('Stripe.js not loaded');
      return null;
    }
    return Stripe(this.STRIPE_PUBLIC_KEY);
  },

  // 결제 세션 생성 (서버 필요 - 여기서는 클라이언트 사이드 데모)
  async createCheckoutSession(sajuData) {
    // 실제 구현시 서버 API 호출
    // const response = await fetch('/api/create-checkout-session', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ sajuData, priceId: 'price_xxx' })
    // });
    // return response.json();

    // 데모용 - Stripe Payment Links 사용 가능
    return {
      url: `https://buy.stripe.com/YOUR_PAYMENT_LINK?client_reference_id=${encodeURIComponent(JSON.stringify(sajuData))}`
    };
  },

  // 프리미엄 구매 모달 표시
  showPurchaseModal() {
    const modal = document.getElementById('premium-modal');
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  },

  // 모달 닫기
  closePurchaseModal() {
    const modal = document.getElementById('premium-modal');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  },

  // 결제 처리
  async handlePurchase() {
    try {
      // 로딩 표시
      const btn = document.getElementById('purchase-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Processing...';

      // Stripe Checkout으로 리다이렉트
      // 실제 구현시:
      // const session = await this.createCheckoutSession(currentSajuData);
      // window.location.href = session.url;

      // 데모: Payment Link로 이동
      window.open('https://buy.stripe.com/YOUR_PAYMENT_LINK', '_blank');

      btn.disabled = false;
      btn.innerHTML = '💎 Get Premium Report - $4.99';
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PremiumSaju, PremiumPayment };
}
