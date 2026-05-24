import { Position, positionEquals } from './types';

/**
 * 음식의 위치 상태와 생성 로직을 관리한다.
 * 무작위성은 주입된 rng 함수로 추상화하여 테스트 결정성을 보장한다.
 */
export class Food {
  /** 현재 음식 위치. null이면 음식 없음(보드 가득 참) */
  public position: Position | null = null;

  /** 주입된 난수 생성 함수 [0, 1) */
  private rng: () => number;

  constructor(rng: () => number) {
    this.rng = rng;
  }

  /**
   * 빈 셀 중에서 무작위로 음식을 생성한다.
   * EC-2: 빈 셀이 없으면 position을 null로 설정하고 크래시 없이 반환한다.
   *
   * @MX:ANCHOR: [AUTO] spawn — 음식 생성의 유일한 진입점
   * @MX:REASON: Game.tick()과 Game.restart()가 이 함수를 호출한다. 빈 셀 필터 로직이 잘못되면 음식이 뱀 위에 겹쳐 생성된다(EC-1 위반).
   */
  spawn(occupied: Position[], gridWidth: number, gridHeight: number): void {
    // 모든 셀 목록 생성
    const free: Position[] = [];
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (!occupied.some((o) => positionEquals(o, { x, y }))) {
          free.push({ x, y });
        }
      }
    }

    if (free.length === 0) {
      // EC-2: 빈 셀 없음 — 크래시 없이 null 처리
      this.position = null;
      return;
    }

    const idx = Math.floor(this.rng() * free.length);
    this.position = { ...free[idx] };
  }
}
