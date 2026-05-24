---
id: SPEC-GAME-002
version: 1.0.0
status: completed
created: 2026-05-25
updated: 2026-05-25
author: yna
priority: high
issue_number: 0
---

# SPEC-GAME-002: Gameplay Extensions — Difficulty & Obstacles (게임플레이 확장: 난이도와 장애물)

## HISTORY

- 2026-05-25: 최초 작성 (draft). SPEC-GAME-001(플레이 가능한 스네이크 MVP) 위에 쌓이는 확장 SPEC. SPEC-GAME-001은 아직 구현되지 않았으므로 delta 마커 없음(기존 코드 없음). 색상 테마는 별도 SPEC(SPEC-GAME-003) 소관으로 본 SPEC 범위에서 제외. author: yna.
- 2026-05-25: TDD 구현 완료 및 sync. status `draft` → `completed`, version 0.1.0 → 1.0.0. 전체 116개 테스트 통과(SPEC-GAME-001 81개 + SPEC-GAME-002 35개), 타입 오류 0, 커버리지 97.86%(게임 코어 99.61%). 신규 파일 5개(difficulty.ts, DifficultyPanel.ts, Difficulty.test.ts, Obstacle.test.ts, DifficultyPanel.test.ts) 생성, 수정 파일 4개(Game.ts, Collision.ts, Renderer.ts, main.ts). 계획 대비 변동: (1) 틱 주기가 main.ts 루프의 고정 상수가 아닌 Game.tickInterval로 변경되어 Game 클래스에서 동적 제어 가능; Board.ts는 미생성(게임판 모듈 불필요, Collision만 확장); (2) 장애물은 GameOptions.obstacles로 주입되며 Game이 저장/관리; (3) 장애물 충돌은 checkObstacleCollision으로 벽/자체 충돌과 단일 규칙으로 통합. author: yna.

---

## 개요 (Overview)

SPEC-GAME-001에서 정의한 플레이 가능한 스네이크 MVP에 두 가지 게임플레이 확장을 추가한다: (1) 사용자가 선택하는 고정 난이도 프로필을 통한 게임 속도(틱 주기) 제어, (2) 게임판 내부에 고정 장애물을 배치하는 장애물 모드. 두 확장 모두 SPEC-GAME-001이 정의한 게임 코어(`Game`, `Board`, `Collision`, `Food`)와 설정(`config`), 렌더러(`Renderer`)를 **확장**하며, 코어 게임 루프를 재구현하지 않는다.

핵심 설계 원칙은 SPEC-GAME-001을 그대로 계승한다: 게임 코어 로직은 렌더링/DOM/입력과 분리된 순수(pure) 로직으로 구현하여 결정론적 단위 테스트(TDD)를 가능하게 한다. 난이도와 장애물은 모두 주입 가능한 설정값(틱 주기 프로필, 장애물 셀 집합)으로 표현하여 테스트 결정성을 보장한다.

---

## 의존성 (Dependency on SPEC-GAME-001)

본 SPEC은 SPEC-GAME-001의 구현에 **직접 의존**한다. 다음 산출물이 SPEC-GAME-001에서 먼저 구현되어 있어야 한다:

- `src/game/Game.ts` — 게임 상태 머신(`ready` / `playing` / `gameover`)과 틱 루프
- `src/game/Board.ts` — 게임판 셀 그리드 및 셀 좌표(Position) 관리
- `src/game/Collision.ts` — 벽/자체 충돌 감지
- `src/game/Food.ts` — 빈 셀 무작위 음식 생성
- `src/config/constants.ts` — 게임판 크기, 셀 크기, 틱 주기, 음식당 점수 상수
- `src/ui/Renderer.ts` — Canvas 렌더링
- `src/main.ts` — Canvas 초기화 및 게임 부트스트랩

본 SPEC은 위 모듈을 확장하며, SPEC-GAME-001이 정의한 상태 머신·충돌 규칙·음식 생성 규칙과 충돌하지 않도록 통합한다. SPEC-GAME-001이 구현되기 전에는 본 SPEC을 구현할 수 없다.

---

## EARS 요구사항 (Requirements)

### REQ-EXT-001: 난이도 / 속도 제어 (Difficulty / Speed Control)

**Ubiquitous**
- 시스템은 난이도 프로필(낮음/중간/높음)을 각각의 틱 주기(tick interval) 값으로 `src/config/difficulty.ts`에 정의해야 한다(shall).

**Event-driven**
- 사용자가 게임 상태 `ready`에서 난이도를 선택했을 때(When), 시스템은 선택된 프로필의 틱 주기를 게임 루프에 적용해야 한다(shall).

**State-driven**
- 게임 상태가 `playing`인 동안(While), 시스템은 선택된 난이도의 틱 주기를 일정하게 유지해야 한다(shall).

**Unwanted behaviour**
- 만약(If) 사용자가 게임 상태 `playing` 도중 난이도를 변경하면, 그러면(then) 시스템은 현재 진행 중인 게임의 틱 주기를 변경하지 않고, 변경된 난이도를 다음 재시작(restart)부터 적용해야 한다(shall).

