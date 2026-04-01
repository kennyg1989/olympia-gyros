const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  const filePath = 'file:///' + path.resolve('banner-options.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'preview-banner-options.png', fullPage: true });
  console.log('Banner options preview saved.');

  await browser.close();
})();
