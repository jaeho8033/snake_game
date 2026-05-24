---
id: SPEC-GAME-001
version: 1.0.0
status: completed
created: 2026-05-24
updated: 2026-05-25
author: yna
priority: high
issue_number: 0
---

# SPEC-GAME-001: Playable Snake MVP (플레이 가능한 스네이크 MVP)

## HISTORY

- 2026-05-24: 최초 작성 (draft). 그린필드 프로젝트의 첫 번째 SPEC. 기존 코드 없음(delta 마커 없음). author: yna.
- 2026-05-24: audit iteration 1 minor fixes (D1/D2/D3). AC-SCORE-1을 `SCORE_PER_FOOD` 상수 참조로 명확화(D1), AC-SELF-1에 구체적 세그먼트 좌표 픽스처 추가(D2), REQ-GAME-005 렌더링/점수 표시용 인수 시나리오(AC-RENDER-1/2) 추가(D3). author: yna.
- 2026-05-25: TDD 구현 완료 및 sync. status `draft` → `completed`, version 0.1.0 → 1.0.0. 전체 81개 테스트 통과, 타입 오류 0, 커버리지 99.08%(게임 코어 99.52%). Implementation Notes 추가. author: yna.

---

## 개요 (Overview)

브라우저에서 직접 실행되는 클래식 스네이크 게임의 최소 기능 집합(MVP)을 정의한다. 사용자는 키보드로 뱀의 방향을 제어하고, 음식을 먹어 뱀을 성장시키며 점수를 올린다. 벽 또는 자기 자신과 충돌하면 게임이 종료되며, 게임 오버 상태에서 재시작할 수 있다.

핵심 설계 원칙: 게임 로직 코어(`game/` 모듈)는 렌더링(`Renderer`) 및 DOM/입력(`InputHandler`)과 완전히 분리된 순수(pure) 로직으로 구현한다. 이는 TDD(RED-GREEN-REFACTOR)에 적합한 결정론적 단위 테스트를 가능하게 한다.

---

## EARS 요구사항 (Requirements)

### REQ-GAME-001: 게임 루프 및 뱀 이동 (Game Loop and Snake Movement)

**Ubiquitous**
- 시스템은 게임판을 고정된 셀 그리드(grid)로 표현하고, 각 뱀 세그먼트와 음식을 셀 좌표(Position)로 관리해야 한다(shall).
- 시스템은 게임 코어 로직을 렌더링 및 DOM과 분리된 순수 함수/클래스로 구현해야 한다(shall).

**State-driven**
- 게임 상태가 `playing`인 동안(While), 시스템은 고정된 틱(tick) 주기마다 뱀의 머리를 현재 진행 방향으로 한 셀 전진시켜야 한다(shall).
- 게임 상태가 `playing`인 동안(While) 뱀이 음식을 먹지 않은 틱에서는, 시스템은 머리를 전진시키고 꼬리를 한 셀 제거하여 뱀의 길이를 유지해야 한다(shall).

### REQ-GAME-002: 음식 생성 및 성장 (Food Spawning and Growth)

**Ubiquitous**
- 시스템은 항상 게임판 위에 정확히 하나의 음식을 유지해야 한다(shall).

**Event-driven**
- 뱀의 머리가 음식이 있는 셀로 이동했을 때(When), 시스템은 뱀의 길이를 한 세그먼트 증가시키고(꼬리를 제거하지 않음), 점수를 증가시키며, 새 음식을 생성해야 한다(shall).
- 새 음식을 생성할 때(When), 시스템은 뱀의 세그먼트가 점유하지 않은(빈) 셀 중에서 무작위로 한 셀을 선택해야 한다(shall).

### REQ-GAME-003: 충돌 및 게임 오버 (Collision and Game Over)

**Unwanted behaviour**
- 만약(If) 뱀의 머리가 게임판 경계(벽) 바깥으로 이동하면, 그러면(then) 시스템은 이동을 확정하지 않고 게임 상태를 `gameover`로 전환해야 한다(shall).
- 만약(If) 뱀의 머리가 자신의 다른 세그먼트가 점유한 셀로 이동하면, 그러면(then) 시스템은 게임 상태를 `gameover`로 전환해야 한다(shall).

**State-driven**
- 게임 상태가 `gameover`인 동안(While), 시스템은 틱에 의한 뱀 이동을 수행하지 않아야 한다(shall).

### REQ-GAME-004: 방향 입력 및 180도 반전 방지 (Direction Input and Reversal Prevention)

**Event-driven**
- 사용자가 방향 키(Arrow keys 또는 WASD)를 눌렀을 때(When), 시스템은 다음 틱에 적용될 뱀의 진행 방향을 갱신해야 한다(shall).

**Unwanted behaviour**
- 만약(If) 입력된 방향이 현재 진행 방향의 정반대(180도 반전)이면, 그러면(then) 시스템은 해당 방향 변경을 무시하고 현재 방향을 유지해야 한다(shall).
- 만약(If) 한 틱 사이에 여러 방향 입력이 들어오면, 그러면(then) 시스템은 마지막 유효 입력만을 다음 틱의 방향으로 확정해야 한다(shall).

### REQ-GAME-005: 점수, 게임 상태 및 재시작 (Score, Game State, and Restart)

**Ubiquitous**
- 시스템은 현재 점수를 화면에 표시하고, 현재 게임 상태(`ready` / `playing` / `gameover`)를 사용자에게 나타내야 한다(shall).
- 시스템은 HTML5 Canvas를 사용하여 게임판, 뱀, 음식을 렌더링해야 한다(shall).

