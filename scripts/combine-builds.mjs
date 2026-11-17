/**
 * Combine Builds Script for Kolhapur Cab Service
 * 
 * Assembles both standalone React+Vite production build outputs into a single
 * unified deployment directory for Vercel:
 *   - dist/       -> Public Website (serves / and public routes)
 *   - dist/admin/ -> Admin Dashboard (serves /admin and /admin/* routes)
 * 
 * Safety:
 *   - Only cleans the root deployment directory 'dist/'.
 *   - Never deletes or modifies source files in public-site or admin-dashboard.
 */

import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const rootDist = path.resolve(rootDir, 'dist');
const publicDist = path.resolve(rootDir, 'public-site', 'dist');
const adminDist = path.resolve(rootDir, 'admin-dashboard', 'dist');

console.log('='.repeat(65));
console.log('  Kolhapur Cab Service — Assembling Unified Deployment Build');
console.log('='.repeat(65));

// 1. Verify that both standalone builds exist
if (!fs.existsSync(publicDist) || !fs.existsSync(path.join(publicDist, 'index.html'))) {
  console.error('\n❌ ERROR: Public site build not found at:', publicDist);
  console.error('Run "npm --prefix public-site run build" first.\n');
  process.exit(1);
}

if (!fs.existsSync(adminDist) || !fs.existsSync(path.join(adminDist, 'index.html'))) {
  console.error('\n❌ ERROR: Admin dashboard build not found at:', adminDist);
  console.error('Run "npm --prefix admin-dashboard run build" first.\n');
  process.exit(1);
}

// 2. Safely clean ONLY the root dist folder
if (fs.existsSync(rootDist)) {
  console.log(`• Cleaning previous root deployment folder: ${rootDist}`);
  fs.rmSync(rootDist, { recursive: true, force: true });
}
fs.mkdirSync(rootDist, { recursive: true });

// 3. Copy public site build to root dist (handles '/')
console.log(`• Copying public website build -> dist/`);
fs.cpSync(publicDist, rootDist, { recursive: true });

// 4. Copy admin dashboard build to root dist/admin/ (handles '/admin')
const adminTarget = path.join(rootDist, 'admin');
console.log(`• Copying admin dashboard build -> dist/admin/`);
fs.mkdirSync(adminTarget, { recursive: true });
fs.cpSync(adminDist, adminTarget, { recursive: true });

// 5. Verification checks
const publicIndex = path.join(rootDist, 'index.html');
const adminIndex = path.join(rootDist, 'admin', 'index.html');

if (!fs.existsSync(publicIndex) || !fs.existsSync(adminIndex)) {
  console.error('\n❌ ERROR: Combined build assembly verification failed!');
  process.exit(1);
}

console.log('\n' + '='.repeat(65));
console.log('✅ Combined build successfully assembled!');
console.log('• Public Website entrypoint : dist/index.html');
console.log('• Admin Dashboard entrypoint: dist/admin/index.html');
console.log('• Ready for Vercel deployment with vercel.json routing.');
console.log('='.repeat(65) + '\n');
