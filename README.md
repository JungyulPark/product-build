# 눈 주변 해부 · Periocular Anatomy

안검, 눈물길, 안와, 외안근 같은 **눈 주변 구조를 정밀한 해부 교육 모형으로 그리는** 프로젝트입니다.
그림마다 받침대 위에 실제로 만들 수 있는 모형이 하나 있습니다. 부품을 분해해 볼 수 있고,
기전(거근이 당기면 눈꺼풀이 올라가는 등)이 실제로 움직입니다. 그림 속 모든 치수와 판독값은 출처가 있는 해부학 수치에서 나옵니다.

그림은 [Anatomy](https://github.com/wheresryan22/anatomy) Claude 스킬(MIT)로 그립니다.
이 저장소의 `.claude/skills/anatomy/`에 들어 있어서, 여기서 Claude Code를 열면 `/anatomy`로 바로 쓸 수 있습니다.

## 그림 목록

| 그림 | 보여줄 구조 | 움직임 | 상태 |
|---|---|---|---|
| 상안검 단면과 거근 기전 | 피부·안륜근, 안와격막, 안와지방, 거근·건막, Whitnall 인대, 뮐러근, 검판, 결막 | 거근을 당기면 눈꺼풀이 올라가고 MRD1이 읽힘 | 예정 |
| 눈물길 | 눈물점 → 소관 → 총소관 → 눈물주머니 → 코눈물관 → 하비도 | 깜빡일 때마다 눈물이 흘러감 | 예정 |
| 안와와 외안근 | 안와 골벽, Zinn 고리, 직근 4·사근 2, 도르래, 시신경 | 근육 수축 → 안구 회전 | 예정 |
| 갑상선눈병증의 안구돌출 | 외안근 비대, 안와지방 증가, 안와 용적 | 부피 증가 → 안구돌출(Hertel) | 예정 |

목록은 `figures.json`에 있고, `index.html`이 이 목록으로 만든 갤러리입니다.

## 구조

```
.claude/skills/anatomy/   Anatomy 스킬 (wheresryan22/anatomy @ 1482e84, MIT, PDF 제외)
figures.json              그림 목록 — 갤러리와 build-all이 읽음
figures/<slug>/
  README.md               해부 노트: 구조, 치수와 출처, 모형 부품 ↔ 해부 구조, 임상 연결, 검수 상태
  model.mjs               치수·관계 (값마다 출처 주석) — 그림의 모든 숫자의 출처
  build.mjs               그림 빌드 → <slug>.html, <slug>-light.html
  cover.png               갤러리용 스크린샷
scripts/
  kit.mjs                 스킬 키트 import 지점
  build-all.mjs           모든 그림 + index.html 빌드
  shoot.mjs               Playwright 스크린샷 (확대 검토용)
```

## 실행

```sh
node scripts/build-all.mjs                 # 전체 빌드 (의존성 없음, Node 20.10+)
node scripts/build-all.mjs upper-eyelid    # 하나만
node scripts/shoot.mjs figures/<slug>/<slug>-light.html shots/a.png --scale 4 --zoom 400,250,150,110
python3 -m http.server                     # http://localhost:8000 에서 갤러리 보기
```

## 라이선스

`.claude/skills/anatomy/`는 Ryan(wheresryan22)의 MIT 라이선스 코드입니다(`LICENSE` 참고).
