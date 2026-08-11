/**
 * 공휴일 목록 조회
 *
 * POST {PUBLIC_KOTI_API_BASE_URL}/holiday/dates
 * body: { year: "2026" }
 * response:
 * {
 *   success: true,
 *   data: { year: "2026", dates: ["2026-01-01", ...] }
 * }
 */

export type HolidayInfo = {
  /** YYYY-MM-DD */
  date: string;
  name?: string;
};

function getApiBaseUrl(): string | undefined {
  // Astro/Vite: 브라우저 번들에는 PUBLIC_ 접두사 변수만 노출됨
  const baseUrl = import.meta.env.PUBLIC_KOTI_API_BASE_URL as
    | string
    | undefined;
  if (!baseUrl || baseUrl.trim() === "") return undefined;
  return baseUrl.replace(/\/$/, "");
}

/** API 실패 시 사용할 2026 공휴일(대체공휴일 포함) */
const FALLBACK_HOLIDAYS_2026: HolidayInfo[] = [
  { date: "2026-01-01", name: "신정" },
  { date: "2026-02-16", name: "설날 연휴" },
  { date: "2026-02-17", name: "설날" },
  { date: "2026-02-18", name: "설날 연휴" },
  { date: "2026-03-01", name: "삼일절" },
  { date: "2026-03-02", name: "대체공휴일" },
  { date: "2026-05-05", name: "어린이날" },
  { date: "2026-05-24", name: "부처님오신날" },
  { date: "2026-05-25", name: "대체공휴일" },
  { date: "2026-06-06", name: "현충일" },
  { date: "2026-08-15", name: "광복절" },
  { date: "2026-08-17", name: "대체공휴일" },
  { date: "2026-09-24", name: "추석 연휴" },
  { date: "2026-09-25", name: "추석" },
  { date: "2026-09-26", name: "추석 연휴" },
  { date: "2026-09-28", name: "대체공휴일" },
  { date: "2026-10-03", name: "개천절" },
  { date: "2026-10-05", name: "대체공휴일" },
  { date: "2026-10-09", name: "한글날" },
  { date: "2026-12-25", name: "크리스마스" },
];

function getFallbackHolidays(year: number): HolidayInfo[] {
  if (year === 2026) return FALLBACK_HOLIDAYS_2026;
  return [];
}

/**
 * 연도별 공휴일 조회
 * POST /holiday/dates { year: "YYYY" }
 */
export async function fetchHolidays(year: number): Promise<HolidayInfo[]> {
  const baseUrl = getApiBaseUrl();

  if (baseUrl) {
    try {
      const res = await fetch(`${baseUrl}/holiday/dates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ year: String(year) }),
      });

      if (res.ok) {
        const json = (await res.json()) as {
          success?: boolean;
          data?: { year?: string; dates?: unknown };
        };

        if (json?.success && Array.isArray(json.data?.dates)) {
          return json.data.dates
            .filter((d): d is string => typeof d === "string" && d.length >= 10)
            .map(date => ({ date: date.slice(0, 10), name: "공휴일" }));
        }
      } else {
        console.warn("[koti-kakao-landings] 공휴일 API 응답 오류:", res.status);
      }
    } catch (error) {
      console.warn("[koti-kakao-landings] 공휴일 API 호출 실패:", error);
    }
  }

  return getFallbackHolidays(year);
}

/** date(YYYY-MM-DD) → name 맵 */
export function toHolidayMap(holidays: HolidayInfo[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const item of holidays) {
    map.set(item.date, item.name ?? "공휴일");
  }
  return map;
}
