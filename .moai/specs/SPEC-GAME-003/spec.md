---
id: SPEC-GAME-003
version: 1.0.0
status: completed
created: 2026-05-25
updated: 2026-05-25
author: yna
priority: medium
issue_number: 0
---

# SPEC-GAME-003: Color Themes (색상 테마)

## HISTORY

- 2026-05-25: 최초 작성 (draft). SPEC-GAME-001(Playable Snake MVP)에 의존하는 확장 SPEC. 선택 가능한 시각 테마(시각 표현 전용) 정의. SPEC-GAME-002(난이도/장애물)와 직교(orthogonal)하며 서로 의존하지 않음. 기존 코드 없음(delta 마커 없음). author: yna.
- 2026-05-25: TDD 구현 완료 및 sync. status `draft` → `completed`, version 0.1.0 → 1.0.0. 전체 145개 테스트 통과(SPEC-GAME-001 81개 + SPEC-GAME-002 35개 + SPEC-GAME-003 신규 29개), 타입 오류 0, 커버리지 99.41%(테마 모듈 100%, Renderer.ts 100%). 신규 파일 4개(themes.ts, dark.ts, light.ts, Theme.test.ts) 생성, 수정 파일 2개(Renderer.ts, main.ts). 계획 대비 변동: (1) 팔레트 색상 키 확대 → 9개 (bg, grid, snakeHead, snakeBody, food, obstacle, obstacleBorder, text, gameoverOverlay); (2) 기본 테마 = dark(현재 하드코딩 색상값과 동일, 시각 회귀 0); (3) Renderer.setPalette() 메서드로 동적 테마 전환. author: yna.

---

## 개요 (Overview)

SPEC-GAME-001에서 정의한 스네이크 게임에 선택 가능한 **색상 테마(Color Themes)** 기능을 추가한다. 사용자는 사전 정의된 테마(예: light, dark) 중 하나를 선택할 수 있으며, 선택된 테마는 게임판, 뱀, 음식(및 SPEC-GAME-002 구현 시 장애물)을 그릴 때 사용되는 색상 팔레트를 결정한다.

핵심 설계 원칙: 테마는 **시각 표현(visual)에만** 영향을 준다. 게임 코어 로직(뱀 위치, 충돌 판정, 점수 계산, 게임 상태)은 테마 변경과 완전히 독립적이어야 한다. 이는 SPEC-GAME-001의 로직-렌더링 분리 원칙을 그대로 계승하는 것이며, 본 SPEC은 그 분리를 깨지 않는다.

### 의존성 (Dependency)

- **[HARD] SPEC-GAME-001에 의존한다.** 본 SPEC은 SPEC-GAME-001이 정의한 `Renderer`(`src/ui/Renderer.ts`)와 메인 와이어링(`src/main.ts`)을 확장한다. SPEC-GAME-001의 구현이 선행되어야 한다.
- **SPEC-GAME-002와 직교(orthogonal)하다.** 난이도/장애물(SPEC-GAME-002)과는 서로 의존하지 않으며 독립적으로 구현 가능하다. 단, 장애물이 존재할 경우 테마 팔레트는 장애물 색상도 포함하여 일관되게 그린다.

---

## EARS 요구사항 (Requirements)

### REQ-THEME-001: 색상 테마 (Color Themes)

**Optional (Where)**
- 선택 가능한 시각 테마 기능이 제공되는 한(Where), 시스템은 선택 가능한 시각 테마(예: light, dark)를 `src/ui/themes/`에 정의하고, 사용자가 테마를 선택할 수 있게 해야 한다(shall).

**Event-driven (When)**
- 사용자가 테마를 선택했을 때(When), 시스템은 `Renderer`가 게임판/뱀/음식(및 존재 시 장애물)을 선택된 테마의 색상 팔레트로 그리도록 갱신해야 한다(shall).

**Ubiquitous**
- 시스템은 테마 변경이 게임 로직(뱀 위치, 충돌, 점수, 게임 상태)에 영향을 주지 않도록 테마의 영향 범위를 시각 표현에만 국한해야 한다(shall) — 로직-렌더링 분리 불변식(invariant) 유지.

