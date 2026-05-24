import { Snake } from './Snake';
import { Food } from './Food';
import { Score } from './Score';
import {
  GameStatus,
  Direction,
  Position,
  DIR_RIGHT,
  isOppositeDirection,
} from './types';
import {
  checkWallCollision,
  checkSelfCollision,
  checkFoodEaten,
} from './Collision';
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  INITIAL_SNAKE_LENGTH,
  INITIAL_HEAD_X,
  INITIAL_HEAD_Y,
} from '../config/constants';

/** Game 초기화 옵션 (테스트 및 재시작에서 커스텀 상태 주입용) */
export interface GameOptions {
  /** 초기 머리 x 좌표 */
  headX?: number;
  /** 초기 머리 y 좌표 */
  headY?: number;
  /** 초기 뱀 길이 */
  length?: number;
  /** 초기 방향 */
  direction?: Direction;
  /** 초기 세그먼트 배열 (지정 시 headX/headY/length 무시) */
  segments?: Position[];
  /** 초기 음식 위치 */
  foodPosition?: Position;
}

/**
 * 게임 상태 머신 및 틱 루프 조율.
 * DOM/Canvas/타이머에 의존하지 않는 순수 로직.
 *
 * @MX:ANCHOR: [AUTO] Game.tick — 게임 진행의 단일 진입점
 * @MX:REASON: 모든 게임 상태 변화(이동/섭취/충돌/성장)는 tick()을 통해서만 발생한다.
 *             이 함수의 호출 순서(방향→이동→충돌→섭취→갱신)가 게임 규칙의 계약이다.
 */
export class Game {
  public snake: Snake;
  public food: Food;
  private scoreObj: Score;
  public status: GameStatus = 'ready';

  private rng: () => number;
  private gridWidth: number;
  private gridHeight: number;

  /**
   * 이전 틱에서 확정된 방향.
   * 한 틱 내 여러 방향 입력의 반전 검사 기준으로 사용한다(EC-3).
   *
   * @MX:NOTE: [AUTO] committedDirection — EC-3 즉각 자체 충돌 방지의 핵심
   * @MX:REASON: setDirection() 호출마다 snake.direction이 바뀌면 한 틱 내에
   *             RIGHT→UP→LEFT 순서 입력 시 LEFT가 UP의 반전이 아니라 통과해버린다.
   *             commitedDirection은 틱 시작 시점의 방향을 고정하여 올바른 기준을 제공한다.
   */
  private committedDirection: Direction;

  constructor(rng: () => number, options?: GameOptions) {
    this.rng = rng;
    this.gridWidth = GRID_WIDTH;
    this.gridHeight = GRID_HEIGHT;
    this.scoreObj = new Score();
    this.food = new Food(rng);

    const segments = this.buildInitialSegments(options);
    const direction = options?.direction ?? DIR_RIGHT;
    this.snake = new Snake(segments, direction);
    // 초기 확정 방향 = 초기 방향
    this.committedDirection = { ...direction };

    if (options?.foodPosition) {
      this.food.position = { ...options.foodPosition };
    } else {
      this.food.spawn(this.snake.occupied(), this.gridWidth, this.gridHeight);
    }
  }

  /** 현재 점수 (읽기 전용 프록시) */
  get score(): number {
    return this.scoreObj.value;
  }

  /** 게임을 시작한다 (ready → playing) */
  start(): void {
    if (this.status === 'ready') {
      this.status = 'playing';
    }
  }

  /** 게임을 재시작한다 (어떤 상태에서든 playing으로 초기화) */
  restart(): void {
    this.scoreObj.reset();
    this.status = 'playing';

    const segments = this.buildInitialSegments();
    this.snake.reset(segments, DIR_RIGHT);
    this.committedDirection = { ...DIR_RIGHT };
    this.food.spawn(this.snake.occupied(), this.gridWidth, this.gridHeight);
  }

  /**
   * 한 틱을 진행한다.
   * 순서: 확정 방향 갱신 → 다음 머리 계산 → 벽/자체 충돌 검사 → 음식 섭취/성장 또는 일반 이동 → 상태 갱신
   */
  tick(): void {
    // gameover / ready 상태에서는 이동하지 않는다
    if (this.status !== 'playing') return;

    // 틱 시작 시 현재 snake.direction을 다음 틱의 반전 기준으로 확정
    this.committedDirection = { ...this.snake.direction };

    const nextHead = this.snake.nextHead();

    // 벽 충돌 검사
    if (checkWallCollision(nextHead, this.gridWidth, this.gridHeight)) {
      this.status = 'gameover';
      return;
    }

    // 자체 충돌 검사
    if (checkSelfCollision(nextHead, this.snake.occupied())) {
      this.status = 'gameover';
      return;
    }

    // 음식 섭취 여부
    const eaten = checkFoodEaten(nextHead, this.food.position);

    if (eaten) {
      // 꼬리 유지 (성장)
      this.snake.move(true);
      this.scoreObj.increment();
      // 새 음식 생성
      this.food.spawn(this.snake.occupied(), this.gridWidth, this.gridHeight);
    } else {
      // 꼬리 제거 (일반 이동)
      this.snake.move(false);
    }
  }

  /**
   * 방향 입력을 처리한다.
   * 반전 검사는 committedDirection(이전 틱 확정 방향) 기준으로 수행하여
   * 한 틱 내 빠른 다중 입력 시 즉각 자체 충돌을 방지한다(EC-3).
   */
  setDirection(dir: Direction): void {
    if (isOppositeDirection(this.committedDirection, dir)) {
      return;
    }
    this.snake.setDirection(dir);
  }

  /**
   * @internal
   * 테스트 전용: 실제 충돌 시뮬레이션 없이 gameover 상태를 설정한다.
   * 프로덕션 코드에서는 호출하지 않는다.
   * 실제 충돌을 통한 테스트가 선호되지만, 상태 전환 자체를 검증하는
   * 단순 테스트에서 보조적으로 사용한다.
   */
  forceGameOver(): void {
    this.status = 'gameover';
  }

  /** 초기 뱀 세그먼트 배열을 생성한다 */
  private buildInitialSegments(options?: GameOptions): Position[] {
    if (options?.segments) {
      return options.segments.map((s) => ({ ...s }));
    }

    const headX = options?.headX ?? INITIAL_HEAD_X;
    const headY = options?.headY ?? INITIAL_HEAD_Y;
    const length = options?.length ?? INITIAL_SNAKE_LENGTH;

    // 오른쪽 방향 초기 뱀: 머리 (headX, headY), 몸 (headX-1, headY), ...
    const segs: Position[] = [];
    for (let i = 0; i < length; i++) {
      segs.push({ x: headX - i, y: headY });
    }
    return segs;
  }
}
