# 눈 주변 해부 — Claude 작업 규칙

이 저장소는 눈 주변(안검·눈물길·안와·외안근) 해부를 정밀 교육 모형으로 그리는 프로젝트입니다. 다른 주제는 다루지 않습니다.
문서와 그림 카드 문구는 한국어로 쓰고, 해부 용어는 한글(영문)으로 병기합니다. 예: 상안검거근(levator palpebrae superioris).

## 그림은 Anatomy 스킬로

- 스킬은 `.claude/skills/anatomy/`에 vendored(upstream `wheresryan22/anatomy` @ `1482e84`, MIT, PDF 제외)되어 있습니다.
  그림 작업 전에 `SKILL.md`를 불러오고, `references/craft.md`를 읽고, 가장 가까운 예제를 엽니다.
- 스킬 파일은 고치지 않습니다. 업데이트할 때는 upstream을 통째로 다시 복사하고 커밋 해시를 바꿉니다.
- 키트는 `scripts/kit.mjs`로만 import합니다 (`import { k, kitScript, moduleScript } from "../../scripts/kit.mjs"`).

## 해부 그림에 맞춘 스킬 해석

- **물체 = 받침대 위의 해부 교육 모형.** 기계 은유로 바꾸지 않고, 실제 구조를 정밀 모형으로 만듭니다. 받침판, 모형을 잡는 스탠드, 분리되는 부품, 단면(시상면·관상면) 절개가 "부품"입니다.
- 형태 어휘: 안구는 `sphereOf`, 안와는 원뿔 `lathe`/`prismOf`, 외안근·시신경·눈물관은 `tubePieces`(가늘어지는 반지름), 검판·격막·건막은 얇은 판, 혈관·신경은 케이블.
- **진실 우선**: 치수와 관계는 출처가 있는 값만 씁니다(교과서, 리뷰 논문). `model.mjs`에 값마다 출처를 주석으로 달고, 개인차가 큰 값은 범위로 둡니다.
  출처를 확인하지 못한 값은 노트에 "확인 필요"로 표시합니다.
- **검수**: 사용자가 내용을 검수하기 전에는 해부 노트 맨 위에 `검수 전`을 표시합니다.
- 그림 안에는 글자를 넣지 않습니다(스킬 규칙). 구조 이름은 범례·캡션과 부품 hover 판독으로 보여줍니다.

## 그림 하나 = 폴더 하나 (`figures/<slug>/`)

- `model.mjs`: 치수·관계를 담은 순수 함수와 상수. 그림의 숫자·판독·움직임은 모두 여기서 나옵니다. `moduleScript()`로 페이지에 인라인합니다.
- `build.mjs`: framework-free 빌드 (`examples/dial-indicator` 방식). 페이지와 공유하는 그리기 함수는 키트 함수를 맨이름으로 부르고 `.toString()`으로 인라인합니다.
  키트 전역 이름(`tenth`, `attrs`, `escape`, `ring`, `iso` 등)과 겹치는 이름을 페이지 스크립트에 선언하지 않습니다.
- `README.md`: 해부 노트 — 한 문장, 모형 부품 ↔ 해부 구조 표, 치수와 출처, 임상 연결, 부품 목록, 검수 상태.
- `cover.png`: 라이트 테마, 안정 상태 스크린샷 (`node scripts/shoot.mjs <page> figures/<slug>/cover.png --wait 2400`).
- 그림을 추가하면 `figures.json`과 루트 README 표를 갱신하고 `node scripts/build-all.mjs`로 `index.html`을 다시 만듭니다.

## 검증

- `node scripts/shoot.mjs`로 데스크톱·폰(`--width 390`)·다크·키 입력(`--keys`)·시간 경과(`--times`)·4~5배 확대(`--scale 5 --zoom x,y,w,h`)를 찍고 PNG를 직접 봅니다.
- 이 클라우드 환경에서는 스킬의 `scripts/capture.mjs`/`drive.mjs`/`lines.mjs`(Chrome 원격 디버깅)가 권한 분류기에 막힐 수 있어 `shoot.mjs`를 씁니다. 로컬에서는 스킬 스크립트로 line-end 검사까지 돌립니다.
- 라이트 테마가 기본입니다. 다크도 깨지지 않게 확인합니다.
