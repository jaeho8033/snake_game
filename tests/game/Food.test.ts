import { describe, it, expect } from 'vitest';
import { Food } from '../../src/game/Food';
import { Position } from '../../src/game/types';

// EC-1 (빈 셀에만 음식 생성), EC-2 (보드 가득 참) 시나리오를 포함

describe('Food', () => {
  // 고정 rng: 항상 0 반환 → 빈 셀 목록의 첫 번째 셀 선택
  const fixedRng = () => 0;

  describe('spawn (EC-1: 빈 셀에만 생성)', () => {
    it('뱀이 없으면 어느 셀이든 선택한다', () => {
      const food = new Food(fixedRng);
      const occupied: Position[] = [];
      food.spawn(occupied, 3, 3);
      // rng=0 → index 0 → 좌표 (0,0)
      expect(food.position).toEqual({ x: 0, y: 0 });
    });

    it('뱀이 점유한 셀을 제외하고 빈 셀에 생성한다', () => {
      const food = new Food(fixedRng);
      // 보드 2x2, 뱀이 (0,0)을 점유
      const occupied: Position[] = [{ x: 0, y: 0 }];
      food.spawn(occupied, 2, 2);
      // 빈 셀: (1,0), (0,1), (1,1) → index 0 → (1,0)
      expect(food.position).not.toEqual({ x: 0, y: 0 });
    });

    it('rng 인덱스를 이용해 결정론적으로 셀을 선택한다', () => {
      // rng가 0.5를 반환 → Math.floor(0.5 * N) 번째 셀
      const halfRng = () => 0.5;
      const food = new Food(halfRng);
      const occupied: Position[] = [];
      // 2x2 보드 → 빈 셀 4개 → index = Math.floor(0.5 * 4) = 2 → (0,1)
      food.spawn(occupied, 2, 2);
      expect(food.position).toEqual({ x: 0, y: 1 });
    });
  });

  describe('spawn (EC-2: 보드 가득 참)', () => {
    it('빈 셀이 없을 때 position이 null이 된다', () => {
      const food = new Food(fixedRng);
      // 2x2 보드를 모두 뱀이 점유
      const occupied: Position[] = [
        { x: 0, y: 0 }, { x: 1, y: 0 },
        { x: 0, y: 1 }, { x: 1, y: 1 },
      ];
      food.spawn(occupied, 2, 2);
      expect(food.position).toBeNull();
    });

    it('빈 셀이 없을 때 크래시 없이 처리된다', () => {
      const food = new Food(fixedRng);
      const occupied: Position[] = [{ x: 0, y: 0 }];
      // 1x1 보드
      expect(() => food.spawn(occupied, 1, 1)).not.toThrow();
    });
  });

  describe('초기 상태', () => {
    it('생성 직후 position이 null이다', () => {
      const food = new Food(fixedRng);
      expect(food.position).toBeNull();
    });
  });
});
