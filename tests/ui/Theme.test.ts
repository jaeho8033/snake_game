import { describe, it, expect, beforeEach } from 'vitest';
import { vi } from 'vitest';
import { Renderer } from '../../src/ui/Renderer';
import { Game } from '../../src/game/Game';
import { ThemeManager, getTheme } from '../../src/ui/themes/themes';
import { darkPalette } from '../../src/ui/themes/dark';
import { lightPalette } from '../../src/ui/themes/light';
import type { Palette } from '../../src/ui/themes/themes';

// 모의 CanvasRenderingContext2D — fillStyle 할당 기록 추적
function createTrackingContext(): CanvasRenderingContext2D & { fillStyleHistory: string[] } {
  const history: string[] = [];
  const ctx = {
    fillStyleHistory: history,
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),
    canvas: { width: 480, height: 480 } as HTMLCanvasElement,
    // fillStyle을 setter로 구현해 히스토리 기록
    _fillStyle: '',
    strokeStyle: '',
    font: '',
    textAlign: '' as CanvasTextAlign,
    textBaseline: '' as CanvasTextBaseline,
    lineWidth: 1,
  };

  Object.defineProperty(ctx, 'fillStyle', {
    get() { return ctx._fillStyle; },
    set(v: string) {
      ctx._fillStyle = v;
      history.push(v);
    },
    configurable: true,
  });

  return ctx as unknown as CanvasRenderingContext2D & { fillStyleHistory: string[] };
}

// ─────────────────────────────────────────────────────────────
// AC-THEME-1: 팔레트 적용 검증
// ─────────────────────────────────────────────────────────────
describe('AC-THEME-1 — 팔레트 적용 검증', () => {
  it('dark 팔레트(기본값)로 render() 호출 시 bg 색상이 기록된다', () => {
    const ctx = createTrackingContext();
    const game = new Game(() => 0);
    game.start();
    const renderer = new Renderer(ctx, game);

    renderer.render();

    expect(ctx.fillStyleHistory).toContain(darkPalette.bg);
  });

  it('dark 팔레트로 render() 호출 시 snakeHead 색상이 기록된다', () => {
    const ctx = createTrackingContext();
    const game = new Game(() => 0);
    game.start();
    const renderer = new Renderer(ctx, game);

    renderer.render();

    expect(ctx.fillStyleHistory).toContain(darkPalette.snakeHead);
  });

  it('dark 팔레트로 render() 호출 시 food 색상이 기록된다', () => {
    const ctx = createTrackingContext();
    const game = new Game(() => 0);
    game.start();
    const renderer = new Renderer(ctx, game);

    renderer.render();

    expect(ctx.fillStyleHistory).toContain(darkPalette.food);
  });

  it('setPalette(lightPalette) 후 render() 호출 시 light bg 색상이 기록된다', () => {
    const ctx = createTrackingContext();
    const game = new Game(() => 0);
    game.start();
    const renderer = new Renderer(ctx, game);

    renderer.setPalette(lightPalette);
    renderer.render();

    expect(ctx.fillStyleHistory).toContain(lightPalette.bg);
  });

  it('setPalette(lightPalette) 후 render() 호출 시 dark bg 색상은 기록되지 않는다', () => {
    const ctx = createTrackingContext();
    const game = new Game(() => 0);
    game.start();
    const renderer = new Renderer(ctx, game);

    renderer.setPalette(lightPalette);
    renderer.render();

    expect(ctx.fillStyleHistory).not.toContain(darkPalette.bg);
  });

  it('setPalette(lightPalette) 후 render() 시 light snakeHead 색상이 기록된다', () => {
    const ctx = createTrackingContext();
    const game = new Game(() => 0);
    game.start();
    const renderer = new Renderer(ctx, game);

    renderer.setPalette(lightPalette);
    renderer.render();

    expect(ctx.fillStyleHistory).toContain(lightPalette.snakeHead);
  });

  it('장애물이 있을 때 dark 팔레트의 obstacle 색상이 기록된다', () => {
    const ctx = createTrackingContext();
    const game = new Game(() => 0, { obstacles: [{ x: 5, y: 5 }] });
    game.start();
    const renderer = new Renderer(ctx, game);

    renderer.render();

    expect(ctx.fillStyleHistory).toContain(darkPalette.obstacle);
  });

  it('장애물이 있을 때 setPalette(lightPalette) 후 light obstacle 색상이 기록된다', () => {
    const ctx = createTrackingContext();
    const game = new Game(() => 0, { obstacles: [{ x: 5, y: 5 }] });
    game.start();
    const renderer = new Renderer(ctx, game);

    renderer.setPalette(lightPalette);
    renderer.render();

    expect(ctx.fillStyleHistory).toContain(lightPalette.obstacle);
  });

  it('장애물이 없을 때는 obstacle 색상이 기록되지 않는다', () => {
    const ctx = createTrackingContext();
    // obstacles 없이 생성
    const game = new Game(() => 0);
    game.start();
    const renderer = new Renderer(ctx, game);

    renderer.render();

    // 장애물 없으면 obstacle 색상이 fillStyle에 할당되지 않는다
    expect(ctx.fillStyleHistory).not.toContain(darkPalette.obstacle);
  });

  it('생성자에 팔레트를 직접 주입하면 해당 팔레트의 bg 색상이 기록된다', () => {
    const ctx = createTrackingContext();
    const game = new Game(() => 0);
    game.start();
    const renderer = new Renderer(ctx, game, lightPalette);

    renderer.render();

    expect(ctx.fillStyleHistory).toContain(lightPalette.bg);
  });

  it('팔레트 미지정 시 기본 팔레트는 dark이다', () => {
    const ctx = createTrackingContext();
    const game = new Game(() => 0);
    game.start();
    const renderer = new Renderer(ctx, game);

    renderer.render();

    // dark.bg가 기록되어 있으면 dark 팔레트가 기본값임을 확인
    expect(ctx.fillStyleHistory).toContain(darkPalette.bg);
    expect(ctx.fillStyleHistory).not.toContain(lightPalette.bg);
  });
});

