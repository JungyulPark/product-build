# Product Anatomy — Claude 작업 규칙

이 저장소는 사용자의 제품들을 하나씩 "실제 기계"로 그리는 아나토미 프로젝트입니다. 문서와 그림 카드 문구는 한국어로 씁니다.

## 그림은 Anatomy 스킬로

- 스킬은 `.claude/skills/anatomy/`에 vendored(upstream `wheresryan22/anatomy` @ `1482e84`, MIT, PDF 제외)되어 있습니다.
  그림 작업 전에 반드시 스킬을 불러오고(`SKILL.md`), `references/craft.md`를 읽고, 가장 가까운 예제를 엽니다.
- 스킬 파일은 고치지 않습니다. 업데이트할 때는 upstream을 통째로 다시 복사하고 이 문서와 README의 커밋 해시를 바꿉니다.
- 키트는 `scripts/kit.mjs`로만 import합니다 (`import { k, kitScript, moduleScript } from "../../scripts/kit.mjs"`).

## 제품 하나 = 폴더 하나 (`products/<slug>/`)

- `model.mjs`: 제품 코드의 규칙을 그대로 옮긴 순수 함수. 그림의 숫자·판독·움직임은 모두 여기서 나옵니다.
  가능하면 원본 코드와 대조합니다(KStar Match는 `node:vm`으로 원본을 돌려 7,404개 날짜 비교). 원본의 버그도 "제품의 동작"으로 그대로 옮기고, 노트에 적습니다.
- `build.mjs`: framework-free 빌드 (`examples/dial-indicator` 방식). 페이지와 공유하는 그리기 함수는 키트 함수를 맨이름으로 부르고 `.toString()`으로 인라인합니다. 모델은 `moduleScript()`로 인라인합니다.
  키트 전역 이름(`tenth`, `attrs`, `escape`, `ring`, `iso` 등)과 겹치는 이름을 페이지 스크립트에 선언하지 않습니다.
- `README.md`: 해부 노트 — 한 문장, 개념→부품 표, 숫자, **그리면서 발견한 것**, 부품 목록, 빌드 방법.
- `cover.png`: 라이트 테마, 안정 상태 스크린샷 (`node scripts/shoot.mjs <page> products/<slug>/cover.png --wait 2400`).
- 제품을 추가하면 `products.json`과 루트 README 갤러리 표도 갱신하고 `node scripts/build-all.mjs`로 `index.html`을 다시 만듭니다.

## 검증

- `node scripts/shoot.mjs`로 데스크톱·폰(`--width 390`)·다크·키 입력(`--keys`)·시간 경과(`--times`)·4~5배 확대(`--scale 5 --zoom x,y,w,h`)를 찍고 PNG를 직접 봅니다.
- 이 클라우드 환경에서는 스킬의 `scripts/capture.mjs`/`drive.mjs`/`lines.mjs`(Chrome 원격 디버깅 실행)가 권한 분류기에 막힐 수 있어 `shoot.mjs`를 씁니다. 로컬에서는 스킬 스크립트로 line-end 검사까지 돌립니다.
- 라이트 테마가 기본(ships)입니다. 다크도 깨지지 않게 확인합니다.

## 이전 내용

KStar Match 사이트 코드(`kfortunes/`)는 태그 `archive/kstarmatch-2026-01`에 있습니다. 제품 근거 코드를 읽을 때 `git show archive/kstarmatch-2026-01:kfortunes/<path>`로 봅니다.
