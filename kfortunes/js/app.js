// KStar Match - Main Application Logic

document.addEventListener('DOMContentLoaded', function() {
  initializeTheme();
  initializeForm();
  initializeGenderButtons();
  handleFormSubmit();
});

// 테마 초기화
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// 테마 토글
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// 폼 초기화
function initializeForm() {
  const yearSelect = document.getElementById('year');
  const monthSelect = document.getElementById('month');
  const daySelect = document.getElementById('day');

  if (!yearSelect || !monthSelect || !daySelect) return;

  // 년도 옵션 (1940-2024)
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 1940; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }

  // 월 옵션
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  months.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = index + 1;
    option.textContent = month;
    monthSelect.appendChild(option);
  });

  // 일 옵션
  for (let day = 1; day <= 31; day++) {
    const option = document.createElement('option');
    option.value = day;
    option.textContent = day;
    daySelect.appendChild(option);
  }

  // 월 변경 시 일 수 조정
  yearSelect.addEventListener('change', updateDays);
  monthSelect.addEventListener('change', updateDays);
}

// 일 수 업데이트
function updateDays() {
  const year = parseInt(document.getElementById('year').value);
  const month = parseInt(document.getElementById('month').value);
  const daySelect = document.getElementById('day');
  const currentDay = parseInt(daySelect.value);

  if (!year || !month) return;

  const daysInMonth = new Date(year, month, 0).getDate();

  // 현재 옵션 수
  while (daySelect.options.length > 1) {
    daySelect.remove(1);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const option = document.createElement('option');
    option.value = day;
    option.textContent = day;
    daySelect.appendChild(option);
  }

  // 이전 선택 값 복원
  if (currentDay && currentDay <= daysInMonth) {
    daySelect.value = currentDay;
  }
}

// 성별 버튼 초기화
function initializeGenderButtons() {
  const genderButtons = document.querySelectorAll('.gender-btn');
  const genderInput = document.getElementById('gender');

  if (!genderButtons.length || !genderInput) return;

  genderButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      genderButtons.forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      genderInput.value = this.dataset.gender;
    });
  });
}

// 폼 제출 처리
function handleFormSubmit() {
  const form = document.getElementById('saju-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const year = parseInt(document.getElementById('year').value);
    const month = parseInt(document.getElementById('month').value);
    const day = parseInt(document.getElementById('day').value);
    const hour = document.getElementById('hour').value;
    const gender = document.getElementById('gender').value;

    // 유효성 검사
    const errorDiv = document.getElementById('form-error');
    const errors = [];

    if (!year || !month || !day) {
      errors.push(i18n.t('error_select_date') || 'Please select your birth date.');
    } else {
      // 유효한 날짜인지 검사 (2월 30일 등 방지)
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day > daysInMonth) {
        errors.push(`Invalid date: ${month}/${day}/${year} does not exist.`);
      }
    }
    if (!gender) {
      errors.push(i18n.t('error_select_gender') || 'Please select your gender.');
    }

    if (errors.length > 0) {
      errorDiv.innerHTML = errors.join('<br>');
      errorDiv.style.display = 'block';
      errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    errorDiv.style.display = 'none';

    // 로딩 표시 - 명확한 피드백
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.classList.add('btn-loading');
    submitBtn.innerHTML = '⭐ Finding your K-Star match...';

    // GA Event Tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'fortune_reading_start', {
        'event_category': 'Conversion',
        'event_label': gender,
        'value': 1
      });
    }

    // 프로그레스 표시
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 20;
      if (progress <= 100) {
        submitBtn.innerHTML = `⭐ Matching... ${progress}%`;
      }
    }, 250);

    // 사주 계산 및 결과 페이지로 이동
    const focusInput = document.getElementById('focus');
    const focusValue = focusInput ? focusInput.value : '';

    setTimeout(() => {
      clearInterval(progressInterval);
      submitBtn.innerHTML = '✨ Redirecting...';
      const params = new URLSearchParams({
        year, month, day, gender,
        ...(hour && { hour }),
        ...(focusValue && { focus: focusValue })
      });
      window.location.href = `result.html?${params.toString()}`;
    }, 1500);
  });
}

