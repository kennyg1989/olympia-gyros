const puppeteer = require('puppeteer');
const https = require('https');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  console.log('Loading Google Maps page...');
  await page.goto('https://www.google.com/maps/place/Olympia+Gyros/@32.5485006,-83.6902367,3a,75y,90t/data=!3m8!1e2!3m6!1sCIHM0ogKEICAgIDngL7LRA!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fgps-cs-s%2FAHVAwergAwe8G8huC7FW-APKZIX098-R5HDc3IzOxmXk7c2FMqIszZbVNifFVNOLKVU3wFfMxB11zS2hBYzatBE4BFlqD2objZ2VXyTFDZuDbZJ8wdazQN-qQOFLnK4em-sWWgdz-V7M%3Dw86-h94-k-no!7i1920!8i2113!4m16!1m8!3m7!1s0x88f3dde3be2e7f03:0x7d39908f455fb204!2sOlympia+Gyros!8m2!3d32.548523!4d-83.6900936!10e5!16s%2Fg%2F11kb_q8dqj!3m6!1s0x88f3dde3be2e7f03:0x7d39908f455fb204!8m2!3d32.548523!4d-83.6900936!10e5!16s%2Fg%2F11kb_q8dqj?entry=ttu', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: 'assets/images/maps-screenshot.png', fullPage: false });
  console.log('Maps screenshot saved.');

  // Try to find all large images on the page
  const images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img'))
      .filter(img => img.naturalWidth > 200 || img.src.includes('googleusercontent'))
      .map(img => ({ src: img.src, width: img.naturalWidth, height: img.naturalHeight }));
  });
  console.log('Found images:', JSON.stringify(images, null, 2));

  await browser.close();
})();
