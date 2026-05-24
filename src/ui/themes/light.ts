import type { Palette } from './themes';

/**
 * 라이트 팔레트 — 밝은 배경에 읽기 쉬운 색상 조합.
 * dark 팔레트와 9가지 키가 동일하며 시인성(WCAG AA 기준)을 고려한다.
 *
 * @MX:NOTE: [AUTO] lightPalette — 다크 팔레트와 대칭되는 밝은 모드 팔레트
 *           배경/그리드는 밝게, 텍스트는 어둡게, 뱀/음식/장애물은 채도를 유지한다.
 */
export const lightPalette: Palette = {
  /** 게임판 배경 — 밝은 회백색 */
  bg: '#f0f0f0',
  /** 체커보드 그리드 — 연한 회색 */
  grid: '#dcdcdc',
  /** 뱀 머리 — 짙은 청록색 (밝은 배경에서 대비 확보) */
  snakeHead: '#1a7a5e',
  /** 뱀 몸통 — 중간 청록색 */
  snakeBody: '#2a9d78',
  /** 음식 — 진한 빨간색 (밝은 배경에서 가시성 유지) */
  food: '#c0392b',
  /** 장애물 — 중간 회색 */
  obstacle: '#95a5a6',
  /** 장애물 테두리 — 어두운 회색 */
  obstacleBorder: '#7f8c8d',
  /** 텍스트 — 짙은 회색 (밝은 배경 대비) */
  text: '#2c2c2c',
  /** 게임오버/대기 오버레이 — 반투명 흰색 */
  gameoverOverlay: 'rgba(255,255,255,0.7)',
};
