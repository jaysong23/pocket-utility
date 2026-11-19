# MY POCKET UTILITY 인수인계

기준일: 2026-11-19. 다음 개발자 또는 새 ChatGPT 대화가 이어서 작업하기 위한 문서입니다. 저장소의 최신 코드와 실제 배포 상태를 우선합니다.

## 1. 서비스와 작업 원칙

- 운영 사이트: https://mypocketutility.com/
- GitHub: https://github.com/jaysong23/pocket-utility (main)
- 로컬 저장소: `/Users/ad1275/Documents/ChatGPT/Prototype/pocket-utility-seo`
- 운영: Cloudflare **Workers + Static Assets**. GitHub Pages는 별도 정적 미리보기이며 운영 API가 없습니다.
- 파일 변환은 반드시 사용자 브라우저 안에서 처리합니다. 이미지·PDF를 변환 서버에 업로드하지 않습니다.
- 한국어 / 영어 / 일본어, Pretendard, 다크 모드. 페이지 제목은 좌측 정렬, 이미지 업로드 박스 내부는 가운데 정렬입니다.
- 문의 이메일: jihoon.song@hotmail.com. mailto 제목에 `[MPU]`를 붙입니다. 문의 폼·이메일 자동 발송 서버는 없습니다.
- 비밀 키를 코드·문서·채팅에 저장하지 않습니다. 공개 식별자는 아래에 기록했습니다.

## 2. 이번 변경

- 기존 `/webp/`, `/heic/` 이미지 변환기에 AVIF 입력과 출력을 통합했습니다. 별도 `/avif/` URL은 만들지 않았습니다.
- FROM: 자동 감지 / AVIF / HEIC·HEIF / WebP / JPG / PNG. TO: JPG / PNG / WebP / AVIF.
- AVIF → JPG·PNG·WebP, JPG·PNG·WebP·HEIC → AVIF를 지원합니다.
- 파일 확장자나 MIME만 믿지 않고 바이트 시그니처로 식별합니다. AVIF 브랜드가 HEIC보다 우선합니다.
- 이미지 URL 입력도 지원 형식 전체로 확장했습니다. 원본 서버의 CORS 허용은 여전히 필요합니다.
- AVIF 출력은 `@jsquash/avif@2.1.1`의 단일 스레드 WASM 인코더를 브라우저 Web Worker에서 실행합니다. 서버 Worker와 다른 개념입니다.
- `/codecs/avif-worker.js`, `avif_enc.wasm`(약 3.3MB), `avif_dec.wasm`(약 1.1MB)은 빌드에서 생성·복사하며 최초 필요 시 다운로드합니다. 매 페이지 초기 로드에 WASM을 받지 않습니다.
- AVIF 읽기는 브라우저 네이티브 디코딩을 먼저 시도하고 실패 시 WASM 디코더로 보완합니다. AVIF 작업은 120초 제한, 페이지를 떠나면 작업 Worker를 종료합니다.
- 정지 이미지만 지원합니다. `avis` 시퀀스와 애니메이션 WebP는 거부합니다. 메타데이터·HDR·애니메이션 보존을 약속하지 않습니다. JPG 투명 영역은 흰색, PNG·WebP·AVIF는 투명도 유지.
- 기존 40메가픽셀 제한은 디코딩 뒤 적용되므로 초대형·손상 파일의 메모리 비용을 완전히 방지하지는 못합니다.
- 업로드 제목만 왼쪽으로 치우치던 문제를 `.shell .converter .dropzone h2` 범위의 CSS로 수정했습니다. 제목 문장도 한 문자열로 바꿨습니다.
- 검증: 실제 WASM으로 AVIF 생성→다시 읽기, 픽셀 크기·알파 채널·손상 입력 검사. 전체 자동 테스트 77개 통과. 실제 iOS/Android와 네이티브 브라우저의 시각적 QA는 별도 수행해야 합니다.

## 3. 기능과 주소

| 분류 | 주소 | 기능 |
| --- | --- | --- |
| 이미지 | `/webp/`, `/heic/` | 공통 이미지 변환기, AVIF 포함 |
| 이미지 | `/pdf-to-jpg/` | PDF.js로 페이지별 JPG 저장 |
| 날짜·시간 | `/weeknumber/` | ISO 주차, 한국어 날짜·음력 기념일, 공휴일 달력 |
| 날짜·시간 | `/clock/`, `/timer/`, `/pomodoro/` | 시각 동기화, 알림, PiP |
| 텍스트·경로 | `/path-converter/` | Windows UNC ↔ SMB·AFP·사용자 프로토콜 |
| 텍스트·경로 | `/symbols/`, `/insta-fonts/` | 특수문자 모아 복사, 유니코드 영문 스타일 |
| 텍스트·경로 | `/markdown/` | Markdown → HTML / 일반 텍스트 |
| 텍스트·경로 | `/url-linter/` | 메타태그 검사 |
| 텍스트·경로 | `/url-expander/` | 단축 주소의 HTTP 이동과 파라미터 분석 |
| 텍스트·경로 | `/character-counter/`, `/lorem-ipsum/` | 글자·바이트 계산, 라틴/한/일 더미 텍스트 |
| 계산 | `/currency/`, `/units/` | 환율·단위 변환 |
| 안내 | `/about/`, `/privacy/`, `/contact/` | 서비스 소개·개인정보·문의 |

