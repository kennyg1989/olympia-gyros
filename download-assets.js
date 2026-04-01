const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const fullUrl = url.startsWith('//') ? 'https:' + url : url;
    const file = fs.createWriteStream(dest);
    https.get(fullUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Create assets directory
  const assetsDir = path.join(__dirname, 'assets', 'images');
  fs.mkdirSync(assetsDir, { recursive: true });

  // Load homepage
  await page.goto('https://www.olympia-gyros.com/', { waitUntil: 'networkidle2', timeout: 30000 });

  // Get ALL image URLs
  const images = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.map(img => ({
      src: img.src,
      alt: img.alt || '',
      width: img.naturalWidth,
      height: img.naturalHeight
    }));
  });

  console.log(`Found ${images.length} images:`);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const ext = img.src.includes('.png') ? '.png' : '.jpg';
    const name = `image-${i}${ext}`;
    const dest = path.join(assetsDir, name);

    console.log(`  [${i}] ${img.alt || 'no alt'} (${img.width}x${img.height}) -> ${name}`);
    console.log(`      ${img.src}`);

    try {
      await download(img.src, dest);
      console.log(`      Downloaded.`);
    } catch (e) {
      console.log(`      FAILED: ${e.message}`);
    }
  }

  // Also get background images from CSS
  const bgImages = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const bgs = [];
    elements.forEach(el => {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none' && bg.includes('url')) {
        const match = bg.match(/url\("?(.+?)"?\)/);
        if (match) bgs.push(match[1]);
      }
    });
    return [...new Set(bgs)];
  });

  console.log(`\nFound ${bgImages.length} background images:`);
  for (let i = 0; i < bgImages.length; i++) {
    const src = bgImages[i];
    const ext = src.includes('.png') ? '.png' : '.jpg';
    const name = `bg-${i}${ext}`;
    const dest = path.join(assetsDir, name);
    console.log(`  [${i}] ${src} -> ${name}`);
    try {
      await download(src, dest);
      console.log(`      Downloaded.`);
    } catch (e) {
      console.log(`      FAILED: ${e.message}`);
    }
  }

  await browser.close();
  console.log('\nDone!');
})();
