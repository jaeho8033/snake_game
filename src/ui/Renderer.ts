import { Game } from '../game/Game';
import { CELL_SIZE, GRID_WIDTH, GRID_HEIGHT } from '../config/constants';

/** 색상 팔레트 */
const COLOR_BG = '#1a1a2e';
const COLOR_GRID = '#16213e';
const COLOR_SNAKE_HEAD = '#4ecca3';
const COLOR_SNAKE_BODY = '#3a9b7e';
const COLOR_FOOD = '#e94560';
/** 장애물 색상 — 강철 회색 계열로 위협감 표현 */
const COLOR_OBSTACLE = '#7f8c8d';
const COLOR_OBSTACLE_BORDER = '#566573';
const COLOR_TEXT = '#e0e0e0';
const COLOR_GAMEOVER = 'rgba(0,0,0,0.6)';

/**
 * Game 상태를 Canvas에 렌더링한다.
 * Canvas 2D 컨텍스트는 생성자를 통해 주입받아 테스트 시 목(mock)으로 대체 가능하다.
 */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private game: Game;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(ctx: CanvasRenderingContext2D, game: Game) {
    this.ctx = ctx;
    this.game = game;
    this.canvasWidth = GRID_WIDTH * CELL_SIZE;
    this.canvasHeight = GRID_HEIGHT * CELL_SIZE;
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
    this.ctx.fillStyle = COLOR_BG;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 그리드 선 (선택적)
    this.ctx.fillStyle = COLOR_GRID;
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
      this.ctx.fillStyle = COLOR_OBSTACLE;
      this.ctx.fillRect(
        obs.x * CELL_SIZE,
        obs.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE,
      );
      // 테두리로 입체감 표현
      this.ctx.fillStyle = COLOR_OBSTACLE_BORDER;
      this.ctx.fillRect(obs.x * CELL_SIZE + 1, obs.y * CELL_SIZE + 1, 2, CELL_SIZE - 2);
      this.ctx.fillRect(obs.x * CELL_SIZE + 1, obs.y * CELL_SIZE + 1, CELL_SIZE - 2, 2);
    }
  }

  /** 음식을 그린다 */
  private drawFood(): void {
    const fp = this.game.food.position;
    if (fp === null) return;
    this.ctx.fillStyle = COLOR_FOOD;
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
      this.ctx.fillStyle = idx === 0 ? COLOR_SNAKE_HEAD : COLOR_SNAKE_BODY;
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
    this.ctx.fillStyle = COLOR_TEXT;
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`SCORE: ${this.game.score}`, 6, 18);
  }

  /** 게임 오버 오버레이를 그린다 */
  private drawGameOver(): void {
    this.ctx.fillStyle = COLOR_GAMEOVER;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.ctx.fillStyle = COLOR_TEXT;
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
    this.ctx.fillStyle = COLOR_GAMEOVER;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.ctx.fillStyle = COLOR_TEXT;
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
