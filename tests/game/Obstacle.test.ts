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
    it('음식 재생성 위치는 장애물 셀이 아니다', () => {
      // Arrange: 장애물이 거의 모든 셀을 차지하도록 구성
      // 결정론적 rng(fixedRng=0)으로 첫 번째 빈 셀이 선택되는 것을 검증
      const obstacles: Position[] = [];
      // (0,0)~(0,18) 모두 장애물로 채움 — (0,19)와 다른 셀은 남김
      for (let y = 0; y <= 18; y++) {
        obstacles.push({ x: 0, y });
      }

      const game = new Game(fixedRng, {
        segments: [
          { x: 5, y: 5 },
          { x: 4, y: 5 },
          { x: 3, y: 5 },
        ],
        direction: DIR_RIGHT,
        foodPosition: { x: 5, y: 6 }, // 먹으면 재생성 트리거
        obstacles,
      });
      game.start();

      // Act: 음식 섭취 후 재생성 트리거
      // 머리(5,5) → 오른쪽(6,5): 음식과 다름
      // 음식이 (5,6)에 있으므로 아래로 방향 변경 후 먹어야 함
      // 다른 접근: 직접 food.position을 머리 바로 앞으로 설정하고 tick
      game.food.position = { x: 6, y: 5 };
      game.tick(); // 음식 섭취 → 재생성

      // Assert: 재생성된 음식이 장애물 위치가 아님
      const fp = game.food.position;
      if (fp !== null) {
        const isOnObstacle = obstacles.some(
          (o) => o.x === fp.x && o.y === fp.y,
        );
        expect(isOnObstacle).toBe(false);
      }
    });

    it('음식 재생성 위치는 뱀 세그먼트와 겹치지 않는다', () => {
      // Arrange: 간단한 장애물 + 뱀 배치
      const game = new Game(fixedRng, {
        segments: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
        direction: DIR_RIGHT,
        foodPosition: { x: 6, y: 5 },
        obstacles: [{ x: 7, y: 5 }],
      });
      game.start();
      game.tick(); // 음식 섭취 → 재생성

      const fp = game.food.position;
      // 뱀 세그먼트와 겹치지 않아야 함
      if (fp !== null) {
        // 뱀이 성장했으므로 머리가 (6,5)로 이동
        const snakeSegs = game.snake.occupied();
        const isOnSnake = snakeSegs.some(
          (s) => s.x === fp.x && s.y === fp.y,
        );
        expect(isOnSnake).toBe(false);
      }
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
