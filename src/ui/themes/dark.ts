import type { Palette } from './themes';

/**
 * 다크 팔레트 — Renderer.ts의 기존 하드코딩 상수 값을 그대로 보존한다.
 * 기본 테마이므로 시각적 회귀가 발생해서는 안 된다.
 *
 * @MX:NOTE: [AUTO] darkPalette — 기존 Renderer.ts 하드코딩 색상의 정규화된 원천
 *           이 값들은 기존 Renderer 테스트(tests/ui/Renderer.test.ts) 통과를 보장한다.
 */
export const darkPalette: Palette = {
  /** 게임판 배경 — 진한 남색 계열 */
  bg: '#1a1a2e',
  /** 체커보드 그리드 — 짙은 파란색 계열 */
  grid: '#16213e',
  /** 뱀 머리 — 민트 그린 */
  snakeHead: '#4ecca3',
  /** 뱀 몸통 — 어두운 민트 그린 */
  snakeBody: '#3a9b7e',
  /** 음식 — 산호 빨간색 */
  food: '#e94560',
  /** 장애물 — 강철 회색 (위협감) */
  obstacle: '#7f8c8d',
  /** 장애물 테두리 — 어두운 회색 (입체감) */
  obstacleBorder: '#566573',
  /** 텍스트 — 밝은 회색 */
  text: '#e0e0e0',
  /** 게임오버/대기 오버레이 — 반투명 검정 */
  gameoverOverlay: 'rgba(0,0,0,0.6)',
};
