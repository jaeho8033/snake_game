import { Position } from '../game/types';
import { TICK_MS } from './constants';

/**
 * 난이도 프로필 타입.
 * tickInterval: 작을수록 빠른 게임 속도 (ms)
 */
export interface DifficultyProfile {
  /** 틱 주기 (ms) — 값이 작을수록 빠름 */
  tickInterval: number;
}

/** 난이도 식별자 타입 */
export type DifficultyLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * 난이도 프로필 레지스트리.
 *
 * @MX:ANCHOR: [AUTO] DIFFICULTY_PROFILES — 난이도 설정의 유일한 진실 원천
 * @MX:REASON: Game.setDifficulty(), DifficultyPanel, main.ts 모두 이 객체를 참조한다.
 *             tickInterval 값 변경 시 게임 속도 밸런스 전체가 영향을 받는다.
 *
 * @MX:NOTE: [AUTO] MEDIUM.tickInterval은 기존 constants.ts의 TICK_MS(150ms)와 동일해야 한다.
 */
export const DIFFICULTY_PROFILES: Record<DifficultyLevel, DifficultyProfile> = {
  /** 느린 속도 — 입문자용 */
  LOW: { tickInterval: 250 },
  /** 기본 속도 — constants.ts의 TICK_MS와 동일 */
  MEDIUM: { tickInterval: TICK_MS },
  /** 빠른 속도 — 숙련자용 */
  HIGH: { tickInterval: 80 },
};

/**
 * 장애물 모드에서 사용되는 기본 장애물 셀 집합.
 *
 * @MX:NOTE: [AUTO] 기본 초기 뱀 위치(머리(5,10), (4,10), (3,10))와 겹치지 않도록 설계.
 *           첫 이동 방향(오른쪽, (6,10))도 장애물 아님을 보장한다.
 */
export const OBSTACLE_CELLS: Position[] = [
  // 수평 장벽 — 게임판 중간 상단 구역
  { x: 8, y: 5 },
  { x: 9, y: 5 },
  { x: 10, y: 5 },
  { x: 11, y: 5 },
  { x: 12, y: 5 },
  // 수직 장벽 — 게임판 오른쪽 구역
  { x: 15, y: 8 },
  { x: 15, y: 9 },
  { x: 15, y: 11 },
  { x: 15, y: 12 },
  // 수평 장벽 — 게임판 중간 하단 구역
  { x: 8, y: 14 },
  { x: 9, y: 14 },
  { x: 10, y: 14 },
  { x: 11, y: 14 },
  { x: 12, y: 14 },
];
