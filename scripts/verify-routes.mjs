/**
 * Route & Asset Verification Script for Kolhapur Cab Service
 * 
 * Verifies that the combined build in 'dist/' contains all required entrypoints,
 * assets, images, and correctly matches Vercel rewrite rules.
 */

import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve('dist');

console.log('='.repeat(65));
console.log('  Kolhapur Cab Service — Local Build & Route Verification');
console.log('='.repeat(65));

let hasErrors = false;

function check(desc, condition) {
  if (condition) {
    console.log(`✓ ${desc}`);
  } else {
    console.error(`❌ FAILED: ${desc}`);
    hasErrors = true;
  }
}

// 1. Check entrypoints
const publicIndex = path.join(DIST_DIR, 'index.html');
const adminIndex = path.join(DIST_DIR, 'admin', 'index.html');

check('Public site entrypoint exists (dist/index.html)', fs.existsSync(publicIndex));
check('Admin dashboard entrypoint exists (dist/admin/index.html)', fs.existsSync(adminIndex));

const publicHtml = fs.readFileSync(publicIndex, 'utf8');
const adminHtml = fs.readFileSync(adminIndex, 'utf8');

check('Public HTML contains root title "Kolhapur Cab Service"', publicHtml.includes('Kolhapur Cab Service'));
check('Public HTML references /assets/ CSS and JS', publicHtml.includes('/assets/index-'));

check('Admin HTML contains title "Admin Workspace"', adminHtml.includes('Admin Workspace'));
check('Admin HTML correctly references /admin/assets/ bundles', adminHtml.includes('/admin/assets/index-'));
check('Admin HTML references /admin/favicon.png and emblem', adminHtml.includes('/admin/favicon.png'));

// 2. Check bundled asset files physically exist on disk
const jsMatches = [...publicHtml.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
const cssMatches = [...publicHtml.matchAll(/href="([^"]+\.css)"/g)].map(m => m[1]);

for (const assetPath of [...jsMatches, ...cssMatches]) {
  const cleanPath = assetPath.replace(/^\//, '');
  const physicalPath = path.join(DIST_DIR, cleanPath);
  check(`Public asset exists: ${cleanPath}`, fs.existsSync(physicalPath));
}

const adminJsMatches = [...adminHtml.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
const adminCssMatches = [...adminHtml.matchAll(/href="([^"]+\.css)"/g)].map(m => m[1]);

for (const assetPath of [...adminJsMatches, ...adminCssMatches]) {
  const cleanPath = assetPath.replace(/^\//, '');
  const physicalPath = path.join(DIST_DIR, cleanPath);
  check(`Admin asset exists: ${cleanPath}`, fs.existsSync(physicalPath));
}

// 3. Check shared branding images in dist
const brandImages = [
  'brand-emblem-128.png',
  'brand-emblem-64.png',
  'brand-emblem.png',
  'brand-logo-dark.png',
  'brand-logo.png',
  'hero-western-ghats.jpg',
  'favicon.png',
  'favicon.ico'
];

for (const img of brandImages) {
  check(`Root branding image exists: dist/${img}`, fs.existsSync(path.join(DIST_DIR, img)));
}

// 4. Test Vercel Rewrite simulation logic
console.log('\n--- Testing Vercel Rewrite Rules ---');

const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const rewrites = vercelConfig.rewrites;

function simulateVercelRoute(urlPath) {
  // Check physical static file first (must be a file, not a directory)
  const clean = urlPath.replace(/^\//, '');
  if (clean) {
    const full = path.join(DIST_DIR, clean);
    if (fs.existsSync(full) && fs.statSync(full).isFile()) {
      return { type: 'static_file', target: clean };
    }
  }

  // Evaluate rewrites in order
  for (const r of rewrites) {
    if (r.source === '/admin/:path*' && (urlPath.startsWith('/admin/') || urlPath === '/admin/')) {
      return { type: 'rewrite', target: r.destination };
    }
    if (r.source === '/admin' && urlPath === '/admin') {
      return { type: 'rewrite', target: r.destination };
    }
    if (r.source === '/((?!admin).*)' && !urlPath.startsWith('/admin')) {
      return { type: 'rewrite', target: r.destination };
    }
  }

  // Default homepage
  if (urlPath === '/' || urlPath === '') {
    return { type: 'static_file', target: 'index.html' };
  }

  return { type: 'unmatched', target: null };
}

const testPaths = [
  { path: '/', expectedTarget: '/index.html', desc: 'Homepage' },
  { path: '/about', expectedTarget: '/index.html', desc: 'Public /about route' },
  { path: '/fleet', expectedTarget: '/index.html', desc: 'Public /fleet route' },
  { path: '/booking', expectedTarget: '/index.html', desc: 'Public /booking route' },
  { path: '/booking-status', expectedTarget: '/index.html', desc: 'Public /booking-status' },
  { path: '/admin', expectedTarget: '/admin/index.html', desc: 'Admin root entry' },
  { path: '/admin/login', expectedTarget: '/admin/index.html', desc: 'Admin login page' },
  { path: '/admin/dashboard', expectedTarget: '/admin/index.html', desc: 'Admin dashboard page' },
  { path: '/admin/bookings', expectedTarget: '/admin/index.html', desc: 'Admin bookings page' },
  { path: '/admin/vehicles', expectedTarget: '/admin/index.html', desc: 'Admin vehicles page' },
  { path: '/admin/drivers', expectedTarget: '/admin/index.html', desc: 'Admin drivers page' },
  { path: '/admin/settings', expectedTarget: '/admin/index.html', desc: 'Admin settings page' },
];

for (const tp of testPaths) {
  const result = simulateVercelRoute(tp.path);
  const matched = result.target === tp.expectedTarget;
  check(`Route '${tp.path}' (${tp.desc}) -> ${result.target || result.type}`, matched);
}

console.log('\n' + '='.repeat(65));
if (hasErrors) {
  console.error('❌ Verification completed with errors.');
  process.exit(1);
} else {
  console.log('✅ ALL TESTS PASSED! Combined build is 100% verified.');
  console.log('='.repeat(65) + '\n');
  process.exit(0);
}
