# SPEC-GAME-002 구현 계획 (Implementation Plan)

## 개요

본 계획은 SPEC-GAME-002(난이도/속도 제어 + 벽 장애물)의 구현 접근, 작업 분해, 의존성, 리스크를 정의한다. 모든 작업은 SPEC-GAME-001이 정의한 게임 코어 위에서 수행되는 **확장**이며, 코어 게임 루프를 재구현하지 않는다.

---

## 의존성 (Dependency on SPEC-GAME-001)

[HARD] 본 SPEC은 SPEC-GAME-001 구현 완료에 의존한다. 다음이 선행되어야 한다:

- `Game` 상태 머신(`ready`/`playing`/`gameover`)과 틱 루프
- `Board` 셀 그리드 / Position 관리
- `Collision` 벽·자체 충돌 감지
- `Food` 빈 셀 무작위 생성
- `config/constants.ts`, `ui/Renderer.ts`, `main.ts`

SPEC-GAME-001 미구현 시 본 SPEC은 시작할 수 없다. 두 SPEC을 병렬로 작업할 경우, REQ-EXT-001/002 통합 작업은 SPEC-GAME-001의 해당 모듈 인터페이스가 안정화된 이후 착수한다.

---

## 기술 접근 (Technical Approach)

### REQ-EXT-001: 난이도 / 속도 제어

1. `src/config/difficulty.ts`에 난이도 프로필(낮음/중간/높음)을 틱 주기 상수로 정의한다(순수 데이터 모듈, 의존성 없음).
2. `Game`의 틱 루프가 외부 주입 틱 주기를 사용하도록 통합한다(SPEC-GAME-001 가정 1의 주입 지점 사용).
3. `ready` 상태에서 선택된 프로필의 틱 주기를 게임 시작/재시작 시점에 확정한다.
4. `playing` 도중 난이도 변경 입력은 즉시 반영하지 않고 "다음 재시작 적용" 펜딩 값으로 저장한다.
5. `DifficultyPanel`(UI)은 난이도 선택을 받아 `Game`/부트스트랩에 전달한다(순수 로직과 분리).

### REQ-EXT-002: 벽 장애물

1. 장애물 활성화 플래그와 고정 장애물 셀 집합을 config에 정의하고(주입 가능), `Board`가 장애물 셀을 보유/조회하도록 확장한다.
2. `Collision`에 장애물 충돌 감지를 추가하되, 벽/자체 충돌과 **동일한 게임 오버 경로**로 통합한다(단일 충돌 판정 함수로 합산).
3. `Food`의 "빈 셀" 정의를 확장하여 장애물 셀과 뱀 세그먼트를 모두 후보에서 배제한다.
4. 게임 시작 시 뱀 초기 세그먼트와 장애물 셀이 겹치지 않도록 초기화 단계에서 검증/보장한다.
5. `Renderer`에 장애물 셀 렌더링을 추가한다(게임판/뱀/음식 렌더링과 동일 패턴).

---

## 작업 분해 (Task Decomposition)

작업은 우선순위 라벨로 정렬한다(시간 추정 없음). REQ-EXT-001과 REQ-EXT-002는 서로 독립적이므로 병렬 진행 가능하나, 각 모듈은 SPEC-GAME-001 인터페이스 의존.