**Event-driven**
- 음식 섭취가 발생할 때마다(When), 시스템은 점수를 고정된 양만큼 증가시켜야 한다(shall).
- 사용자가 게임 상태 `ready`에서 시작을 트리거했을 때(When), 시스템은 게임 상태를 `playing`으로 전환하고 틱 루프를 시작해야 한다(shall).
- 사용자가 게임 상태 `gameover`에서 재시작을 트리거했을 때(When), 시스템은 뱀, 음식, 점수를 초기 상태로 재설정하고 게임 상태를 `playing`으로 전환해야 한다(shall).

---

## Exclusions (What NOT to Build)

이 SPEC은 명시적으로 다음을 구현 범위에서 제외한다:

- **난이도/속도 조절 컨트롤**: 게임 속도는 고정된 단일 틱 주기를 사용하며, 사용자가 속도/레벨을 선택하는 기능은 구현하지 않는다.
- **벽 장애물(Wall obstacles)**: 게임판 내부에 고정 장애물을 배치하는 모드는 구현하지 않는다.
- **색상 테마(Color themes / theming)**: 라이트/다크 테마 등 외관 커스터마이징은 구현하지 않는다.
- **최고 점수 영구 저장(High-score persistence / localStorage)**: 점수는 브라우저 세션/현재 게임 동안에만 유지하며, 영구 저장하지 않는다.
- **모바일/터치 컨트롤(Mobile/touch controls)**: 키보드 입력만 지원한다.
- **사운드(Sound)**: 효과음/배경음은 구현하지 않는다.
- **멀티플레이어(Multiplayer)**: 단일 플레이어 로컬 게임만 구현한다.

---

## 가정 (Assumptions)

1. 게임판 크기, 셀 크기, 틱 주기, 음식당 점수는 `config/constants.ts`에 고정 상수로 정의된다.
2. 음식 생성의 무작위성은 테스트 결정성을 위해 주입 가능한(injectable) 난수 소스로 추상화한다.
3. 게임은 단일 브라우저 탭에서 실행되는 클라이언트 사이드 전용이며, 백엔드/DB가 없다.

---

## 기술 제약 (Technical Constraints)

- 언어: TypeScript (strict 모드)
- 렌더링: HTML5 Canvas 2D API
- 빌드: Vite, 테스트: Vitest
- 프로덕션 의존성: 없음(zero). 개발 의존성만 사용(vite, vitest, typescript).

---

## Implementation Notes (구현 노트)

2026-05-25 sync 시점 기준, 본 SPEC은 TDD(RED-GREEN-REFACTOR)로 완전히 구현되었으며 모든 인수 기준과 품질 게이트를 충족했다.

### 구현 결과 요약

| 항목 | 목표 | 실제 결과 |
|------|------|-----------|
| 단위/통합 테스트 | 전체 AC 자동화 통과 | 81/81 통과 (8개 테스트 파일) |
| TypeScript strict | 타입 오류 0 | 0 (`tsc --noEmit`) |
| 커버리지 | 전체 85%+, 코어 95%+ | 전체 99.08%, 게임 코어 99.52% |
| 프로덕션 빌드 | 성공 | 성공 (vite build, 13 모듈) |
| Exclusions | 범위 외 기능 미포함 | 준수 (localStorage/Audio/touch/theme/difficulty 부재 확인) |

### 요구사항 → 구현 매핑

- REQ-GAME-001 (게임 루프/이동): `src/game/Snake.ts`, `src/game/Game.ts`(`tick()`) — 검증: `tests/game/Snake.test.ts`, `tests/game/Game.test.ts`
- REQ-GAME-002 (음식 생성/성장): `src/game/Food.ts`, `src/game/Collision.ts`(`checkFoodEaten`) — 검증: `tests/game/Food.test.ts`
- REQ-GAME-003 (충돌/게임오버): `src/game/Collision.ts`(`checkWallCollision`/`checkSelfCollision`) — 검증: `tests/game/Collision.test.ts`
- REQ-GAME-004 (방향 입력/180도 반전 방지): `src/game/Game.ts`(`committedDirection`, `setDirection`), `src/ui/InputHandler.ts` — 검증: `tests/ui/InputHandler.test.ts`
- REQ-GAME-005 (점수/상태/재시작): `src/game/Score.ts`, `src/game/Game.ts`(`restart`), `src/ui/Renderer.ts` — 검증: `tests/game/Score.test.ts`, `tests/integration/GameFlow.test.ts`, `tests/ui/Renderer.test.ts`

### 계획 대비 변동 (Divergence)

- 계획(`plan.md`) 대비 추가 구현된 테스트: `tests/ui/Renderer.test.ts`, `tests/ui/InputHandler.test.ts` — UI 계층 커버리지 확보를 위해 추가(범위 확장 없음, 동일 REQ 검증 보강).
- ESLint/Prettier는 `plan.md`에서 선택 항목으로 언급되었으나 `package.json`에 미설치 상태. TypeScript strict가 타입 게이트를 대체하며 lint 게이트는 graceful skip됨.
- 그 외 계획된 파일 구조 및 모듈 경계는 `plan.md`/`structure.md`와 일치.

### @MX 태그

- ANCHOR(REASON 포함): `Game.tick`, `Snake.nextHead`, `Food.spawn`, `Collision.*`
- NOTE: `committedDirection`(EC-3), 180도 반전 규칙, dx/dy 좌표 규칙, 밸런스 상수
- 개발 방법론: TDD (RED-GREEN-REFACTOR), 커버리지 목표 85% 이상(게임 코어 95% 이상 권장).
