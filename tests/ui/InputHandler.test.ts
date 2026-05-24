import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InputHandler } from '../../src/ui/InputHandler';
import { Game } from '../../src/game/Game';
import { DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT } from '../../src/game/types';

// InputHandler 단위 테스트 — window.addEventListener 모의 처리

describe('InputHandler', () => {
  let game: Game;
  let handler: InputHandler;

  /** KeyboardEvent 모의 생성 헬퍼 */
  function fireKey(key: string): void {
    const event = new KeyboardEvent('keydown', { key, bubbles: true });
    window.dispatchEvent(event);
  }

  beforeEach(() => {
    game = new Game(() => 0);
    handler = new InputHandler(game);
    handler.register();
  });

  afterEach(() => {
    handler.unregister();
  });

  describe('register / unregister', () => {
    it('register() 후 키 이벤트가 처리된다', () => {
      game.start();
      // 위쪽 방향 입력
      fireKey('ArrowUp');
      expect(game.snake.direction).toEqual(DIR_UP);
    });

    it('unregister() 후 키 이벤트가 무시된다', () => {
      game.start();
      handler.unregister();
      const dirBefore = { ...game.snake.direction };
      fireKey('ArrowUp');
      expect(game.snake.direction).toEqual(dirBefore);
    });
  });

  describe('방향 키 — Arrow keys', () => {
    beforeEach(() => game.start());

    it('ArrowUp → DIR_UP', () => {
      fireKey('ArrowUp');
      expect(game.snake.direction).toEqual(DIR_UP);
    });

    it('ArrowDown → DIR_DOWN', () => {
      // 현재 방향이 RIGHT이므로 DOWN은 유효
      fireKey('ArrowDown');
      expect(game.snake.direction).toEqual(DIR_DOWN);
    });

    it('ArrowLeft → DIR_LEFT — 반전이므로 무시됨', () => {
      const dirBefore = { ...game.snake.direction }; // RIGHT
      fireKey('ArrowLeft');
      // RIGHT의 반전(LEFT)은 무시
      expect(game.snake.direction).toEqual(dirBefore);
    });

    it('ArrowRight → DIR_RIGHT (이미 오른쪽이므로 유지)', () => {
      fireKey('ArrowRight');
      expect(game.snake.direction).toEqual(DIR_RIGHT);
    });
  });

  describe('방향 키 — WASD', () => {
    beforeEach(() => game.start());

    it('w → DIR_UP', () => {
      fireKey('w');
      expect(game.snake.direction).toEqual(DIR_UP);
    });

    it('s → DIR_DOWN', () => {
      fireKey('s');
      expect(game.snake.direction).toEqual(DIR_DOWN);
    });

    it('a → DIR_LEFT — 반전이므로 무시됨', () => {
      const dirBefore = { ...game.snake.direction };
      fireKey('a');
      expect(game.snake.direction).toEqual(dirBefore);
    });

    it('d → DIR_RIGHT', () => {
      fireKey('d');
      expect(game.snake.direction).toEqual(DIR_RIGHT);
    });

    it('W (대문자) → DIR_UP', () => {
      fireKey('W');
      expect(game.snake.direction).toEqual(DIR_UP);
    });
  });

  describe('시작 트리거 (AC-RESTART-2)', () => {
    it('ready 상태에서 ArrowUp 입력 시 게임이 시작된다', () => {
      expect(game.status).toBe('ready');
      fireKey('ArrowUp');
      expect(game.status).toBe('playing');
    });

    it('ready 상태에서 WASD 입력 시 게임이 시작된다', () => {
      expect(game.status).toBe('ready');
      fireKey('d');
      expect(game.status).toBe('playing');
    });
  });

  describe('재시작 키 — R', () => {
    it('gameover 상태에서 R 키 입력 시 재시작된다', () => {
      // 실제 벽 충돌로 gameover 유도
      const goGame = new Game(() => 0, {
        headX: 19,
        headY: 5,
        length: 2,
        direction: DIR_RIGHT,
        foodPosition: { x: 0, y: 0 },
      });
      const goHandler = new InputHandler(goGame);
      goHandler.register();
      goGame.start();
      goGame.tick(); // 우측 벽 충돌 → gameover
      expect(goGame.status).toBe('gameover');
      fireKey('r');
      expect(goGame.status).toBe('playing');
      goHandler.unregister();
    });

    it('R (대문자)도 재시작된다', () => {
      // 실제 벽 충돌로 gameover 유도
      const goGame = new Game(() => 0, {
        headX: 19,
        headY: 5,
        length: 2,
        direction: DIR_RIGHT,
        foodPosition: { x: 0, y: 0 },
      });
      const goHandler = new InputHandler(goGame);
      goHandler.register();
      goGame.start();
      goGame.tick(); // 우측 벽 충돌 → gameover
      fireKey('R');
      expect(goGame.status).toBe('playing');
      goHandler.unregister();
    });

    it('playing 상태에서 R 키 입력은 무시된다', () => {
      game.start();
      fireKey('r');
      expect(game.status).toBe('playing'); // 여전히 playing
    });
  });
});
