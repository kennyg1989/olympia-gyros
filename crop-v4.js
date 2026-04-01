const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const outDir = path.join(__dirname, 'assets', 'dishes-enhanced');
fs.mkdirSync(outDir, { recursive: true });

async function cropImage(inputFile, crops) {
  const metadata = await sharp(inputFile).metadata();
  console.log(`Processing ${inputFile} (${metadata.width}x${metadata.height})`);

  for (const crop of crops) {
    const { name, col, row } = crop;
    // 3 columns, 4 rows grid with text labels below each photo
    // Use proportional coords
    const colW = metadata.width / 3;
    const rowH = metadata.height / 4;

    // Center of each cell, take a square crop focused on the plate
    const centerX = colW * col + colW / 2;
    const centerY = rowH * row + rowH * 0.4; // bias upward to avoid text
    const size = Math.min(colW, rowH) * 0.75; // 75% of cell size

    const left = Math.max(0, Math.round(centerX - size / 2));
    const top = Math.max(0, Math.round(centerY - size / 2));
    const w = Math.min(Math.round(size), metadata.width - left);
    const h = Math.min(Math.round(size), metadata.height - top);

    try {
      await sharp(inputFile)
        .extract({ left, top, width: w, height: h })
        .resize(500, 500, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toFile(path.join(outDir, `${name}.jpg`));
      console.log(`  ✓ ${name} (${left},${top} ${w}x${h})`);
    } catch (e) {
      console.log(`  ✗ ${name}: ${e.message}`);
    }
  }
}

(async () => {
  // greek1-v2: 3 cols x 4 rows
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

  // greek2-v2: 3 cols x 4 rows
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
