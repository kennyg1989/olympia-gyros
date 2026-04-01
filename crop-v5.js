const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const outDir = path.join(__dirname, 'assets', 'dishes-enhanced');

async function cropImage(inputFile, crops) {
  const metadata = await sharp(inputFile).metadata();
  console.log(`Processing ${inputFile} (${metadata.width}x${metadata.height})`);

  const colW = metadata.width / 3;
  const rowH = metadata.height / 4;

  for (const crop of crops) {
    const { name, col, row } = crop;

    // Focus on top 55% of each cell to avoid text labels at bottom
    const left = Math.round(colW * col + colW * 0.08);
    const top = Math.round(rowH * row + rowH * 0.02);
    const w = Math.round(colW * 0.84);
    const h = Math.round(rowH * 0.55);
    const size = Math.min(w, h);

    // Center the square crop
    const cx = left + Math.round((w - size) / 2);
    const cy = top + Math.round((h - size) / 2);

    try {
      await sharp(inputFile)
        .extract({
          left: Math.max(0, cx),
          top: Math.max(0, cy),
          width: Math.min(size, metadata.width - Math.max(0, cx)),
          height: Math.min(size, metadata.height - Math.max(0, cy))
        })
        .resize(500, 500, { fit: 'cover' })
        .jpeg({ quality: 92 })
        .toFile(path.join(outDir, `${name}.jpg`));
      console.log(`  ✓ ${name}`);
    } catch (e) {
      console.log(`  ✗ ${name}: ${e.message}`);
    }
  }
}

(async () => {
  await cropImage('assets/images/greek1-v2.png', [
    { name: 'steak-bowl',       col: 0, row: 0 },
    { name: 'shawarma-bowl',    col: 1, row: 0 },
    { name: 'med-chop-steak',   col: 2, row: 0 },
    { name: 'greek-salad-gyro', col: 0, row: 1 },
    { name: 'gyro-platter',     col: 1, row: 1 },
    { name: 'chicken-bowl',     col: 2, row: 1 },
    { name: 'shrimp-bowl',      col: 0, row: 2 },
    { name: 'falafel-bowl',     col: 1, row: 2 },
    { name: 'spanakopita',      col: 2, row: 2 },
    { name: 'greek-burger',     col: 0, row: 3 },
    { name: 'desserts-1',       col: 1, row: 3 },
    { name: 'gyro-melt',        col: 2, row: 3 },
  ]);

  await cropImage('assets/images/greek2-v2.jpg', [
    { name: 'shrimp-scampi',      col: 0, row: 0 },
    { name: 'chicken-alfredo',    col: 1, row: 0 },
    { name: 'chicken-sicilian',   col: 2, row: 0 },
    { name: 'shawarma-platter',   col: 0, row: 1 },
    { name: 'salmon-piccata',     col: 1, row: 1 },
    { name: 'lasagna',            col: 2, row: 1 },
    { name: 'med-pork-chops',     col: 0, row: 2 },
    { name: 'chicken-parmigiana', col: 1, row: 2 },
    { name: 'pasta-mama-mia',     col: 2, row: 2 },
    { name: 'baywest-salmon',     col: 0, row: 3 },
    { name: 'desserts-2',         col: 1, row: 3 },
    { name: 'chicken-souvlaki',   col: 2, row: 3 },
  ]);

  console.log('\nDone!');
})();