영어는 `/en/`, 일본어는 `/ja/` 접두사. 홈+17개 도구+3개 안내 페이지 ×3언어=63개 canonical URL입니다. 레거시 `/md-to-html/`, `/clock-timer/`, `#/…` 링크도 처리합니다.

## 4. 주요 파일

| 파일 | 역할 |
| --- | --- |
| `src/App.tsx` | 도구 목록·GNB·페이지 선택·위크넘버 화면 |
| `src/Converter.tsx` | 이미지 목록·입출력·다운로드·URL 읽기 |
| `src/image-type.mjs` | 바이트 기반 이미지 형식 감지 |
| `src/avif-client.mjs` | AVIF Web Worker 생성·종료·타임아웃 |
| `src/avif-worker.mjs`, `src/avif-codec.mjs` | WASM 로드와 인코딩·디코딩 |
| `src/translations.json`, `src/i18n.mjs` | UI 번역·언어별 표시 |
| `src/routing.mjs`, `src/language-preference.mjs` | 경로·첫 접속 언어 선택 |
| `src/guides.mjs`, `src/info-pages.mjs` | 도구 설명·FAQ·안내 페이지 콘텐츠 |
| `src/seo.mjs`, `scripts/build.mjs` | 메타·정적 HTML·사이트맵·manifest 생성 |
| `src/styles.css` | 공통·모바일·다크 스타일 |
| `worker/index.mjs` | URL·메타태그·네이버 시각 API |
| `worker/visitor-stats.mjs` | 자체 방문 집계, Durable Object 저장 |
| `src/SiteFooter.tsx`, `src/footer.mjs`, `src/visitor-client.mjs` | 푸터·방문 집계 클라이언트 |
| `public/notification-sw.js` | 알림 전용 서비스 워커. 오프라인 캐시 없음 |
| `wrangler.jsonc` | 운영 Worker·정적 파일·rate limit·방문 저장소 설정 |

## 5. 개발·배포·롤백

지원 Node: 22.22.2 이상인 Node 22, 또는 Node 24.15.0 이상. 기존 환경 Node 24.13.0에서는 jsdom 엔진 경고가 발생하므로 새 환경은 지원 버전을 사용합니다.

```sh
npm ci
npm test
SITE_URL=https://mypocketutility.com/ npm run build
npx wrangler deploy --dry-run
```

1. 변경 전 `git status`와 최신 커밋을 확인합니다. 사용자 미커밋 변경을 덮어쓰지 않습니다.
2. 필요한 테스트와 빌드를 통과시킵니다. `dist`는 결과물이며 직접 수정하지 않습니다.
3. main에 커밋·push하면 연결된 Cloudflare 빌드가 배포합니다. GitHub Actions의 Pages 배포와 구분합니다.
4. Cloudflare 설정: 프로젝트 `pocket-utility`, build `npm run build`, deploy `npx wrangler deploy`, 루트는 저장소 루트, build 변수 `SITE_URL=https://mypocketutility.com/`.
5. 실제 `/version.json`의 commit이 배포한 SHA와 일치하는지 확인합니다. push 성공만으로 배포 완료라고 말하지 않습니다.
6. 홈·도구·언어별 URL·사이트맵·API와 필요한 정적 코덱 파일을 확인합니다.
7. 문제 발생 시 수정 커밋 또는 `git revert <문제 커밋>`으로 복원합니다. 방문 데이터가 들어 있는 Durable Object의 이름·binding·migration은 임의 삭제하지 않습니다. 저장소 데이터의 롤백은 코드 롤백과 별개입니다.

GitHub Pages 미리보기는 SITE_URL 미설정 시 프로젝트 경로를 사용합니다. 본문·아이콘·manifest·코덱 URL도 이 base 경로를 따라야 합니다. 운영 API를 GitHub Pages에서 테스트하면 실패하는 것이 정상입니다.

## 6. 서버 API와 비용 경계