// ─────────────────────────────────────────────────────────────
// AC-THEME-2: 로직 불변성 검증 (MANDATORY)
// ─────────────────────────────────────────────────────────────
describe('AC-THEME-2 — 테마 전환이 게임 로직을 변경하지 않는다 (MANDATORY)', () => {
  it('테마 전환 전후로 뱀 세그먼트가 동일하다', () => {
    const ctx = createTrackingContext();
    const game = new Game(() => 0, {
      headX: 5,
      headY: 5,
      length: 3,
      foodPosition: { x: 10, y: 10 },
    });
    game.start();
    const renderer = new Renderer(ctx, game);

    // 게임 상태 스냅샷 (테마 전환 전)
    const segmentsBefore = game.snake.occupied().map(p => ({ ...p }));
    const foodBefore = { ...game.food.position! };
    const scoreBefore = game.score;
    const statusBefore = game.status;

    // 테마 전환: light → dark → light
    renderer.setPalette(lightPalette);
    renderer.setPalette(darkPalette);
    renderer.setPalette(lightPalette);

    // 게임 상태 스냅샷 (테마 전환 후)
    const segmentsAfter = game.snake.occupied().map(p => ({ ...p }));
    const foodAfter = { ...game.food.position! };
    const scoreAfter = game.score;
    const statusAfter = game.status;

    // 뱀 세그먼트 동일 검증
    expect(segmentsAfter).toEqual(segmentsBefore);
    // 음식 위치 동일 검증
    expect(foodAfter).toEqual(foodBefore);
    // 점수 동일 검증
    expect(scoreAfter).toBe(scoreBefore);
    // 상태 동일 검증
    expect(statusAfter).toBe(statusBefore);
  });

  it('ThemeManager.setTheme 전환 전후로 게임 상태가 동일하다', () => {
    const ctx = createTrackingContext();
    const game = new Game(() => 0, {
      headX: 3,
      headY: 3,
      length: 2,
      foodPosition: { x: 8, y: 8 },
    });
    game.start();

    const segmentsBefore = game.snake.occupied().map(p => ({ ...p }));
    const foodBefore = { ...game.food.position! };
    const scoreBefore = game.score;
    const statusBefore = game.status;

    // ThemeManager를 통한 테마 전환
    ThemeManager.setTheme('light');
    ThemeManager.setTheme('dark');
    ThemeManager.setTheme('light');

    const segmentsAfter = game.snake.occupied().map(p => ({ ...p }));
    const foodAfter = { ...game.food.position! };
    const scoreAfter = game.score;
    const statusAfter = game.status;

    expect(segmentsAfter).toEqual(segmentsBefore);
    expect(foodAfter).toEqual(foodBefore);
    expect(scoreAfter).toBe(scoreBefore);
    expect(statusAfter).toBe(statusBefore);
  });

  it('테마 전환 중 render()를 호출해도 게임 상태가 변하지 않는다', () => {
    const ctx = createTrackingContext();
    const game = new Game(() => 0, {
      headX: 7,
      headY: 7,
      length: 4,
      foodPosition: { x: 2, y: 2 },
    });
    game.start();
    const renderer = new Renderer(ctx, game);

    const segmentsBefore = game.snake.occupied().map(p => ({ ...p }));

    renderer.setPalette(lightPalette);
    renderer.render();
    renderer.setPalette(darkPalette);
    renderer.render();

    const segmentsAfter = game.snake.occupied().map(p => ({ ...p }));

    expect(segmentsAfter).toEqual(segmentsBefore);
    expect(game.score).toBe(0);
    expect(game.status).toBe('playing');
  });
});

