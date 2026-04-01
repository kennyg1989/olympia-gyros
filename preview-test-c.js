const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  const filePath = 'file:///' + path.resolve('index-test-c.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'preview-option-c.png', fullPage: false });
  console.log('Option C in-context preview saved.');

  // Scroll to show banner + menu
  await page.evaluate(() => window.scrollTo(0, 600));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'preview-option-c-scrolled.png', fullPage: false });
  console.log('Option C scrolled preview saved.');

  await browser.close();
})();
