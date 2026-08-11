/**
 * 랜딩별 payload mapper 레지스트리
 */

import type {
  ApplicationPayload,
  Landing001FormValues,
  SimpleFormValues,
} from '../types';
import {
  buildLanding001Payload,
  buildLanding001Payloads,
} from './landing-001';

export { buildLanding001Payloads } from './landing-001';

/** simple 폼 기준 mapper */
type SimplePayloadBuilder = (
  values: SimpleFormValues,
  landingId: string,
) => ApplicationPayload;

const simpleMappers: Record<string, SimplePayloadBuilder> = {};

/**
 * slug에 해당하는 simple 폼 payload를 생성합니다.
 */
export function buildSimpleLandingPayload(
  slug: string,
  landingId: string,
  values: SimpleFormValues,
): ApplicationPayload {
  const mapper = simpleMappers[slug];

  if (!mapper) {
    console.warn(
      `[koti-kakao-landings] "${slug}"용 mapper가 없어 기본 payload를 사용합니다.`,
    );
    return {
      landingId,
      name: values.name.trim(),
      phone: values.phone.replace(/\D/g, ''),
      privacyAgreed: values.privacyAgreed,
    };
  }

  return mapper(values, landingId);
}

/** landing-001 landing-apply payload (하위 호환) */
export function buildLanding001LandingPayload(
  landingId: string,
  values: Landing001FormValues,
): ApplicationPayload {
  return buildLanding001Payload(values, landingId);
}