- `/api/expand-url`: 최대 8회 HTTP 이동 추적. 로그인·JS 리디렉션·보안 확인 화면은 실행하지 않습니다.
- `/api/inspect-url`: 최대 2MB HTML을 가져와 메타태그 검사. 이미지나 변환 파일 프록시가 아닙니다.
- `/api/naver-time`: 고정 네이버 Search Ads 주소의 HTTP Date. 인증된 표준시/공식 시간 API가 아닙니다.
- 위 API는 same-origin POST, URL·DNS·리디렉션 검사, 타임아웃, rate limiter를 적용합니다.
- `/api/visitor-stats`: 자체 카운터. 같은 브라우저를 한국 시간 기준 하루 한 번 집계. 누적은 일별 합계이며 생애 순방문자 수가 아닙니다. 상세는 `docs/VISITOR-COUNTER.md`.
- 정적 파일은 Assets, API는 Workers, 카운터는 SQLite Durable Object를 사용합니다. 원본 파일 변환은 기기 안에서 처리하지만 코덱 다운로드와 API 요청은 사용량이 발생합니다. 무제한 무료나 전 세계 통합 지출 상한을 보장하지 않습니다.
- GA4 조회 계정·비밀 키는 필요 없습니다. 이전 GA4 카운터는 자체 카운터로 교체됐습니다.

## 7. 분석·검색·광고·홈 화면

- GTM: `GTM-TWZHXWH8`, GA4 측정 ID: `G-37Q7F0TD0R`. GTM 공개 컨테이너에 연결되어 있으며 실제 수신은 GA4에서 확인합니다.
- AdSense: `ca-pub-1071029697771585` 확인 메타 태그만 적용. 광고 스크립트·광고 배치·승인 완료를 뜻하지 않습니다. 계정 승인 상태는 소유자 확인이 필요합니다.
- Naver 확인 태그: 공통 `index.html`에 저장. Google Search Console과 Naver Search Advisor 등록은 소유자가 진행했습니다.
- `/sitemap.xml`, `/robots.txt`, 페이지별 제목·설명·canonical·hreflang·OG·JSON-LD 생성.
- Google 검색 노출·favicon 반영은 보장되지 않습니다. Search Console의 실적 처리 대기 화면은 페이지 색인 실패와 다른 의미입니다. 색인 원인은 페이지 보고서/URL 검사로 확인합니다.
- 홈페이지 `/`는 브라우저 언어를 감지해 클라이언트에서 `/en/` 또는 `/ja/`로 전환합니다. 영어 검색 제목과 관련 가능성이 있어 한국어 고정+언어 이동 안내 방식이 제안됐지만 **아직 변경하지 않았습니다**. 다음 담당자는 의도 확인 후 변경합니다.
- favicon ICO(16/32/48px), PNG 32/192px, Apple touch 180px, manifest 192/512px.
- `/manifest.webmanifest`: 이름 MY POCKET UTILITY, 짧은 이름 MPU, standalone. 홈 화면 추가를 지원하지만 오프라인 사용·백그라운드 타이머는 보장하지 않습니다.
- `/webp/`의 기존 OG 이미지 문구는 WebP 중심입니다. 현재 페이지 제목·설명·메뉴에는 AVIF가 반영되어 있으나 OG 이미지 디자인을 새로 제작하지는 않았습니다.

## 8. 기존 제한 및 다음 점검

- 이미지 URL: CORS가 막힌 원본은 저장 후 파일 업로드로 안내. 중계 서버 추가 금지 원칙 유지.
- HEIC: heic-to 1.6.7 CDN 사용. PDF: PDF.js 5.4.624 CDN. 네트워크 장애와 메모리 한계 존재.
- 주차: 양력 1900~2100, 음력 1900~2050. 공휴일 데이터는 2026~2027 확인분. 다음 연도 추가 시 공식 월력 확인 필요.
- 시간: HTTP Date는 초 단위이며 CDN 시각일 수 있습니다. 수강 신청·티켓팅 정확성을 보장하지 않습니다.
- 알림: 브라우저 권한뿐 아니라 OS 방해금지·탭 절전·기기 수면 영향을 받습니다. 탭 종료 후 예약 알림 서버는 없습니다.
- mailto는 기본 이메일 앱 설정에 의존합니다.
- 우선 QA: 실제 AVIF 파일의 JPG/PNG/WebP 변환, PNG→AVIF 투명도, 대용량 모바일 메모리, 다국어 업로드 박스 정렬, iOS/Android 홈 화면 아이콘.
- 승인되지 않은 외부 API·유료 플랜·이미지 업로드 서버를 임의로 도입하지 않습니다.

## 9. 새 대화 시작 문구

> MY POCKET UTILITY 작업을 이어서 진행해줘. 저장소는 `/Users/ad1275/Documents/ChatGPT/Prototype/pocket-utility-seo`, GitHub는 `jaysong23/pocket-utility`, 운영 사이트는 `https://mypocketutility.com/`이야. 먼저 `docs/HANDOVER.md`와 git 상태를 읽고, 실제 `/version.json`으로 배포 상태를 확인해줘. AVIF 입출력과 업로드 박스 가운데 정렬을 추가한 상태야. 파일 변환은 반드시 브라우저 내부에서 처리하고 한·영·일 번역과 SEO를 유지해줘. 다음 요청: [여기에 할 일을 적기]
