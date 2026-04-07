const sharp = require('sharp');

async function cropSpecial(input, output, topPct, bottomPct, leftPct, rightPct) {
  const meta = await sharp(input).metadata();
  const top = Math.round(meta.height * topPct);
  const bottom = Math.round(meta.height * bottomPct);
  const left = Math.round(meta.width * leftPct);
  const right = Math.round(meta.width * rightPct);

  await sharp(input)
    .extract({ left, top, width: right - left, height: bottom - top })
    .jpeg({ quality: 90 })
    .toFile(output);

  const newMeta = await sharp(output).metadata();
  console.log(`${input} -> ${output} (${newMeta.width}x${newMeta.height})`);
}

(async () => {
  // Tighter crop — remove more black on all sides
  await cropSpecial('assets/images/specials-lunch.jpg', 'assets/images/specials-lunch-cropped.jpg', 0.15, 0.78, 0.05, 0.95);
  await cropSpecial('assets/images/specials-dinner.jpg', 'assets/images/specials-dinner-cropped.jpg', 0.15, 0.78, 0.05, 0.95);
  console.log('Done!');
})();
