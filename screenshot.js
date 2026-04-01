const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Homepage - full page screenshot
  await page.goto('https://www.olympia-gyros.com/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.screenshot({ path: 'before-homepage.png', fullPage: true });
  console.log('Homepage screenshot saved.');

  // Contact page - full page screenshot
  await page.goto('https://www.olympia-gyros.com/contact', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.screenshot({ path: 'before-contact.png', fullPage: true });
  console.log('Contact page screenshot saved.');

  await browser.close();
})();
