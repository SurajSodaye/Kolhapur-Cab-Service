import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const PORT = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  // Strip query string and hash
  const rawPath = req.url.split('?')[0].split('#')[0];
  const urlPath = decodeURIComponent(rawPath);
  const isAdmin = urlPath === '/admin' || urlPath.startsWith('/admin/');

  // 1. Check if exact physical file exists in dist
  let candidatePath = path.join(distDir, urlPath);

  // If path is a directory, check for index.html inside
  if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isDirectory()) {
    candidatePath = path.join(candidatePath, 'index.html');
  }

  if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
    const ext = path.extname(candidatePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(candidatePath).pipe(res);
    return;
  }

  // 2. SPA Rewrites matching vercel.json:
  // - /admin/** -> dist/admin/index.html
  // - /** -> dist/index.html
  const fallbackHtml = isAdmin
    ? path.join(distDir, 'admin', 'index.html')
    : path.join(distDir, 'index.html');

  if (fs.existsSync(fallbackHtml)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(fallbackHtml).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found — Please build the project first using `npm run build`.');
  }
});

server.listen(PORT, () => {
  console.log(`\n=================================================================`);
  console.log(`  Kolhapur Cab Service — Local Unified Preview Server`);
  console.log(`=================================================================`);
  console.log(`  Serving combined build from: ${distDir}`);
  console.log(`  • Public Site     : http://localhost:${PORT}/`);
  console.log(`  • Admin Login     : http://localhost:${PORT}/admin/login`);
  console.log(`  • Admin Dashboard : http://localhost:${PORT}/admin/dashboard`);
  console.log(`=================================================================\n`);
});
