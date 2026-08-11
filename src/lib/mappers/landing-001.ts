/**
 * landing-001 전용 payload 변환기
 *
 * tssample/LandingApplyForm3.tsx 의 landingPayload / legacyPayload 구조를
 * 그대로 사용합니다.
 */

import type { ApplicationPayload, Landing001FormValues } from "../types";

/** 요청값 고정 고객사 코드 */
export const LANDING001_COM_CODE = "cchat1749";

/** yyyy-MM-dd HH:mm:ss (date-fns format 대체) */
export function formatDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** "서울" + "강남구" → "서울 강남구" */
function toApplyArea(sido: string, sigungu: string): string {
  return `${sido} ${sigungu}`.trim();
}

/**
 * 메모 문자열 구성
 * - 면접희망일을 선택하지 않으면 해당 문구는 제외
 */
export function buildLanding001Memo(
  applyArea: string,
  workArea: string,
  sortedInterviewDates: string[],
): string {
  const parts = ["카카오 랜딩페이지 지원자"];

  if (workArea && workArea !== applyArea) {
    parts.push(`희망근무: ${workArea}`);
  }

  if (sortedInterviewDates.length > 0) {
    parts.push(`면접희망일: ${sortedInterviewDates.join(", ")}`);
  }

  return parts.length === 1
    ? parts[0]
    : `${parts[0]} / ${parts.slice(1).join(" / ")}`;
}

export type Landing001BuiltPayloads = {
  /** POST /check */
  checkPayload: ApplicationPayload;
  /** POST /landing-apply/input */
  landingPayload: ApplicationPayload;
  /** POST /input */
  legacyPayload: ApplicationPayload;
};

/**
 * 샘플 LandingApplyForm3 handleSubmit 과 동일한 페이로드를 구성합니다.
 */
export function buildLanding001Payloads(
  values: Landing001FormValues,
  options?: { pageNum?: number; applyStatus?: string },
): Landing001BuiltPayloads {
  const validatedName = values.name.trim();
  const validatedPhone = values.phone.trim();
  const validatedBirthYear = values.birthYear;
  const validatedGender = values.gender;

  const sido = values.residence.sido;
  const sigungu = values.residence.sigungu;
  const applyArea = toApplyArea(sido, sigungu);

  const workArea = toApplyArea(
    values.workRegion.sido,
    values.workRegion.sigungu,
  );

  const sortedInterviewDates = [...values.interviewDates]
    .filter(Boolean)
    .sort();

  const now = new Date();
  const formattedNow = formatDateTime(now);
  const applyStatus = options?.applyStatus || "신규DB";
  const applySnum = `${validatedBirthYear}0000`;

  const checkPayload: ApplicationPayload = {
    applyName: validatedName,
    applyContact: validatedPhone,
    comCode: LANDING001_COM_CODE,
    com_code: LANDING001_COM_CODE,
    applySnum,
  };

  const landingPayload: ApplicationPayload = {
    apply_name: validatedName,
    apply_phone: validatedPhone,
    apply_addr: applyArea,
    apply_sido: sido,
    apply_sigungu: sigungu,
    apply_snum: validatedBirthYear,
    gender: validatedGender,
    comCode: LANDING001_COM_CODE,
    com_code: LANDING001_COM_CODE,
  };

  // 선택한 경우에만 면접희망일 전송
  if (sortedInterviewDates.length > 0) {
    landingPayload.apply_interview = sortedInterviewDates;
  }

  if (typeof options?.pageNum === "number") {
    landingPayload.page_num = options.pageNum + 1;
  }

  const applyAreas =
    workArea && workArea !== applyArea ? [applyArea, workArea] : [applyArea];

  const memo = buildLanding001Memo(applyArea, workArea, sortedInterviewDates);

  const legacyPayload: ApplicationPayload = {
    comCode: LANDING001_COM_CODE,
    com_code: LANDING001_COM_CODE,
    applyName: validatedName,
    applyContact: validatedPhone,
    applySnum,
    applySex: validatedGender,
    applyPath: "랜딩",
    applyAddr: applyArea,
    applyAreas,
    applyDate: now,
    lastModified: now,
    applyStatus,
    applySubStatus: " ",
    applyBloodtype: "-",
    applyMemo: memo,
    applyFile: "",
    managerId: "landing",
    contactManager: "",
    interviewTime: "00월 00일 00시",
    applyCareer: 0,
    statusHistory: `${formattedNow} 지원 | 랜딩페이지`,
    interviewMemo: memo,
    adminMemo: memo,
    marketingAgree: values.agreeMarketing,
  };

  return { checkPayload, landingPayload, legacyPayload };
}

/**
 * @deprecated buildLanding001Payloads 를 사용하세요.
 */
export function buildLanding001Payload(
  values: Landing001FormValues,
  _landingId: string,
): ApplicationPayload {
  return buildLanding001Payloads(values).landingPayload;
}
