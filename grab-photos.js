const https = require('https');
const fs = require('fs');
const path = require('path');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

(async () => {
  // The Google Maps image base URL - we can request it at any resolution by changing the params
  const baseUrl = 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwergAwe8G8huC7FW-APKZIX098-R5HDc3IzOxmXk7c2FMqIszZbVNifFVNOLKVU3wFfMxB11zS2hBYzatBE4BFlqD2objZ2VXyTFDZuDbZJ8wdazQN-qQOFLnK4em-sWWgdz-V7M';

  // Request full resolution (original is 1920x2113)
  const fullResUrl = baseUrl + '=w1920-h2113-k-no';
  const medResUrl = baseUrl + '=w1200-h1200-k-no';

  console.log('Downloading interior photo at full res...');
  await download(fullResUrl, path.join('assets', 'images', 'interior-full.jpg'));
  console.log('Done - interior-full.jpg');

  console.log('Downloading interior photo at medium res...');
  await download(medResUrl, path.join('assets', 'images', 'interior-med.jpg'));
  console.log('Done - interior-med.jpg');
})();
