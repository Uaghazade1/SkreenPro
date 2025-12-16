const { app, BrowserWindow, ipcMain, dialog, Menu, shell, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;

// Register custom protocol for OAuth callbacks
if (!isDev) {
  app.setAsDefaultProtocolClient('skreenpro');
}

function createWindow() {
  // Create icon - use PNG for dev, icns for production
  let icon = null;

  if (isDev) {
    // In development, use PNG (more reliable for hot reload)
    const pngPath = path.join(__dirname, 'public/icons/512-mac_converted.png');
    if (fs.existsSync(pngPath)) {
      icon = nativeImage.createFromPath(pngPath);
      console.log('Dev mode: Using PNG icon from', pngPath);
    } else {
      console.log('Dev mode: PNG icon not found at', pngPath);
    }
  } else {
    // In production, use icns
    const iconPath = path.join(__dirname, 'public/icons/icon.icns');
    if (fs.existsSync(iconPath)) {
      icon = nativeImage.createFromPath(iconPath);
      console.log('Production mode: Using icns icon from', iconPath);
    }
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: icon,
    webPreferences: {
      preload: path.join(__dirname, isDev ? 'src/preload/preload.js' : 'dist/preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // macOS menü uyarılarını önlemek için basit menü oluştur
  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        { role: 'close' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Handle OAuth callback URLs
app.on('open-url', (event, url) => {
  event.preventDefault();

  console.log('Received OAuth callback URL:', url);

  if (mainWindow) {
    if (url.startsWith('skreenpro://')) {
      // Forward the OAuth callback to the renderer
      mainWindow.webContents.send('oauth-callback', url);
    }
  }
});

app.whenReady().then(() => {
  // Set dock icon for macOS
  if (process.platform === 'darwin') {
    let dockIconPath;

    if (isDev) {
      // Use PNG in development
      dockIconPath = path.join(__dirname, 'public/icons/512-mac_converted.png');
    } else {
      // Use icns in production
      dockIconPath = path.join(__dirname, 'public/icons/icon.icns');
    }

    if (fs.existsSync(dockIconPath)) {
      const dockIcon = nativeImage.createFromPath(dockIconPath);
      app.dock.setIcon(dockIcon);
      console.log('Dock icon set from', dockIconPath);
    } else {
      console.log('Dock icon not found at', dockIconPath);
    }
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Open image file
ipcMain.handle('open-image', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Image',
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const imageBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1);
    const base64Image = `data:image/${ext};base64,${imageBuffer.toString('base64')}`;

    return {
      success: true,
      data: base64Image,
      filename: path.basename(filePath)
    };
  }

  return { success: false };
});

// Save image file
ipcMain.handle('save-image', async (event, imageData) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Image',
    defaultPath: 'SkreenPro-image.png',
    filters: [
      { name: 'PNG', extensions: ['png'] },
      { name: 'JPEG', extensions: ['jpg', 'jpeg'] },
    ]
  });

  if (!result.canceled && result.filePath) {
    try {
      // Remove data:image/png;base64, prefix
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(result.filePath, buffer);

      return { success: true, path: result.filePath };
    } catch (error) {
      console.error('Error saving image:', error);
      return { success: false, error: error.message };
    }
  }

  return { success: false };
});

// Open external URL in default browser
ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('Error opening external URL:', error);
    return { success: false, error: error.message };
  }
});
