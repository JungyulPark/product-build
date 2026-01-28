// KStar Match - Day Master Details
// 일간별 상세 해석 (무료 버전용)

const DayMasterDetails = {
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
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DayMasterDetails };
}
