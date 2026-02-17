
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "جيم الجلاء برو - نظام إدارة الاشتراكات",
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true // إخفاء القوائم العلوية لجعل المظهر احترافياً
  });

  // في بيئة التطوير نستخدم الملف المحلي، وفي الإنتاج نستخدم مسار ملف index.html
  win.loadFile('index.html');
  
  // فتح البرنامج بملء الشاشة عند الرغبة
  // win.maximize();
}

app.whenReady().then(() => {
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
