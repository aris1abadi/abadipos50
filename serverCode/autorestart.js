import chokidar from 'chokidar';
import { exec } from 'child_process';

const PM2_APP_NAME = 'abadipos'; // Ganti dengan nama aplikasi Anda di PM2

// Fungsi untuk me-restart server menggunakan PM2
const restartServer = () => {
    console.log('🔄 Restarting server via PM2...');
    exec(`pm2 restart ${PM2_APP_NAME}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error restarting server: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`⚠️ STDERR: ${stderr}`);
        }
        console.log(`✅ Server restarted: ${stdout}`);
    });
};

// Pantau folder untuk perubahan
const watcher = chokidar.watch('./static/images', {
    ignored: /(^|[\/\\])\../, // Abaikan file tersembunyi
    persistent: true,
});

// Event saat file baru ditambahkan
watcher.on('add', (path) => {
    console.log(`📂 File baru terdeteksi: ${path}`);
    restartServer();
});

// Tangani proses keluar dengan baik
process.on('SIGINT', () => {
    console.log('🛑 Shutting down watcher...');
    process.exit();
});
