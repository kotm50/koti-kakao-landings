/**
 * 공통 validation 유틸리티
 *
 * 기본 규칙(이름, 전화번호, 개인정보 동의)을 제공하고,
 * 랜딩별로 추가 규칙이 필요하면 이 모듈의 함수를 조합하거나
 * 랜딩 전용 validate 함수를 별도로 작성합니다.
 */

import type {
  Landing001FormValues,
  SimpleFormValues,
  ValidationResult,
} from './types';

/**
 * 전화번호에서 숫자만 남깁니다.
 * 예: "010-1234-5678" → "01012345678"
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * 한국 휴대전화 번호 형식 검사
 * 허용 예:
 * - 01012345678
 * - 010-1234-5678
 * - 010 1234 5678
 *
 * 정규화 후 01X로 시작하는 10~11자리 숫자인지 확인합니다.
 */
export function isValidPhone(phone: string): boolean {
  const digits = normalizePhone(phone);
  return /^01[016789]\d{7,8}$/.test(digits);
}

/** 이름이 공백이 아닌지 확인 */
export function isNonEmptyName(name: string): boolean {
  return name.trim().length > 0;
}

/**
 * simple 템플릿용 기본 검증
 * - 이름 공백 여부
 * - 전화번호 형식
 * - 개인정보 수집 동의
 */
export function validateSimpleForm(values: SimpleFormValues): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isNonEmptyName(values.name)) {
    errors.name = '이름을 입력해주세요.';
  }

  if (!values.phone.trim()) {
    errors.phone = '휴대전화번호를 입력해주세요.';
  } else if (!isValidPhone(values.phone)) {
    errors.phone = '올바른 휴대전화번호 형식이 아닙니다.';
  }

  if (!values.privacyAgreed) {
    errors.privacyAgreed = '개인정보 수집에 동의해주세요.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * 랜딩별 커스텀 검증을 확장할 때 사용하는 헬퍼 예시입니다.
 * 공통 검증 결과에 추가 오류를 합칩니다.
 */
export function mergeValidationResults(
  ...results: ValidationResult[]
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const result of results) {
    Object.assign(errors, result.errors);
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/** YYYY-MM-DD 가 평일(월~금)인지 */
export function isWeekdayDateString(dateStr: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return false;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

/**
 * landing-001 이벤트 지원 폼 검증
 * - 이름 / 휴대폰 / 출생연도 / 성별
 * - 거주지 · 희망 근무 지역
 * - 면접 희망일(선택): 평일만, 최대 3개
 * - 필수 동의 2종
 */
export function validateLanding001Form(
  values: Landing001FormValues,
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isNonEmptyName(values.name)) {
    errors.name = '이름을 입력해주세요.';
  }

  if (!values.phone.trim()) {
    errors.phone = '휴대폰 번호를 입력해주세요.';
  } else if (!isValidPhone(values.phone)) {
    errors.phone = '올바른 휴대폰 번호 형식이 아닙니다.';
  }

  if (!values.birthYear) {
    errors.birthYear = '출생연도를 선택해주세요.';
  }

  if (!values.gender) {
    errors.gender = '성별을 선택해주세요.';
  }

  if (!values.residence.sido || !values.residence.sigungu) {
    errors.residence = '거주지를 선택해주세요.';
  }

  if (!values.workRegion.sido || !values.workRegion.sigungu) {
    errors.workRegion = '희망 근무 지역을 선택해주세요.';
  }

  // 면접일은 선택 사항 — 선택한 경우만 평일·개수 검증
  if (values.interviewDates.length > 3) {
    errors.interviewDates = '면접/상담 희망일은 최대 3개까지 선택할 수 있습니다.';
  } else if (values.interviewDates.some((d) => !isWeekdayDateString(d))) {
    errors.interviewDates = '면접/상담 희망일은 평일만 선택할 수 있습니다.';
  }

  if (!values.agreeCollection) {
    errors.agreeCollection = '개인정보 수집 및 이용에 동의해주세요.';
  }

  if (!values.agreeThirdParty) {
    errors.agreeThirdParty = '개인정보의 제3자 제공에 동의해주세요.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
