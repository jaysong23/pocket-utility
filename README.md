# Image Pocket

브라우저에서 HEIC/HEIF, WebP, JPG, PNG 이미지를 변환하는 도구입니다.

- FROM: 자동 감지 / HEIC·HEIF / WebP / JPG / PNG
- TO: JPG / PNG / WebP
- 드래그 앤 드롭, 여러 파일 순차 변환, 품질 설정, 다운로드
- 사용자 이미지는 서버로 전송하지 않습니다.

## 개발

Node.js 22 이상에서 `npm install` 후 `npm run build`를 실행합니다. 생성된 `dist`가 배포 파일입니다.

- `src/App.tsx`: 화면과 변환 로직
- `src/styles.css`: 디자인
- `scripts/build.mjs`: 정적 빌드
- `.github/workflows/pages.yml`: main 업데이트 시 GitHub Pages 자동 배포

GitHub Settings → Pages → Source를 GitHub Actions로 설정하세요.

## 지원 범위

HEIC 최초 변환 시 jsDelivr에서 heic-to 1.6.7 디코더를 불러오므로 인터넷 연결이 필요합니다. 사진은 전송하지 않습니다. EXIF 등 메타데이터와 Live Photo 동영상은 보존하지 않습니다. 애니메이션 WebP는 지원하지 않습니다. 최대 40메가픽셀 검사는 디코딩 후에 적용됩니다. 매우 큰 원본은 기기 메모리를 많이 사용할 수 있습니다.

HEIC 실제 파일 및 브라우저별 호환성 검증은 추가로 필요합니다.
