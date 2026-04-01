const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  const filePath = 'file:///' + path.resolve('banner-options-v2.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'preview-banner-v2.png', fullPage: true });
  console.log('Done.');

  await browser.close();
})();
