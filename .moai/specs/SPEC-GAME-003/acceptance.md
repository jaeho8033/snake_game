# SPEC-GAME-003 인수 기준 (Acceptance Criteria)

EARS 요구사항 REQ-THEME-001을 검증하는 Given/When/Then 시나리오. 최소 2개의 시나리오를 포함하며, 로직-불변(logic-invariance) 검증을 필수로 포함한다.

---

## AC-THEME-1: 선택된 테마 팔레트가 렌더에 적용됨 (Palette Application, smoke)

검증 대상: REQ-THEME-001 (Event-driven)

- **Given**: mock Canvas 2D 컨텍스트가 주입된 `Renderer`가 있고, "dark" 테마가 선택되어 있다.
- **When**: 렌더(그리기) 호출이 한 번 수행된다.
- **Then**: `Renderer`의 그리기 호출(예: `fillStyle` 설정, `fillRect`)에 dark 테마 팔레트의 색상 값이 사용된다 — 게임판 배경, 뱀, 음식 각각에 dark 팔레트 색상이 적용된다.

검증 방법: mock 컨텍스트가 기록한 색상 설정값이 dark 팔레트의 색상 값과 일치하는지 확인한다.

---

## AC-THEME-2: 테마 전환이 게임 로직에 영향을 주지 않음 (Logic Invariance) — 필수

검증 대상: REQ-THEME-001 (Ubiquitous, 로직-렌더링 분리 불변식)

- **Given**: 임의의 게임 상태(뱀 세그먼트 좌표, 음식 위치, 점수, 게임 상태)가 주어진다.
- **When**: 테마를 light에서 dark로, 다시 dark에서 light로 전환한다(light ↔ dark).
- **Then**: 전환 전후로 뱀 세그먼트 좌표, 음식 위치, 점수, 게임 상태가 모두 동일하다 — 테마 전환은 게임 로직 상태를 일절 변경하지 않는다.

검증 방법: 전환 전 게임 상태 스냅샷과 전환 후 게임 상태 스냅샷이 정확히 일치하는지 비교한다.

---

## 엣지 케이스 (Edge Cases)

- **기본 테마**: 사용자가 테마를 선택하지 않은 경우, 사전 정의된 기본 테마(예: light) 팔레트가 사용된다.
- **즉시 전환**: 테마 전환은 애니메이션 없이 즉시 적용된다(다음 렌더에 반영).
- **장애물 색상(조건부, SPEC-GAME-002 존재 시)**: 장애물이 존재하면 팔레트의 장애물 색상으로 그려지며, 장애물이 없으면 해당 색상은 사용되지 않는다.

---

## 품질 게이트 (Quality Gates) / Definition of Done

- [ ] AC-THEME-1, AC-THEME-2 시나리오가 자동화 테스트(`tests/ui/Theme.test.ts`)로 통과한다.
- [ ] 테마 변경이 게임 코어 로직(`src/game/`)을 변경하지 않음을 AC-THEME-2가 보증한다.
- [ ] 사전 정의 테마(light, dark)가 `src/ui/themes/`에 정의된다.
- [ ] 커버리지 목표 85% 이상(테마 모듈).
- [ ] TRUST 5 품질 게이트 통과.
- [ ] Exclusions에 명시된 항목(사용자 정의 테마, 영구 저장, 전환 애니메이션, 난이도/장애물, 코어 루프)은 구현되지 않았다.