// 결과 페이지 초기화
function initializeResultPage() {
  const params = new URLSearchParams(window.location.search);
  const year = parseInt(params.get('year'));
  const month = parseInt(params.get('month'));
  const day = parseInt(params.get('day'));
  const hour = params.get('hour') || null;
  const gender = params.get('gender');

  if (!year || !month || !day || !gender) {
    window.location.href = 'index.html';
    return;
  }

  // 사주 계산
  const result = Saju.calculate(year, month, day, hour, gender);
  displayResult(result, { year, month, day, hour, gender });

  // GA Event Tracking - Result viewed
  if (typeof gtag !== 'undefined') {
    gtag('event', 'fortune_result_viewed', {
      'event_category': 'Conversion',
      'event_label': result.dayMaster?.element || 'unknown',
      'value': 1
    });
  }
}

// 결과 표시
function displayResult(result, birthInfo) {
  const { fourPillars, dayMaster, elementCount, interpretation } = result;

  // 생년월일 표시
  document.getElementById('birth-info').textContent =
    `${birthInfo.year}. ${birthInfo.month}. ${birthInfo.day}`;

  // 일간 표시
  document.getElementById('day-master').textContent =
    `${dayMaster.hanja} (${dayMaster.korean}) - ${Saju.ELEMENTS[dayMaster.element].korean}`;

  // 사주팔자 차트 표시
  displayPillars(fourPillars);

  // 오행 분석 표시
  displayElements(elementCount);

  // 해석 표시
  displayInterpretation(interpretation);
}

// 사주팔자 차트 표시
function displayPillars(pillars) {
  const labels = ['Hour', 'Day', 'Month', 'Year'];
  const pillarData = [pillars.hour, pillars.day, pillars.month, pillars.year];
  const container = document.getElementById('pillars-chart');

  container.innerHTML = pillarData.map((pillar, index) => {
    if (!pillar) {
      return `
        <div class="pillar">
          <div class="pillar-label">${labels[index]}</div>
          <div class="pillar-hanja" style="color: var(--text-secondary);">?<br>?</div>
          <div class="pillar-korean">Unknown</div>
        </div>
      `;
    }

    const stemColor = Saju.ELEMENTS[pillar.stem.element].color;
    const branchColor = Saju.ELEMENTS[pillar.branch.element].color;

    // Element icons for cleaner look (instead of Chinese characters)
    const elementIcons = {
      wood: '🌳', fire: '🔥', earth: '🌍', metal: '⚙️', water: '💧'
    };
    const stemIcon = elementIcons[pillar.stem.element] || '🔮';
    const branchIcon = elementIcons[pillar.branch.element] || '🔮';

    return `
      <div class="pillar">
        <div class="pillar-label">${labels[index]}</div>
        <div class="pillar-icons" style="font-size: 1.8rem; line-height: 1.4;">
          <span title="${pillar.stem.korean}">${stemIcon}</span><br>
          <span title="${pillar.branch.korean}">${branchIcon}</span>
        </div>
        <div class="pillar-korean" style="font-size: 0.85rem;">${pillar.stem.korean}${pillar.branch.korean}</div>
        <div class="pillar-animal">${pillar.branch.animal}</div>
      </div>
    `;
  }).join('');
}

