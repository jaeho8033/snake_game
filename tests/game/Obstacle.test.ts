import { describe, it, expect } from 'vitest';
import { Game } from '../../src/game/Game';
import { DIR_RIGHT, DIR_DOWN, DIR_UP, Position } from '../../src/game/types';
import { checkObstacleCollision } from '../../src/game/Collision';
import { INITIAL_HEAD_X, INITIAL_HEAD_Y } from '../../src/config/constants';
import { OBSTACLE_CELLS } from '../../src/config/difficulty';

// 장애물 시스템 단위 테스트
// AC-OBS-1: 장애물 정면 → 1틱 후 gameover
// AC-OBS-2: 음식 재생성 시 장애물/뱀 위치 제외
// AC-OBS-3: 초기 뱀 세그먼트가 장애물과 겹치지 않음

/** 결정론적 고정 rng */
const fixedRng = () => 0;

describe('장애물(Obstacle) 시스템', () => {
  describe('checkObstacleCollision 순수 함수', () => {
    it('위치가 장애물 목록에 있으면 true 반환', () => {
      const obstacles: Position[] = [{ x: 3, y: 3 }, { x: 5, y: 7 }];
      expect(checkObstacleCollision({ x: 3, y: 3 }, obstacles)).toBe(true);
    });

    it('위치가 장애물 목록에 없으면 false 반환', () => {
      const obstacles: Position[] = [{ x: 3, y: 3 }];
      expect(checkObstacleCollision({ x: 4, y: 4 }, obstacles)).toBe(false);
    });

    it('장애물 목록이 비어 있으면 항상 false', () => {
      expect(checkObstacleCollision({ x: 0, y: 0 }, [])).toBe(false);
    });
  });

  describe('AC-OBS-1: 장애물 정면 충돌 → gameover', () => {
    it('진행 방향 바로 앞에 장애물이 있으면 1틱 후 gameover가 된다', () => {
      // Arrange: 머리(5,5) 오른쪽 방향, 바로 앞 (6,5)에 장애물
      const obstacleAhead: Position = { x: 6, y: 5 };
      const game = new Game(fixedRng, {
        segments: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
        direction: DIR_RIGHT,
        foodPosition: { x: 10, y: 10 },
        obstacles: [obstacleAhead],
      });
      game.start();

      // Act
      game.tick();

      // Assert: 장애물 충돌 → gameover (벽/자체충돌과 동일 경로)
      expect(game.status).toBe('gameover');
    });

    it('아래 방향 진행 중 장애물과 충돌해도 gameover', () => {
      // Arrange: 머리(5,5) 아래 방향, 바로 아래 (5,6)에 장애물
      const game = new Game(fixedRng, {
        segments: [{ x: 5, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 3 }],
        direction: DIR_DOWN,
        foodPosition: { x: 10, y: 10 },
        obstacles: [{ x: 5, y: 6 }],
      });
      game.start();
      game.tick();
      expect(game.status).toBe('gameover');
    });

    it('장애물이 없으면 같은 방향 이동 시 gameover 아님', () => {
      // Arrange: 장애물 없음
      const game = new Game(fixedRng, {
        segments: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
        direction: DIR_RIGHT,
        foodPosition: { x: 10, y: 10 },
        obstacles: [],
      });
      game.start();
      game.tick();
      // 장애물 없으면 정상 이동
      expect(game.status).toBe('playing');
    });

    it('장애물이 진행 방향 앞이 아닌 다른 위치면 정상 이동', () => {
      // Arrange: 장애물이 (6,6)에 있음 — 오른쪽 이동 경로(6,5)가 아님
      const game = new Game(fixedRng, {
        segments: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
        direction: DIR_RIGHT,
        foodPosition: { x: 10, y: 10 },
        obstacles: [{ x: 6, y: 6 }],
      });
      game.start();
      game.tick();
      expect(game.status).toBe('playing');
    });
  });

  describe('AC-OBS-2: 음식 생성 시 장애물/뱀 위치 제외', () => {
    it('음식 재생성 위치는 장애물 셀도, 뱀 세그먼트도 아니다 (후보 공간 전체 검증)', () => {
      // Arrange: x=0 열의 (0,0)~(0,18)을 장애물로 채워 빈 셀 후보를 제한한다.
      // fixedRng=0이면 free[] 첫 번째 원소 선택 → 첫 원소가 장애물/뱀이면 테스트가 실패해야 함.
      const obstacles: Position[] = [];
      for (let y = 0; y <= 18; y++) {
        obstacles.push({ x: 0, y });
      }
      // 뱀: 머리(5,5), (4,5), (3,5) — 오른쪽 방향
      // 음식을 머리 바로 앞(6,5)에 배치해 다음 tick에서 즉시 섭취되도록 함
      const game = new Game(fixedRng, {
        segments: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
        direction: DIR_RIGHT,
        foodPosition: { x: 6, y: 5 },
        obstacles,
      });
      game.start();

      // Act: tick() → 음식 섭취 → food.spawn() 호출됨
      game.tick();

      // Assert 1: 재생성된 음식이 반드시 존재해야 한다 (빈 셀 있음)
      expect(game.food.position).not.toBeNull();

      const fp = game.food.position!;

      // Assert 2: 장애물 위치가 아니어야 한다
      const isOnObstacle = obstacles.some((o) => o.x === fp.x && o.y === fp.y);
      expect(isOnObstacle).toBe(false);

      // Assert 3: 뱀 세그먼트 위치도 아니어야 한다 (tick 후 성장한 상태)
      const snakeSegs = game.snake.occupied();
      const isOnSnake = snakeSegs.some((s) => s.x === fp.x && s.y === fp.y);
      expect(isOnSnake).toBe(false);

      // Assert 4: 생성된 위치가 실제 빈 셀 후보 집합에 속하는지 검증
      // (필터 로직 회귀 방지 — 장애물 또는 뱀 위에 음식이 배치되면 이 집합에 없음)
      const occupiedSet = new Set(
        [...snakeSegs, ...obstacles].map((p) => `${p.x},${p.y}`),
      );
      expect(occupiedSet.has(`${fp.x},${fp.y}`)).toBe(false);
    });

    it('음식 재생성 위치는 장애물도, 뱀 세그먼트도 동시에 배제된다 (두 조건 모두 검증)', () => {
      // Arrange: 장애물과 뱀이 혼재한 상황에서 양쪽 모두 제외되는지 검증
      // 장애물: (7,5) — 음식 먹은 직후 뱀이 (6,5)로 이동하고 (3,5)~(6,5) 점유
      // 빈 셀은 보드 전체에서 뱀(4셀) + 장애물(1셀)을 뺀 나머지
      const obstacles: Position[] = [{ x: 7, y: 5 }];
      const game = new Game(fixedRng, {
        segments: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
        direction: DIR_RIGHT,
        foodPosition: { x: 6, y: 5 },
        obstacles,
      });
      game.start();
      game.tick(); // 음식 섭취 → 재생성

      // Assert 1: 음식이 생성되어 있어야 한다
      expect(game.food.position).not.toBeNull();

      const fp = game.food.position!;
      const snakeSegs = game.snake.occupied(); // 성장 후: (6,5),(5,5),(4,5),(3,5)

      // Assert 2: 장애물 위치 아님
      const isOnObstacle = obstacles.some((o) => o.x === fp.x && o.y === fp.y);
      expect(isOnObstacle).toBe(false);

      // Assert 3: 뱀 세그먼트 위치 아님
      const isOnSnake = snakeSegs.some((s) => s.x === fp.x && s.y === fp.y);
      expect(isOnSnake).toBe(false);

      // Assert 4: occupied 합집합 기반 후보 집합 검증 (필터 회귀 방지)
      const occupiedSet = new Set(
        [...snakeSegs, ...obstacles].map((p) => `${p.x},${p.y}`),
      );
      expect(occupiedSet.has(`${fp.x},${fp.y}`)).toBe(false);
    });
  });

  describe('AC-OBS-3: 초기 뱀 세그먼트가 장애물과 겹치지 않음', () => {
    it('기본 OBSTACLE_CELLS가 기본 초기 뱀 위치와 겹치지 않는다', () => {
      // 기본 초기 뱀: 머리(5,10), (4,10), (3,10)
      const defaultSnakeSegments: Position[] = [
        { x: INITIAL_HEAD_X, y: INITIAL_HEAD_Y },
        { x: INITIAL_HEAD_X - 1, y: INITIAL_HEAD_Y },
        { x: INITIAL_HEAD_X - 2, y: INITIAL_HEAD_Y },
      ];

      const hasOverlap = OBSTACLE_CELLS.some((obstacle) =>
        defaultSnakeSegments.some(
          (seg) => seg.x === obstacle.x && seg.y === obstacle.y,
        ),
      );

      expect(hasOverlap).toBe(false);
    });

    it('장애물 모드로 Game 생성 시 즉시 gameover가 아니다', () => {
      // 기본 OBSTACLE_CELLS로 게임 생성
      const game = new Game(fixedRng, {
        obstacles: OBSTACLE_CELLS,
      });
      game.start();

      // 첫 틱에서 gameover면 초기 배치 충돌 또는 즉시 장애물 충돌
      game.tick();

      // 첫 틱에서 gameover이면 안 됨 (초기 세그먼트가 장애물과 안 겹치고, 첫 이동 경로도 안전해야)
      // 참고: 첫 이동 방향(DIR_RIGHT)으로 머리(5,10)→(6,10)이 장애물 아니어야 함
      const nextHead: Position = { x: 6, y: 10 };
      const isNextHeadObstacle = OBSTACLE_CELLS.some(
        (o) => o.x === nextHead.x && o.y === nextHead.y,
      );

      if (!isNextHeadObstacle) {
        expect(game.status).toBe('playing');
      }
    });

    it('커스텀 장애물이 주입되어도 초기 뱀 위치와 겹치지 않으면 game 생성 후 즉시 gameover 아님', () => {
      // Arrange: 뱀과 겹치지 않는 안전한 장애물 위치
      const safeObstacles: Position[] = [
        { x: 10, y: 10 },
        { x: 11, y: 10 },
        { x: 12, y: 10 },
      ];

      const game = new Game(fixedRng, {
        segments: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
        direction: DIR_RIGHT,
        foodPosition: { x: 10, y: 5 },
        obstacles: safeObstacles,
      });
      game.start();

      // 첫 틱: 장애물이 이동 경로(6,5)에 없으므로 정상 이동
      game.tick();
      expect(game.status).toBe('playing');
    });
  });
});
