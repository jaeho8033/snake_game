import { Game } from '../game/Game';
import { DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT } from '../game/types';

/**
 * 키보드 이벤트를 방향 의도로 변환하여 Game에 전달한다.
 * Arrow keys 및 WASD를 지원한다.
 *
 * @MX:NOTE: [AUTO] 입력 버퍼링 전략 — 키 이벤트마다 즉시 Game.setDirection()을 호출한다.
 * @MX:REASON: Game.setDirection()이 Snake.setDirection()을 통해 180도 반전을 거부하므로
 *             InputHandler는 별도 버퍼 없이 마지막 유효 입력만 남긴다(EC-3).
 */
export class InputHandler {
  private game: Game;
  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor(game: Game) {
    this.game = game;
    this.boundKeyDown = this.onKeyDown.bind(this);
  }

  /** 키보드 이벤트 리스너를 등록한다 */
  register(): void {
    window.addEventListener('keydown', this.boundKeyDown);
  }

  /** 키보드 이벤트 리스너를 해제한다 */
  unregister(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
  }

  private onKeyDown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        if (this.game.status === 'ready') {
          this.game.start();
        }
        this.game.setDirection(DIR_UP);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        if (this.game.status === 'ready') {
          this.game.start();
        }
        this.game.setDirection(DIR_DOWN);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        if (this.game.status === 'ready') {
          this.game.start();
        }
        this.game.setDirection(DIR_LEFT);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        if (this.game.status === 'ready') {
          this.game.start();
        }
        this.game.setDirection(DIR_RIGHT);
        break;
      case 'r':
      case 'R':
        if (this.game.status === 'gameover') {
          this.game.restart();
        }
        break;
    }
  }
}