| ID | 작업 | 대상 파일 | 우선순위 | 의존 |
|----|------|-----------|----------|------|
| T1 | 난이도 프로필 상수 정의 | `src/config/difficulty.ts` (신규) | High | GAME-001 constants |
| T2 | 난이도 틱 주기 주입 통합 | `src/game/Game.ts` (수정) | High | T1, GAME-001 Game |
| T3 | playing 중 변경 → 다음 재시작 적용 로직 | `src/game/Game.ts` (수정) | High | T2 |
| T4 | 난이도 선택 UI | `src/ui/DifficultyPanel.ts` (신규) | Medium | T1 |
| T5 | 난이도 단위 테스트 | `tests/game/Difficulty.test.ts` (신규) | High | T2, T3 |
| T6 | 장애물 셀 집합 config + Board 보유 | `src/config/constants.ts`(or difficulty.ts), `src/game/Board.ts` (수정) | High | GAME-001 Board |
| T7 | 장애물 충돌 통합(벽/자체와 단일 규칙) | `src/game/Collision.ts` (수정) | High | T6, GAME-001 Collision |
| T8 | 음식 생성 시 장애물 배제 | `src/game/Food.ts` (수정) | High | T6, GAME-001 Food |
| T9 | 초기 위치 vs 장애물 비겹침 보장 | `src/game/Game.ts` / `src/game/Board.ts` (수정) | High | T6 |
| T10 | 장애물 렌더링 | `src/ui/Renderer.ts` (수정) | Medium | T6 |
| T11 | 부트스트랩 통합(난이도/장애물 모드 연결) | `src/main.ts` (수정) | Medium | T2, T6 |
| T12 | 장애물 단위 테스트 | `tests/game/Obstacle.test.ts` (신규) | High | T7, T8, T9 |

---

## 생성/수정 파일 목록 (Files to Create / Modify)

### 신규 생성 (New)
- `src/config/difficulty.ts` — 난이도 프로필 틱 주기 + (장애물 셀 집합/모드 플래그)
- `src/ui/DifficultyPanel.ts` — 난이도 선택 UI 컴포넌트
- `tests/game/Difficulty.test.ts` — 난이도/속도 제어 테스트
- `tests/game/Obstacle.test.ts` — 장애물 모드 테스트

### 수정 (Modify, SPEC-GAME-001이 정의한 파일)
- `src/config/constants.ts` — 장애물 모드/셀 관련 상수 추가
- `src/game/Board.ts` — 장애물 셀 보유/조회
- `src/game/Collision.ts` — 장애물 충돌(벽/자체와 단일 규칙 통합)
- `src/game/Food.ts` — 음식 생성 시 장애물 셀 배제
- `src/game/Game.ts` — 난이도 틱 주기 적용, playing 중 변경 펜딩, 초기 비겹침 보장
- `src/ui/Renderer.ts` — 장애물 셀 렌더링
- `src/main.ts` — 난이도/장애물 모드 부트스트랩 통합

---

## 리스크 노트 (Risk Notes)

- **R1 — SPEC-GAME-001 인터페이스 변동**: 틱 주기 주입 지점이나 `Collision` 시그니처가 GAME-001에서 확정되지 않으면 T2/T7 통합이 막힌다. 완화: GAME-001 가정 1(틱 주기 외부 주입)을 인터페이스 계약으로 고정하고, GAME-001 모듈 안정화 후 통합 작업 착수.
- **R2 — 충돌 규칙 분기**: 장애물 충돌을 별도 게임 오버 경로로 만들면 벽/자체 충돌과 동작이 미묘하게 어긋날 수 있다. 완화: 단일 충돌 판정 함수에 장애물 셀을 합산하여 동일 규칙으로 통합(기술 제약 명시).
- **R3 — 음식 생성 데드락**: 장애물 + 뱀이 게임판 대부분을 차지하면 빈 셀이 없어 음식 생성이 실패할 수 있다. 완화: 장애물 셀 수 상한을 config로 제한하고, 빈 셀 없음 시 동작(예: 클리어 처리)을 인수 기준 밖 엣지로 명시(본 SPEC 범위는 빈 셀 선택 정확성까지).
- **R4 — 초기 배치 충돌**: 장애물과 뱀 초기 세그먼트가 겹치면 시작 즉시 게임 오버가 된다. 완화: T9에서 초기화 단계 비겹침 보장 및 AC-OBS-3로 검증.
- **R5 — playing 중 난이도 변경 혼동**: 사용자가 즉시 반영을 기대할 수 있다. 완화: "다음 재시작부터 적용"을 UI 피드백으로 명확히 표시(REQ-EXT-001 unwanted behaviour).
