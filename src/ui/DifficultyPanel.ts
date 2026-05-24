import { Game } from '../game/Game';
import { DifficultyLevel } from '../config/difficulty';

/**
 * 난이도 선택 UI 패널.
 * 순수 DOM 관심사만 담당하며 Game 인스턴스에 setDifficulty()를 위임한다.
 * Game 로직(tick 속도 계산 등)을 포함하지 않는다.
 *
 * @MX:NOTE: [AUTO] DifficultyPanel — DOM과 Game 로직의 경계 분리
 */
export class DifficultyPanel {
  private game: Game;
  private container: HTMLElement | null;

  constructor(game: Game, containerId: string) {
    this.game = game;
    this.container = document.getElementById(containerId);
  }

  /**
   * 난이도 버튼을 DOM에 렌더링하고 이벤트를 등록한다.
   * 버튼 클릭 시 game.setDifficulty()를 호출한다.
   */
  mount(): void {
    if (!this.container) return;

    const levels: Array<{ level: DifficultyLevel; label: string }> = [
      { level: 'LOW', label: '느림' },
      { level: 'MEDIUM', label: '보통' },
      { level: 'HIGH', label: '빠름' },
    ];

    this.container.innerHTML = '';

    for (const { level, label } of levels) {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.dataset['difficulty'] = level;
      btn.addEventListener('click', () => {
        this.game.setDifficulty(level);
        this.updateActiveButton(level);
      });
      this.container.appendChild(btn);
    }

    // 기본 활성 버튼: MEDIUM
    this.updateActiveButton('MEDIUM');
  }

  /** 현재 선택된 난이도 버튼에 active 클래스를 표시한다 */
  private updateActiveButton(activeLevel: DifficultyLevel): void {
    if (!this.container) return;
    const buttons = this.container.querySelectorAll('button');
    buttons.forEach((btn) => {
      const isActive = btn.dataset['difficulty'] === activeLevel;
      btn.classList.toggle('active', isActive);
    });
  }
}
