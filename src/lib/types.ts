/**
 * 랜딩페이지 공통 타입 정의
 *
 * 각 랜딩은 LandingConfig로 설정을 관리하고,
 * template 값에 따라 서로 다른 UI 템플릿을 사용합니다.
 */

/** 사용 가능한 템플릿 식별자 */
export type LandingTemplate = 'simple' | 'recruit' | 'event' | 'landing001';

/**
 * 랜딩페이지 설정 (직렬화 가능한 데이터만 포함)
 * 함수는 여기에 두지 않고 mapper / validation 모듈로 분리합니다.
 */
export interface LandingConfig {
  /** URL 경로에 사용되는 슬러그. 예: landing-001 → /kakao/landing-001/ */
  slug: string;
  /** API에 전달하는 랜딩 식별자 */
  landingId: string;
  /** 사용할 UI 템플릿 */
  template: LandingTemplate;
  /** 페이지 제목 (meta + 화면 표시) */
  title: string;
  /** 페이지 설명 (meta + 화면 표시) */
  description: string;
  /** 신청 버튼 문구 (기본값: 신청하기) */
  submitButtonText?: string;
  /** 히어로/배너 이미지 경로 (public 기준, 선택) */
  heroImage?: string;
}

/**
 * 공통 API로 전송하는 payload
 * 랜딩마다 필드가 달라질 수 있으므로 특정 형태에 강하게 종속하지 않습니다.
 */
export type ApplicationPayload = Record<string, unknown>;

/** 신청 API 호출 결과 */
export interface SubmitResult {
  ok: boolean;
  status?: number;
  message?: string;
}

/** 폼 검증 결과 */
export interface ValidationResult {
  valid: boolean;
  /** 필드별 오류 메시지. key는 필드명 */
  errors: Record<string, string>;
}

/**
 * simple 템플릿에서 사용하는 기본 폼 값
 * 다른 템플릿은 각자 확장된 FormValues 타입을 정의하면 됩니다.
 */
export interface SimpleFormValues {
  name: string;
  phone: string;
  privacyAgreed: boolean;
}

/** 시/도 · 시/군/구 쌍 */
export interface RegionPair {
  sido: string;
  sigungu: string;
}

/**
 * landing-001(이벤트) 지원 폼 값
 * tssample LandingApplyForm3 정보 입력 영역을 기준으로 합니다.
 */
export interface Landing001FormValues {
  name: string;
  phone: string;
  birthYear: string;
  gender: string;
  residence: RegionPair;
  workRegion: RegionPair;
  /** 면접/상담 희망일 YYYY-MM-DD 목록 (선택, 최대 3개, 평일만) */
  interviewDates: string[];
  agreeCollection: boolean;
  agreeThirdParty: boolean;
  agreeMarketing: boolean;
}