### REQ-EXT-002: 벽 장애물 (Wall Obstacles)

**Optional feature**
- 장애물 모드가 활성화된 경우(Where), 시스템은 config에 정의된 고정 장애물 셀 집합을 게임판에 배치해야 한다(shall).

**Unwanted behaviour**
- 만약(If) 뱀의 머리가 장애물 셀로 이동하면, 그러면(then) 시스템은 게임 상태를 `gameover`로 전환해야 한다(shall). 이 규칙은 SPEC-GAME-001의 벽/자체 충돌과 동일한 충돌 규칙으로 `Collision`에 통합한다.
- 만약(If) 새 음식 생성 시 후보 셀이 장애물 셀 또는 뱀 세그먼트와 겹치면, 그러면(then) 시스템은 장애물과 뱀이 모두 점유하지 않은 빈 셀 중에서만 음식을 선택해야 한다(shall).

**Ubiquitous**
- 장애물 모드에서 시스템은 게임 시작 시 뱀의 초기 위치(초기 세그먼트)와 장애물 셀이 겹치지 않음을 보장해야 한다(shall).

---

## Exclusions (What NOT to Build)

이 SPEC은 명시적으로 다음을 구현 범위에서 제외한다:

- **동적 난이도(점수 기반 자동 가속)**: 점수나 진행도에 따라 속도가 자동으로 바뀌는 기능은 구현하지 않는다. 사용자가 선택하는 고정 프로필(낮음/중간/높음)만 지원한다.
- **움직이는/파괴 가능한 장애물**: 게임 중 위치가 바뀌거나 뱀이 부술 수 있는 장애물은 구현하지 않는다. 게임 시작 시 고정되는 정적 장애물만 지원한다.
- **색상 테마(Color themes / theming)**: 라이트/다크 테마 등 외관 커스터마이징은 본 SPEC 범위가 아니며 SPEC-GAME-003 소관이다.
- **코어 게임 루프 재구현**: 게임 상태 머신, 뱀 이동, 기본 충돌, 점수 시스템은 SPEC-GAME-001 소관이며 본 SPEC에서 재구현하지 않는다(확장만 수행).

---

## 가정 (Assumptions)

1. SPEC-GAME-001이 정의한 `Game` 틱 루프는 틱 주기 값을 외부에서 주입/설정할 수 있는 형태로 구현된다(고정 단일 상수에 하드코딩되지 않음). 본 SPEC은 이 주입 지점을 통해 난이도별 틱 주기를 적용한다.
2. 난이도 프로필(낮음/중간/높음)의 틱 주기 값은 `src/config/difficulty.ts`에 고정 상수로 정의되며, 숫자가 작을수록 빠르다(밀리초 단위 틱 간격).
3. 장애물 모드의 활성화 여부와 고정 장애물 셀 집합은 config(`difficulty.ts` 또는 `constants.ts`)에 정의되며, 테스트 결정성을 위해 좌표가 명시적으로 주입 가능하다.
4. SPEC-GAME-001의 음식 생성은 "뱀 세그먼트가 점유하지 않은 빈 셀" 기준이며, 본 SPEC은 이 "빈 셀" 정의에 장애물 셀을 추가로 배제하도록 확장한다.
5. 게임은 단일 브라우저 탭에서 실행되는 클라이언트 사이드 전용이며, 백엔드/DB가 없다(SPEC-GAME-001과 동일).

---

## 기술 제약 (Technical Constraints)

- 언어: TypeScript (strict 모드)
- 렌더링: HTML5 Canvas 2D API (장애물 셀 렌더링은 `Renderer`에 추가)
- 빌드: Vite, 테스트: Vitest
- 프로덕션 의존성: 없음(zero). 개발 의존성만 사용(vite, vitest, typescript).
- 개발 방법론: TDD (RED-GREEN-REFACTOR), 커버리지 목표 85% 이상(게임 코어 95% 이상 권장).
- 통합 제약: 장애물 충돌은 SPEC-GAME-001의 벽/자체 충돌과 단일 충돌 규칙으로 통합하며, 별도 게임 오버 경로를 만들지 않는다.

---

## Implementation Notes (구현 노트)

2026-05-25 sync 시점 기준, 본 SPEC은 TDD(RED-GREEN-REFACTOR)로 완전히 구현되었으며 모든 인수 기준과 품질 게이트를 충족했다.

### 구현 결과 요약

| 항목 | 목표 | 실제 결과 |
|------|------|-----------|
| 단위/통합 테스트 | 전체 AC 자동화 통과 | 116/116 통과 (11개 테스트 파일: SPEC-GAME-001 8개 + SPEC-GAME-002 신규 3개) |
| TypeScript strict | 타입 오류 0 | 0 (`tsc --noEmit`) |
| 커버리지 | 전체 85%+, 코어 95%+ | 전체 97.86%, 게임 코어 99.61%, DifficultyPanel.ts 100% |
| SPEC-GAME-001 회귀 | 기존 기능 유지 | 81개 기존 테스트 모두 통과, 기존 기능 훼손 없음 |
| Exclusions | 범위 외 기능 미포함 | 준수 (동적 난이도/움직이는 장애물/색상 테마/코어 재구현 부재 확인) |

