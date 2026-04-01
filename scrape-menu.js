const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set a realistic user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  console.log('Loading Toast Tab menu...');
  await page.goto('https://order.toasttab.com/online/olympia-gyros-670-lake-joy-road-ste-150', {
    waitUntil: 'networkidle2',
    timeout: 45000
  });

  // Wait for menu content to load
  await new Promise(r => setTimeout(r, 5000));

  // Take a full screenshot of the menu
  await page.screenshot({ path: 'toast-menu-full.png', fullPage: true });
  console.log('Menu screenshot saved.');

  // Extract all text content from the page
  const content = await page.evaluate(() => document.body.innerText);
  require('fs').writeFileSync('toast-menu-text.txt', content);
  console.log('Menu text saved.');

  await browser.close();
})();
