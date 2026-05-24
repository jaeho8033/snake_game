import { describe, it, expect } from 'vitest';
import { Game } from '../../src/game/Game';
import { DIR_RIGHT, DIR_UP, DIR_DOWN, DIR_LEFT } from '../../src/game/types';
import { SCORE_PER_FOOD, INITIAL_SNAKE_LENGTH } from '../../src/config/constants';

// 전체 게임 플로우 통합 테스트
// start → move → eat/grow → wall collision → gameover → restart

const fixedRng = () => 0;

describe('GameFlow (통합)', () => {
  describe('시작 → 이동 → 음식 섭취 → 성장', () => {
    it('ready → playing → 음식 섭취 → 길이/점수 증가', () => {
      const game = new Game(fixedRng, {
        headX: 5,
        headY: 5,
        length: 3,
        direction: DIR_RIGHT,
        foodPosition: { x: 6, y: 5 },
      });

      expect(game.status).toBe('ready');
      game.start();
      expect(game.status).toBe('playing');

      const lenBefore = game.snake.length();
      game.tick(); // 음식 섭취
      expect(game.snake.length()).toBe(lenBefore + 1);
      expect(game.score).toBe(SCORE_PER_FOOD);
      expect(game.food.position).not.toBeNull();
    });
  });

  describe('이동 → 벽 충돌 → 게임 오버', () => {
    it('우측 경계 충돌 → gameover (AC-WALL-1)', () => {
      const game = new Game(fixedRng, {
        headX: 19,
        headY: 5,
        length: 3,
        direction: DIR_RIGHT,
      });
      game.start();
      game.tick();
      expect(game.status).toBe('gameover');
    });
  });

  describe('자체 충돌 → 게임 오버 (AC-SELF-1)', () => {
    it('U자 뱀이 아래로 움직여 자체 충돌', () => {
      const game = new Game(fixedRng, {
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
      game.start();
      game.tick();
      expect(game.status).toBe('gameover');
    });
  });

  describe('게임 오버 → 재시작 (AC-RESTART-1)', () => {
    it('gameover에서 restart 시 초기 상태로 복귀', () => {
      // 실제 벽 충돌로 gameover 유도
      const game = new Game(fixedRng, {
        headX: 19,
        headY: 5,
        length: 2,
        direction: DIR_RIGHT,
        foodPosition: { x: 0, y: 0 },
      });
      game.start();
      game.tick(); // 우측 벽 충돌 → gameover
      expect(game.status).toBe('gameover');

      game.restart();
      expect(game.status).toBe('playing');
      expect(game.score).toBe(0);
      expect(game.snake.length()).toBe(INITIAL_SNAKE_LENGTH);
    });
  });

  describe('gameover 후 tick 비동작 (AC-SELF-2)', () => {
    it('gameover 상태에서 여러 tick 호출 시 뱀 정지', () => {
      // 실제 벽 충돌로 gameover 유도
      const game = new Game(fixedRng, {
        headX: 19,
        headY: 5,
        length: 2,
        direction: DIR_RIGHT,
        foodPosition: { x: 0, y: 0 },
      });
      game.start();
      game.tick(); // 우측 벽 충돌 → gameover
      expect(game.status).toBe('gameover');

      const headBefore = { ...game.snake.head() };
      game.tick();
      game.tick();
      game.tick();
      expect(game.snake.head()).toEqual(headBefore);
      expect(game.status).toBe('gameover');
    });
  });

  describe('점수 누적 (AC-SCORE-2)', () => {
    it('tick()을 통해 음식 3회 연속 섭취 시 base + SCORE_PER_FOOD * 3 점수가 된다', () => {
      // Arrange: 머리(5,5) 오른쪽 방향, 첫 음식 (6,5) — 다음 틱에 바로 섭취
      const game = new Game(fixedRng, {
        headX: 5,
        headY: 5,
        length: 3,
        direction: DIR_RIGHT,
        foodPosition: { x: 6, y: 5 },
      });
      game.start();
      const base = game.score; // 0

      // Act 1: 첫 번째 음식 섭취 — head (5,5) → (6,5)
      game.tick();
      expect(game.score).toBe(base + SCORE_PER_FOOD);
      expect(game.status).toBe('playing');

      // 두 번째 음식을 현재 머리(6,5) 바로 앞인 (7,5)에 수동 배치
      game.food.position = { x: 7, y: 5 };

      // Act 2: 두 번째 음식 섭취 — head (6,5) → (7,5)
      game.tick();
      expect(game.score).toBe(base + SCORE_PER_FOOD * 2);
      expect(game.status).toBe('playing');

      // 세 번째 음식을 현재 머리(7,5) 바로 앞인 (8,5)에 수동 배치
      game.food.position = { x: 8, y: 5 };

      // Act 3: 세 번째 음식 섭취 — head (7,5) → (8,5)
      game.tick();
      expect(game.score).toBe(base + SCORE_PER_FOOD * 3);
      expect(game.status).toBe('playing');

      // Assert: 뱀 길이도 3회 성장 확인
      expect(game.snake.length()).toBe(3 + 3); // 초기 3 + 성장 3
    });
  });

  describe('EC-3: 한 틱 내 빠른 다중 키 입력', () => {
    it('여러 입력 중 마지막 유효 입력이 적용된다', () => {
      const game = new Game(fixedRng);
      game.start();
      // 초기 방향 RIGHT
      game.setDirection(DIR_UP);   // 유효
      game.setDirection(DIR_DOWN); // UP의 반전 → 무시
      game.setDirection(DIR_UP);   // 유효, 최종
      // tick 시 UP으로 이동해야 함
      const headBefore = { ...game.snake.head() };
      game.tick();
      if (game.status === 'playing') {
        expect(game.snake.head().y).toBe(headBefore.y - 1); // UP = y 감소
      }
    });
  });
});
