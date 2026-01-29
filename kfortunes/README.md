# KFortunes - Korean Fortune Telling Service

## 프로젝트 정보

### 서비스 이름
- **KStar Match** (kstarmatch.com)
- **KFortunes** (kfortunes.com)

### Git 저장소 구조
⚠️ **중요: Git Remote 설정**

```bash
# 현재 설정된 remote
origin    → https://github.com/JungyulPark/product-build.git (메인 사용)
kfortunes → https://github.com/JungyulPark/kfortunes.git (별도)
```

**실제 배포 저장소**: `product-build` (origin)
**프로젝트명**: `kfortunes`

### 디렉토리 구조
```
pb-week1/
├── kfortunes/          # 실제 프로젝트 디렉토리
│   ├── functions/      # Cloudflare Pages Functions (API)
│   ├── js/             # 프론트엔드 JavaScript
│   ├── __tests__/      # Jest 테스트
│   └── ...
├── TASKS.md            # 개선 작업 목록
├── TECHNICAL_ANALYSIS.md
└── IMPROVEMENT_ANALYSIS.md
```

### 배포 환경
- **호스팅**: Cloudflare Pages
- **도메인**: kstarmatch.com, kfortunes.com
- **자동 배포**: `origin/main` 브랜치 push 시 자동 배포
- **빌드**: 정적 파일 (빌드 명령 없음)

### 주요 기술 스택
- Frontend: Vanilla JavaScript (ES6+), HTML5, CSS3
- Backend: Cloudflare Pages Functions (서버리스)
- API: OpenAI GPT-4o-mini
- Test: Jest (215 tests)
- 외부 서비스:
  - Google AdSense (광고)
  - Google Analytics (분석)
  - Microsoft Clarity (세션 레코딩)

### 개발 환경
```bash
# 로컬 개발 서버
npm run dev
# → http://localhost:8787

# 테스트 실행
npm test

# 커밋 및 배포
git add .
git commit -m "commit message"
git push origin main  # ← origin (product-build) 사용
```

### 환경 변수
`.dev.vars` 파일에 저장:
```
OPENAI_API_KEY=sk-...
MOCK_MODE=false
```

### 주요 API 엔드포인트
| 엔드포인트 | 설명 | Rate Limit |
|-----------|------|-----------|
| `/api/fortune` | AI 성격 분석 | 10회/분 |
| `/api/compatibility` | 연예인 궁합 | 10회/분 |
| `/api/status` | 서비스 상태 | - |

### Rate Limiting (Cloudflare KV)
- **상태**: 코드 구현 완료, KV 설정 필요
- **제한**: IP당 분당 10회
- **설정 가이드**: `docs/RATE_LIMIT_SETUP.md` 참조

### 테스트
```bash
npm test              # 전체 테스트
npm run test:watch    # Watch 모드
npm run test:coverage # 커버리지 포함
```

**현재 테스트 상태**: ✅ 215/215 통과

### 문서
- `TASKS.md` - 개선 작업 목록 (18개 태스크)
- `TECHNICAL_ANALYSIS.md` - 기술 스택 분석
- `IMPROVEMENT_ANALYSIS.md` - 부족한 점 및 개선 방안
- `docs/RATE_LIMIT_SETUP.md` - Rate Limiting 설정 가이드

### 최근 업데이트
- 2026-01-28: Jest 테스트 프레임워크 추가 (215 tests)
- 2026-01-28: Rate Limiting 구현 (Cloudflare KV)
- 2026-01-28: 에러 처리 강화 (SajuError 클래스)
- 2026-01-28: 로깅 시스템 추가 (logger.js)

---

## 빠른 시작

### 1. 의존성 설치
```bash
cd kfortunes
npm install
```

### 2. 환경 변수 설정
`.dev.vars` 파일 생성:
```
OPENAI_API_KEY=your-api-key-here
MOCK_MODE=false
```

### 3. 로컬 실행
```bash
npm run dev
```

### 4. 배포
```bash
git add .
git commit -m "your message"
git push origin main
```

---

## 운영 체크리스트

### 일일 점검
- [ ] 사이트 접속 확인 (kstarmatch.com)
- [ ] API 상태 확인 (/api/status)
- [ ] Google AdSense 수익 확인

### 주간 점검
- [ ] OpenAI API 비용 확인
- [ ] 트래픽 분석 (Google Analytics)
- [ ] 에러 로그 확인

### 즉시 해야 할 것
- [ ] Cloudflare KV 설정 (Rate Limiting 활성화)
- [ ] Google AdSense 승인 대기

---

*마지막 업데이트: 2026-01-29*
