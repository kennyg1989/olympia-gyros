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

  // Direct downloads of the two interior photos at full res
  const directPhotos = [
    {
      name: 'interior-1.jpg',
      base: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepVQaReFESU40s8kvotHqhmtldJ8fe8Uw7Zn0ocPMk2LwOKtvmSxVnXzUUfsIUQxhmGaYflG_cchIahS9vmedY-b9mrJpt_snt9XiRxyGP4NZO1X2VHCB6ToiOBCXruSVVHBm0y',
      origW: 3060, origH: 4080
    },
    {
      name: 'interior-2.jpg',
      base: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepvWUpHCOyKkm0jXmM6FkipPB_QpVcom6GIjV_Y-okoDdZ9yiM4isMDRXa6m5p7XpOB5z6VvV_NNqwZv_u3iptR7iY7AKUGbib9s7WKaYwD8w-fJZJBrHhcO5hGAgjYSYIZynPv',
      origW: 3000, origH: 4000
    },
    {
      name: 'storefront.jpg',
      base: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwergAwe8G8huC7FW-APKZIX098-R5HDc3IzOxmXk7c2FMqIszZbVNifFVNOLKVU3wFfMxB11zS2hBYzatBE4BFlqD2objZ2VXyTFDZuDbZJ8wdazQN-qQOFLnK4em-sWWgdz-V7M',
      origW: 1920, origH: 2113
    }
  ];

  for (const photo of directPhotos) {
    const url = `${photo.base}=w${photo.origW}-h${photo.origH}-k-no`;
    console.log(`Downloading ${photo.name}...`);
    try {
      await download(url, path.join(outDir, photo.name));
      const stat = fs.statSync(path.join(outDir, photo.name));
      console.log(`  Done (${(stat.size / 1024).toFixed(0)}KB)`);
    } catch (e) {
      console.log(`  FAILED: ${e.message}`);
    }
  }

  // Now scrape more photos from Google Maps listing
  console.log('\nScraping Google Maps photos page...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Go to the Google Maps listing photos tab
  await page.goto('https://www.google.com/maps/place/Olympia+Gyros/@32.548523,-83.6900936,17z/data=!1m1!4s!3m6!1s0x88f3dde3be2e7f03:0x7d39908f455fb204!8m2!3d32.548523!4d-83.6900936!10e5!16s%2Fg%2F11kb_q8dqj', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  await new Promise(r => setTimeout(r, 3000));

  // Try clicking on the photos section
  try {
    const photoButton = await page.$('button[aria-label*="photo"], [data-photo-index], a[href*="photos"]');
    if (photoButton) {
      await photoButton.click();
      await new Promise(r => setTimeout(r, 3000));
    }
  } catch(e) {
    console.log('No photo button found, trying direct approach...');
  }

  // Get all googleusercontent image URLs from the page
  const imageUrls = await page.evaluate(() => {
    const urls = new Set();
    // Get all img elements
    document.querySelectorAll('img').forEach(img => {
      if (img.src && img.src.includes('googleusercontent.com')) {
        // Extract base URL (before the size params)
        const match = img.src.match(/(https:\/\/lh3\.googleusercontent\.com\/[^=]+)/);
        if (match) urls.add(match[1]);
      }
    });
    // Also check background images
    document.querySelectorAll('*').forEach(el => {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg.includes('googleusercontent.com')) {
        const match = bg.match(/(https:\/\/lh3\.googleusercontent\.com\/[^=]+)/);
        if (match) urls.add(match[1]);
      }
    });
    // Check divs with style attribute
    document.querySelectorAll('[style*="googleusercontent"]').forEach(el => {
      const match = el.getAttribute('style').match(/(https:\/\/lh3\.googleusercontent\.com\/[^=)"']+)/g);
      if (match) match.forEach(u => urls.add(u));
    });
    return [...urls];
  });

  console.log(`Found ${imageUrls.length} unique Google image URLs`);

  // Download each at high resolution
  for (let i = 0; i < imageUrls.length; i++) {
    const baseUrl = imageUrls[i];
    const fullUrl = baseUrl + '=w1200-h1200-k-no';
    const name = `gmap-${i}.jpg`;
    console.log(`  Downloading ${name}...`);
    try {
      await download(fullUrl, path.join(outDir, name));
      const stat = fs.statSync(path.join(outDir, name));
      console.log(`    Done (${(stat.size / 1024).toFixed(0)}KB)`);
    } catch (e) {
      console.log(`    FAILED: ${e.message}`);
    }
  }

  await browser.close();
  console.log('\nAll done!');
})();
