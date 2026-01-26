// KStar Match GPT Fortune Integration
// GPT API를 통한 상세 운세 분석

const GPTFortune = {
  // API 엔드포인트 (Cloudflare Pages Function)
  apiEndpoint: '/api/fortune',

  // 상세 운세 요청
  async getDetailedFortune(sajuResult, language = 'en') {
    const sajuData = this.prepareSajuData(sajuResult);

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sajuData,
          language
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fortune');
      }

      const data = await response.json();

      if (data.success && data.fortune) {
        return data.fortune;
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('GPT Fortune Error:', error);
      return null;
    }
  },

  // 사주 데이터 준비
  prepareSajuData(result) {
    const params = new URLSearchParams(window.location.search);

    // Helper to format pillar data
    const formatPillar = (pillar) => {
      if (!pillar) return { stem: '?', branch: '?', korean: '??' };
      return {
        stem: pillar.stem.hanja,
        branch: pillar.branch.hanja,
        korean: pillar.stem.korean + pillar.branch.korean
      };
    };

    return {
      birthDate: {
        year: parseInt(params.get('year')),
        month: parseInt(params.get('month')),
        day: parseInt(params.get('day')),
        hour: params.get('hour')
      },
      gender: params.get('gender'),
      dayMaster: {
        stem: result.dayMaster.hanja,
        korean: result.dayMaster.korean,
        element: result.dayMaster.element,
        yin: result.dayMaster.yin
      },
      fourPillars: {
        year: formatPillar(result.fourPillars.year),
        month: formatPillar(result.fourPillars.month),
        day: formatPillar(result.fourPillars.day),
        hour: formatPillar(result.fourPillars.hour)
      },
      elementBalance: result.elementCount
    };
  },

  // UI에 GPT 운세 표시
  displayFortune(fortune) {
    if (!fortune) return;

    // 성격
    const personalityEl = document.getElementById('personality-text');
    if (personalityEl && fortune.personality) {
      personalityEl.innerHTML = `<span class="gpt-badge">🔮</span> ${fortune.personality}`;
    }

    // 직업
    const careerEl = document.getElementById('career-list');
    if (careerEl && fortune.career) {
      careerEl.innerHTML = `<li><span class="gpt-badge">🔮</span> ${fortune.career}</li>`;
    }

    // 연애
    const loveEl = document.getElementById('love-text');
    if (loveEl && fortune.love) {
      loveEl.innerHTML = `<span class="gpt-badge">🔮</span> ${fortune.love}`;
    }

    // 강점
    const strengthEl = document.getElementById('strength-text');
    if (strengthEl && fortune.wealth) {
      strengthEl.innerHTML = `<span class="gpt-badge">🔮</span> ${fortune.wealth}`;
    }

    // 약점/주의
    const weaknessEl = document.getElementById('weakness-text');
    if (weaknessEl && fortune.caution) {
      weaknessEl.innerHTML = `<span class="gpt-badge">⚠️</span> ${fortune.caution}`;
    }

    // GPT 전용 섹션 추가
    this.addGPTSections(fortune);
  },

  // GPT 전용 섹션 추가
  addGPTSections(fortune) {
    const container = document.querySelector('.action-buttons');
    if (!container) return;

    // 건강운 섹션
    if (fortune.health) {
      const healthSection = document.createElement('div');
      healthSection.className = 'section-card gpt-section';
      healthSection.innerHTML = `
        <h3>🏥 Health Fortune <span class="gpt-badge">🔮</span></h3>
        <p>${fortune.health}</p>
      `;
      container.parentNode.insertBefore(healthSection, container);
    }

    // 2025-2026 운세
    if (fortune.yearFortune) {
      const yearSection = document.createElement('div');
      yearSection.className = 'section-card gpt-section';
      yearSection.innerHTML = `
        <h3>📅 2025-2026 Outlook <span class="gpt-badge">🔮</span></h3>
        <p>${fortune.yearFortune}</p>
      `;
      container.parentNode.insertBefore(yearSection, container);
    }

    // 행운 팁 업데이트
    if (fortune.luckyTips) {
      const luckyEl = document.getElementById('lucky-info');
      if (luckyEl) {
        luckyEl.innerHTML = `
          <div class="lucky-grid">
            <div class="lucky-item">
              <span class="lucky-label">Lucky Color</span>
              <span class="lucky-value">${fortune.luckyTips.color}</span>
            </div>
            <div class="lucky-item">
              <span class="lucky-label">Lucky Direction</span>
              <span class="lucky-value">${fortune.luckyTips.direction}</span>
            </div>
            <div class="lucky-item">
              <span class="lucky-label">Lucky Number</span>
              <span class="lucky-value">${fortune.luckyTips.number}</span>
            </div>
            <div class="lucky-item">
              <span class="lucky-label">Lucky Day</span>
              <span class="lucky-value">${fortune.luckyTips.day}</span>
            </div>
          </div>
          <p class="gpt-note">Based on Korean Four Pillars of Destiny (Saju)</p>
        `;
      }
    }
  },

  // GPT 로딩 표시
  showLoading() {
    const sections = ['personality-text', 'career-list', 'love-text', 'strength-text', 'weakness-text'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = '<span class="loading-dots">🔮 Analyzing<span>.</span><span>.</span><span>.</span></span>';
      }
    });
  }
};

// CSS for GPT features
const gptStyles = document.createElement('style');
gptStyles.textContent = `
  .gpt-badge {
    display: inline-block;
    background: linear-gradient(135deg, var(--accent), var(--accent-pink));
    color: white;
    font-size: 0.7rem;
    padding: 0.15rem 0.5rem;
    border-radius: 50px;
    margin-right: 0.5rem;
    font-weight: 600;
  }

  .gpt-section {
    border-left: 3px solid var(--accent);
    animation: fadeIn 0.5s ease;
  }

  .gpt-note {
    font-size: 0.8rem;
    color: var(--accent-light);
    margin-top: 1rem;
    font-style: italic;
  }

  .lucky-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .lucky-item {
    background: var(--bg-secondary);
    padding: 1rem;
    border-radius: 12px;
    text-align: center;
  }

  .lucky-label {
    display: block;
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .lucky-value {
    display: block;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--accent-light);
  }

  .loading-dots span {
    animation: blink 1.4s infinite both;
  }

  .loading-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .loading-dots span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes blink {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 1; }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    .lucky-grid {
      grid-template-columns: 1fr;
    }
  }
`;
document.head.appendChild(gptStyles);

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GPTFortune;
}
