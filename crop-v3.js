const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const outDir = path.join(__dirname, 'assets', 'dishes');
fs.mkdirSync(outDir, { recursive: true });

async function cropImage(inputFile, crops) {
  const metadata = await sharp(inputFile).metadata();
  console.log(`Processing ${inputFile} (${metadata.width}x${metadata.height})`);

  for (const crop of crops) {
    const { name, left, top, width, height } = crop;
    const l = Math.round(left * metadata.width);
    const t = Math.round(top * metadata.height);
    const w = Math.min(Math.round(width * metadata.width), metadata.width - l);
    const h = Math.min(Math.round(height * metadata.height), metadata.height - t);

    try {
      await sharp(inputFile)
        .extract({ left: l, top: t, width: w, height: h })
        .resize(500, 500, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toFile(path.join(outDir, `${name}.jpg`));
      console.log(`  ✓ ${name} (${l},${t} ${w}x${h})`);
    } catch (e) {
      console.log(`  ✗ ${name}: ${e.message}`);
    }
  }
}

(async () => {
  // greek1.webp - 3x4 grid + bottom row
  // Using proportional coordinates (0-1) so it works regardless of resolution
  const colW = 0.33;
  const rowH = 0.23;
  const topPad = 0.04; // Greek key border at top

  await cropImage('assets/images/greek1.webp', [
    // Row 1
    { name: 'steak-bowl',       left: 0.01,       top: topPad,              width: 0.31, height: 0.21 },
    { name: 'shawarma-bowl',    left: 0.34,       top: topPad,              width: 0.31, height: 0.21 },
    { name: 'med-chop-steak',   left: 0.67,       top: topPad,              width: 0.31, height: 0.21 },
    // Row 2
    { name: 'greek-salad-gyro', left: 0.01,       top: topPad + rowH,       width: 0.31, height: 0.21 },
    { name: 'gyro-platter',     left: 0.34,       top: topPad + rowH,       width: 0.31, height: 0.21 },
    { name: 'chicken-bowl',     left: 0.67,       top: topPad + rowH,       width: 0.31, height: 0.21 },
    // Row 3
    { name: 'shrimp-bowl',      left: 0.01,       top: topPad + rowH * 2,   width: 0.31, height: 0.21 },
    { name: 'falafel-bowl',     left: 0.34,       top: topPad + rowH * 2,   width: 0.31, height: 0.21 },
    { name: 'spanakopita',      left: 0.67,       top: topPad + rowH * 2,   width: 0.31, height: 0.21 },
    // Row 4
    { name: 'greek-burger',     left: 0.01,       top: topPad + rowH * 3,   width: 0.31, height: 0.21 },
    { name: 'desserts-1',       left: 0.34,       top: topPad + rowH * 3,   width: 0.31, height: 0.21 },
    { name: 'gyro-melt',        left: 0.67,       top: topPad + rowH * 3,   width: 0.31, height: 0.21 },
  ]);

  // greek2.webp - same grid structure
  await cropImage('assets/images/greek2.webp', [
    // Row 1
    { name: 'shrimp-scampi',      left: 0.01,  top: topPad,              width: 0.31, height: 0.21 },
    { name: 'chicken-alfredo',    left: 0.34,  top: topPad,              width: 0.31, height: 0.21 },
    { name: 'chicken-sicilian',   left: 0.67,  top: topPad,              width: 0.31, height: 0.21 },
    // Row 2
    { name: 'shawarma-platter',   left: 0.01,  top: topPad + rowH,       width: 0.31, height: 0.21 },
    { name: 'salmon-piccata',     left: 0.34,  top: topPad + rowH,       width: 0.31, height: 0.21 },
    { name: 'lasagna',            left: 0.67,  top: topPad + rowH,       width: 0.31, height: 0.21 },
    // Row 3
    { name: 'med-pork-chops',     left: 0.01,  top: topPad + rowH * 2,   width: 0.31, height: 0.21 },
    { name: 'chicken-parmigiana', left: 0.34,  top: topPad + rowH * 2,   width: 0.31, height: 0.21 },
    { name: 'pasta-mama-mia',     left: 0.67,  top: topPad + rowH * 2,   width: 0.31, height: 0.21 },
    // Row 4
    { name: 'baywest-salmon',     left: 0.01,  top: topPad + rowH * 3,   width: 0.31, height: 0.21 },
    { name: 'desserts-2',         left: 0.34,  top: topPad + rowH * 3,   width: 0.31, height: 0.21 },
    { name: 'chicken-souvlaki',   left: 0.67,  top: topPad + rowH * 3,   width: 0.31, height: 0.21 },
  ]);

  console.log('\nDone!');
})();
