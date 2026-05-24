# 구현 계획 - SPEC-GAME-001: Playable Snake MVP

## 기술 스택 및 의존성 (Technology Stack and Dependencies)

- **언어**: TypeScript 4.9+ (strict)
- **렌더링**: HTML5 Canvas 2D API
- **빌드/개발 서버**: Vite 5.x
- **테스트**: Vitest 1.x
- **프로덕션 의존성**: 없음 (zero — 순수 TypeScript + Canvas)
- **개발 의존성**: `vite`, `vitest`, `typescript` (필수). `eslint`, `prettier`는 코드 품질용으로 함께 사용.

## 기술적 접근 (Technical Approach)

핵심 전략은 **로직과 렌더링의 분리**다.

- `src/game/` 모듈은 DOM/Canvas/타이머에 의존하지 않는 순수 로직으로 작성한다. 입력은 "방향 변경 의도"와 "틱 진행"이라는 추상 이벤트로만 받는다. 이로써 모든 게임 규칙을 결정론적 단위 테스트로 검증할 수 있다.
- `src/ui/` 모듈은 `game/`의 상태를 읽어 Canvas에 그리고(`Renderer`), 키보드 이벤트를 `game/`이 이해하는 방향 의도로 변환한다(`InputHandler`).
- `Game.tick()`이 게임 진행의 단일 진입점이다. 틱마다: (1) 확정된 방향 적용 → (2) 머리 이동 계산 → (3) 충돌 검사 → (4) 음식 섭취/성장 또는 일반 이동 → (5) 상태 갱신.
- 음식 무작위 생성은 주입 가능한 난수 함수(`() => number`)로 추상화하여 테스트에서 고정 시드를 사용한다.

## 작업 분해 (Task Decomposition)

구조는 `structure.md`의 모듈 정의를 따른다. 우선순위는 의존성 순서를 따른다.

### Priority High — 게임 코어 (순수 로직, TDD 중심)

1. **config/constants.ts** — 게임판 크기(`GRID_WIDTH`, `GRID_HEIGHT`), 셀 크기, 틱 주기, 음식당 점수, 초기 뱀 길이/위치, 방향 벡터 상수 정의.
2. **game/types.ts** — `Position`, `Direction`, `GameStatus`(`ready`|`playing`|`gameover`) 등 공유 타입 정의.
3. **game/Snake.ts** — 세그먼트 배열, 현재 방향, `move(grow: boolean)`, 방향 설정(180도 반전 거부 포함), 점유 셀 조회. (REQ-GAME-001, REQ-GAME-004)
4. **game/Food.ts** — 빈 셀 목록에서 주입된 난수로 음식 위치 선정, 현재 음식 위치 관리. (REQ-GAME-002)
5. **game/Collision.ts** — 벽 충돌, 자체 충돌, 음식 섭취 판정 순수 함수. (REQ-GAME-002, REQ-GAME-003)
6. **game/Score.ts** — 점수 보유 및 증가, 초기화. (REQ-GAME-005)
7. **game/Game.ts** — 상태 머신과 `tick()` 루프 조율. start/restart, 상태 전이, 위 모듈 통합. (모든 REQ)

### Priority Medium — UI/통합 (Canvas, DOM)

8. **ui/Renderer.ts** — `Game` 상태를 받아 Canvas에 게임판/뱀/음식/점수/상태 그리기. (REQ-GAME-005)
9. **ui/InputHandler.ts** — 키보드 이벤트(Arrow/WASD)를 방향 의도로 변환하여 `Game`에 전달. (REQ-GAME-004)
10. **main.ts / index.html** — Canvas 초기화, `Game` 인스턴스 생성, `requestAnimationFrame` 기반 틱 루프 연결, 입력 핸들러 등록.

### 테스트 (각 코어 모듈과 동반, RED 우선)

- `tests/game/Snake.test.ts`, `Food.test.ts`, `Collision.test.ts`, `Score.test.ts`, `Game.test.ts`
- `tests/integration/GameFlow.test.ts` — 시작 → 이동 → 섭취 → 충돌 → 게임 오버 → 재시작 전체 흐름.

## 마일스톤 (Milestones, 우선순위 기반)

- **M1 (High)**: config/types + Snake + Food + Collision + Score 코어 모듈과 단위 테스트 통과 (RED→GREEN).
- **M2 (High)**: Game 상태 머신/tick 루프 완성, 통합 테스트 통과. 게임 규칙 전체가 순수 로직으로 검증됨.
- **M3 (Medium)**: Renderer + InputHandler + main.ts 연결, 브라우저에서 실제 플레이 가능.
- **M4 (Medium)**: REFACTOR 단계 — 중복 제거, 커버리지 85%+ 확인, LSP/타입 오류 0 확인.

## 위험 분석 (Risk Analysis)

| 위험 | 영향 | 완화책 |
|------|------|--------|
| 게임 루프 타이밍(`requestAnimationFrame` vs 고정 틱) 혼선 | 이동 속도 불안정, 테스트 비결정성 | 코어 `tick()`을 시간과 분리. UI는 누적 시간으로 고정 틱 간격에서만 `tick()` 호출. 테스트는 `tick()` 직접 호출. |
| 렌더링과 로직 결합으로 단위 테스트 불가 | TDD 불가, 커버리지 미달 | `game/`은 Canvas/DOM 미참조 순수 모듈로 강제. UI는 상태 읽기 전용. |
| 한 틱 내 다중 키 입력으로 인한 180도 반전 우회 | 즉사 버그 | 입력은 "다음 틱 방향"을 버퍼링하고, 틱 시작 시 현재 확정 방향 기준으로 반전 검사. |
| 음식 무작위성으로 테스트 불안정 | 플레이키 테스트 | 난수 소스를 주입 가능하게 설계, 테스트에서 고정값 사용. |
| 뱀이 보드를 가득 채운 극단 상황(빈 셀 없음) | 음식 생성 불가/크래시 | 빈 셀이 없으면 음식 생성을 생략하고 클리어 상태로 처리(크래시 금지). |

## mx_plan

게임 코어의 핵심 불변식 함수에 @MX 태그를 부여한다.

- **@MX:ANCHOR** 후보 (high fan_in, 불변 계약):
  - `Game.tick()` — 모든 진행이 이 함수를 통과하는 단일 진입점.
  - `Collision` 판정 함수(벽/자체/음식) — 게임 종료/성장의 핵심 계약.
- **@MX:NOTE** 후보 (의도/맥락 전달):
  - `config/constants.ts`의 그리드/틱/점수 상수 — 변경 시 게임 밸런스 영향.
  - 방향 규칙(180도 반전 거부) 로직 — 비자명한 규칙의 의도 설명.
- **@MX:TODO**: GREEN 단계 전 미구현 분기에 임시 표기(GREEN에서 해소).

(이 SPEC은 그린필드이므로 @MX:LEGACY는 해당 없음.)
