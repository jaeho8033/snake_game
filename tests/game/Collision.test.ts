import { describe, it, expect } from 'vitest';
import { checkWallCollision, checkSelfCollision, checkFoodEaten } from '../../src/game/Collision';
import { Position } from '../../src/game/types';

// AC-WALL-1, AC-WALL-2, AC-SELF-1 시나리오 검증

describe('Collision', () => {
  describe('checkWallCollision (AC-WALL-1, AC-WALL-2)', () => {
    const GRID_W = 20;
    const GRID_H = 20;

    it('좌표가 정상 범위면 false 반환', () => {
      expect(checkWallCollision({ x: 5, y: 5 }, GRID_W, GRID_H)).toBe(false);
    });

    it('x가 음수이면 true (좌측 경계)', () => {
      expect(checkWallCollision({ x: -1, y: 5 }, GRID_W, GRID_H)).toBe(true);
    });

    it('x가 GRID_WIDTH 이상이면 true (AC-WALL-1: 우측 경계)', () => {
      expect(checkWallCollision({ x: 20, y: 5 }, GRID_W, GRID_H)).toBe(true);
    });

    it('y가 음수이면 true (AC-WALL-2: 상단 경계)', () => {
      expect(checkWallCollision({ x: 5, y: -1 }, GRID_W, GRID_H)).toBe(true);
    });

    it('y가 GRID_HEIGHT 이상이면 true (하단 경계)', () => {
      expect(checkWallCollision({ x: 5, y: 20 }, GRID_W, GRID_H)).toBe(true);
    });

    it('경계 내 최대 좌표는 충돌 아님', () => {
      expect(checkWallCollision({ x: 19, y: 19 }, GRID_W, GRID_H)).toBe(false);
    });
  });

  describe('checkSelfCollision (AC-SELF-1)', () => {
    it('머리가 몸 세그먼트와 겹치면 true', () => {
      // AC-SELF-1 픽스처: 머리 (5,5), 몸 (4,5), (4,6), (5,6), (6,6), (6,5)
      // 다음 머리 (5,6)은 네 번째 세그먼트와 겹침
      const nextHead: Position = { x: 5, y: 6 };
      const segments: Position[] = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 4, y: 6 },
        { x: 5, y: 6 },
        { x: 6, y: 6 },
        { x: 6, y: 5 },
      ];
      expect(checkSelfCollision(nextHead, segments)).toBe(true);
    });

    it('머리가 몸과 겹치지 않으면 false', () => {
      const nextHead: Position = { x: 6, y: 5 };
      const segments: Position[] = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ];
      expect(checkSelfCollision(nextHead, segments)).toBe(false);
    });

    it('단일 세그먼트 뱀은 자체 충돌 없음', () => {
      expect(checkSelfCollision({ x: 1, y: 0 }, [{ x: 0, y: 0 }])).toBe(false);
    });
  });

  describe('checkFoodEaten', () => {
    it('머리가 음식 위치와 같으면 true', () => {
      expect(checkFoodEaten({ x: 3, y: 4 }, { x: 3, y: 4 })).toBe(true);
    });

    it('머리가 음식 위치와 다르면 false', () => {
      expect(checkFoodEaten({ x: 3, y: 4 }, { x: 3, y: 5 })).toBe(false);
    });

    it('음식 위치가 null이면 false', () => {
      expect(checkFoodEaten({ x: 3, y: 4 }, null)).toBe(false);
    });
  });
});
