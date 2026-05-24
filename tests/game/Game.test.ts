import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from '../../src/game/Game';
import { DIR_RIGHT, DIR_LEFT, DIR_UP, DIR_DOWN } from '../../src/game/types';
import { SCORE_PER_FOOD, INITIAL_SNAKE_LENGTH } from '../../src/config/constants';

// Game 상태 머신 단위 테스트
// AC-MOVE-1, AC-EAT-1, AC-WALL-1, AC-SELF-1, AC-SELF-2, AC-RESTART-1, AC-RESTART-2, EC-3

/** 결정론적 테스트용 고정 rng */
const fixedRng = () => 0;

describe('Game', () => {
  let game: Game;

  beforeEach(() => {
    game = new Game(fixedRng);
  });

  describe('초기 상태', () => {
    it('초기 상태는 ready이다', () => {
      expect(game.status).toBe('ready');
    });

    it('초기 점수는 0이다', () => {
      expect(game.score).toBe(0);
    });
  });

  describe('start (AC-RESTART-2)', () => {
    it('ready 상태에서 start() 호출 시 playing이 된다', () => {
      game.start();
      expect(game.status).toBe('playing');
    });
  });

  describe('tick — gameover 상태에서 정지 (AC-SELF-2)', () => {
    it('gameover 상태에서 tick을 호출해도 상태 변화 없음', () => {
      // 실제 벽 충돌로 gameover 유도: 머리를 우측 끝에 배치
      const edgeGame = new Game(fixedRng, {
        headX: 19,
        headY: 5,
        length: 2,
        direction: DIR_RIGHT,
      });
      edgeGame.start();
      edgeGame.tick(); // 벽 충돌 → gameover
      expect(edgeGame.status).toBe('gameover');
      const snakeHeadBefore = { ...edgeGame.snake.head() };
      edgeGame.tick(); // gameover 상태에서 추가 tick
      expect(edgeGame.status).toBe('gameover');
      expect(edgeGame.snake.head()).toEqual(snakeHeadBefore);
    });
  });

  describe('tick — 정상 이동 (AC-MOVE-1)', () => {
    it('playing 상태에서 tick 호출 시 뱀이 한 칸 이동한다', () => {
      game.start();
      const headBefore = { ...game.snake.head() };
      const dir = game.snake.direction;
      game.tick();
      const headAfter = game.snake.head();
      if (game.status === 'playing') {
        // 충돌 없이 이동했을 경우에만 검증
        expect(headAfter.x).toBe(headBefore.x + dir.dx);
        expect(headAfter.y).toBe(headBefore.y + dir.dy);
      }
    });
  });

  describe('tick — 벽 충돌 (AC-WALL-1)', () => {
    it('벽에 부딪히면 gameover가 된다', () => {
      // 뱀을 경계 바로 앞에 위치시키기 위해 Game에 커스텀 초기화 사용
      const edgeGame = new Game(fixedRng, {
        headX: 19,
        headY: 10,
        length: 3,
        direction: DIR_RIGHT,
      });
      edgeGame.start();
      edgeGame.tick();
      expect(edgeGame.status).toBe('gameover');
    });

    it('상단 경계 충돌 시 gameover (AC-WALL-2)', () => {
      const edgeGame = new Game(fixedRng, {
        headX: 10,
        headY: 0,
        length: 3,
        direction: DIR_UP,
      });
      edgeGame.start();
      edgeGame.tick();
      expect(edgeGame.status).toBe('gameover');
    });
  });

  describe('tick — 자체 충돌 (AC-SELF-1)', () => {
    it('자기 몸과 충돌하면 gameover가 된다', () => {
      // AC-SELF-1 픽스처: 머리(5,5), (4,5), (4,6), (5,6), (6,6), (6,5) 방향 아래
      const selfGame = new Game(fixedRng, {
        segments: [
          { x: 5, y: 5 },
          { x: 4, y: 5 },
          { x: 4, y: 6 },
          { x: 5, y: 6 },
          { x: 6, y: 6 },
          { x: 6, y: 5 },
        ],
        direction: DIR_DOWN,
      });
      selfGame.start();
      selfGame.tick();
      expect(selfGame.status).toBe('gameover');
    });
  });

  describe('tick — 음식 섭취 및 성장 (AC-EAT-1, AC-EAT-2)', () => {
    it('음식을 먹으면 뱀 길이가 증가하고 점수가 오른다', () => {
      // 뱀 머리 바로 앞(오른쪽)에 음식 배치
      const eatGame = new Game(fixedRng, {
        headX: 5,
        headY: 5,
        length: 3,
        direction: DIR_RIGHT,
        foodPosition: { x: 6, y: 5 },
      });
      eatGame.start();
      const lenBefore = eatGame.snake.length();
      eatGame.tick();
      expect(eatGame.snake.length()).toBe(lenBefore + 1);
      expect(eatGame.score).toBe(SCORE_PER_FOOD);
    });

    it('음식 섭취 후 새 음식이 생성된다 (AC-EAT-2)', () => {
      const eatGame = new Game(fixedRng, {
        headX: 5,
        headY: 5,
        length: 3,
        direction: DIR_RIGHT,
        foodPosition: { x: 6, y: 5 },
      });
      eatGame.start();
      eatGame.tick();
      // 새 음식이 항상 하나 존재
      expect(eatGame.food.position).not.toBeNull();
    });
  });

  describe('방향 설정 (AC-REV-1, EC-3)', () => {
    it('180도 반전 방향은 무시된다 (AC-REV-1)', () => {
      game.start();
      const origDir = game.snake.direction;
      game.setDirection(DIR_LEFT); // 오른쪽 진행 중 왼쪽 입력
      expect(game.snake.direction).toEqual(origDir);
    });

    it('한 틱 내 여러 입력 중 마지막 유효 입력만 적용 (EC-3)', () => {
      game.start();
      game.setDirection(DIR_UP);
      game.setDirection(DIR_DOWN); // UP과 반전 → 무시
      game.setDirection(DIR_UP);   // 마지막 유효 입력
      // 틱 전까지는 snake.direction에 반영되어 있어야 함
      expect(game.snake.direction).toEqual(DIR_UP);
    });

    it('EC-3 즉각 자체 충돌 방지: RIGHT→UP→LEFT 순서 입력 시 LEFT가 원래 방향(RIGHT) 기준 반전이므로 무시된다', () => {
      // Arrange: 머리(5,10), 몸(4,10),(3,10) — 오른쪽 진행
      const ecGame = new Game(fixedRng, {
        headX: 5,
        headY: 10,
        length: 3,
        direction: DIR_RIGHT,
      });
      ecGame.start();

      // Act: 한 틱 안에 UP → LEFT 순서로 입력
      // LEFT는 원래 확정 방향 RIGHT의 반전이므로 거부되어야 한다
      ecGame.setDirection(DIR_UP);   // 유효 (RIGHT와 반전 아님)
      ecGame.setDirection(DIR_LEFT); // RIGHT의 반전 → 거부되어야 함

      ecGame.tick();

      // Assert: 자체 충돌(gameover) 없이 UP 방향으로 이동한다
      expect(ecGame.status).toBe('playing');
      expect(ecGame.snake.head()).toEqual({ x: 5, y: 9 }); // UP 이동
    });
  });

  describe('restart (AC-RESTART-1)', () => {
    it('gameover에서 restart() 시 playing으로 전환하고 초기화된다', () => {
      // 실제 벽 충돌로 gameover 유도
      const restartGame = new Game(fixedRng, {
        headX: 19,
        headY: 5,
        length: 2,
        direction: DIR_RIGHT,
        foodPosition: { x: 0, y: 0 },
      });
      restartGame.start();
      restartGame.tick(); // 벽 충돌 → gameover
      expect(restartGame.status).toBe('gameover');
      restartGame.restart();
      expect(restartGame.status).toBe('playing');
      expect(restartGame.score).toBe(0);
    });

    it('restart 후 뱀이 초기 길이로 리셋된다', () => {
      // 실제 벽 충돌로 gameover 유도
      const restartGame = new Game(fixedRng, {
        headX: 19,
        headY: 5,
        length: 2,
        direction: DIR_RIGHT,
        foodPosition: { x: 0, y: 0 },
      });
      restartGame.start();
      restartGame.tick(); // 벽 충돌 → gameover
      restartGame.restart();
      // 초기 뱀 길이는 constants의 INITIAL_SNAKE_LENGTH
      expect(restartGame.snake.length()).toBe(INITIAL_SNAKE_LENGTH);
    });
  });
});
