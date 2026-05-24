import { Game } from './game/Game';
import { Renderer } from './ui/Renderer';
import { InputHandler } from './ui/InputHandler';
import { DifficultyPanel } from './ui/DifficultyPanel';
import { ThemeManager } from './ui/themes/themes';
import { CELL_SIZE, GRID_WIDTH, GRID_HEIGHT } from './config/constants';
import { OBSTACLE_CELLS } from './config/difficulty';

// Canvas 초기화
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
canvas.width = GRID_WIDTH * CELL_SIZE;
canvas.height = GRID_HEIGHT * CELL_SIZE;

const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('Canvas 2D context 를 가져올 수 없습니다');

// 점수 표시 DOM 요소
const scoreEl = document.getElementById('score-value');

// 장애물 모드 활성화 여부 결정 (URL 파라미터 ?obstacles=true 또는 기본 활성)
const urlParams = new URLSearchParams(window.location.search);
const obstacleMode = urlParams.get('obstacles') !== 'false';
const obstacles = obstacleMode ? OBSTACLE_CELLS : [];

// 게임 인스턴스 생성 (장애물 포함)
const game = new Game(Math.random, { obstacles });
const renderer = new Renderer(ctx, game);
const input = new InputHandler(game);
input.register();

// 난이도 패널 마운트 (DOM 요소가 있을 때만)
const diffPanel = new DifficultyPanel(game, 'difficulty-panel');
diffPanel.mount();

// 테마 전환 버튼 연결 (DOM 요소가 있을 때만)
// 버튼 id: "theme-dark", "theme-light"
const themeDarkBtn = document.getElementById('theme-dark');
const themeLightBtn = document.getElementById('theme-light');

if (themeDarkBtn) {
  themeDarkBtn.addEventListener('click', () => {
    ThemeManager.setTheme('dark');
    renderer.setPalette(ThemeManager.getActivePalette());
  });
}

if (themeLightBtn) {
  themeLightBtn.addEventListener('click', () => {
    ThemeManager.setTheme('light');
    renderer.setPalette(ThemeManager.getActivePalette());
  });
}

// requestAnimationFrame 기반 고정 틱 루프
// game.tickInterval을 매 프레임 읽어 동적 난이도 변경을 반영한다
let lastTime = 0;
let accumulator = 0;

function loop(timestamp: number): void {
  const dt = timestamp - lastTime;
  lastTime = timestamp;
  accumulator += dt;

  // game.tickInterval을 매 프레임 조회 — 난이도 변경 시 즉시 반영
  while (accumulator >= game.tickInterval) {
    game.tick();
    accumulator -= game.tickInterval;
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
