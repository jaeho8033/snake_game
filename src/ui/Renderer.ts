import { Game } from '../game/Game';
import { CELL_SIZE, GRID_WIDTH, GRID_HEIGHT } from '../config/constants';
import type { Palette } from './themes/themes';
import { darkPalette } from './themes/dark';

/**
 * Game 상태를 Canvas에 렌더링한다.
 * Canvas 2D 컨텍스트는 생성자를 통해 주입받아 테스트 시 목(mock)으로 대체 가능하다.
 *
 * 팔레트(색상 테마)도 생성자를 통해 주입 가능하며, setPalette()로 런타임 전환된다.
 * 테마 코드는 게임 상태를 읽거나 변경하지 않는다 — 렌더링 전용.
 *
 * @MX:ANCHOR: [AUTO] Renderer.setPalette — 테마 전환의 렌더러 측 진입점
 * @MX:REASON: main.ts의 테마 버튼 핸들러, ThemeManager, 테스트가 모두 이 메서드를 호출한다.
 *             팔레트 교체는 다음 render() 호출 시 즉시 반영된다.
 */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private game: Game;
  private canvasWidth: number;
  private canvasHeight: number;
  /** 현재 활성 팔레트 — 기본값은 dark */
  private palette: Palette;

  constructor(ctx: CanvasRenderingContext2D, game: Game, palette?: Palette) {
    this.ctx = ctx;
    this.game = game;
    this.canvasWidth = GRID_WIDTH * CELL_SIZE;
    this.canvasHeight = GRID_HEIGHT * CELL_SIZE;
    // 팔레트 미지정 시 dark 팔레트를 기본값으로 사용한다
    this.palette = palette ?? darkPalette;
  }

  /**
   * 활성 팔레트를 교체한다.
   * 다음 render() 호출 시 새 팔레트가 적용된다.
   * 게임 상태(snake, food, score)는 변경되지 않는다.
   */
  setPalette(palette: Palette): void {
    this.palette = palette;
  }

  /** 한 프레임을 렌더링한다 */
  render(): void {
    this.drawBackground();
    this.drawObstacles();
    this.drawFood();
    this.drawSnake();
    this.drawScore();
    if (this.game.status === 'gameover') {
      this.drawGameOver();
    }
    if (this.game.status === 'ready') {
      this.drawReady();
    }
  }

  /** 게임판 배경을 그린다 */
  private drawBackground(): void {
    this.ctx.fillStyle = this.palette.bg;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 그리드 선 (선택적)
    this.ctx.fillStyle = this.palette.grid;
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if ((x + y) % 2 === 1) {
          this.ctx.fillRect(
            x * CELL_SIZE,
            y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE,
          );
        }
      }
    }
  }

  /** 장애물 셀을 그린다 (뱀/음식과 구별되는 색상) */
  private drawObstacles(): void {
    for (const obs of this.game.obstacles) {
      // 배경 채우기
      this.ctx.fillStyle = this.palette.obstacle;
      this.ctx.fillRect(
        obs.x * CELL_SIZE,
        obs.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE,
      );
      // 테두리로 입체감 표현
      this.ctx.fillStyle = this.palette.obstacleBorder;
      this.ctx.fillRect(obs.x * CELL_SIZE + 1, obs.y * CELL_SIZE + 1, 2, CELL_SIZE - 2);
      this.ctx.fillRect(obs.x * CELL_SIZE + 1, obs.y * CELL_SIZE + 1, CELL_SIZE - 2, 2);
    }
  }

  /** 음식을 그린다 */
  private drawFood(): void {
    const fp = this.game.food.position;
    if (fp === null) return;
    this.ctx.fillStyle = this.palette.food;
    this.ctx.fillRect(
      fp.x * CELL_SIZE + 2,
      fp.y * CELL_SIZE + 2,
      CELL_SIZE - 4,
      CELL_SIZE - 4,
    );
  }

  /** 뱀을 그린다 */
  private drawSnake(): void {
    const segments = this.game.snake.occupied();
    segments.forEach((seg, idx) => {
      this.ctx.fillStyle = idx === 0 ? this.palette.snakeHead : this.palette.snakeBody;
      this.ctx.fillRect(
        seg.x * CELL_SIZE + 1,
        seg.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2,
      );
    });
  }

  /** 점수를 Canvas 위에 텍스트로 그린다 */
  private drawScore(): void {
    this.ctx.fillStyle = this.palette.text;
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`SCORE: ${this.game.score}`, 6, 18);
  }

  /** 게임 오버 오버레이를 그린다 */
  private drawGameOver(): void {
    this.ctx.fillStyle = this.palette.gameoverOverlay;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.ctx.fillStyle = this.palette.text;
    this.ctx.font = 'bold 28px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvasWidth / 2, this.canvasHeight / 2);
    this.ctx.font = '14px monospace';
    this.ctx.fillText(
      'Press R to restart',
      this.canvasWidth / 2,
      this.canvasHeight / 2 + 30,
    );
  }

  /** 시작 대기 오버레이를 그린다 */
  private drawReady(): void {
    this.ctx.fillStyle = this.palette.gameoverOverlay;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.ctx.fillStyle = this.palette.text;
    this.ctx.font = 'bold 24px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('SNAKE', this.canvasWidth / 2, this.canvasHeight / 2 - 20);
    this.ctx.font = '14px monospace';
    this.ctx.fillText(
      'Arrow keys / WASD to start',
      this.canvasWidth / 2,
      this.canvasHeight / 2 + 10,
    );
  }
}