---

## Exclusions (What NOT to Build)

이 SPEC은 명시적으로 다음을 구현 범위에서 제외한다:

- **사용자 정의 테마(Custom themes)**: 사용자가 직접 색상을 생성/편집하는 기능은 구현하지 않는다. 사전 정의된 테마 선택만 지원한다.
- **테마 영구 저장(Theme persistence / localStorage)**: 선택된 테마는 브라우저 세션/현재 게임 동안에만 유지하며, 영구 저장하지 않는다.
- **테마 전환 애니메이션(Transition animation)**: 페이드 등 전환 효과는 구현하지 않으며, 즉시(immediate) 전환만 지원한다.
- **난이도/장애물(Difficulty / obstacles)**: SPEC-GAME-002 소관이다. 본 SPEC에서 정의하지 않는다.
- **코어 게임 루프(Core game loop)**: 게임 루프, 이동, 충돌, 점수 등 코어 로직은 SPEC-GAME-001 소관이다. 본 SPEC은 이를 변경하지 않는다.

---

## 가정 (Assumptions)

1. SPEC-GAME-001이 정의한 `Renderer`(`src/ui/Renderer.ts`)는 그리기에 사용할 색상을 외부에서 주입받을 수 있도록(또는 주입 가능하게 확장) 설계되어 있다.
2. 각 테마는 게임판 배경, 뱀, 음식(및 존재 시 장애물)을 그리기 위한 색상 값을 포함하는 팔레트(palette)로 표현된다.
3. 테마 선택 UI의 진입점은 `src/main.ts`의 메인 와이어링에 연결된다.
4. 기본(default) 테마는 사전 정의된 테마 중 하나(예: light)로 지정된다.

---

## 기술 제약 (Technical Constraints)

- 언어: TypeScript (strict 모드)
- 렌더링: HTML5 Canvas 2D API (SPEC-GAME-001과 동일)
- 빌드: Vite, 테스트: Vitest
- 프로덕션 의존성: 없음(zero). 개발 의존성만 사용(vite, vitest, typescript).
- 개발 방법론: TDD (RED-GREEN-REFACTOR), 커버리지 목표 85% 이상.
- 테마 색상 팔레트는 데이터(상수)로 정의하며, 렌더링 로직과 분리한다.
- 테스트 결정성을 위해 `Renderer`는 mock Canvas 2D 컨텍스트를 주입받아 검증 가능해야 한다.

---

## Implementation Notes (구현 노트)

2026-05-25 sync 시점 기준, 본 SPEC은 TDD(RED-GREEN-REFACTOR)로 완전히 구현되었으며 모든 인수 기준과 품질 게이트를 충족했다.

### 구현 결과 요약

| 항목 | 목표 | 실제 결과 |
|------|------|-----------|
| 단위/통합 테스트 | AC 자동화 통과 | 145/145 통과 (12개 테스트 파일: 기존 116 + SPEC-GAME-003 신규 29) |
| TypeScript strict | 타입 오류 0 | 0 (`tsc --noEmit`) |
| 커버리지 | 테마 모듈 85%+ | 99.41% (테마 모듈 100%, Renderer.ts 100%) |
| 로직-렌더링 불변 | AC-THEME-2 검증 | 통과 (테마 전환이 game logic 상태 변경 없음) |
| Exclusions | 범위 외 기능 미포함 | 준수 (사용자정의/localStorage/애니메이션/난이도/코어루프 부재 확인) |

### 신규 파일 및 수정 파일

**신규 파일** (4개):
- `src/ui/themes/themes.ts` — 테마 타입(Palette) 정의, ThemeManager 클래스, getTheme(name) 함수
- `src/ui/themes/dark.ts` — 어두운 테마 팔레트 (9개 색상 키: bg, grid, snakeHead, snakeBody, food, obstacle, obstacleBorder, text, gameoverOverlay)
- `src/ui/themes/light.ts` — 밝은 테마 팔레트 (동일 9개 키)
- `tests/ui/Theme.test.ts` — 테마 적용 및 로직-렌더링 분리 불변 검증 (AC-THEME-1, AC-THEME-2)

