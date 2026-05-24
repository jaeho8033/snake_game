import { SCORE_PER_FOOD } from '../config/constants';

/**
 * 점수 상태를 관리한다.
 */
export class Score {
  /** 현재 점수 */
  public value: number = 0;

  /** 음식 섭취 시 SCORE_PER_FOOD만큼 점수를 증가시킨다 */
  increment(): void {
    this.value += SCORE_PER_FOOD;
  }

  /** 점수를 0으로 초기화한다 */
  reset(): void {
    this.value = 0;
  }
}
