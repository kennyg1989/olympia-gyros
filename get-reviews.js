const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  await page.goto('https://www.google.com/search?q=olympia+gyros+kathleen+ga+reviews', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  await new Promise(r => setTimeout(r, 2000));

  const text = await page.evaluate(() => document.body.innerText);

  // Look for rating patterns
  const lines = text.split('\n').filter(l => l.match(/\d\.\d.*review|star|rating/i) || l.match(/^\d\.\d$/));
  console.log('Rating-related lines:');
  lines.forEach(l => console.log('  ', l.trim()));

  // Get all text near "reviews"
  const reviewIdx = text.indexOf('review');
  if (reviewIdx > -1) {
    console.log('\nContext around "review":');
    console.log(text.substring(Math.max(0, reviewIdx - 200), reviewIdx + 200));
  }

  await page.screenshot({ path: 'google-reviews.png' });
  await browser.close();
})();
