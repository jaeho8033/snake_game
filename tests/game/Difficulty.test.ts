import { describe, it, expect } from 'vitest';
import { Game } from '../../src/game/Game';
import { DIFFICULTY_PROFILES } from '../../src/config/difficulty';
import { TICK_MS } from '../../src/config/constants';
import { DIR_RIGHT } from '../../src/game/types';

// 난이도 시스템 단위 테스트
// AC-DIFF-1: ready 상태에서 HIGH 설정 후 start() → tickInterval == HIGH 프로필 값
// AC-DIFF-2: playing 중 LOW 변경 → active 유지, restart() 후 LOW 적용
// AC-DIFF-3: playing 중 10틱 진행 → tickInterval 변화 없음

/** 결정론적 테스트용 고정 rng */
const fixedRng = () => 0;

describe('난이도(Difficulty) 시스템', () => {
  describe('AC-DIFF-1: ready 상태에서 난이도 변경 후 start()', () => {
    it('ready 상태에서 setDifficulty("HIGH") 후 start() → tickInterval이 HIGH 프로필 값과 같다', () => {
      // Arrange
      const game = new Game(fixedRng);
      expect(game.status).toBe('ready');

      // Act
      game.setDifficulty('HIGH');
      game.start();

      // Assert
      expect(game.tickInterval).toBe(DIFFICULTY_PROFILES.HIGH.tickInterval);
    });

    it('ready 상태에서 setDifficulty("LOW") 후 start() → tickInterval이 LOW 프로필 값과 같다', () => {
      const game = new Game(fixedRng);
      game.setDifficulty('LOW');
      game.start();
      expect(game.tickInterval).toBe(DIFFICULTY_PROFILES.LOW.tickInterval);
    });
  });

  describe('AC-DIFF-2: playing 중 난이도 변경 → active 틱 유지, restart() 후 적용', () => {
    it('playing 중 setDifficulty("LOW") → active tickInterval은 여전히 MEDIUM', () => {
      // Arrange: MEDIUM으로 시작
      const game = new Game(fixedRng);
      game.start();
      const mediumInterval = DIFFICULTY_PROFILES.MEDIUM.tickInterval;

      // 초기 tickInterval은 MEDIUM이어야 함
      expect(game.tickInterval).toBe(mediumInterval);

      // Act: playing 중 LOW로 변경
      game.setDifficulty('LOW');

      // Assert: active는 여전히 MEDIUM (pending에만 저장됨)
      expect(game.tickInterval).toBe(mediumInterval);
    });

    it('playing 중 LOW로 변경 후 restart() → tickInterval이 LOW로 전환된다', () => {
      // Arrange
      const game = new Game(fixedRng);
      game.start();

      // Act
      game.setDifficulty('LOW');
      game.restart();

      // Assert: restart() 후 pending이 active로 승격됨
      expect(game.tickInterval).toBe(DIFFICULTY_PROFILES.LOW.tickInterval);
    });

    it('gameover 상태에서 setDifficulty("HIGH") 후 restart() → tickInterval이 HIGH로 전환된다', () => {
      // Arrange: 벽 충돌로 gameover 유도
      const game = new Game(fixedRng, {
        headX: 19,
        headY: 5,
        length: 2,
        direction: DIR_RIGHT,
      });
      game.start();
      game.tick(); // 벽 충돌 → gameover
      expect(game.status).toBe('gameover');

      // Act
      game.setDifficulty('HIGH');
      game.restart();

      // Assert
      expect(game.tickInterval).toBe(DIFFICULTY_PROFILES.HIGH.tickInterval);
    });
  });

  describe('AC-DIFF-3: playing 중 난이도 변경 없으면 tickInterval 일정 유지', () => {
    it('playing 상태에서 10틱 진행 후 tickInterval이 초기 MEDIUM 값 그대로다', () => {
      // Arrange
      const game = new Game(fixedRng);
      game.start();
      const initialInterval = game.tickInterval;

      // Act: 10틱 진행
      for (let i = 0; i < 10; i++) {
        if (game.status === 'playing') {
          game.tick();
        }
      }

      // Assert: tickInterval 변화 없음
      expect(game.tickInterval).toBe(initialInterval);
      expect(game.tickInterval).toBe(DIFFICULTY_PROFILES.MEDIUM.tickInterval);
    });
  });

  describe('기본값 및 프로필 검증', () => {
    it('Game 기본 tickInterval은 MEDIUM 프로필 값이다', () => {
      const game = new Game(fixedRng);
      expect(game.tickInterval).toBe(DIFFICULTY_PROFILES.MEDIUM.tickInterval);
    });

    it('MEDIUM 프로필 tickInterval은 TICK_MS(150)와 동일하다', () => {
      // MEDIUM은 기존 게임 속도와 동일해야 함
      expect(DIFFICULTY_PROFILES.MEDIUM.tickInterval).toBe(TICK_MS);
    });

    it('HIGH는 MEDIUM보다 빠르고(작고), LOW는 MEDIUM보다 느리다(크다)', () => {
      expect(DIFFICULTY_PROFILES.HIGH.tickInterval).toBeLessThan(
        DIFFICULTY_PROFILES.MEDIUM.tickInterval,
      );
      expect(DIFFICULTY_PROFILES.LOW.tickInterval).toBeGreaterThan(
        DIFFICULTY_PROFILES.MEDIUM.tickInterval,
      );
    });
  });
});