// 오행 분석 표시
function displayElements(elementCount) {
  const container = document.getElementById('element-chart');
  const total = Object.values(elementCount).reduce((a, b) => a + b, 0);

  const elements = [
    { key: 'wood', name: '🌳 Wood', color: 'var(--wood)' },
    { key: 'fire', name: '🔥 Fire', color: 'var(--fire)' },
    { key: 'earth', name: '🌍 Earth', color: 'var(--earth)' },
    { key: 'metal', name: '⚙️ Metal', color: 'var(--metal)' },
    { key: 'water', name: '💧 Water', color: 'var(--water)' }
  ];

  container.innerHTML = elements.map(el => {
    const count = elementCount[el.key];
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return `
      <div class="element-bar-container">
        <div class="element-label">
          <span>${el.name}</span>
          <span>${count} (${Math.round(percentage)}%)</span>
        </div>
        <div class="element-bar">
          <div class="element-bar-fill" style="width: ${percentage}%; background: ${el.color};"></div>
        </div>
      </div>
    `;
  }).join('');
}

// 해석 표시
function displayInterpretation(interpretation) {
  // 성격
  document.getElementById('personality-text').textContent = interpretation.personality;

  // 직업
  const careerList = document.getElementById('career-list');
  careerList.innerHTML = interpretation.career.map(c => `<li>${c}</li>`).join('');

  // 연애
  document.getElementById('love-text').textContent = interpretation.love;

  // 강점
  document.getElementById('strength-text').textContent = interpretation.strength;

  // 약점
  document.getElementById('weakness-text').textContent = interpretation.weakness;

  // 행운 요소
  const luckyInfo = document.getElementById('lucky-info');
  luckyInfo.innerHTML = `
    <div class="tags">
      <span class="tag" style="background: ${interpretation.luckyElement.color}20; color: ${interpretation.luckyElement.color};">
        Lucky Element: ${interpretation.luckyElement.korean}
      </span>
      <span class="tag">Direction: ${interpretation.luckyDirection}</span>
      <span class="tag">Numbers: ${interpretation.luckyNumbers.join(', ')}</span>
    </div>
    <div class="tags" style="margin-top: 0.5rem;">
      ${interpretation.luckyColors.map(c => `<span class="tag">${c}</span>`).join('')}
    </div>
  `;
}

// 궁합 페이지 초기화
function initializeCompatibilityPage() {
  initializeCompatibilityForms();
  handleCompatibilitySubmit();
}

// 궁합 폼 초기화
function initializeCompatibilityForms() {
  const forms = ['person1', 'person2'];

  forms.forEach(prefix => {
    const yearSelect = document.getElementById(`${prefix}-year`);
    const monthSelect = document.getElementById(`${prefix}-month`);
    const daySelect = document.getElementById(`${prefix}-day`);

    if (!yearSelect || !monthSelect || !daySelect) return;

    // 년도 옵션
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1940; year--) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    }

    // 월 옵션
    for (let month = 1; month <= 12; month++) {
      const option = document.createElement('option');
      option.value = month;
      option.textContent = month;
      monthSelect.appendChild(option);
    }

    // 일 옵션
    for (let day = 1; day <= 31; day++) {
      const option = document.createElement('option');
      option.value = day;
      option.textContent = day;
      daySelect.appendChild(option);
    }

    // 성별 버튼
    const genderButtons = document.querySelectorAll(`#${prefix}-form .gender-btn`);
    const genderInput = document.getElementById(`${prefix}-gender`);

    genderButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        genderButtons.forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        genderInput.value = this.dataset.gender;
      });
    });
  });
}

