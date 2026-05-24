import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Renderer } from '../../src/ui/Renderer';
import { Game } from '../../src/game/Game';
import { DIR_RIGHT } from '../../src/game/types';

// AC-RENDER-1: 매 틱 렌더링 스모크 체크 — 모의 Canvas 2D 컨텍스트 주입

/** 모의 CanvasRenderingContext2D 생성 */
function createMockContext(): CanvasRenderingContext2D {
  return {
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
    fillStyle: '',
    strokeStyle: '',
    font: '',
    textAlign: '' as CanvasTextAlign,
    textBaseline: '' as CanvasTextBaseline,
    lineWidth: 1,
  } as unknown as CanvasRenderingContext2D;
}

describe('Renderer (AC-RENDER-1)', () => {
  let ctx: CanvasRenderingContext2D;
  let game: Game;
  let renderer: Renderer;

  beforeEach(() => {
    ctx = createMockContext();
    game = new Game(() => 0);
    game.start();
    renderer = new Renderer(ctx, game);
  });

  it('render() 호출 시 fillRect가 최소 1회 이상 호출된다 (게임판 배경)', () => {
    renderer.render();
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('render() 호출 시 뱀 세그먼트를 그린다 (fillRect 여러 번 호출)', () => {
    renderer.render();
    // 게임판 배경 + 뱀 세그먼트 + 음식 = fillRect 다수 호출
    const callCount = (ctx.fillRect as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(callCount).toBeGreaterThan(1);
  });

  it('render() 호출 시 점수 텍스트를 그린다 (fillText 호출)', () => {
    renderer.render();
    expect(ctx.fillText).toHaveBeenCalled();
  });

  it('틱 후 render() 호출 시 상태가 반영된다', () => {
    game.tick();
    renderer.render();
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('gameover 상태에서도 render()가 크래시 없이 동작한다', () => {
    // 실제 벽 충돌로 gameover 유도
    const goGame = new Game(() => 0, {
      headX: 19,
      headY: 5,
      length: 2,
      direction: DIR_RIGHT,
      foodPosition: { x: 0, y: 0 },
    });
    goGame.start();
    goGame.tick(); // 우측 벽 충돌 → gameover
    const goRenderer = new Renderer(ctx, goGame);
    expect(() => goRenderer.render()).not.toThrow();
    // gameover 오버레이도 그려진다 (fillText 호출)
    expect(ctx.fillText).toHaveBeenCalled();
  });

  describe('ready 상태 렌더링 (AC-RENDER-1: drawReady 커버리지)', () => {
    it('ready 상태에서 render() 호출 시 fillRect와 fillText가 호출된다', () => {
      // start()를 호출하지 않아 ready 상태 유지
      const readyGame = new Game(() => 0);
      const readyCtx = createMockContext();
      const readyRenderer = new Renderer(readyCtx, readyGame);

      expect(readyGame.status).toBe('ready');

      readyRenderer.render();

      // 배경 그리기
      expect(readyCtx.fillRect).toHaveBeenCalled();
      // ready 오버레이 텍스트 ("SNAKE" 등) 그리기
      expect(readyCtx.fillText).toHaveBeenCalled();
    });

    it('ready 상태에서 render()가 크래시 없이 동작한다', () => {
      const readyGame = new Game(() => 0);
      const readyCtx = createMockContext();
      const readyRenderer = new Renderer(readyCtx, readyGame);
      expect(() => readyRenderer.render()).not.toThrow();
    });
  });
});
