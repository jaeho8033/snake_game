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
  checkObstacleCollision,
} from './Collision';
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  INITIAL_SNAKE_LENGTH,
  INITIAL_HEAD_X,
  INITIAL_HEAD_Y,
} from '../config/constants';
import {
  DifficultyLevel,
  DIFFICULTY_PROFILES,
} from '../config/difficulty';

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
  /** 장애물 셀 배열 (없으면 빈 배열 = 장애물 없음) */
  obstacles?: Position[];
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

  /**
   * 현재 활성 틱 주기 (ms).
   * main.ts 루프가 매 프레임 읽어 accumulator 임계값으로 사용한다.
   *
   * @MX:NOTE: [AUTO] tickInterval — main.ts 루프의 accumulator 임계값 원천
   */
  public tickInterval: number;

  /**
   * 대기 중인 틱 주기 (ms).
   * playing 상태에서 setDifficulty() 호출 시 여기에 저장된다.
   * start() / restart() 시 tickInterval로 승격된다.
   *
   * @MX:NOTE: [AUTO] pendingTickInterval — 난이도 변경의 유예 메커니즘
   *           playing 중 즉시 속도 변경하지 않고, 다음 게임 시작 시점에 적용한다.
   */
  private pendingTickInterval: number;

  /** 현재 적용된 장애물 셀 배열 */
  public obstacles: Position[];

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

    // 기본 틱 주기는 MEDIUM 프로필
    const defaultInterval = DIFFICULTY_PROFILES.MEDIUM.tickInterval;
    this.tickInterval = defaultInterval;
    this.pendingTickInterval = defaultInterval;

    // 장애물 초기화
    this.obstacles = options?.obstacles ? options.obstacles.map((o) => ({ ...o })) : [];

    const segments = this.buildInitialSegments(options);
    const direction = options?.direction ?? DIR_RIGHT;
    this.snake = new Snake(segments, direction);
    // 초기 확정 방향 = 초기 방향
    this.committedDirection = { ...direction };

    if (options?.foodPosition) {
      this.food.position = { ...options.foodPosition };
    } else {
      // 장애물도 occupied에 포함하여 음식이 장애물 위에 생성되지 않도록 함
      this.food.spawn(
        [...this.snake.occupied(), ...this.obstacles],
        this.gridWidth,
        this.gridHeight,
      );
    }
  }

  /** 현재 점수 (읽기 전용 프록시) */
  get score(): number {
    return this.scoreObj.value;
  }

  /** 게임을 시작한다 (ready → playing). pendingTickInterval을 active로 승격한다. */
  start(): void {
    if (this.status === 'ready') {
      // 대기 중인 난이도를 활성화
      this.tickInterval = this.pendingTickInterval;
      this.status = 'playing';
    }
  }

  /** 게임을 재시작한다 (어떤 상태에서든 playing으로 초기화). pendingTickInterval을 active로 승격한다. */
  restart(): void {
    // 대기 중인 난이도를 활성화
    this.tickInterval = this.pendingTickInterval;

    this.scoreObj.reset();
    this.status = 'playing';

    const segments = this.buildInitialSegments();
    this.snake.reset(segments, DIR_RIGHT);
    this.committedDirection = { ...DIR_RIGHT };
    this.food.spawn(
      [...this.snake.occupied(), ...this.obstacles],
      this.gridWidth,
      this.gridHeight,
    );
  }

  /**
   * 난이도를 설정한다.
   * playing 상태이면 pendingTickInterval에만 저장하고 다음 start()/restart() 시 적용한다.
   * 그 외 상태이면 tickInterval과 pendingTickInterval 모두 즉시 적용한다.
   *
   * @MX:NOTE: [AUTO] setDifficulty — playing 중 즉시 적용 금지 규칙
   *           진행 중 속도가 갑자기 바뀌면 게임 공정성이 깨진다.
   *           pending 패턴으로 다음 게임 시작 시에만 적용된다.
   */
  setDifficulty(level: DifficultyLevel): void {
    const interval = DIFFICULTY_PROFILES[level].tickInterval;
    if (this.status === 'playing') {
      // playing 중: pending에만 저장 (active는 유지)
      this.pendingTickInterval = interval;
    } else {
      // ready / gameover: 즉시 active에도 반영
      this.tickInterval = interval;
      this.pendingTickInterval = interval;
    }
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

    // 장애물 충돌 검사 (벽/자체 충돌과 동일한 단일 충돌 경로)
    if (checkObstacleCollision(nextHead, this.obstacles)) {
      this.status = 'gameover';
      return;
    }

    // 음식 섭취 여부
    const eaten = checkFoodEaten(nextHead, this.food.position);

    if (eaten) {
      // 꼬리 유지 (성장)
      this.snake.move(true);
      this.scoreObj.increment();
      // 새 음식 생성 — 장애물도 occupied에 포함
      this.food.spawn(
        [...this.snake.occupied(), ...this.obstacles],
        this.gridWidth,
        this.gridHeight,
      );
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
