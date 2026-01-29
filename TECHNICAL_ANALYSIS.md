# KStar Match - 기술 분석 문서

## 1. 프로젝트 개요

### 1.1 서비스 소개
**KStar Match**는 한국의 전통 사주팔자(四柱八字) 시스템을 기반으로 한 무료 온라인 성격 분석 플랫폼입니다. 사용자의 생년월일을 입력받아 성격 프로필을 생성하고, K-Pop 아이돌 및 K-Drama 스타와의 성격 매칭을 제공합니다.

### 1.2 핵심 기능
| 기능 | 설명 |
|------|------|
| 성격 분석 | 사주팔자 기반 성격 프로필 생성 |
| K-Star 매칭 | 200+ 연예인 데이터베이스와 성격 매칭 |
| 궁합 테스트 | 두 사람 간의 오행 궁합 분석 |
| AI 분석 | GPT-4o-mini를 활용한 심층 분석 |
| 다국어 지원 | 영어, 한국어, 일본어, 중국어, 베트남어 |

### 1.3 서비스 URL
- **메인 도메인**: https://kstarmatch.com

### 1.4 Git 저장소
⚠️ **중요: Git Remote 구조**
```bash
# 현재 설정된 remote
origin    → https://github.com/JungyulPark/product-build.git (메인 배포용)
kfortunes → https://github.com/JungyulPark/kfortunes.git (별도)
```

- **실제 배포 저장소**: `product-build` (origin remote)
- **프로젝트 디렉토리명**: `kfortunes/`
- **배포 방식**: `git push origin main` → Cloudflare Pages 자동 배포

---

## 2. 기술 스택

### 2.1 프론트엔드
```
- HTML5 (Semantic markup, SEO 최적화)
- CSS3 (CSS Custom Properties, Dark/Light 테마)
- Vanilla JavaScript (ES6+)
- 반응형 디자인 (Mobile-first)
```

### 2.2 백엔드/인프라
```
- Cloudflare Pages (정적 호스팅)
- Cloudflare Pages Functions (서버리스 API)
- Wrangler CLI v3.114.17 (개발/배포 도구)
```

### 2.3 외부 서비스
```
- OpenAI API (GPT-4o-mini)
- Google Analytics (G-Y36C26EGSG)
- Google AdSense (ca-pub-8992259838992521)
- Microsoft Clarity (세션 레코딩)
- Userback (사용자 피드백)
```

### 2.4 의존성
```json
{
  "dependencies": {
    "sharp": "^0.34.5"        // 이미지 처리 (미사용 상태)
  },
  "devDependencies": {
    "wrangler": "^3.114.17"   // Cloudflare CLI
  }
}
```

---

## 3. 아키텍처

### 3.1 디렉토리 구조
```
kfortunes/
├── index.html              # 메인 랜딩 페이지
├── result.html             # 분석 결과 페이지
├── compatibility.html      # 궁합 테스트 페이지
├── about.html              # 서비스 소개
├── faq.html                # FAQ
├── privacy.html            # 개인정보처리방침
├── terms.html              # 이용약관
├── contact.html            # 문의
│
├── js/
│   ├── app.js              # 메인 애플리케이션 로직 (826줄)
│   ├── saju.js             # 사주팔자 계산 엔진 (423줄)
│   ├── i18n.js             # 다국어 시스템 (691줄)
│   ├── config.js           # 설정 및 티어 관리 (84줄)
│   ├── celebrities.js      # 연예인 매칭 로직
│   ├── day-master-details.js
│   └── gpt-fortune.js
│
├── functions/api/
│   ├── fortune.js          # GPT 성격 분석 API (580줄)
│   ├── compatibility.js    # 연예인 궁합 AI API
│   ├── status.js           # 서비스 상태 확인
│   ├── create-checkout.js  # 결제 (비활성화)
│   └── saju-consultation.js # 프리미엄 상담 (미연결)
│
├── style.css               # 글로벌 스타일
├── celebrities.json        # 200+ 연예인 데이터
├── images/                 # 정적 에셋
└── .dev.vars               # 환경 변수
```

### 3.2 데이터 흐름
```
[사용자 입력] → [클라이언트 사주 계산] → [결과 표시]
                                    ↓
                            [선택: AI 분석]
                                    ↓
                       [Cloudflare Function]
                                    ↓
                          [OpenAI API 호출]
                                    ↓
                         [JSON 응답 → UI 표시]
```

