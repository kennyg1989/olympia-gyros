const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const filePath = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');

  // Mobile view
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(filePath, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'preview-mobile.png', fullPage: true });
  console.log('Mobile preview saved.');

  // Desktop view
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(filePath, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'preview-desktop.png', fullPage: true });
  console.log('Desktop preview saved.');

  await browser.close();
})();
