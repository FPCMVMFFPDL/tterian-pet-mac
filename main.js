// 바탕화면 전체를 덮는 투명 창 + 트레이 메뉴
const { app, BrowserWindow, Tray, Menu, ipcMain, screen } = require('electron');
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
  win.loadFile('index.html');

  if (uiohook) {
    uiohook.on('keydown', () => {
      if (win && !win.isDestroyed()) {
        win.webContents.send('typing-activity');
      }
    });

    try {
      uiohook.start();
    } catch (e) {
      console.warn('키보드 감지 시작 실패:', e.message);
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
  tray = new Tray(
    path.join(__dirname, 'shared', 'tray_icon.png')
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