# koti-kakao-landings

카카오 챗봇에서 연결해 사용하는 **여러 개의 랜딩페이지**를 하나의 저장소·하나의 Cloudflare Pages 프로젝트에서 관리하기 위한 정적 사이트입니다.

새 랜딩을 추가할 때 프로젝트나 HTML 구조를 매번 새로 만들지 않도록, Astro 동적 라우팅(`getStaticPaths`)과 랜딩 설정 파일 기반으로 설계했습니다.

예상 URL 예시:

- `/kakao/landing-001/`
- `/kakao/landing-002/`
- `/kakao/landing-003/`

---

## 기술 스택

| 항목          | 선택                                      |
| ------------- | ----------------------------------------- |
| 프레임워크    | Astro                                     |
| 언어          | TypeScript                                |
| 렌더링        | SSG (Static Site Generation)              |
| UI 라이브러리 | 없음 (React / Next.js 미사용)             |
| 패키지 매니저 | pnpm                                      |
| Node.js       | 22+                                       |
| 배포          | Cloudflare Pages (Functions / SSR 미사용) |
| 신청 API      | 기존 외부 Express API로 POST              |

---

## 설치 방법

```bash
pnpm install
```

환경변수 예시 파일을 복사합니다.

```bash
cp .env.example .env
```

`.env` 예시:

```env
KOTI_API_BASE_URL=https://api.example.com
```

> `PUBLIC_` 접두사는 **브라우저에 노출되는 공개 값**입니다.
> API Secret, DB 비밀번호, Private Key 등은 절대 넣지 마세요.

---

## 개발 서버 실행

```bash
pnpm dev
```

기본 주소: `http://localhost:4321`

- 목록: `/`
- 테스트 랜딩: `/kakao/landing-001/`

---

## Production Build

```bash
pnpm build
```

결과물은 `dist/` 에 생성됩니다. 완전히 정적인 HTML/CSS/JS입니다.

로컬에서 빌드 결과 미리보기:

```bash
pnpm preview
```

---

## 프로젝트 구조

```text
koti-kakao-landings/
├─ public/
│  └─ images/                  # 랜딩 이미지 (정적 자산)
│
├─ src/
│  ├─ pages/
│  │  ├─ index.astro           # 등록된 랜딩 목록
│  │  └─ kakao/
│  │     └─ [slug].astro       # SSG 동적 라우트
│  │
│  ├─ layouts/
│  │  └─ LandingLayout.astro   # 공통 레이아웃 (모바일 우선, max-width ~480px)
│  │
│  ├─ components/
│  │  ├─ forms/
│  │  │  └─ SimpleApplicationForm.astro
│  │  └─ templates/
│  │     └─ SimpleLanding.astro
│  │
│  ├─ data/
│  │  └─ landings/
│  │     ├─ index.ts           # 랜딩 목록 레지스트리
│  │     └─ landing-001.ts     # 개별 랜딩 설정
│  │
│  └─ lib/
│     ├─ api.ts                # 공통 API 호출
│     ├─ validation.ts         # 공통 validation
│     ├─ types.ts              # 공통 타입
│     └─ mappers/              # 랜딩별 payload 변환
│        ├─ index.ts
│        └─ landing-001.ts
│
├─ .env.example
├─ astro.config.mjs
├─ package.json
└─ README.md
```

---

## 새로운 랜딩 추가 방법

아래 순서대로 진행하면 됩니다.

### 1) 랜딩 설정 파일 추가

`src/data/landings/landing-002.ts` 파일을 만듭니다.

```ts
import type { LandingConfig } from "../../lib/types";

const landing002: LandingConfig = {
  slug: "landing-002",
  landingId: "kakao-landing-002",
  template: "simple", // 또는 새로 만든 템플릿명
  title: "두 번째 랜딩 제목",
  description: "설명 문구",
  submitButtonText: "신청하기",
  // heroImage: '/images/landing-002/hero.png', // 필요 시
};

export default landing002;
```

### 2) 랜딩 목록에 등록

`src/data/landings/index.ts` 를 수정합니다.

```ts
import landing001 from "./landing-001";
import landing002 from "./landing-002";

export const landings: LandingConfig[] = [
  landing001,
  landing002, // 추가
];
```

빌드 시 `/kakao/landing-002/` 정적 페이지가 자동 생성됩니다.

### 3) 이미지 추가 (필요 시)

이미지를 `public/images/landing-002/` 등에 넣고, 설정에 `heroImage`를 지정합니다.

```ts
heroImage: '/images/landing-002/hero.png',
```

### 4) payload mapper 추가 (필드/API 형태가 다르면)

`src/lib/mappers/landing-002.ts` 를 만들고:

```ts
export function buildLanding002Payload(values, landingId) {
  return {
    landingId,
    name: values.name.trim(),
    phone: values.phone.replace(/\D/g, ""),
    // 랜딩별 추가 필드...
  };
}
```

