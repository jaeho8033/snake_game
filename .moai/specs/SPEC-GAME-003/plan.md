# SPEC-GAME-003 구현 계획 (Implementation Plan)

## 목표 (Goal)

SPEC-GAME-001의 `Renderer`와 메인 와이어링을 확장하여, 사전 정의된 색상 테마(예: light, dark)를 선택하고 그 팔레트로 게임을 렌더링할 수 있게 한다. 게임 코어 로직은 변경하지 않는다.

---

## 의존성 (Dependencies)

- **[HARD] SPEC-GAME-001 선행 필수**: `src/ui/Renderer.ts`와 `src/main.ts`가 존재해야 한다. 본 계획은 이들을 확장한다.
- **SPEC-GAME-002와 직교**: 난이도/장애물과 독립적으로 구현 가능하다. 장애물 존재 시 팔레트가 장애물 색상을 포함하여 일관되게 그린다(조건부).
- 기존 코드 없음(그린필드 의존 SPEC) → delta 마커 없음.

---

## 기술 접근 (Technical Approach)

1. **테마 데이터 정의**: 각 테마를 색상 값만 담은 순수 데이터(상수)로 정의한다. 팔레트 키는 게임판 배경, 뱀, 음식(및 장애물)을 포함한다.
2. **테마 타입/매니저**: 팔레트 타입과 현재 테마를 선택/조회하는 매니저를 정의한다. 세션 동안만 메모리에 유지한다(영구 저장 없음).
3. **Renderer 확장**: `Renderer`가 선택된 팔레트를 받아 그리기 호출에 색상 값을 사용하도록 확장한다. 로직-렌더링 분리 불변식을 유지한다.
4. **메인 와이어링**: `src/main.ts`에서 테마 선택 UI를 매니저/Renderer에 연결한다. 테마 변경 시 즉시 재렌더(전환 애니메이션 없음).

---

## 작업 분해 (Task Decomposition)

우선순위 라벨로 표기한다(시간 추정 없음).

### Priority High
- [ ] `src/ui/themes/themes.ts`: 팔레트 타입 정의 및 테마 매니저(선택/조회, 기본 테마 지정).
- [ ] `src/ui/themes/light.ts`, `src/ui/themes/dark.ts`: 사전 정의 테마 팔레트 데이터.
- [ ] `src/ui/Renderer.ts`(SPEC-GAME-001 정의) 확장: 주입된 팔레트로 게임판/뱀/음식(및 존재 시 장애물) 렌더.

### Priority Medium
- [ ] `src/main.ts`(SPEC-GAME-001 정의) 수정: 테마 선택 UI를 매니저/Renderer에 연결, 선택 시 즉시 재렌더.
- [ ] `tests/ui/Theme.test.ts`: AC-THEME-1(팔레트 적용 smoke), AC-THEME-2(로직 불변) 검증.

---

## 생성/수정 파일 (Files to Create / Modify)

### 신규 생성 (New)
- `src/ui/themes/light.ts` — 라이트 테마 팔레트
- `src/ui/themes/dark.ts` — 다크 테마 팔레트
- `src/ui/themes/themes.ts` — 테마 매니저/타입
- `tests/ui/Theme.test.ts` — 테마 단위 테스트

### 수정 (Modify, SPEC-GAME-001이 정의)
- `src/ui/Renderer.ts` — 주입된 팔레트로 렌더하도록 확장
- `src/main.ts` — 테마 선택 UI 연결

---

## 위험 노트 (Risk Notes)

- **R1 — SPEC-GAME-001 미구현 위험**: `Renderer`/`main.ts`가 아직 없으면 본 SPEC을 진행할 수 없다. SPEC-GAME-001 구현을 선행해야 한다.
- **R2 — Renderer 주입성 부족**: SPEC-GAME-001의 `Renderer`가 색상을 하드코딩했다면, 팔레트 주입을 위한 소규모 리팩토링이 필요하다. 이는 시각 표현에 국한되며 로직을 건드리지 않아야 한다.
- **R3 — 로직-렌더링 분리 불변식 위반 위험**: 테마 코드가 게임 상태에 접근하거나 변경하면 안 된다. AC-THEME-2(로직 불변)로 이를 가드한다.
- **R4 — SPEC-GAME-002 장애물 색상 누락**: 장애물이 나중에 추가될 때 팔레트에 색상 키가 없으면 렌더 누락이 발생할 수 있다. 팔레트 타입에 장애물 색상 키를 선택적으로 포함하여 대비한다(직교 유지).