### 3.3 API 엔드포인트
| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/fortune` | POST | AI 성격 분석 |
| `/api/compatibility` | POST | 연예인 궁합 분석 |
| `/api/status` | GET | GPT 활성화 상태 확인 |
| `/api/create-checkout` | POST | 결제 (비활성화) |

---

## 4. 핵심 모듈 분석

### 4.1 사주 계산 엔진 (saju.js)
```javascript
// 핵심 데이터 구조
- STEMS: 천간 10개 (갑을병정무기경신임계)
- BRANCHES: 지지 12개 (자축인묘진사오미신유술해)
- ELEMENTS: 오행 5개 (목화토금수)

// 주요 함수
- calculateYearPillar(year)   // 년주 계산
- calculateMonthPillar(year, month)  // 월주 계산
- calculateDayPillar(year, month, day)  // 일주 계산
- calculateHourPillar(dayStem, hour)  // 시주 계산
- calculateCompatibility(person1, person2)  // 궁합 계산
```

### 4.2 다국어 시스템 (i18n.js)
```javascript
// 지원 언어
- en: English (기본값)
- ko: 한국어
- ja: 日本語
- zh: 中文
- vi: Tiếng Việt

// 번역 키 카테고리
- nav_*: 네비게이션
- hero_*: 히어로 섹션
- form_*: 폼 요소
- result_*: 결과 페이지
- compat_*: 궁합 페이지
```

### 4.3 GPT API 통합 (fortune.js)
```javascript
// 설정
const FORTUNE_CONFIG = {
  model: 'gpt-4o-mini',
  maxTokens: 2000,
  temperature: 0.7,
  timeoutMs: 15000
};

// Fallback 전략
- MOCK_MODE=true → Mock 데이터 반환
- API 키 없음 → Mock 데이터 반환
- Rate limit (429) → Mock 데이터 반환
- 타임아웃/에러 → Mock 데이터 반환
```

---

## 5. 수익화 모델

### 5.1 현재 모델
```
무료 서비스 + 광고 수익
├── Google AdSense (디스플레이 광고)
├── 제휴 링크 (Coupang, Amazon)
└── 프리미엄 기능 (비활성화)
```

### 5.2 비활성화된 결제 시스템
```javascript
// config.js
polar: {
  enabled: false,  // Polar 결제 비활성화
}

// 원래 가격 체계 (비활성화됨)
- basic: $2.99 → $0 (무료)
- compatibility: $0.99 → $0 (무료)
```

---

## 6. 성능 및 보안

### 6.1 성능 최적화
- WebP 이미지 포맷 사용
- 정적 파일 Cloudflare CDN 배포
- Lazy loading 이미지
- 클라이언트 사이드 사주 계산 (서버 부하 감소)

### 6.2 보안 조치
- CORS 헤더 설정
- 환경 변수로 API 키 관리
- 입력 유효성 검사 (날짜)
- Rate limiting (OpenAI 측)

---

## 7. 분석 및 추적

### 7.1 Google Analytics 이벤트
```javascript
// 추적 이벤트
- fortune_reading_start: 분석 시작
- fortune_result_viewed: 결과 조회
- compatibility_calculated: 궁합 계산
- share_modal_opened: 공유 모달 열기
- share: SNS 공유 실행
```

### 7.2 사용자 저장 데이터 (LocalStorage)
```javascript
localStorage.setItem('theme', 'dark|light')
localStorage.setItem('kfortunes-lang', 'en|ko|ja|zh|vi')
localStorage.setItem('kstar_purchases_v4', JSON.stringify({...}))
```

---

## 8. 배포 및 운영

### 8.1 개발 환경
```bash
# 로컬 개발 서버 실행
npm run dev
# → http://localhost:8787

# 환경 변수 (.dev.vars)
MOCK_MODE=true
OPENAI_API_KEY=sk-xxx
```

### 8.2 배포 프로세스
```
Git Push → Cloudflare Pages 자동 배포
- 브랜치: main
- 빌드 명령: 없음 (정적 파일)
- 출력 디렉토리: kfortunes/
```

---

## 9. 연예인 데이터베이스

### 9.1 데이터 구조
```json
{
  "name": { "en": "BTS V", "ko": "뷔" },
  "birthYear": 1995,
  "element": "wood",
  "dayMaster": "갑",
  "category": "kpop_male",
  "popularity": 10
}
```

### 9.2 카테고리
- kpop_male: 남자 아이돌
- kpop_female: 여자 아이돌
- actor: 배우
- actress: 여배우
- athlete: 운동선수
- other: 기타

---

## 10. 결론

KStar Match는 전통 사주 시스템과 현대 AI 기술을 결합한 엔터테인먼트 서비스입니다. Cloudflare Pages를 활용한 서버리스 아키텍처로 확장성과 비용 효율성을 확보했으며, 다국어 지원과 SNS 공유 기능으로 글로벌 시장을 타겟팅하고 있습니다.
