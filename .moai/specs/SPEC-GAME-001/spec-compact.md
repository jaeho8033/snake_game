# SPEC-GAME-001 (Compact): Playable Snake MVP

## Requirements (EARS)

- **REQ-GAME-001 게임 루프 및 뱀 이동**: 그리드/셀 좌표 기반(Ubiquitous), 코어 로직은 렌더링/DOM과 분리(Ubiquitous). `playing` 동안 매 틱마다 머리 1셀 전진, 미섭취 시 꼬리 제거로 길이 유지(State-driven).
- **REQ-GAME-002 음식 생성 및 성장**: 항상 음식 1개 유지(Ubiquitous). 머리가 음식 셀로 이동 시 길이 증가+점수 증가+새 음식 생성(Event-driven). 새 음식은 빈 셀 중 무작위 선택(Event-driven).
- **REQ-GAME-003 충돌 및 게임 오버**: 머리가 벽 바깥으로 이동 시 `gameover`(Unwanted). 머리가 자기 세그먼트 셀로 이동 시 `gameover`(Unwanted). `gameover` 동안 틱 이동 없음(State-driven).
- **REQ-GAME-004 방향 입력 및 180도 반전 방지**: 방향 키 입력 시 다음 틱 방향 갱신(Event-driven). 현재 방향의 정반대 입력은 무시(Unwanted). 한 틱 내 다중 입력은 마지막 유효 입력만 확정(Unwanted).
- **REQ-GAME-005 점수, 상태 및 재시작**: 현재 점수/게임 상태 표시 + Canvas 렌더링(Ubiquitous). 섭취 시 고정량 점수 증가(Event-driven). `ready`에서 시작 트리거 시 `playing` 전환(Event-driven). `gameover`에서 재시작 시 뱀/음식/점수 초기화 후 `playing`(Event-driven).

## Acceptance Criteria (Given/When/Then)

- **AC-MOVE-1**: Given `playing`+우측 진행 머리 (5,5) / When 1틱(미섭취) / Then 머리 (6,5), 길이 유지.
- **AC-MOVE-2**: Given `playing`+위 진행+입력 없음 / When 3틱 / Then 위쪽 직선 이동.
- **AC-EAT-1**: Given 머리 앞 셀에 음식 / When 1틱으로 진입 / Then 길이 +1, 새 음식 빈 셀 생성.
- **AC-EAT-2**: Given `playing` / When 섭취 후 생성 / Then 음식 항상 1개.
- **AC-WALL-1**: Given 우측 끝+오른쪽 진행 / When 1틱 / Then `gameover`, 경계 밖 미이동.
- **AC-WALL-2**: Given 상단 끝+위 진행 / When 1틱 / Then `gameover`.
- **AC-SELF-1**: Given 머리부터 (5,5),(4,5),(4,6),(5,6),(6,6),(6,5) 점유+아래 진행+미섭취 / When 1틱(머리 (5,6) 전진) / Then (5,6)은 자기 몸이므로 `gameover`.
- **AC-SELF-2**: Given `gameover` / When 추가 틱 / Then 미이동, `gameover` 유지.
- **AC-SCORE-1**: Given 점수 0 / When 1회 섭취 / Then `SCORE_PER_FOOD` 상수값만큼 증가.
- **AC-SCORE-2**: Given 점수 N / When 3회 섭취 / Then N + 음식당점수×3.
- **AC-REV-1**: Given 오른쪽 진행 / When 왼쪽 키 / Then 무시, 오른쪽 유지.
- **AC-REV-2**: Given 오른쪽 진행 / When 위쪽 키 / Then 다음 틱 위쪽 이동.
- **AC-RESTART-1**: Given `gameover`+점수 N / When 재시작 / Then 초기화 후 `playing`.
- **AC-RESTART-2**: Given `ready` / When 시작 / Then `playing`, 틱 루프 시작.
- **AC-RENDER-1**: Given `playing`+모의 Canvas 2D 컨텍스트 주입 / When 1틱 렌더 호출 / Then 게임판/뱀 세그먼트/음식/점수 모두 그려짐(드로잉 호출 발생).
- **AC-RENDER-2**: Given 브라우저 `playing` 실행 / When 1회 섭취 / Then 화면 점수 값이 `SCORE_PER_FOOD`만큼 갱신(수동 육안 검증).

### Edge Cases

- **EC-1**: 음식은 빈 셀에만 생성(뱀 몸 위 겹침 금지).
- **EC-2**: 보드 가득 참 시 음식 미생성, 크래시 없음.
- **EC-3**: 한 틱 내 빠른 다중 키 입력 시 마지막 유효 입력만 적용, 즉시 자체 충돌 없음.

## Files to Modify (create)

- `src/config/constants.ts`
- `src/game/types.ts`
- `src/game/Snake.ts`
- `src/game/Food.ts`
- `src/game/Collision.ts`
- `src/game/Score.ts`
- `src/game/Game.ts`
- `src/ui/Renderer.ts`
- `src/ui/InputHandler.ts`
- `src/main.ts`
- `index.html`
- `tests/game/Snake.test.ts`, `tests/game/Food.test.ts`, `tests/game/Collision.test.ts`, `tests/game/Score.test.ts`, `tests/game/Game.test.ts`
- `tests/integration/GameFlow.test.ts`

## Exclusions (What NOT to Build)

- 난이도/속도 조절 컨트롤
- 벽 장애물(Wall obstacles)
- 색상 테마(Color themes / theming)
- 최고 점수 영구 저장(localStorage)
- 모바일/터치 컨트롤
- 사운드(Sound)
- 멀티플레이어(Multiplayer)
