/**
 * 공통 랜딩 신청 API 클라이언트
 *
 * - simple 템플릿: POST {base}/api/landing/apply
 * - landing-001: 샘플(LandingApplyForm3)과 동일하게
 *   1) POST {base}/check
 *   2) POST {base}/landing-apply/input  +  POST {base}/input  병렬
 */

import type {
  ApplicationPayload,
  Landing001FormValues,
  SubmitResult,
} from "./types";
import { buildLanding001Payloads } from "./mappers/landing-001";

/** simple 템플릿용 임시 endpoint */
const APPLY_PATH = "/api/landing/apply";

function getApiBaseUrl(): string | undefined {
  // Astro/Vite: 브라우저(클라이언트) 번들에는 PUBLIC_ 접두사 변수만 노출됨
  const baseUrl = import.meta.env.PUBLIC_KOTI_API_BASE_URL as
    | string
    | undefined;
  if (!baseUrl || baseUrl.trim() === "") {
    return undefined;
  }
  return baseUrl.replace(/\/$/, "");
}

/**
 * 랜딩 신청 데이터를 외부 Express API로 전송합니다. (simple 템플릿용)
 */
export async function submitLandingApplication(
  payload: ApplicationPayload,
): Promise<SubmitResult> {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    console.warn(
      "[koti-kakao-landings] PUBLIC_KOTI_API_BASE_URL이 설정되지 않았습니다. .env / Cloudflare 환경변수를 확인하세요.",
    );
    return {
      ok: false,
      message: "API_BASE_URL_NOT_CONFIGURED",
    };
  }

  const endpoint = `${baseUrl}${APPLY_PATH}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: "SUBMIT_FAILED",
      };
    }

    return {
      ok: true,
      status: response.status,
    };
  } catch (error) {
    console.error("[koti-kakao-landings] 신청 API 호출 실패:", error);
    return {
      ok: false,
      message: "NETWORK_ERROR",
    };
  }
}

type JsonBody = Record<string, unknown>;

async function postJson(
  url: string,
  body: ApplicationPayload,
): Promise<{ ok: boolean; status: number; data: JsonBody }> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  let data: JsonBody = {};
  try {
    data = (await response.json()) as JsonBody;
  } catch {
    data = {};
  }

  return { ok: response.ok, status: response.status, data };
}

/**
 * landing-001 지원 등록
 * LandingApplyForm3.tsx handleSubmit 과 동일한 API 호출 순서·페이로드
 */
export async function submitLanding001Application(
  values: Landing001FormValues,
  options?: { pageNum?: number },
): Promise<SubmitResult> {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    console.warn(
      "[koti-kakao-landings] PUBLIC_KOTI_API_BASE_URL이 설정되지 않았습니다. .env / Cloudflare 환경변수를 확인하세요.",
    );
    return {
      ok: false,
      message: "API_BASE_URL_NOT_CONFIGURED",
    };
  }

  try {
    // 1) 사전 검증 — POST /check
    const draft = buildLanding001Payloads(values, {
      pageNum: options?.pageNum,
    });

    const checkRes = await postJson(`${baseUrl}/check`, draft.checkPayload);
    if (!checkRes.ok) {
      return {
        ok: false,
        status: checkRes.status,
        message: "사전 검증에 실패했습니다. 잠시 후 다시 시도해주세요.",
      };
    }

    const applyStatus =
      typeof checkRes.data.applyStatus === "string"
        ? checkRes.data.applyStatus
        : "신규DB";

    // applyStatus 반영 후 최종 페이로드 재구성
    const { landingPayload, legacyPayload } = buildLanding001Payloads(values, {
      pageNum: options?.pageNum,
      applyStatus,
    });

    // 2) 랜딩 등록 + 레거시 등록 병렬
    const [landingRes, legacyRes] = await Promise.all([
      postJson(`${baseUrl}/landing-apply/input`, landingPayload),
      postJson(`${baseUrl}/input`, legacyPayload),
    ]);

    if (!landingRes.ok || landingRes.data.success !== true) {
      const message =
        typeof landingRes.data.message === "string"
          ? landingRes.data.message
          : "지원 등록에 실패했습니다. 잠시 후 다시 시도해주세요.";
      return {
        ok: false,
        status: landingRes.status,
        message,
      };
    }

    if (!legacyRes.ok || legacyRes.data.success !== true) {
      return {
        ok: false,
        status: legacyRes.status,
        message: "지원 정보 저장에 실패했습니다. 잠시 후 다시 시도해주세요.",
      };
    }

    return {
      ok: true,
      status: landingRes.status,
      message: "지원이 정상적으로 접수되었습니다.",
    };
  } catch (error) {
    console.error("[koti-kakao-landings] landing-001 저장 오류:", error);
    return {
      ok: false,
      message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
}