// ─────────────────────────────────────────────────────────────
// ThemeManager API 검증
// ─────────────────────────────────────────────────────────────
describe('ThemeManager — API 검증', () => {
  beforeEach(() => {
    // 각 테스트 전 dark로 리셋
    ThemeManager.setTheme('dark');
  });

  it('기본 테마는 dark이다', () => {
    ThemeManager.setTheme('dark');
    expect(ThemeManager.getCurrentTheme()).toBe('dark');
  });

  it('setTheme("light") 후 getCurrentTheme()은 "light"를 반환한다', () => {
    ThemeManager.setTheme('light');
    expect(ThemeManager.getCurrentTheme()).toBe('light');
  });

  it('setTheme("dark") 후 getActivePalette()는 dark 팔레트를 반환한다', () => {
    ThemeManager.setTheme('dark');
    const palette = ThemeManager.getActivePalette();
    expect(palette).toEqual(darkPalette);
  });

  it('setTheme("light") 후 getActivePalette()는 light 팔레트를 반환한다', () => {
    ThemeManager.setTheme('light');
    const palette = ThemeManager.getActivePalette();
    expect(palette).toEqual(lightPalette);
  });

  it('getTheme("dark")는 dark 팔레트의 9개 색상 키를 모두 가진다', () => {
    const palette = getTheme('dark');
    const requiredKeys: (keyof Palette)[] = [
      'bg', 'grid', 'snakeHead', 'snakeBody', 'food',
      'obstacle', 'obstacleBorder', 'text', 'gameoverOverlay',
    ];
    for (const key of requiredKeys) {
      expect(palette).toHaveProperty(key);
    }
  });

  it('getTheme("light")는 light 팔레트의 9개 색상 키를 모두 가진다', () => {
    const palette = getTheme('light');
    const requiredKeys: (keyof Palette)[] = [
      'bg', 'grid', 'snakeHead', 'snakeBody', 'food',
      'obstacle', 'obstacleBorder', 'text', 'gameoverOverlay',
    ];
    for (const key of requiredKeys) {
      expect(palette).toHaveProperty(key);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// dark 팔레트 값 검증 — 기존 하드코딩 값과 동일해야 한다
// ─────────────────────────────────────────────────────────────
describe('dark 팔레트 — 기존 하드코딩 색상과 정확히 일치', () => {
  it('bg는 #1a1a2e이다', () => {
    expect(darkPalette.bg).toBe('#1a1a2e');
  });

  it('grid는 #16213e이다', () => {
    expect(darkPalette.grid).toBe('#16213e');
  });

  it('snakeHead는 #4ecca3이다', () => {
    expect(darkPalette.snakeHead).toBe('#4ecca3');
  });

  it('snakeBody는 #3a9b7e이다', () => {
    expect(darkPalette.snakeBody).toBe('#3a9b7e');
  });

  it('food는 #e94560이다', () => {
    expect(darkPalette.food).toBe('#e94560');
  });

  it('obstacle은 #7f8c8d이다', () => {
    expect(darkPalette.obstacle).toBe('#7f8c8d');
  });

  it('obstacleBorder는 #566573이다', () => {
    expect(darkPalette.obstacleBorder).toBe('#566573');
  });

  it('text는 #e0e0e0이다', () => {
    expect(darkPalette.text).toBe('#e0e0e0');
  });

  it('gameoverOverlay는 rgba(0,0,0,0.6)이다', () => {
    expect(darkPalette.gameoverOverlay).toBe('rgba(0,0,0,0.6)');
  });
});