// 궁합 제출 처리
function handleCompatibilitySubmit() {
  const form = document.getElementById('compatibility-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const person1 = {
      year: parseInt(document.getElementById('person1-year').value),
      month: parseInt(document.getElementById('person1-month').value),
      day: parseInt(document.getElementById('person1-day').value),
      hour: document.getElementById('person1-hour')?.value || null,
      gender: document.getElementById('person1-gender').value
    };

    const person2 = {
      year: parseInt(document.getElementById('person2-year').value),
      month: parseInt(document.getElementById('person2-month').value),
      day: parseInt(document.getElementById('person2-day').value),
      hour: document.getElementById('person2-hour')?.value || null,
      gender: document.getElementById('person2-gender').value
    };

    // 유효성 검사
    const errorDiv = document.getElementById('compatibility-form-error');
    const errors = [];

    if (!person1.year || !person1.month || !person1.day || !person1.gender) {
      errors.push('Please complete Person 1 information (year, month, day, and gender).');
    } else {
      // 유효한 날짜인지 검사
      const days1 = new Date(person1.year, person1.month, 0).getDate();
      if (person1.day > days1) {
        errors.push(`Person 1: Invalid date (${person1.month}/${person1.day}/${person1.year} does not exist).`);
      }
    }

    if (!person2.year || !person2.month || !person2.day || !person2.gender) {
      errors.push('Please complete Person 2 information (year, month, day, and gender).');
    } else {
      // 유효한 날짜인지 검사
      const days2 = new Date(person2.year, person2.month, 0).getDate();
      if (person2.day > days2) {
        errors.push(`Person 2: Invalid date (${person2.month}/${person2.day}/${person2.year} does not exist).`);
      }
    }

    if (errors.length > 0) {
      errorDiv.innerHTML = errors.join('<br>');
      errorDiv.style.display = 'block';
      errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Clear previous errors
    errorDiv.style.display = 'none';
    errorDiv.innerHTML = '';

    // 로딩 표시 - 명확한 피드백
    const submitBtn = document.getElementById('compatibility-submit-btn');
    submitBtn.disabled = true;
    submitBtn.classList.add('btn-loading');
    submitBtn.innerHTML = '💕 Analyzing...';

    // 프로그레스 표시
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 25;
      if (progress <= 100) {
        submitBtn.innerHTML = `💕 Calculating... ${progress}%`;
      }
    }, 400);

    // 궁합 계산
    setTimeout(() => {
      clearInterval(progressInterval);
      const result = Saju.calculateCompatibility(person1, person2);
      displayCompatibilityResult(result);
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn-loading');
      submitBtn.innerHTML = '💕 Calculate Compatibility';

      // GA Event Tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'compatibility_calculated', {
          'event_category': 'Conversion',
          'event_label': result.score >= 70 ? 'High Compatibility' : result.score >= 50 ? 'Moderate Compatibility' : 'Low Compatibility',
          'value': result.score
        });
      }
    }, 2000);
  });
}

// 궁합 폼 초기화
function clearCompatibilityForm() {
  ['person1', 'person2'].forEach(prefix => {
    document.getElementById(`${prefix}-year`).value = '';
    document.getElementById(`${prefix}-month`).value = '';
    document.getElementById(`${prefix}-day`).value = '';
    document.getElementById(`${prefix}-gender`).value = '';

    // 성별 버튼 선택 해제
    document.querySelectorAll(`#${prefix}-form .gender-btn`).forEach(btn => {
      btn.classList.remove('selected');
    });
  });

  // 에러 메시지 숨기기
  const errorDiv = document.getElementById('compatibility-form-error');
  if (errorDiv) {
    errorDiv.style.display = 'none';
    errorDiv.innerHTML = '';
  }

  // 결과 섹션 숨기기
  const resultSection = document.getElementById('compatibility-result');
  if (resultSection) {
    resultSection.style.display = 'none';
  }
}