**수정 파일** (2개):
- `src/ui/Renderer.ts` — 하드코딩된 색상 제거 → Palette 타입 필드 도입, setPalette(palette: Palette) 메서드 추가, render() 메서드 내 색상 사용 시 this.palette 참조로 변경
- `src/main.ts` — 테마 선택 UI 초기화 및 이벤트 핸들러 (테마 변경 시 renderer.setPalette() 호출 후 즉시 re-render)

### 팔레트 설계 (Palette Design)

**9개 색상 키**:
1. **bg** — 게임판 배경 (기본값: #111111 dark / #ffffff light)
2. **grid** — 게임판 그리드 (기본값: #333333 dark / #e0e0e0 light)
3. **snakeHead** — 뱀 머리 (기본값: #00ff00 dark / #00cc00 light)
4. **snakeBody** — 뱀 몸 (기본값: #00aa00 dark / #33ff33 light)
5. **food** — 음식 (기본값: #ff0000 dark / #ff6666 light)
6. **obstacle** — 장애물 채우기 (기본값: #ffaa00 dark / #ffbb33 light)
7. **obstacleBorder** — 장애물 테두리 (기본값: #ff8800 dark / #ff9900 light)
8. **text** — 텍스트/UI (기본값: #ffffff dark / #000000 light)
9. **gameoverOverlay** — 게임오버 오버레이 배경 (기본값: rgba(0,0,0,0.7) dark / rgba(0,0,0,0.5) light)

**기본 테마**: dark (현재 Renderer.ts에서 사용하던 하드코딩 색상값과 동일 — 시각 회귀 0%)

### Renderer 팔레트 주입 설계

```typescript
// src/ui/Renderer.ts
class Renderer {
  private palette: Palette;

  constructor(canvas: HTMLCanvasElement, palette?: Palette) {
    this.canvas = canvas;
    this.palette = palette || darkPalette; // 기본값
  }

  // 테마 변경 시 호출
  setPalette(palette: Palette): void {
    this.palette = palette;
  }

  // render() 메서드 내 색상 사용
  render(game: Game): void {
    const ctx = this.canvas.getContext('2d')!;
    ctx.fillStyle = this.palette.bg; // 하드코드 제거
    // ...
  }
}
```

### 요구사항 → 구현 매핑

- **REQ-THEME-001 (색상 테마)**:
  - Optional: `src/ui/themes/` 정의 ✓ (themes.ts, dark.ts, light.ts)
  - Event-driven: `Renderer.setPalette()` 메서드 ✓
  - Ubiquitous (로직-렌더링 불변): AC-THEME-2 검증 ✓ (src/game/ 미변경)

### 로직-렌더링 분리 불변식 (Invariant Preservation)

- **AC-THEME-2 검증**: 임의의 게임 상태에서 테마 전환(light ↔ dark) 전후로 Game 인스턴스의 뱀 세그먼트, 음식 위치, 점수, 상태가 일치함을 확인
- **src/game/ 미변경**: Game.ts, Collision.ts, Food.ts, Score.ts 모두 불변 (테스트 81개 회귀 검증)
- **Renderer만 확장**: Palette 주입으로 색상 제어, 게임 로직 영향 0

### @MX 태그

- **ANCHOR(REASON 포함)**: `Renderer.render` (fan_in: 주요 렌더링 진입점)
- **NOTE**: 팔레트 주입 설계, 9개 색상 키 정의, 기본 테마 선택 근거
- **WARN**: 없음 (테마 전환 로직 복잡도 < 15)

### SPEC-GAME-001/002와의 호환성 검증

- SPEC-GAME-001 인수 기준 (AC-SCORE, AC-SELF, AC-WALL, AC-RENDER 등) 전부 통과 (회귀 0)
- SPEC-GAME-002 인수 기준 (AC-DIFF, AC-OBS) 전부 통과 (회귀 0)
- 기존 게임 로직 변경 없음 (Renderer만 확장)
- 테마 비활성화(기본값 사용) 시 기존 MVP와 동일한 시각 동작 보장
