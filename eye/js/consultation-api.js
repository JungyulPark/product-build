// Eye Health Consultation API Client
// 눈 건강 상담 API 클라이언트

const EyeConsultationAPI = {
  // API 엔드포인트
  endpoint: '/api/consultation',

  /**
   * 눈 건강 상담 보고서 요청
   * @param {Object} data - 상담 데이터
   * @returns {Promise<Object>} - 상담 보고서
   */
  async getConsultation(data) {
    const {
      symptoms = [],      // ['dry_eye', 'eye_strain', 'blurry_vision', ...]
      duration = '',      // '1week', '1month', '3months', '6months+'
      age = '',
      lifestyle = {},     // { screenTime, sleepHours, workType, contactLens, smoking }
      concerns = '',
      language = 'ko'
    } = data;

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          symptoms,
          duration,
          age,
          lifestyle,
          concerns,
          language
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get consultation');
      }

      return result;
    } catch (error) {
      console.error('Eye Consultation API Error:', error);
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

    const riskColors = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#ef4444'
    };

    const riskLabels = {
      low: '낮음',
      medium: '보통',
      high: '높음'
    };

    return `
      <div class="consultation-report">
        <div class="report-header">
          <h2>👁️ 눈 건강 상담 보고서</h2>
          <p class="summary">${report.summary || ''}</p>
        </div>

        <div class="report-section analysis">
          <h3>📊 분석 결과</h3>
          <div class="risk-badge" style="background: ${riskColors[report.analysis?.riskLevel] || riskColors.medium}">
            위험도: ${riskLabels[report.analysis?.riskLevel] || '보통'}
          </div>
          <p><strong>주요 문제:</strong> ${report.analysis?.mainIssue || ''}</p>
          <p><strong>가능한 원인:</strong></p>
          <ul>
            ${(report.analysis?.possibleCauses || []).map(c => `<li>${c}</li>`).join('')}
          </ul>
        </div>

        <div class="report-section recommendations">
          <h3>💡 추천 사항</h3>

          <h4>즉시 실천할 것</h4>
          <ul>
            ${(report.recommendations?.immediate || []).map(r => `<li>${r}</li>`).join('')}
          </ul>

          <h4>생활습관 개선</h4>
          <ul>
            ${(report.recommendations?.lifestyle || []).map(r => `<li>${r}</li>`).join('')}
          </ul>

          <h4>눈 운동</h4>
          <ul>
            ${(report.recommendations?.exercises || []).map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>

        <div class="report-section products">
          <h3>🛒 추천 제품</h3>
          <ul>
            <li><strong>인공눈물:</strong> ${report.products?.eyeDrops || ''}</li>
            <li><strong>영양제:</strong> ${report.products?.supplements || ''}</li>
            <li><strong>보조용품:</strong> ${report.products?.accessories || ''}</li>
          </ul>
        </div>

        <div class="report-section weekly-plan">
          <h3>📅 주간 실천 계획</h3>
          <div class="plan-timeline">
            <div class="plan-item">
              <span class="day">1-3일차</span>
              <p>${report.weeklyPlan?.day1_3 || ''}</p>
            </div>
            <div class="plan-item">
              <span class="day">4-7일차</span>
              <p>${report.weeklyPlan?.day4_7 || ''}</p>
            </div>
            <div class="plan-item">
              <span class="day">지속 관리</span>
              <p>${report.weeklyPlan?.ongoing || ''}</p>
            </div>
          </div>
        </div>

        ${report.doctorVisit?.needed ? `
        <div class="report-section doctor-visit warning">
          <h3>🏥 병원 방문 권장</h3>
          <p><strong>긴급도:</strong> ${report.doctorVisit?.urgency === 'urgent' ? '🔴 긴급' : report.doctorVisit?.urgency === 'soon' ? '🟡 빠른 시일 내' : '🟢 정기 검진'}</p>
          <p>${report.doctorVisit?.reason || ''}</p>
        </div>
        ` : ''}

        <div class="report-section warnings">
          <h3>⚠️ 주의사항</h3>
          <ul>
            ${(report.warnings || []).map(w => `<li>${w}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }
};

// 사용 예시
/*
document.getElementById('consultBtn').addEventListener('click', async () => {
  try {
    const result = await EyeConsultationAPI.getConsultation({
      symptoms: ['dry_eye', 'eye_strain'],
      duration: '1month',
      age: '35',
      lifestyle: {
        screenTime: '8시간 이상',
        sleepHours: '6시간',
        workType: '사무직',
        contactLens: true,
        smoking: false
      },
      concerns: '최근 눈이 자주 피로하고 건조해요',
      language: 'ko'
    });

    document.getElementById('reportContainer').innerHTML =
      EyeConsultationAPI.renderReport(result.report);
  } catch (error) {
    alert('상담 보고서 생성 중 오류가 발생했습니다.');
  }
});
*/

// ES Module export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EyeConsultationAPI;
}
