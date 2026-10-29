// 바탕화면 전체를 덮는 투명 창 + 트레이 메뉴
const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage, systemPreferences } = require('electron');
const fs = require('fs'), path = require('path');

let uiohook = null;

try {
  uiohook = require('uiohook-napi').uIOhook;
} catch (e) {
  console.warn('전역 키보드 감지를 사용하려면 uiohook-napi 설치가 필요합니다.');
}

let win, tray, active = new Set();

const CH = path.join(__dirname, 'characters');

const ids = () =>
  fs.readdirSync(CH, { withFileTypes: true })
    .filter(d =>
      d.isDirectory() &&
      fs.existsSync(path.join(CH, d.name, 'character.json'))
    )
    .map(d => d.name);

const nameOf = id => {
  try {
    return JSON.parse(
      fs.readFileSync(
        path.join(CH, id, 'character.json'),
        'utf8'
      )
    ).name || id;
  } catch {
    return id;
  }
};

function buildTray() {
  tray.setContextMenu(
    Menu.buildFromTemplate([
      ...ids().map(id => ({
        label: nameOf(id),
        type: 'checkbox',
        checked: active.has(id),
        click: () => {
          win.webContents.send('toggle', id);
        }
      })),
      { type: 'separator' },
      {
        label: '이미지/설정 새로고침',
        click: () => win.webContents.reload()
      },
      {
        label: '종료',
        click: () => app.quit()
      }
    ])
  );
}

app.whenReady().then(() => {
  const wa = screen.getPrimaryDisplay().workArea;

  win = new BrowserWindow({
    x: wa.x,
    y: wa.y,
    width: wa.width,
    height: wa.height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  // macOS supports the floating window level more reliably than screen-saver.
  win.setAlwaysOnTop(true, process.platform === 'darwin' ? 'floating' : 'screen-saver');
  win.setIgnoreMouseEvents(true, { forward: true });
  // 맥 전용: 독 아이콘 숨기고(메뉴바 아이콘만 사용), 전체화면 앱 위에서도 보이게
  if (process.platform === 'darwin') {
    app.dock?.hide();
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }

  win.loadFile('index.html');

  if (uiohook) {
    uiohook.on('keydown', () => {
      if (win && !win.isDestroyed()) {
        win.webContents.send('typing-activity');
      }
    });

    const startHook = () => {
      try {
        uiohook.start();
      } catch (e) {
        console.warn('키보드 감지 시작 실패:', e.message);
      }
    };

    if (process.platform === 'darwin' && !systemPreferences.isTrustedAccessibilityClient(true)) {
      // 맥은 '손쉬운 사용' 권한을 허용해야 키 입력을 읽을 수 있어요. 허용될 때까지 3초마다 확인합니다.
      const timer = setInterval(() => {
        if (systemPreferences.isTrustedAccessibilityClient(false)) {
          clearInterval(timer);
          startHook();
        }
      }, 3000);
    } else {
      startHook();
    }
  }

  // 창의 마우스 이벤트 통과 여부 제어
  ipcMain.on('ignore', (e, v) => {
    if (win && !win.isDestroyed()) {
      win.setIgnoreMouseEvents(v, { forward: true });
    }
  });

  // 활성 캐릭터 목록 업데이트
  ipcMain.on('active', (e, list) => {
    active = new Set(list);
    buildTray();
  });

  // 캐릭터 ID 목록 반환
  ipcMain.handle('ids', () => ids());

  // ✅ index.html의 '종료하기' 버튼에서 보낸 요청 처리
  ipcMain.on('quit', () => {
    app.quit();
  });

  // 시스템 트레이 아이콘
  const trayIconPath = path.join(__dirname, 'shared', 'tray_icon.png');
  tray = new Tray(
    process.platform === 'darwin'
      ? nativeImage.createFromPath(trayIconPath).resize({ width: 18, height: 18 }) // 맥 메뉴바용 작은 크기
      : trayIconPath
  );

  tray.setToolTip('TTERIAN_PET');
  buildTray();
});

// 앱 종료 시 키보드 감지 기능 정리
app.on('will-quit', () => {
  try {
    if (uiohook) uiohook.stop();
  } catch {}
});

app.on('window-all-closed', () => {
  app.quit();
});