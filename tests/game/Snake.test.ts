import { describe, it, expect, beforeEach } from 'vitest';
import { Snake } from '../../src/game/Snake';
import { DIR_RIGHT, DIR_LEFT, DIR_UP, DIR_DOWN } from '../../src/game/types';

// AC-MOVE-1, AC-MOVE-2, AC-REV-1, AC-REV-2 시나리오를 검증하는 단위 테스트

describe('Snake', () => {
  let snake: Snake;

  beforeEach(() => {
    // 초기 뱀: 머리 (5,5), 몸 (4,5), (3,5) — 오른쪽 방향
    snake = new Snake([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ], DIR_RIGHT);
  });

  describe('초기 상태', () => {
    it('머리 위치를 반환한다', () => {
      expect(snake.head()).toEqual({ x: 5, y: 5 });
    });

    it('초기 길이가 3이다', () => {
      expect(snake.length()).toBe(3);
    });

    it('초기 방향이 오른쪽이다', () => {
      expect(snake.direction).toEqual(DIR_RIGHT);
    });
  });

  describe('move (AC-MOVE-1: 정상 전진)', () => {
    it('grow=false 이면 머리가 앞으로 이동하고 꼬리가 제거된다', () => {
      snake.move(false);
      // 머리: (6,5), 몸: (5,5), (4,5) — 꼬리 (3,5) 제거
      expect(snake.head()).toEqual({ x: 6, y: 5 });
      expect(snake.length()).toBe(3);
    });

    it('grow=true 이면 머리가 앞으로 이동하고 꼬리가 유지된다', () => {
      snake.move(true);
      expect(snake.head()).toEqual({ x: 6, y: 5 });
      expect(snake.length()).toBe(4);
    });
  });

  describe('move (AC-MOVE-2: 방향 유지)', () => {
    it('연속 3틱 동안 방향 유지 이동', () => {
      snake.move(false);
      snake.move(false);
      snake.move(false);
      expect(snake.head()).toEqual({ x: 8, y: 5 });
      expect(snake.length()).toBe(3);
    });
  });

  describe('setDirection (AC-REV-1: 180도 반전 방지)', () => {
    it('현재 오른쪽 진행 중 왼쪽 입력은 무시된다', () => {
      snake.setDirection(DIR_LEFT);
      expect(snake.direction).toEqual(DIR_RIGHT);
    });

    it('현재 위쪽 진행 중 아래쪽 입력은 무시된다', () => {
      const s = new Snake([{ x: 5, y: 5 }, { x: 5, y: 6 }], DIR_UP);
      s.setDirection(DIR_DOWN);
      expect(s.direction).toEqual(DIR_UP);
    });
  });

  describe('setDirection (AC-REV-2: 직각 방향 허용)', () => {
    it('오른쪽 진행 중 위쪽 입력이 적용된다', () => {
      snake.setDirection(DIR_UP);
      expect(snake.direction).toEqual(DIR_UP);
    });

    it('오른쪽 진행 중 아래쪽 입력이 적용된다', () => {
      snake.setDirection(DIR_DOWN);
      expect(snake.direction).toEqual(DIR_DOWN);
    });
  });

  describe('occupied (점유 셀 조회)', () => {
    it('모든 세그먼트 위치를 반환한다', () => {
      const cells = snake.occupied();
      expect(cells).toHaveLength(3);
      expect(cells).toContainEqual({ x: 5, y: 5 });
      expect(cells).toContainEqual({ x: 4, y: 5 });
      expect(cells).toContainEqual({ x: 3, y: 5 });
    });
  });

  describe('다음 머리 위치 계산 (nextHead)', () => {
    it('현재 방향으로 한 셀 앞 위치를 반환한다', () => {
      expect(snake.nextHead()).toEqual({ x: 6, y: 5 });
    });

    it('위 방향일 때 y가 감소한다', () => {
      const s = new Snake([{ x: 5, y: 5 }], DIR_UP);
      expect(s.nextHead()).toEqual({ x: 5, y: 4 });
    });
  });
});
