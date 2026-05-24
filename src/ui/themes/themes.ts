/**
 * 색상 테마 시스템 — 렌더러가 사용하는 9가지 색상 키를 정의한다.
 *
 * @MX:ANCHOR: [AUTO] Palette — 렌더러-테마 계약의 단일 진실 원천
 * @MX:REASON: Renderer, ThemeManager, dark.ts, light.ts가 모두 이 타입에 의존한다.
 *             fan_in >= 3 — 이 인터페이스 변경은 모든 팔레트 구현체에 파급된다.
 *
 * @MX:NOTE: [AUTO] 로직-렌더링 분리 불변성 — 팔레트/테마 코드는 게임 상태를 읽거나 변경해서는 안 된다.
 *           Renderer의 drawing 메서드만 팔레트를 소비하며, Game 객체에 접근하지 않는다.
 */
export interface Palette {
  /** 게임판 배경 색상 */
  bg: string;
  /** 체커보드 그리드 셀 색상 */
  grid: string;
  /** 뱀 머리 색상 */
  snakeHead: string;
  /** 뱀 몸통 색상 */
  snakeBody: string;
  /** 음식(먹이) 색상 */
  food: string;
  /** 장애물 채우기 색상 */
  obstacle: string;
  /** 장애물 테두리 색상 */
  obstacleBorder: string;
  /** 텍스트(점수/오버레이 문구) 색상 */
  text: string;
  /** 게임오버/대기 오버레이 배경 색상 */
  gameoverOverlay: string;
}

/** 지원하는 테마 이름 목록 */
export type ThemeName = 'dark' | 'light';

import { darkPalette } from './dark';
import { lightPalette } from './light';

/** 이름으로 팔레트를 조회한다 */
export function getTheme(name: ThemeName): Palette {
  return name === 'light' ? lightPalette : darkPalette;
}

/**
 * 세션 범위 테마 관리자.
 * localStorage 등 영속성은 지원하지 않는다 (세션 전용).
 *
 * @MX:ANCHOR: [AUTO] ThemeManager — 테마 전환의 단일 진입점
 * @MX:REASON: main.ts와 향후 테마 UI 컴포넌트가 이 모듈을 통해 팔레트를 변경한다.
 *             fan_in >= 2 — main.ts + Theme.test.ts가 직접 호출한다.
 */
export const ThemeManager = {
  /** 현재 활성 테마 이름 (세션 기본값: dark) */
  _current: 'dark' as ThemeName,

  /** 현재 테마 이름을 반환한다 */
  getCurrentTheme(): ThemeName {
    return this._current;
  },

  /** 테마를 전환한다. 다음 render() 호출 시 새 팔레트가 적용된다. */
  setTheme(name: ThemeName): void {
    this._current = name;
  },

  /** 현재 활성 팔레트 객체를 반환한다 */
  getActivePalette(): Palette {
    return getTheme(this._current);
  },
};