// 궁합 결과 표시
function displayCompatibilityResult(result) {
  const resultSection = document.getElementById('compatibility-result');
  resultSection.style.display = 'block';
  resultSection.scrollIntoView({ behavior: 'smooth' });

  const { score, analysis } = result;

  // 점수 원형 차트
  const circumference = 2 * Math.PI * 90;
  const dashArray = (score / 100) * circumference;

  let gradient;
  if (score >= 70) {
    gradient = 'url(#gradient-good)';
  } else if (score >= 50) {
    gradient = 'url(#gradient-moderate)';
  } else {
    gradient = 'url(#gradient-low)';
  }

  document.getElementById('score-circle-container').innerHTML = `
    <div class="score-circle">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="gradient-good" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8b5cf6"/>
            <stop offset="100%" style="stop-color:#ec4899"/>
          </linearGradient>
          <linearGradient id="gradient-moderate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#eab308"/>
            <stop offset="100%" style="stop-color:#22c55e"/>
          </linearGradient>
          <linearGradient id="gradient-low" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ef4444"/>
            <stop offset="100%" style="stop-color:#eab308"/>
          </linearGradient>
        </defs>
        <circle class="score-circle-bg" cx="100" cy="100" r="90"/>
        <circle class="score-circle-fill" cx="100" cy="100" r="90"
          stroke="${gradient}"
          stroke-dasharray="${dashArray} ${circumference}"/>
      </svg>
      <div class="score-value">
        <span class="emoji">${analysis.emoji}</span>
        <span class="number">${score}%</span>
      </div>
    </div>
  `;

  // 분석 결과
  document.getElementById('compatibility-rating').textContent = analysis.rating;
  document.getElementById('compatibility-description').textContent = analysis.description;

  // 강점
  document.getElementById('strengths-list').innerHTML =
    analysis.strengths.map(s => `<li>${s}</li>`).join('');

  // 도전
  document.getElementById('challenges-list').innerHTML =
    analysis.challenges.map(c => `<li>${c}</li>`).join('');
}

// 공유 기능 - SNS 모달 표시
function shareResult() {
  const modal = document.getElementById('share-modal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // GA 이벤트
    if (typeof gtag !== 'undefined') {
      gtag('event', 'share_modal_opened', {
        'event_category': 'Engagement',
        'event_label': 'Result Page'
      });
    }
  }
}

