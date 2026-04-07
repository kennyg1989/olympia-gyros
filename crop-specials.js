const sharp = require('sharp');

async function cropSpecial(input, output, topPct, bottomPct) {
  const meta = await sharp(input).metadata();
  const top = Math.round(meta.height * topPct);
  const bottom = Math.round(meta.height * bottomPct);
  const height = bottom - top;

  await sharp(input)
    .extract({ left: 0, top, width: meta.width, height })
    .jpeg({ quality: 90 })
    .toFile(output);

  const newMeta = await sharp(output).metadata();
  console.log(`${input} -> ${output} (${newMeta.width}x${newMeta.height})`);
}

(async () => {
  // Crop to just the chalkboard area — remove phone UI and dark space
  await cropSpecial('assets/images/specials-lunch.jpg', 'assets/images/specials-lunch-cropped.jpg', 0.08, 0.85);
  await cropSpecial('assets/images/specials-dinner.jpg', 'assets/images/specials-dinner-cropped.jpg', 0.08, 0.85);
  console.log('Done!');
})();
