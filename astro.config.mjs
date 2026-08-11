// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Cloudflare Pages 정적 배포용 SSG 설정
 * - output: 'static' → 빌드 결과가 순수 HTML/CSS/JS
 * - trailingSlash: 'always' → /kakao/landing-001/ 형태 URL
 * - Cloudflare Pages Functions / SSR 미사용
 */
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  // og:image 절대 URL용 (Cloudflare 등에서 PUBLIC_SITE_URL 설정 권장)
  site: process.env.PUBLIC_SITE_URL || undefined,
  build: {
    format: 'directory',
  },
});
