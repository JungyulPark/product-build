# 프로젝트 정보 요약

## 기본 정보
- **프로젝트명**: KFortunes / KStar Match
- **서비스 URL**: https://kstarmatch.com, https://kfortunes.com
- **프로젝트 디렉토리**: `/home/user/pb-week1/kfortunes/`

## Git 저장소 ⚠️ 중요
```bash
# Git Remote 구조 (혼동 주의!)
origin    → https://github.com/JungyulPark/product-build.git  # ← 실제 배포용
kfortunes → https://github.com/JungyulPark/kfortunes.git      # 별도 저장소
```

### 왜 이렇게 되었나?
- **저장소명**: product-build (프로젝트 빌드 저장소)
- **프로젝트명**: kfortunes (실제 서비스명)
- **사용**: `git push origin main` ← origin 사용

## 빠른 명령어
```bash
# 로컬 개발
npm run dev              # http://localhost:8787

# 테스트
npm test                 # 215개 테스트 실행

# 배포
git add .
git commit -m "message"
git push origin main     # ← origin 사용 (product-build)
```

## 현재 상태
- ✅ 서비스 운영 중
- ✅ 테스트 215개 통과
- ✅ Rate Limiter 코드 완료
- ⚠️ Cloudflare KV 설정 필요 (Rate Limiting 활성화)
- ⏳ Google AdSense 승인 대기

## 주요 파일
- `README.md` - 전체 프로젝트 가이드
- `TECHNICAL_ANALYSIS.md` - 기술 분석 (상위 디렉토리)
- `TASKS.md` - 개선 작업 목록 (상위 디렉토리)
- `docs/RATE_LIMIT_SETUP.md` - KV 설정 가이드

---
*저장일: 2026-01-29*
