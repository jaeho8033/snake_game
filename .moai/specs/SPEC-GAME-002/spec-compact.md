# SPEC-GAME-002 (Compact)

Gameplay Extensions — Difficulty & Obstacles (게임플레이 확장: 난이도와 장애물)
의존: SPEC-GAME-001 (Game, Board, Collision, Food, config, Renderer 확장). GAME-001 미구현 시 시작 불가.

## REQ

### REQ-EXT-001: 난이도 / 속도 제어
- Ubiquitous: 난이도 프로필(낮음/중간/높음)을 틱 주기 값으로 `config/difficulty.ts`에 정의 shall.
- Event-driven: `ready`에서 난이도 선택 시(When), 선택 프로필의 틱 주기를 게임 루프에 적용 shall.
- State-driven: `playing` 동안(While), 선택된 난이도 틱 주기를 일정 유지 shall.
- Unwanted: `playing` 중 난이도 변경 시(If), 현재 틱 주기 불변, 다음 재시작부터 적용 shall.

### REQ-EXT-002: 벽 장애물
- Optional: 장애물 모드 활성화 시(Where), config 정의 고정 장애물 셀 집합을 게임판에 배치 shall.
- Unwanted: 머리가 장애물 셀로 이동 시(If), `gameover` 전환 shall (벽/자체 충돌과 단일 규칙 통합).
- Unwanted: 새 음식 후보가 장애물/뱀과 겹치면(If), 빈 셀에서만 선택 shall.
- Ubiquitous: 시작 시 뱀 초기 위치와 장애물 비겹침 보장 shall.

## Acceptance
- AC-DIFF-1: ready "높음" 선택 후 시작 → 루프 틱 주기 = "높음" 값.
- AC-DIFF-2: playing 중 변경 → 현재 틱 유지, 다음 재시작부터 적용.
- AC-DIFF-3 (edge): playing 동안 틱 주기 불변(여러 틱).
- AC-OBS-1: 장애물 모드, 머리 앞 장애물 → 한 틱 후 gameover.
- AC-OBS-2: 장애물 모드, 새 음식 → 장애물·뱀 아닌 빈 셀에만 생성.
- AC-OBS-3 (edge): 장애물 모드 시작 → 초기 세그먼트와 장애물 비겹침.

## Files
- New: `src/config/difficulty.ts`, `src/ui/DifficultyPanel.ts`, `tests/game/Difficulty.test.ts`, `tests/game/Obstacle.test.ts`
- Modify (GAME-001 정의): `src/config/constants.ts`, `src/game/Board.ts`, `src/game/Collision.ts`, `src/game/Food.ts`, `src/game/Game.ts`, `src/ui/Renderer.ts`, `src/main.ts`

## Exclusions
- 동적 난이도(점수 기반 자동 가속) — 고정 프로필만.
- 움직이는/파괴 가능한 장애물 — 정적 장애물만.
- 색상 테마 — SPEC-GAME-003 소관.
- 코어 게임 루프 재구현 — SPEC-GAME-001 소관(확장만).
