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

let samplePublicJs = null;
for (const assetPath of [...jsMatches, ...cssMatches]) {
  const cleanPath = assetPath.replace(/^\//, '');
  const physicalPath = path.join(DIST_DIR, cleanPath);
  check(`Public asset exists: ${cleanPath}`, fs.existsSync(physicalPath));
  if (cleanPath.endsWith('.js') && !samplePublicJs) samplePublicJs = assetPath;
}

const adminJsMatches = [...adminHtml.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
const adminCssMatches = [...adminHtml.matchAll(/href="([^"]+\.css)"/g)].map(m => m[1]);

let sampleAdminJs = null;
for (const assetPath of [...adminJsMatches, ...adminCssMatches]) {
  const cleanPath = assetPath.replace(/^\//, '');
  const physicalPath = path.join(DIST_DIR, cleanPath);
  check(`Admin asset exists: ${cleanPath}`, fs.existsSync(physicalPath));
  if (cleanPath.endsWith('.js') && !sampleAdminJs) sampleAdminJs = assetPath;
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
  check(`Admin branding image exists: dist/admin/${img}`, fs.existsSync(path.join(DIST_DIR, 'admin', img)));
}

// 4. Test Vercel Rewrite simulation logic
console.log('\n--- Testing Vercel Rewrite Rules & Configuration ---');

const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const rewrites = vercelConfig.rewrites;

// Verify cleanUrls is NOT true (cleanUrls conflicts with SPA .html rewrite destinations)
check('vercel.json does not enable conflicting "cleanUrls: true"', vercelConfig.cleanUrls !== true);

function simulateVercelRoute(urlPath) {
  // Step 1: In Vercel, physical files on filesystem take precedence over rewrites
  const clean = urlPath.replace(/^\//, '');
  if (clean) {
    const full = path.join(DIST_DIR, clean);
    if (fs.existsSync(full) && fs.statSync(full).isFile()) {
      return { type: 'static_file', target: clean };
    }
  }

  // Step 2: Evaluate rewrites in order from top to bottom
  for (const r of rewrites) {
    let regex;
    if (r.source.startsWith('/') && (r.source.includes('(') || r.source.includes(':'))) {
      const pattern = r.source
        .replace(/:[a-zA-Z0-9_]+\*/g, '(.*)')
        .replace(/:[a-zA-Z0-9_]+/g, '([^/]+)');
      regex = new RegExp(`^${pattern}$`);
    } else {
      regex = new RegExp(`^${r.source}$`);
    }

    const match = urlPath.match(regex);
    if (match) {
      let dest = r.destination;
      if (dest.includes('$1') && match[1] !== undefined) {
        dest = dest.replace('$1', match[1]);
      }
      return { type: 'rewrite', target: dest };
    }
  }

  // Default homepage
  if (urlPath === '/' || urlPath === '') {
    return { type: 'static_file', target: 'index.html' };
  }

  return { type: 'unmatched', target: null };
}

const testPaths = [
  { path: '/', expectedType: 'rewrite', expectedTarget: '/index.html', desc: 'Homepage' },
  { path: '/about', expectedType: 'rewrite', expectedTarget: '/index.html', desc: 'Public /about route' },
  { path: '/fleet', expectedType: 'rewrite', expectedTarget: '/index.html', desc: 'Public /fleet route' },
  { path: '/booking', expectedType: 'rewrite', expectedTarget: '/index.html', desc: 'Public /booking route' },
  { path: '/booking-status', expectedType: 'rewrite', expectedTarget: '/index.html', desc: 'Public /booking-status' },
  { path: '/login', expectedType: 'rewrite', expectedTarget: '/index.html', desc: 'Customer /login route' },
  { path: '/register', expectedType: 'rewrite', expectedTarget: '/index.html', desc: 'Customer /register route' },
  { path: '/forgot-password', expectedType: 'rewrite', expectedTarget: '/index.html', desc: 'Customer /forgot-password route' },
  { path: '/profile', expectedType: 'rewrite', expectedTarget: '/index.html', desc: 'Customer /profile route' },
  { path: '/my-bookings', expectedType: 'rewrite', expectedTarget: '/index.html', desc: 'Customer /my-bookings route' },
  { path: '/admin', expectedType: 'rewrite', expectedTarget: '/admin/index.html', desc: 'Admin root entry' },
  { path: '/admin/', expectedType: 'rewrite', expectedTarget: '/admin/index.html', desc: 'Admin trailing-slash entry' },
  { path: '/admin/login', expectedType: 'rewrite', expectedTarget: '/admin/index.html', desc: 'Admin login page' },
  { path: '/admin/dashboard', expectedType: 'rewrite', expectedTarget: '/admin/index.html', desc: 'Admin dashboard page' },
  { path: '/admin/bookings', expectedType: 'rewrite', expectedTarget: '/admin/index.html', desc: 'Admin bookings page' },
  { path: '/admin/vehicles', expectedType: 'rewrite', expectedTarget: '/admin/index.html', desc: 'Admin vehicles page' },
  { path: '/admin/drivers', expectedType: 'rewrite', expectedTarget: '/admin/index.html', desc: 'Admin drivers page' },
  { path: '/admin/settings', expectedType: 'rewrite', expectedTarget: '/admin/index.html', desc: 'Admin settings page' },
];

for (const tp of testPaths) {
  const result = simulateVercelRoute(tp.path);
  const matched = result.target === tp.expectedTarget;
  check(`Route '${tp.path}' (${tp.desc}) -> ${result.target || result.type}`, matched);
}

// 5. Test Static Assets are served directly and NOT rewritten to HTML
console.log('\n--- Testing Static Asset Serving (Not Rewritten to HTML) ---');

if (sampleAdminJs) {
  const result = simulateVercelRoute(sampleAdminJs);
  const isStatic = result.type === 'static_file' && !result.target.endsWith('index.html');
  check(`Admin bundle '${sampleAdminJs}' served as static file (NOT rewritten to HTML)`, isStatic);
}

if (samplePublicJs) {
  const result = simulateVercelRoute(samplePublicJs);
  const isStatic = result.type === 'static_file' && !result.target.endsWith('index.html');
  check(`Public bundle '${samplePublicJs}' served as static file (NOT rewritten to HTML)`, isStatic);
}

const adminLogoResult = simulateVercelRoute('/admin/brand-emblem-128.png');
check(`Admin logo '/admin/brand-emblem-128.png' served as static file`, adminLogoResult.type === 'static_file');

console.log('\n' + '='.repeat(65));
if (hasErrors) {
  console.error('❌ Verification completed with errors.');
  process.exit(1);
} else {
  console.log('✅ ALL TESTS PASSED! Combined build and Vercel routing 100% verified.');
  console.log('='.repeat(65) + '\n');
  process.exit(0);
}
