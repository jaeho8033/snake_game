/**
 * 게임 밸런스 상수
 * @MX:NOTE: [AUTO] 아래 값들은 게임 플레이 밸런스에 직접 영향을 미친다.
 * @MX:REASON: GRID_WIDTH/HEIGHT/CELL_SIZE 변경 시 Canvas 크기 계산과 충돌 로직 경계가 함께 변경된다.
 *             TICK_MS 변경 시 게임 속도가 변한다. SCORE_PER_FOOD 변경 시 점수 체계가 바뀐다.
 */

/** 게임판 열 수 */
export const GRID_WIDTH = 20;

/** 게임판 행 수 */
export const GRID_HEIGHT = 20;

/** 셀 하나의 픽셀 크기 */
export const CELL_SIZE = 24;

/** 틱 주기 (밀리초) — 이 간격마다 Game.tick()이 호출됨 */
export const TICK_MS = 150;

/** 음식 1개 섭취 시 획득 점수 */
export const SCORE_PER_FOOD = 10;

/** 초기 뱀 길이 */
export const INITIAL_SNAKE_LENGTH = 3;

/** 초기 뱀 머리 위치 */
export const INITIAL_HEAD_X = 5;
export const INITIAL_HEAD_Y = 10;
