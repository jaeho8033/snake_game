# SPEC-GAME-003 (Compact): Color Themes (색상 테마)

의존: SPEC-GAME-001 (Renderer + main 와이어링 확장). SPEC-GAME-002와 직교.

## 요구사항 (REQ)

- **REQ-THEME-001 — 색상 테마**
  - (Where) 시스템은 선택 가능한 시각 테마(예: light, dark)를 `src/ui/themes/`에 정의하고 사용자가 선택할 수 있게 해야 한다(shall).
  - (When) 사용자가 테마를 선택했을 때, `Renderer`가 게임판/뱀/음식(및 존재 시 장애물)을 선택된 팔레트로 그리도록 갱신해야 한다(shall).
  - (Ubiquitous) 테마 변경이 게임 로직(뱀 위치/충돌/점수/상태)에 영향을 주지 않도록 시각 표현에만 국한해야 한다(shall) — 로직-렌더링 분리 불변식.

## 인수 기준 (Acceptance)

- **AC-THEME-1 (팔레트 적용, smoke)**: Given mock Canvas + "dark" 테마 / When 렌더 호출 / Then 그리기 호출에 dark 팔레트 색상값 사용.
- **AC-THEME-2 (로직 불변, 필수)**: Given 임의 게임 상태 / When light ↔ dark 전환 / Then 뱀 위치·음식 위치·점수·게임 상태가 전후 동일.

## 생성/수정 파일 (Files)

- New: `src/ui/themes/light.ts`, `src/ui/themes/dark.ts`, `src/ui/themes/themes.ts`(매니저/타입), `tests/ui/Theme.test.ts`
- Modify (GAME-001 정의): `src/ui/Renderer.ts`(팔레트 주입 렌더), `src/main.ts`(테마 선택 UI 연결)

## Exclusions

- 사용자 정의 테마 (사전 정의 선택만)
- 테마 영구 저장 / localStorage (세션 동안만)
- 테마 전환 애니메이션 (즉시 전환만)
- 난이도/장애물 → SPEC-GAME-002
- 코어 게임 루프 → SPEC-GAME-001
