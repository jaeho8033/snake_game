import { Game } from './game/Game';
import { Renderer } from './ui/Renderer';
import { InputHandler } from './ui/InputHandler';
import { CELL_SIZE, GRID_WIDTH, GRID_HEIGHT, TICK_MS } from './config/constants';

// Canvas 초기화
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
canvas.width = GRID_WIDTH * CELL_SIZE;
canvas.height = GRID_HEIGHT * CELL_SIZE;

const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('Canvas 2D context 를 가져올 수 없습니다');

// 점수 표시 DOM 요소
const scoreEl = document.getElementById('score-value');

// 게임 인스턴스 생성
const game = new Game(Math.random);
const renderer = new Renderer(ctx, game);
const input = new InputHandler(game);
input.register();

// requestAnimationFrame 기반 고정 틱 루프
let lastTime = 0;
let accumulator = 0;

function loop(timestamp: number): void {
  const dt = timestamp - lastTime;
  lastTime = timestamp;
  accumulator += dt;

  // 고정 틱 주기마다 game.tick() 호출
  while (accumulator >= TICK_MS) {
    game.tick();
    accumulator -= TICK_MS;
  }

  // 매 프레임 렌더링
  renderer.render();

  // 점수 DOM 업데이트
  if (scoreEl) {
    scoreEl.textContent = String(game.score);
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
