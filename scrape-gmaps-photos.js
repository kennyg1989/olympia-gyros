const puppeteer = require('puppeteer');
const https = require('https');
const fs = require('fs');
const path = require('path');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        download(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

(async () => {
  const outDir = path.join(__dirname, 'assets', 'images', 'google');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Go directly to the place page
  console.log('Loading Google Maps...');
  await page.goto('https://www.google.com/maps/place/Olympia+Gyros/@32.548523,-83.6900936,17z', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  await new Promise(r => setTimeout(r, 3000));

  // Click on the main photo to open the gallery
  console.log('Looking for photo gallery...');

  // Try clicking the first photo/image area
  const clicked = await page.evaluate(() => {
    // Try various selectors for the photo area
    const selectors = [
      'button[jsaction*="photo"]',
      '[data-photo-index="0"]',
      'img[decoding="async"]',
      '.aoRNLd',
      'a[data-value="See photos"]'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) { el.click(); return sel; }
    }
    return null;
  });
  console.log('Clicked:', clicked);
  await new Promise(r => setTimeout(r, 4000));

  // Now try to collect all images multiple times as we scroll
  const allUrls = new Set();

  for (let scroll = 0; scroll < 5; scroll++) {
    const urls = await page.evaluate(() => {
      const found = [];
      document.querySelectorAll('img').forEach(img => {
        if (img.src && img.src.includes('googleusercontent.com') && !img.src.includes('avatar') && img.naturalWidth > 100) {
          const match = img.src.match(/(https:\/\/lh[0-9]*\.googleusercontent\.com\/[^=]+)/);
          if (match) found.push(match[1]);
        }
      });
      // Also check all a[href] with photo references
      document.querySelectorAll('a[href*="googleusercontent"], div[style*="googleusercontent"]').forEach(el => {
        const html = el.outerHTML;
        const matches = html.match(/(https:\/\/lh[0-9]*\.googleusercontent\.com\/[^="')\s]+)/g);
        if (matches) matches.forEach(m => {
          const clean = m.replace(/=.*$/, '');
          found.push(clean);
        });
      });
      return found;
    });

    urls.forEach(u => allUrls.add(u));
    console.log(`Scroll ${scroll + 1}: found ${urls.length} images (${allUrls.size} unique total)`);

    // Scroll down in the photo panel
    await page.evaluate(() => {
      const panels = document.querySelectorAll('[role="main"], .section-scrollbox, [class*="photos"]');
      panels.forEach(p => p.scrollBy(0, 800));
      window.scrollBy(0, 800);
    });
    await new Promise(r => setTimeout(r, 2000));
  }

  // Take a screenshot to see what state we're in
  await page.screenshot({ path: 'assets/images/google/debug-maps.png' });

  console.log(`\nTotal unique base URLs: ${allUrls.size}`);

  let i = 0;
  for (const baseUrl of allUrls) {
    const fullUrl = baseUrl + '=w1200-h1200-k-no';
    const name = `gmap-${i}.jpg`;
    console.log(`Downloading ${name}: ${baseUrl.substring(0, 80)}...`);
    try {
      await download(fullUrl, path.join(outDir, name));
      const stat = fs.statSync(path.join(outDir, name));
      if (stat.size > 5000) {
        console.log(`  OK (${(stat.size / 1024).toFixed(0)}KB)`);
        i++;
      } else {
        fs.unlinkSync(path.join(outDir, name));
        console.log(`  Too small, skipped`);
      }
    } catch (e) {
      console.log(`  FAILED: ${e.message}`);
    }
  }

  await browser.close();
  console.log(`\nDone! Downloaded ${i} photos.`);
})();
