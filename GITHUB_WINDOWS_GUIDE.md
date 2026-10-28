# Windows에서 Mac 설치파일(DMG) 만들기

## 1. GitHub 저장소 만들기
- https://github.com 접속 후 가입/로그인
- 오른쪽 + > New repository
- Repository name: `tterian-pet-mac`
- Private 선택 권장 (소스코드와 캐릭터 이미지가 들어 있습니다)
- Create repository

## 2. 코드 올리기 (쉬운 방법)
- 이 ZIP의 `TTERIAN_PET_mac` 폴더를 열고 **폴더 안에 있는 파일 전체**를 선택합니다. `.github` 폴더도 포함해야 합니다. Windows 탐색기에서 '보기 > 표시 > 숨긴 항목' 체크.
- GitHub 저장소에서 `uploading an existing file` 또는 Add file > Upload files 선택.
- GitHub 웹에서 `.github` 같은 숨김폴더 업로드가 어려우면 GitHub Desktop을 사용하세요: https://desktop.github.com/
- Commit changes 클릭합니다.

## 3. 빌드 시작
- GitHub 저장소 상단 Actions 탭
- `Build TTERIAN PET for Mac` 선택
- Run workflow > Run workflow 클릭 (push했으면 자동 시작될 수도 있음)
- 빌드가 초록색으로 완료되면 실행 항목 클릭
- 하단 Artifacts > `TTERIAN_PET_Mac_installers` 다운로드
- 압축 해제하면 .dmg 파일들이 있습니다. arm64는 Apple Silicon(M1 이상), x64는 Intel Mac용입니다.

## 4. Mac에서 설치
- Mac 사용자가 .dmg를 더블클릭
- 열린 창에서 TTERIAN_PET 앱 아이콘을 Applications 폴더로 드래그
- 서명/공증하지 않았으므로 macOS 보안 설정에서 별도 실행 허용이 필요할 수 있습니다.

## 주의 사항
- 이 아카이브는 Windows 설치 파일에서 복구·재구성한 프로젝트입니다. macOS 빌드 성공 및 실제 실행은 아직 검증되지 않았습니다.
- `uiohook-napi`의 macOS 입력 모니터링 권한 및 네이티브 모듈 호환성 문제가 생길 수 있습니다.
- GitHub Actions macOS 실행에는 이용 한도/요금이 적용될 수 있습니다.
- `.github/workflows/build-mac.yml` 파일이 저장소의 맨 위 경로에 있는지 확인하세요.
- 빌드가 실패하면 Actions의 빨간 로그를 복사해 공유해 주세요.
