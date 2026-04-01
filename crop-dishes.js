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
    // Clamp to image bounds
    const clampedWidth = Math.min(width, metadata.width - left);
    const clampedHeight = Math.min(height, metadata.height - top);

    try {
      await sharp(inputFile)
        .extract({ left, top, width: clampedWidth, height: clampedHeight })
        .resize(400, 400, { fit: 'cover' })
        .jpeg({ quality: 85 })
        .toFile(path.join(outDir, `${name}.jpg`));
      console.log(`  ✓ ${name}`);
    } catch (e) {
      console.log(`  ✗ ${name}: ${e.message}`);
    }
  }
}

(async () => {
  // Image 4 (menu1.jpg) - 1224x1584, 3 columns x ~4.5 rows
  // Grid: ~3 cols, each ~408px wide; rows ~320px tall; top border ~50px
  const colW1 = 408, rowH1 = 320, padTop1 = 50, padLeft1 = 0;
  await cropImage('assets/images/image-4.jpg', [
    // Row 1
    { name: 'steak-bowl',        left: 0,          top: padTop1,              width: colW1, height: rowH1 },
    { name: 'shawarma-bowl',     left: colW1,      top: padTop1,              width: colW1, height: rowH1 },
    { name: 'med-chop-steak',    left: colW1 * 2,  top: padTop1,              width: colW1, height: rowH1 },
    // Row 2
    { name: 'greek-salad-gyro',  left: 0,          top: padTop1 + rowH1,      width: colW1, height: rowH1 },
    { name: 'gyro-platter',      left: colW1,      top: padTop1 + rowH1,      width: colW1, height: rowH1 },
    { name: 'chicken-bowl',      left: colW1 * 2,  top: padTop1 + rowH1,      width: colW1, height: rowH1 },
    // Row 3
    { name: 'shrimp-bowl',       left: 0,          top: padTop1 + rowH1 * 2,  width: colW1, height: rowH1 },
    { name: 'falafel-bowl',      left: colW1,      top: padTop1 + rowH1 * 2,  width: colW1, height: rowH1 },
    { name: 'spanakopita',       left: colW1 * 2,  top: padTop1 + rowH1 * 2,  width: colW1, height: rowH1 },
    // Row 4
    { name: 'greek-burger',      left: 0,          top: padTop1 + rowH1 * 3,  width: colW1, height: rowH1 },
    { name: 'desserts-1',        left: colW1,      top: padTop1 + rowH1 * 3,  width: colW1, height: rowH1 },
    { name: 'gyro-melt',         left: colW1 * 2,  top: padTop1 + rowH1 * 3,  width: colW1, height: rowH1 },
  ]);

  // Image 5 (2.jpg) - 720x932, 3 columns x ~4 rows
  const colW2 = 240, rowH2 = 230, padTop2 = 30;
  await cropImage('assets/images/image-5.jpg', [
    // Row 1
    { name: 'shrimp-scampi',     left: 0,          top: padTop2,              width: colW2, height: rowH2 },
    { name: 'chicken-alfredo',   left: colW2,      top: padTop2,              width: colW2, height: rowH2 },
    { name: 'chicken-sicilian',  left: colW2 * 2,  top: padTop2,              width: colW2, height: rowH2 },
    // Row 2
    { name: 'shawarma-platter',  left: 0,          top: padTop2 + rowH2,      width: colW2, height: rowH2 },
    { name: 'salmon-piccata',    left: colW2,      top: padTop2 + rowH2,      width: colW2, height: rowH2 },
    { name: 'lasagna',           left: colW2 * 2,  top: padTop2 + rowH2,      width: colW2, height: rowH2 },
    // Row 3
    { name: 'med-pork-chops',    left: 0,          top: padTop2 + rowH2 * 2,  width: colW2, height: rowH2 },
    { name: 'chicken-parmigiana',left: colW2,      top: padTop2 + rowH2 * 2,  width: colW2, height: rowH2 },
    { name: 'pasta-mama-mia',    left: colW2 * 2,  top: padTop2 + rowH2 * 2,  width: colW2, height: rowH2 },
    // Row 4
    { name: 'baywest-salmon',    left: 0,          top: padTop2 + rowH2 * 3,  width: colW2, height: rowH2 },
    { name: 'desserts-2',        left: colW2,      top: padTop2 + rowH2 * 3,  width: colW2, height: rowH2 },
    { name: 'chicken-souvlaki',  left: colW2 * 2,  top: padTop2 + rowH2 * 3,  width: colW2, height: rowH2 },
  ]);

  console.log('\nDone! Cropped dishes saved to assets/dishes/');
})();