### 신규 파일 및 수정 파일

**신규 파일** (5개):
- `src/config/difficulty.ts` — 난이도 프로필(낮음/중간/높음) 정의, 각 프로필의 틱 주기값
- `src/ui/DifficultyPanel.ts` — 난이도 선택 UI 컴포넌트
- `tests/game/Difficulty.test.ts` — 난이도 설정 및 적용 검증 (AC-DIFF-1~3)
- `tests/game/Obstacle.test.ts` — 장애물 충돌/음식 생성/초기 배치 검증 (AC-OBS-1~3)
- `tests/ui/DifficultyPanel.test.ts` — DifficultyPanel UI 렌더링 및 이벤트 검증

**수정 파일** (4개):
- `src/game/Game.ts` — `tickInterval` / `pendingTickInterval` 필드 추가, 틱 주기 동적 제어, 난이도 적용 로직 통합
- `src/game/Collision.ts` — `checkObstacleCollision` 메서드 추가, 벽/자체/장애물 충돌을 단일 통합 규칙으로 처리
- `src/ui/Renderer.ts` — 장애물 셀 렌더링 로직 추가 (`drawObstacles`)
- `src/main.ts` — 난이도 선택 UI 초기화 및 이벤트 핸들러 등록

### 계획 대비 변동 및 설계 결정

#### 변동 1: 틱 주기 관리 위치
**계획**: `main.ts` 루프에서 `TICK_MS` 상수로 틱 주기 제어  
**실제**: Game 클래스가 `tickInterval` (현재 적용 중) + `pendingTickInterval` (다음 재시작부터 적용) 필드 보유

**근거**:
- `playing` 중 난이도 변경 시 현재 게임 영향 없이 다음 재시작부터 적용하는 REQ-EXT-001 "Unwanted behaviour" 구현 필요
- Game이 틱 주기를 소유하면 난이도 변경 로직 (`setDifficulty` 메서드)이 Game 내부에 응집됨
- main.ts는 단순히 `game.tickInterval` 값을 읽어 루프 간격으로 사용 (설정/관리 불필요)

#### 변동 2: Board.ts 미생성
**계획**: `src/game/Board.ts` (게임판 상태 및 렌더링)  
**실제**: Board.ts 미생성 (SPEC-GAME-001에서도 미생성)

**근거**:
- SPEC-GAME-001 설계에서 Board 모듈은 사용되지 않음
- 게임판 크기, 셀 좌표 관리는 `Game.ts` 및 `Collision.ts`에서 직접 처리 (높은 응집도)
- 장애물도 `GameOptions.obstacles` (좌표 배열)로 주입되어 Board 추상화 불필요
- 기존 구조 유지로 복잡도 최소화

#### 변동 3: 장애물 소유권
**계획**: 장애물 셀 집합을 `src/config/` 또는 `Board.ts`에 저장  
**실제**: 장애물은 `GameOptions.obstacles` 필드로 Game에 주입되며, Game이 저장

**근거**:
- 테스트 결정성: 각 테스트에서 다른 장애물 배치로 테스트 가능 (config 의존성 제거)
- Food.spawn()의 "빈 셀" 정의에 장애물 포함 필요 → Game이 점유 셀 집합 전체(뱀 + 장애물) 관리하면 일관성 유지
- Collision 로직도 Game이 보유한 장애물 집합에 대해 checkObstacleCollision 실행

### 요구사항 → 구현 매핑

- REQ-EXT-001 (난이도/속도 제어): `src/config/difficulty.ts`, `src/game/Game.ts` (tickInterval/pendingTickInterval, setDifficulty) — 검증: `tests/game/Difficulty.test.ts` (AC-DIFF-1~3)
- REQ-EXT-002 (벽 장애물): `src/game/Collision.ts` (checkObstacleCollision), `src/game/Game.ts` (obstacles 저장), `src/ui/Renderer.ts` (drawObstacles) — 검증: `tests/game/Obstacle.test.ts` (AC-OBS-1~3)

### @MX 태그

- ANCHOR(REASON 포함): `Game.tick`, `Game.setDifficulty`, `Collision.checkObstacleCollision`, `Food.spawn`
- NOTE: 난이도 변경 펜딩 로직, 장애물 충돌 통합 규칙, 틱 주기 동적 제어
- WARN: 장애물 충돌 감지 복잡도 (>=15 라인, 벽/자체/장애물 조건 통합)

### SPEC-GAME-001과의 호환성 검증

- SPEC-GAME-001의 인수 기준 (AC-SCORE, AC-SELF, AC-WALL, AC-RENDER 등) 전부 통과 (회귀 0)
- 기존 게임 루프/뱀 이동/음식 생성 로직 변경 없음 (확장만 수행)
- 난이도/장애물 비활성화 시 SPEC-GAME-001 MVP와 동일한 동작 보장
