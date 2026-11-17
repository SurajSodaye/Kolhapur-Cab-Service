import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('\n=================================================================');
console.log('  Kolhapur Cab Service — Starting Unified Development Environment');
console.log('=================================================================');
console.log('  • Public Website  : http://localhost:3000/');
console.log('  • Admin Login     : http://localhost:3000/admin/login');
console.log('  • Admin Dev Direct: http://localhost:5174/admin/login');
console.log('=================================================================\n');

// 1. Launch Admin Dashboard Vite Dev Server (port 5174)
const adminProcess = spawn('npm', ['--prefix', 'admin-dashboard', 'run', 'dev'], {
  cwd: rootDir,
  shell: true,
  stdio: 'inherit',
});

// 2. Launch Public Website Vite Dev Server (port 3000, proxies /admin -> :5174)
const publicProcess = spawn('npm', ['--prefix', 'public-site', 'run', 'dev'], {
  cwd: rootDir,
  shell: true,
  stdio: 'inherit',
});

const cleanup = () => {
  if (adminProcess && !adminProcess.killed) {
    adminProcess.kill();
  }
  if (publicProcess && !publicProcess.killed) {
    publicProcess.kill();
  }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
