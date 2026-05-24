// 게임 도메인 공유 타입 정의

/** 게임판 위 셀 좌표 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 뱀의 이동 방향 벡터
 * @MX:NOTE: [AUTO] dx/dy 부호 규칙 — x는 우측이 양수, y는 아래가 양수 (Canvas 좌표계 기준)
 */
export interface Direction {
  dx: number;
  dy: number;
}

/** 게임 상태 */
export type GameStatus = 'ready' | 'playing' | 'gameover';

/** 방향 상수 */
export const DIR_UP: Direction = { dx: 0, dy: -1 };
export const DIR_DOWN: Direction = { dx: 0, dy: 1 };
export const DIR_LEFT: Direction = { dx: -1, dy: 0 };
export const DIR_RIGHT: Direction = { dx: 1, dy: 0 };

/** 두 위치가 동일한지 비교 */
export function positionEquals(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

/** 두 방향이 정반대(180도)인지 검사 */
export function isOppositeDirection(a: Direction, b: Direction): boolean {
  return a.dx === -b.dx && a.dy === -b.dy;
}