`src/lib/mappers/index.ts` 의 `simpleMappers`에 등록합니다.

```ts
const simpleMappers = {
  "landing-001": buildLanding001Payload,
  "landing-002": buildLanding002Payload,
};
```

> 입력 필드 자체가 `simple`과 다르면, 전용 폼/템플릿을 추가하는 편이 낫습니다. (아래 “새 템플릿 추가” 참고)

### 5) validation 확장 (필요 시)

공통 규칙은 `src/lib/validation.ts`에 있습니다.
랜딩 전용 규칙이 필요하면 별도 함수를 만들고 폼 스크립트에서 사용하세요.

### 6) 확인

```bash
pnpm dev
```

`/` 목록에 `landing-002`가 보이는지, `/kakao/landing-002/`가 열리는지 확인합니다.

```bash
pnpm build
```

`dist/kakao/landing-002/index.html`이 생성되는지 확인합니다.

---

## 새로운 템플릿 추가 방법

랜딩마다 디자인이 달라질 수 있으므로, 템플릿을 선택하는 구조입니다.

### 1) 템플릿 컴포넌트 생성

예: `src/components/templates/RecruitLanding.astro`

필요하면 전용 폼도 함께 만듭니다.

예: `src/components/forms/RecruitApplicationForm.astro`

### 2) 타입에 템플릿명 추가

`src/lib/types.ts`의 `LandingTemplate`에 이름을 추가합니다.

```ts
export type LandingTemplate = "simple" | "recruit" | "event";
```

### 3) 라우트에서 템플릿 분기

`src/pages/kakao/[slug].astro`에서 분기합니다.

```astro
{landing.template === 'simple' && <SimpleLanding landing={landing} />}
{landing.template === 'recruit' && <RecruitLanding landing={landing} />}
```

### 4) 랜딩 설정에서 지정

```ts
template: 'recruit',
```

현재는 `simple` 템플릿만 구현되어 있습니다.

---

## 랜딩별 payload를 다르게 만드는 방법

공통 API 함수는 payload 형태에 종속되지 않습니다.

```ts
// src/lib/api.ts
await submitLandingApplication(payload);
```

랜딩별 변환은 mapper에서 처리합니다.

예시 A (`landing-001`):

```json
{
  "landingId": "kakao-landing-001",
  "name": "홍길동",
  "phone": "01012345678",
  "privacyAgreed": true
}
```

예시 B (다른 랜딩):

```json
{
  "landingId": "kakao-b",
  "name": "홍길동",
  "phone": "01012345678",
  "birth": "19900101",
  "region": "서울",
  "jobType": "office"
}
```

권장 흐름:

1. 폼에서 값 수집
2. validation
3. `buildXxxPayload()`로 랜딩별 JSON 생성
4. `submitLandingApplication(payload)` 호출

전화번호는 입력 시 `010-1234-5678` / `01012345678` 모두 허용하고, API 전송 시 숫자만 남깁니다.

---

## 환경변수 설정

| 변수                | 설명                                    |
| ------------------- | --------------------------------------- |
| `KOTI_API_BASE_URL` | 프론트에서 호출하는 공개 API 베이스 URL |

신청 API (임시):

```text
POST {KOTI_API_BASE_URL}/api/landing/apply
```

로컬:

1. `.env.example` → `.env` 복사
2. 실제 API 주소로 변경
3. `pnpm dev` 재시작 (환경변수 변경 후 재시작 필요)

API가 아직 연결되지 않아도 페이지 UI·validation·버튼 상태 확인은 가능합니다.
요청 실패 시에는 아래 메시지가 표시됩니다.

```text
신청 처리 중 문제가 발생했습니다.
잠시 후 다시 시도해주세요.
```

성공 시:

```text
신청이 완료되었습니다.
```

---

## Cloudflare Pages 배포 설정

GitHub Repository를 Cloudflare Pages에 연결할 때:

| 설정                   | 값           |
| ---------------------- | ------------ |
| Build command          | `pnpm build` |
| Build output directory | `dist`       |
| Node.js version        | `22`         |

환경변수 (빌드 시점에 주입):

- `KOTI_API_BASE_URL` = 실제 API 주소

> Astro/Vite의 `PUBLIC_` 변수는 **빌드 타임**에 HTML/JS에 포함됩니다.
> Cloudflare Pages 대시보드의 Environment Variables에 설정한 뒤 빌드해야 반영됩니다.

주의:

- Cloudflare Pages **Functions 사용하지 않음**
- 이 프로젝트에 백엔드/SSR 런타임 없음
- 빌드 결과물은 정적 파일만 포함

---

## 개발 명령어 요약

```bash
pnpm install   # 의존성 설치
pnpm dev       # 개발 서버
pnpm build     # production 빌드 → dist/
pnpm preview   # 빌드 결과 미리보기
```