// 공유 모달 닫기
function closeShareModal() {
  const modal = document.getElementById('share-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// SNS 공유 함수
function shareToSNS(platform) {
  const siteUrl = 'https://kfortunes.com';
  const dayMasterEl = document.getElementById('day-master');
  const dayMaster = dayMasterEl ? dayMasterEl.textContent : 'my personality';

  const shareText = encodeURIComponent(`🔮 I just discovered my Korean Saju personality profile!\n\nMy Day Master: ${dayMaster}\n\nDiscover yours too!`);
  const shareUrl = encodeURIComponent(siteUrl);
  const hashtags = encodeURIComponent('KFortunes,Saju,사주,PersonalityTest');

  let shareLink = '';

  switch(platform) {
    case 'twitter':
      shareLink = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}&hashtags=${hashtags}`;
      break;
    case 'facebook':
      shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
      break;
    case 'whatsapp':
      shareLink = `https://wa.me/?text=${shareText}%20${shareUrl}`;
      break;
    case 'telegram':
      shareLink = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;
      break;
    case 'reddit':
      shareLink = `https://www.reddit.com/submit?url=${shareUrl}&title=${encodeURIComponent('I discovered my Korean Saju personality! 🔮')}`;
      break;
    case 'linkedin':
      shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
      break;
    case 'pinterest':
      shareLink = `https://pinterest.com/pin/create/button/?url=${shareUrl}&description=${shareText}&media=${encodeURIComponent('https://kfortunes.com/sajucharacter.webp')}`;
      break;
    case 'threads':
      // Threads는 웹 공유 API 사용
      shareLink = `https://www.threads.net/intent/post?text=${shareText}%20${shareUrl}`;
      break;
    case 'kakaotalk':
      // 카카오톡 공유 (모바일에서 작동)
      shareLink = `https://story.kakao.com/share?url=${shareUrl}`;
      break;
    case 'line':
      shareLink = `https://social-plugins.line.me/lineit/share?url=${shareUrl}&text=${shareText}`;
      break;
    case 'copy':
      const fullText = decodeURIComponent(shareText) + '\n\n' + siteUrl;
      navigator.clipboard.writeText(fullText).then(() => {
        showToast('✅ Copied to clipboard!');
      });
      closeShareModal();
      return;
    case 'native':
      if (navigator.share) {
        navigator.share({
          title: 'KStar Match - My Saju Reading',
          text: decodeURIComponent(shareText),
          url: siteUrl
        });
        closeShareModal();
        return;
      }
      break;
  }

  if (shareLink) {
    const popup = window.open(shareLink, '_blank', 'width=600,height=400');

    // 공유 성공 피드백
    if (popup) {
      showToast(`📤 Opening ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`);
    } else {
      showToast('⚠️ Pop-up blocked. Please allow pop-ups for sharing.');
    }

    // GA 이벤트
    if (typeof gtag !== 'undefined') {
      gtag('event', 'share', {
        'event_category': 'Social',
        'event_label': platform,
        'value': 1
      });
    }
  }

  closeShareModal();
}

// Compatibility 결과 공유
function shareCompatibilityResult() {
  const modal = document.getElementById('share-modal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // GA 이벤트
    if (typeof gtag !== 'undefined') {
      gtag('event', 'share_modal_opened', {
        'event_category': 'Engagement',
        'event_label': 'Compatibility Page'
      });
    }
  }
}

// Compatibility 공유용 SNS 함수 (기존 shareToSNS 오버라이드)
const originalShareToSNS = typeof shareToSNS === 'function' ? shareToSNS : null;

function shareToSNSCompatibility(platform) {
  const siteUrl = 'https://kfortunes.com/compatibility.html';
  const scoreEl = document.querySelector('.score-value .number');
  const score = scoreEl ? scoreEl.textContent : '';

  const shareText = encodeURIComponent(`💕 Our love compatibility score is ${score}!\n\nCheck your compatibility with Korean Saju!`);
  const shareUrl = encodeURIComponent(siteUrl);

  let shareLink = '';

  switch(platform) {
    case 'twitter':
      shareLink = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
      break;
    case 'facebook':
      shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
      break;
    case 'whatsapp':
      shareLink = `https://wa.me/?text=${shareText}%20${shareUrl}`;
      break;
    case 'telegram':
      shareLink = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;
      break;
    case 'reddit':
      shareLink = `https://www.reddit.com/submit?url=${shareUrl}&title=${encodeURIComponent('Our Korean Saju love compatibility! 💕')}`;
      break;
    case 'kakaotalk':
      shareLink = `https://story.kakao.com/share?url=${shareUrl}`;
      break;
    case 'line':
      shareLink = `https://social-plugins.line.me/lineit/share?url=${shareUrl}&text=${shareText}`;
      break;
    case 'copy':
      const fullText = decodeURIComponent(shareText) + '\n\n' + siteUrl;
      navigator.clipboard.writeText(fullText).then(() => {
        showToast('✅ Copied to clipboard!');
      });
      closeShareModal();
      return;
  }

  if (shareLink) {
    const popup = window.open(shareLink, '_blank', 'width=600,height=400');

    // 공유 성공 피드백
    if (popup) {
      showToast(`📤 Opening ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`);
    } else {
      showToast('⚠️ Pop-up blocked. Please allow pop-ups for sharing.');
    }

    if (typeof gtag !== 'undefined') {
      gtag('event', 'share', {
        'event_category': 'Social',
        'event_label': platform + '_compatibility',
        'value': 1
      });
    }
  }

  closeShareModal();
}

// Toast 메시지 표시
function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, var(--accent), var(--accent-pink));
    color: white;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-weight: 500;
    z-index: 9999;
    animation: fadeInUp 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 새 분석
function newReading() {
  window.location.href = 'index.html';
}

// 결과 페이지 자동 초기화
if (window.location.pathname.includes('result.html')) {
  document.addEventListener('DOMContentLoaded', initializeResultPage);
}

// 궁합 페이지 자동 초기화
if (window.location.pathname.includes('compatibility.html')) {
  document.addEventListener('DOMContentLoaded', initializeCompatibilityPage);
}
