---
id: SPEC-GAME-003
version: 0.1.0
status: draft
created: 2026-05-25
updated: 2026-05-25
author: yna
priority: medium
issue_number: 0
---

# SPEC-GAME-003: Color Themes (색상 테마)

## HISTORY

- 2026-05-25: 최초 작성 (draft). SPEC-GAME-001(Playable Snake MVP)에 의존하는 확장 SPEC. 선택 가능한 시각 테마(시각 표현 전용) 정의. SPEC-GAME-002(난이도/장애물)와 직교(orthogonal)하며 서로 의존하지 않음. 기존 코드 없음(delta 마커 없음). author: yna.

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
