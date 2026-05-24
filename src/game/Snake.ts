import { Position, Direction, isOppositeDirection } from './types';

/**
 * 뱀의 상태와 이동 로직을 관리한다.
 *
 * @MX:NOTE: [AUTO] 180도 반전 규칙 — setDirection()에서 현재 방향과 정반대인 입력을 거부한다.
 * @MX:REASON: 반전 허용 시 한 틱 안에 자체 충돌이 발생하여 즉사 버그가 생긴다(REQ-GAME-004).
 */
export class Snake {
  /** 세그먼트 배열 — 인덱스 0이 머리 */
  private segments: Position[];

  /** 현재 이동 방향 */
  public direction: Direction;

  constructor(segments: Position[], direction: Direction) {
    this.segments = segments.map((s) => ({ ...s }));
    this.direction = { ...direction };
  }

  /** 머리 위치 반환 */
  head(): Position {
    return { ...this.segments[0] };
  }

  /** 현재 세그먼트 수 반환 */
  length(): number {
    return this.segments.length;
  }

  /**
   * 다음 틱의 머리 위치를 계산한다 (이동 전 충돌 검사용)
   *
   * @MX:ANCHOR: [AUTO] nextHead — Game.tick()이 충돌 판정에 사용하는 핵심 계산
   * @MX:REASON: tick()의 모든 충돌 분기가 이 함수의 반환값에 의존한다. 변경 시 충돌 로직 전체에 영향.
   */
  nextHead(): Position {
    return {
      x: this.segments[0].x + this.direction.dx,
      y: this.segments[0].y + this.direction.dy,
    };
  }

  /**
   * 뱀을 한 칸 이동한다.
   * @param grow - true이면 꼬리를 제거하지 않아 길이가 1 증가한다
   */
  move(grow: boolean): void {
    // 새 머리 추가
    this.segments.unshift(this.nextHead());
    // 성장하지 않으면 꼬리 제거
    if (!grow) {
      this.segments.pop();
    }
  }

  /**
   * 이동 방향을 설정한다. 현재 방향의 정반대(180도)는 무시한다.
   */
  setDirection(dir: Direction): void {
    if (isOppositeDirection(this.direction, dir)) {
      return;
    }
    this.direction = { ...dir };
  }

  /** 뱀이 점유하는 모든 셀 위치를 반환한다 */
  occupied(): Position[] {
    return this.segments.map((s) => ({ ...s }));
  }

  /** 뱀을 새 세그먼트 배열과 방향으로 초기화한다 */
  reset(segments: Position[], direction: Direction): void {
    this.segments = segments.map((s) => ({ ...s }));
    this.direction = { ...direction };
  }
}
