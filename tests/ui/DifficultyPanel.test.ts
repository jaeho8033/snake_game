import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DifficultyPanel } from '../../src/ui/DifficultyPanel';
import { Game } from '../../src/game/Game';
import { DIFFICULTY_PROFILES } from '../../src/config/difficulty';

// DifficultyPanel 단위 테스트
// jsdom 환경에서 DOM 렌더링, 클릭 이벤트, game.setDifficulty() 연동 검증

/** 결정론적 rng */
const fixedRng = () => 0;

/** 테스트용 컨테이너 DOM을 생성하고 document.body에 붙인다 */
function createContainer(id: string): HTMLElement {
  const div = document.createElement('div');
  div.id = id;
  document.body.appendChild(div);
  return div;
}

/** 테스트 후 컨테이너를 제거한다 */
function removeContainer(el: HTMLElement): void {
  document.body.removeChild(el);
}

describe('DifficultyPanel', () => {
  let game: Game;
  let container: HTMLElement;
  const CONTAINER_ID = 'test-difficulty-panel';

  beforeEach(() => {
    game = new Game(fixedRng);
    container = createContainer(CONTAINER_ID);
  });

  afterEach(() => {
    removeContainer(container);
  });

  describe('mount() — 버튼 렌더링', () => {
    it('mount() 후 컨테이너에 정확히 3개의 버튼이 생성된다', () => {
      // Arrange & Act
      const panel = new DifficultyPanel(game, CONTAINER_ID);
      panel.mount();

      // Assert
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(3);
    });

    it('LOW / MEDIUM / HIGH에 대응하는 버튼이 각각 존재한다', () => {
      const panel = new DifficultyPanel(game, CONTAINER_ID);
      panel.mount();

      const buttons = container.querySelectorAll('button');
      const levels = Array.from(buttons).map((btn) => btn.dataset['difficulty']);
      expect(levels).toContain('LOW');
      expect(levels).toContain('MEDIUM');
      expect(levels).toContain('HIGH');
    });

    it('mount() 후 기본 활성 버튼은 MEDIUM이다 (active 클래스)', () => {
      const panel = new DifficultyPanel(game, CONTAINER_ID);
      panel.mount();

      const mediumBtn = container.querySelector('[data-difficulty="MEDIUM"]') as HTMLButtonElement;
      const lowBtn = container.querySelector('[data-difficulty="LOW"]') as HTMLButtonElement;
      const highBtn = container.querySelector('[data-difficulty="HIGH"]') as HTMLButtonElement;

      expect(mediumBtn.classList.contains('active')).toBe(true);
      expect(lowBtn.classList.contains('active')).toBe(false);
      expect(highBtn.classList.contains('active')).toBe(false);
    });

    it('mount()를 여러 번 호출해도 버튼이 중복 생성되지 않는다', () => {
      const panel = new DifficultyPanel(game, CONTAINER_ID);
      panel.mount();
      panel.mount(); // 두 번째 mount

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(3); // 중복 없이 3개
    });

    it('존재하지 않는 containerId로 생성해도 크래시 없이 mount()가 무시된다', () => {
      const panel = new DifficultyPanel(game, 'non-existent-id');
      // 예외 없이 실행되어야 함
      expect(() => panel.mount()).not.toThrow();
    });
  });

  describe('버튼 클릭 — game.setDifficulty() 연동', () => {
    it('HIGH 버튼 클릭 시 ready 상태에서 game.tickInterval이 HIGH 값으로 바뀐다', () => {
      // Arrange
      const panel = new DifficultyPanel(game, CONTAINER_ID);
      panel.mount();
      expect(game.status).toBe('ready');

      // Act
      const highBtn = container.querySelector('[data-difficulty="HIGH"]') as HTMLButtonElement;
      highBtn.click();

      // Assert: ready 상태에서 setDifficulty('HIGH')는 즉시 active에 반영
      expect(game.tickInterval).toBe(DIFFICULTY_PROFILES.HIGH.tickInterval);
    });

    it('LOW 버튼 클릭 시 ready 상태에서 game.tickInterval이 LOW 값으로 바뀐다', () => {
      const panel = new DifficultyPanel(game, CONTAINER_ID);
      panel.mount();

      const lowBtn = container.querySelector('[data-difficulty="LOW"]') as HTMLButtonElement;
      lowBtn.click();

      expect(game.tickInterval).toBe(DIFFICULTY_PROFILES.LOW.tickInterval);
    });

    it('playing 중 LOW 버튼 클릭 → active tickInterval은 MEDIUM 유지 (pending에만 저장)', () => {
      // Arrange
      const panel = new DifficultyPanel(game, CONTAINER_ID);
      panel.mount();
      game.start(); // MEDIUM으로 playing 진입
      const mediumInterval = DIFFICULTY_PROFILES.MEDIUM.tickInterval;

      // Act
      const lowBtn = container.querySelector('[data-difficulty="LOW"]') as HTMLButtonElement;
      lowBtn.click();

      // Assert: playing 중이므로 active는 여전히 MEDIUM
      expect(game.tickInterval).toBe(mediumInterval);
    });

    it('playing 중 HIGH 버튼 클릭 후 restart() → tickInterval이 HIGH로 전환된다', () => {
      // Arrange
      const panel = new DifficultyPanel(game, CONTAINER_ID);
      panel.mount();
      game.start();

      // Act
      const highBtn = container.querySelector('[data-difficulty="HIGH"]') as HTMLButtonElement;
      highBtn.click();
      game.restart();

      // Assert: restart() 시 pending → active 승격
      expect(game.tickInterval).toBe(DIFFICULTY_PROFILES.HIGH.tickInterval);
    });

    it('setDifficulty가 spy를 통해 올바른 level 인자로 호출된다', () => {
      // Arrange
      const spy = vi.spyOn(game, 'setDifficulty');
      const panel = new DifficultyPanel(game, CONTAINER_ID);
      panel.mount();

      // Act: MEDIUM 버튼 클릭
      const mediumBtn = container.querySelector('[data-difficulty="MEDIUM"]') as HTMLButtonElement;
      mediumBtn.click();

      // Assert: setDifficulty('MEDIUM') 호출됨
      expect(spy).toHaveBeenCalledWith('MEDIUM');
      expect(spy).toHaveBeenCalledTimes(1);

      spy.mockRestore();
    });

    it('각 버튼 클릭 시 해당 level 인자로만 setDifficulty가 호출된다', () => {
      // Arrange
      const spy = vi.spyOn(game, 'setDifficulty');
      const panel = new DifficultyPanel(game, CONTAINER_ID);
      panel.mount();

      // Act: LOW, HIGH 순서로 클릭
      (container.querySelector('[data-difficulty="LOW"]') as HTMLButtonElement).click();
      (container.querySelector('[data-difficulty="HIGH"]') as HTMLButtonElement).click();

      // Assert
      expect(spy).toHaveBeenNthCalledWith(1, 'LOW');
      expect(spy).toHaveBeenNthCalledWith(2, 'HIGH');
      expect(spy).toHaveBeenCalledTimes(2);

      spy.mockRestore();
    });
  });

  describe('updateActiveButton — 활성 버튼 표시', () => {
    it('HIGH 버튼 클릭 후 HIGH만 active 클래스를 갖는다', () => {
      const panel = new DifficultyPanel(game, CONTAINER_ID);
      panel.mount();

      (container.querySelector('[data-difficulty="HIGH"]') as HTMLButtonElement).click();

      const highBtn = container.querySelector('[data-difficulty="HIGH"]') as HTMLButtonElement;
      const lowBtn = container.querySelector('[data-difficulty="LOW"]') as HTMLButtonElement;
      const mediumBtn = container.querySelector('[data-difficulty="MEDIUM"]') as HTMLButtonElement;

      expect(highBtn.classList.contains('active')).toBe(true);
      expect(lowBtn.classList.contains('active')).toBe(false);
      expect(mediumBtn.classList.contains('active')).toBe(false);
    });

    it('LOW 버튼 클릭 후 LOW만 active 클래스를 갖는다', () => {
      const panel = new DifficultyPanel(game, CONTAINER_ID);
      panel.mount();

      (container.querySelector('[data-difficulty="LOW"]') as HTMLButtonElement).click();

      const lowBtn = container.querySelector('[data-difficulty="LOW"]') as HTMLButtonElement;
      const mediumBtn = container.querySelector('[data-difficulty="MEDIUM"]') as HTMLButtonElement;

      expect(lowBtn.classList.contains('active')).toBe(true);
      expect(mediumBtn.classList.contains('active')).toBe(false);
    });

    it('버튼을 연속 클릭해도 active가 마지막 클릭한 버튼으로만 이동한다', () => {
      const panel = new DifficultyPanel(game, CONTAINER_ID);
      panel.mount();

      // HIGH → LOW → MEDIUM 순서로 클릭
      (container.querySelector('[data-difficulty="HIGH"]') as HTMLButtonElement).click();
      (container.querySelector('[data-difficulty="LOW"]') as HTMLButtonElement).click();
      (container.querySelector('[data-difficulty="MEDIUM"]') as HTMLButtonElement).click();

      const highBtn = container.querySelector('[data-difficulty="HIGH"]') as HTMLButtonElement;
      const lowBtn = container.querySelector('[data-difficulty="LOW"]') as HTMLButtonElement;
      const mediumBtn = container.querySelector('[data-difficulty="MEDIUM"]') as HTMLButtonElement;

      expect(mediumBtn.classList.contains('active')).toBe(true);
      expect(highBtn.classList.contains('active')).toBe(false);
      expect(lowBtn.classList.contains('active')).toBe(false);
    });
  });
});
