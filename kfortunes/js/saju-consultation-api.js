// Saju Consultation API Client
// 사주 상담 컨설팅 보고서 API 클라이언트

const SajuConsultationAPI = {
  // API 엔드포인트
  endpoint: '/api/saju-consultation',

  /**
   * 사주 상담 보고서 요청
   * @param {Object} data - 상담 데이터
   * @returns {Promise<Object>} - 상담 보고서
   */
  async getConsultation(data) {
    const {
      sajuData = {},
      consultationType = 'general',  // general, career, love, wealth, health
      specificQuestion = '',
      currentSituation = '',
      language = 'ko'
    } = data;

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sajuData,
          consultationType,
          specificQuestion,
          currentSituation,
          language
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get consultation');
      }

      return result;
    } catch (error) {
      console.error('Saju Consultation API Error:', error);
      throw error;
    }
  },

  /**
   * 상담 보고서 HTML 렌더링
   * @param {Object} report - 상담 보고서 데이터
   * @returns {string} - HTML 문자열
   */
  renderReport(report) {
    if (!report) return '<p>보고서를 불러올 수 없습니다.</p>';

    return `
      <div class="saju-consultation-report">
        <div class="report-header">
          <h2>🔮 ${report.title || '사주 상담 보고서'}</h2>
          <div class="executive-summary">
            <p>${report.executiveSummary || ''}</p>
          </div>
        </div>

        <div class="report-section saju-analysis">
          <h3>📜 사주 분석</h3>

          <div class="analysis-item">
            <h4>일간(日干) 분석</h4>
            <p>${report.sajuAnalysis?.dayMasterAnalysis || ''}</p>
          </div>

          <div class="analysis-item">
            <h4>오행 균형</h4>
            <p>${report.sajuAnalysis?.fiveElementsBalance || ''}</p>
          </div>

          <div class="analysis-item">
            <h4>십신(十神) 분석</h4>
            <p>${report.sajuAnalysis?.tenGodsAnalysis || ''}</p>
          </div>

          ${(report.sajuAnalysis?.majorPatterns || []).length > 0 ? `
          <div class="analysis-item">
            <h4>특이 격국/패턴</h4>
            <ul>
              ${report.sajuAnalysis.majorPatterns.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
        </div>

        <div class="report-section main-consultation">
          <h3>💎 핵심 상담</h3>

          <div class="current-phase">
            <h4>현재 운의 흐름</h4>
            <p>${report.mainConsultation?.currentPhase || ''}</p>
          </div>

          <div class="core-advice highlight-box">
            <h4>✨ 핵심 조언</h4>
            <p>${report.mainConsultation?.coreAdvice || ''}</p>
          </div>

          <div class="opportunities">
            <h4>🌟 기회</h4>
            <ul>
              ${(report.mainConsultation?.opportunities || []).map(o => `<li>${o}</li>`).join('')}
            </ul>
          </div>

          <div class="challenges">
            <h4>⚠️ 주의점</h4>
            <ul>
              ${(report.mainConsultation?.challenges || []).map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>

          <div class="action-items">
            <h4>✅ 실천 사항</h4>
            <ul>
              ${(report.mainConsultation?.actionItems || []).map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="report-section timing">
          <h3>📅 시기별 운세</h3>

          <div class="timing-grid">
            <div class="timing-item good">
              <h4>🟢 좋은 달</h4>
              <ul>
                ${(report.timing?.luckyMonths || []).map(m => `<li>${m}</li>`).join('')}
              </ul>
            </div>

            <div class="timing-item caution">
              <h4>🟡 주의할 달</h4>
              <ul>
                ${(report.timing?.cautionMonths || []).map(m => `<li>${m}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="important-dates">
            <h4>📌 중요 시기</h4>
            <ul>
              ${(report.timing?.importantDates || []).map(d => `<li>${d}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="report-section relationships">
          <h3>👥 인연/관계</h3>
          <ul>
            <li><strong>잘 맞는 오행/띠:</strong> ${report.relationships?.compatibleElements || ''}</li>
            <li><strong>귀인의 특성:</strong> ${report.relationships?.beneficialPeople || ''}</li>
            <li><strong>조심할 유형:</strong> ${report.relationships?.avoidTypes || ''}</li>
          </ul>
        </div>

        <div class="report-section feng-shui">
          <h3>🧭 풍수/행운 아이템</h3>
          <div class="lucky-items-grid">
            <div class="lucky-item">
              <span class="label">길방위</span>
              <span class="value">${report.fengShui?.luckyDirection || ''}</span>
            </div>
            <div class="lucky-item">
              <span class="label">행운의 색</span>
              <span class="value">${(report.fengShui?.luckyColors || []).join(', ')}</span>
            </div>
            <div class="lucky-item">
              <span class="label">행운의 숫자</span>
              <span class="value">${(report.fengShui?.luckyNumbers || []).join(', ')}</span>
            </div>
            <div class="lucky-item">
              <span class="label">보완 아이템</span>
              <span class="value">${report.fengShui?.enhancingElements || ''}</span>
            </div>
          </div>
        </div>

        <div class="report-section yearly-outlook">
          <h3>📈 연도별 전망</h3>
          <div class="yearly-cards">
            <div class="year-card">
              <h4>2025년</h4>
              <p>${report.yearlyOutlook?.year2025 || ''}</p>
            </div>
            <div class="year-card">
              <h4>2026년</h4>
              <p>${report.yearlyOutlook?.year2026 || ''}</p>
            </div>
          </div>
          <div class="five-year-trend">
            <h4>향후 5년 흐름</h4>
            <p>${report.yearlyOutlook?.fiveYearTrend || ''}</p>
          </div>
        </div>

        <div class="report-section special-message">
          <div class="message-box">
            <h3>💌 특별한 메시지</h3>
            <p class="special-text">${report.specialMessage || ''}</p>
          </div>
        </div>
      </div>
    `;
  }
};

// 사용 예시
/*
document.getElementById('getReportBtn').addEventListener('click', async () => {
  const sajuData = window.currentSajuData; // 이미 계산된 사주 데이터

  try {
    const result = await SajuConsultationAPI.getConsultation({
      sajuData: sajuData,
      consultationType: 'career',  // general, career, love, wealth, health
      specificQuestion: '올해 이직을 해도 될까요?',
      currentSituation: '현재 직장에서 5년째 근무 중이며 새로운 기회를 찾고 있습니다.',
      language: 'ko'
    });

    document.getElementById('reportContainer').innerHTML =
      SajuConsultationAPI.renderReport(result.report);
  } catch (error) {
    alert('상담 보고서 생성 중 오류가 발생했습니다.');
  }
});
*/

// ES Module export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SajuConsultationAPI;
}
