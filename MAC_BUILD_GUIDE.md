# TTERIAN_PET macOS 빌드 가이드

Windows EXE 설치 파일에서 복구한 Electron 앱을 기반으로 구성했습니다. 이 ZIP 안에는 **완성된 Mac 앱이 아니라 Mac에서 빌드할 프로젝트**가 있습니다.

1. Mac에 Node.js LTS 설치: https://nodejs.org/
2. ZIP 압축을 풀고 터미널을 엽니다.
3. 프로젝트 폴더에서 `npm install` 후 `npm start`로 실행 테스트합니다.
4. `npm run dist:mac`을 실행하면 `dist/`에 Apple Silicon(arm64)과 Intel(x64)용 DMG/ZIP이 생성됩니다.
   또는 `build-mac.command`를 터미널에서 실행하세요.

참고: 최초 빌드에는 인터넷 연결이 필요합니다. 서명되지 않은 앱은 macOS Gatekeeper에서 실행이 제한될 수 있습니다. 본인 Mac에서 시스템 설정 > 개인정보 보호 및 보안의 실행 허용 안내를 확인하세요. 외부 배포에는 Apple Developer ID 서명 및 공증을 권장합니다.

**키보드 감지:** `uiohook-napi`가 macOS의 손쉬운 사용 또는 입력 모니터링 권한을 요구할 수 있습니다. 권한을 주지 않으면 타이핑 애니메이션이 작동하지 않을 수 있습니다.

**주의:** Mac에서 실제 구동/빌드 테스트를 수행하지 못했습니다. Mac 환경 및 Electron 버전에 따른 창 투명도/마우스 클릭 통과/트레이 동작은 테스트하고 수정해야 할 수 있습니다. 이 프로젝트에는 원본 Windows 실행 파일 대신 복구된 앱 코드/에셋을 사용했습니다.
