import { Position, positionEquals } from './types';

/**
 * 충돌 판정 순수 함수 모음.
 * DOM/Canvas 의존성 없음 — 결정론적 단위 테스트 가능.
 *
 * @MX:ANCHOR: [AUTO] checkWallCollision / checkSelfCollision / checkFoodEaten / checkObstacleCollision
 * @MX:REASON: Game.tick()이 네 함수의 반환값으로 게임 종료/성장 분기를 결정한다.
 *             이 함수들의 계약이 변경되면 게임 오버/성장 로직 전체에 영향을 미친다.
 */

/**
 * 벽 충돌 여부를 반환한다.
 * @param pos - 검사할 위치
 * @param gridWidth - 게임판 열 수
 * @param gridHeight - 게임판 행 수
 */
export function checkWallCollision(
  pos: Position,
  gridWidth: number,
  gridHeight: number,
): boolean {
  return pos.x < 0 || pos.x >= gridWidth || pos.y < 0 || pos.y >= gridHeight;
}

/**
 * 자체 충돌 여부를 반환한다.
 * @param nextHead - 이동 후 머리 위치
 * @param segments - 이동 전 뱀 세그먼트 전체 (머리 포함)
 */
export function checkSelfCollision(
  nextHead: Position,
  segments: Position[],
): boolean {
  // 이동 후 꼬리가 제거되므로 마지막 세그먼트는 충돌 대상에서 제외
  // (꼬리 위치는 이동 후 비게 됨)
  const checkTargets = segments.slice(0, segments.length - 1);
  return checkTargets.some((s) => positionEquals(s, nextHead));
}

/**
 * 음식 섭취 여부를 반환한다.
 * @param head - 머리 위치
 * @param foodPos - 음식 위치 (null이면 항상 false)
 */
export function checkFoodEaten(
  head: Position,
  foodPos: Position | null,
): boolean {
  if (foodPos === null) return false;
  return positionEquals(head, foodPos);
}

/**
 * 장애물 충돌 여부를 반환한다.
 * 벽/자체 충돌과 동일한 단일 충돌 경로에서 사용된다.
 *
 * @param pos - 검사할 위치 (다음 머리)
 * @param obstacles - 장애물 위치 배열
 */
export function checkObstacleCollision(
  pos: Position,
  obstacles: Position[],
): boolean {
  return obstacles.some((o) => positionEquals(o, pos));
}
