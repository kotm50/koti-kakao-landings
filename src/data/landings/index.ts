/**
 * 등록된 모든 랜딩 설정 모음
 *
 * 새 랜딩을 추가할 때:
 * 1. landings/landing-00X.ts 파일 생성
 * 2. 아래 import / landings 배열에 추가
 */

import type { LandingConfig } from '../../lib/types';
import landing001 from './landing-001';

/** 빌드 시 정적 페이지로 생성될 랜딩 목록 */
export const landings: LandingConfig[] = [landing001];

/** 전체 랜딩 목록 반환 */
export function getAllLandings(): LandingConfig[] {
  return landings;
}

/** slug로 랜딩 설정 조회 */
export function getLandingBySlug(slug: string): LandingConfig | undefined {
  return landings.find((landing) => landing.slug === slug);
}
