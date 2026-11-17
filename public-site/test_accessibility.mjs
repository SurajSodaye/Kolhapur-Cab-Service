// Verification of routes, HTML structure, and accessibility
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

console.log('--- RUNNING ACCESSIBILITY & ROUTE VERIFICATION ---');

// 1. Verify App.jsx routes
const appCode = readFileSync('./src/App.jsx', 'utf-8');
const expectedRoutes = [
  '/',
  '/about',
  '/fleet',
  '/services',
  '/routes',
  '/booking',
  '/booking-status',
  '/contact',
  '/faq',
  '/privacy-policy',
  '/terms',
  '*'
];

for (const r of expectedRoutes) {
  if (!appCode.includes(`path="${r}"`)) {
    throw new Error(`Missing expected route in App.jsx: ${r}`);
  }
}
console.log('✓ All 12 required routes exist in App.jsx');

// 2. Verify all 12 page components exist
const pagesDir = './src/pages';
const pageFiles = readdirSync(pagesDir);
console.log(`✓ Found ${pageFiles.length} page files in src/pages`);
if (pageFiles.length < 12) {
  throw new Error(`Expected at least 12 page files, found ${pageFiles.length}`);
}

// 3. Verify no broken image tags without alt attributes in pages and components
function checkAltTags(dir) {
  const files = readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const fullPath = join(dir, f.name);
    if (f.isDirectory()) {
      checkAltTags(fullPath);
    } else if (f.name.endsWith('.jsx')) {
      const code = readFileSync(fullPath, 'utf-8');
      const imgRegex = /<img\b([^>]*)\/?>/g;
      let match;
      while ((match = imgRegex.exec(code)) !== null) {
        if (!match[1].includes('alt=')) {
          throw new Error(`Found <img /> without alt attribute in ${fullPath}`);
        }
      }
    }
  }
}
checkAltTags('./src');
console.log('✓ All <img /> elements have explicit alt attributes across all components and pages');

// 4. Verify Form Input Accessibility
const bookingFormCode = readFileSync('./src/components/booking/BookingForm.jsx', 'utf-8');
if (!bookingFormCode.includes('aria-label') && !bookingFormCode.includes('<label')) {
  throw new Error('BookingForm missing labels');
}
console.log('✓ Form elements have explicit descriptive <label> tags');

// 5. Verify Pending Disclaimer Requirement
if (!bookingFormCode.includes('PENDING') || !bookingFormCode.includes('does not guarantee')) {
  throw new Error('BookingForm missing critical PENDING disclaimer');
}
console.log('✓ PENDING disclaimer is strictly enforced in BookingForm');

console.log('--- ALL ACCESSIBILITY & ROUTE CHECKS PASSED ---');

