import { describe, it, expect, beforeEach } from 'vitest';
import { Score } from '../../src/game/Score';
import { SCORE_PER_FOOD } from '../../src/config/constants';

// AC-SCORE-1, AC-SCORE-2 시나리오 검증

describe('Score', () => {
  let score: Score;

  beforeEach(() => {
    score = new Score();
  });

  describe('초기 상태', () => {
    it('초기 점수는 0이다', () => {
      expect(score.value).toBe(0);
    });
  });

  describe('increment (AC-SCORE-1: 섭취 시 증가)', () => {
    it('한 번 증가 시 SCORE_PER_FOOD만큼 점수가 오른다', () => {
      score.increment();
      expect(score.value).toBe(SCORE_PER_FOOD);
    });
  });

  describe('increment (AC-SCORE-2: 누적 증가)', () => {
    it('3회 섭취 시 SCORE_PER_FOOD x 3 점수가 된다', () => {
      score.increment();
      score.increment();
      score.increment();
      expect(score.value).toBe(SCORE_PER_FOOD * 3);
    });

    it('임의 초기값 N에서 3회 섭취 시 N + SCORE_PER_FOOD * 3이 된다', () => {
      // 내부적으로 N번 증가시켜 초기값 설정
      const N = 5;
      for (let i = 0; i < N; i++) score.increment();
      const base = score.value;
      score.increment();
      score.increment();
      score.increment();
      expect(score.value).toBe(base + SCORE_PER_FOOD * 3);
    });
  });

  describe('reset', () => {
    it('점수를 0으로 초기화한다', () => {
      score.increment();
      score.increment();
      score.reset();
      expect(score.value).toBe(0);
    });
  });
});
