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
    const clampedLeft = Math.max(0, Math.min(left, metadata.width - 1));
    const clampedTop = Math.max(0, Math.min(top, metadata.height - 1));
    const clampedWidth = Math.min(width, metadata.width - clampedLeft);
    const clampedHeight = Math.min(height, metadata.height - clampedTop);

    try {
      await sharp(inputFile)
        .extract({ left: clampedLeft, top: clampedTop, width: clampedWidth, height: clampedHeight })
        .resize(400, 400, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toFile(path.join(outDir, `${name}.jpg`));
      console.log(`  ✓ ${name}`);
    } catch (e) {
      console.log(`  ✗ ${name}: ${e.message}`);
    }
  }
}

(async () => {
  // Image 4 (menu1.jpg) - 1275x1650
  // The image has a Greek key border at top (~45px) and bottom
  // 3 columns, ~4 rows of circular dish photos with labels below
  // Each cell is roughly 425w x 380h
  // But photos are circular and centered in their cells
  const c4 = 425; // column width
  const r4 = 380; // row height
  const t4 = 55;  // top offset past border

  await cropImage('assets/images/image-4.jpg', [
    // Row 1
    { name: 'steak-bowl',       left: 30,        top: t4,            width: 380, height: 340 },
    { name: 'shawarma-bowl',    left: 30 + c4,   top: t4,            width: 380, height: 340 },
    { name: 'med-chop-steak',   left: 30 + c4*2, top: t4,            width: 380, height: 340 },
    // Row 2
    { name: 'greek-salad-gyro', left: 30,        top: t4 + r4,       width: 380, height: 340 },
    { name: 'gyro-platter',     left: 30 + c4,   top: t4 + r4,       width: 380, height: 340 },
    { name: 'chicken-bowl',     left: 30 + c4*2, top: t4 + r4,       width: 380, height: 340 },
    // Row 3
    { name: 'shrimp-bowl',      left: 30,        top: t4 + r4*2,     width: 380, height: 340 },
    { name: 'falafel-bowl',     left: 30 + c4,   top: t4 + r4*2,     width: 380, height: 340 },
    { name: 'spanakopita',      left: 30 + c4*2, top: t4 + r4*2,     width: 380, height: 340 },
    // Row 4 (bottom row - slightly different spacing, includes dessert cakes)
    { name: 'greek-burger',     left: 30,        top: t4 + r4*3,     width: 380, height: 340 },
    { name: 'desserts-1',       left: 30 + c4,   top: t4 + r4*3,     width: 380, height: 340 },
    { name: 'gyro-melt',        left: 30 + c4*2, top: t4 + r4*3,     width: 380, height: 340 },
  ]);

  // Image 5 (2.jpg) - 1275x1650 (same dimensions as image 4 after download)
  // Same grid structure
  await cropImage('assets/images/image-5.jpg', [
    // Row 1
    { name: 'shrimp-scampi',      left: 30,        top: t4,            width: 380, height: 340 },
    { name: 'chicken-alfredo',    left: 30 + c4,   top: t4,            width: 380, height: 340 },
    { name: 'chicken-sicilian',   left: 30 + c4*2, top: t4,            width: 380, height: 340 },
    // Row 2
    { name: 'shawarma-platter',   left: 30,        top: t4 + r4,       width: 380, height: 340 },
    { name: 'salmon-piccata',     left: 30 + c4,   top: t4 + r4,       width: 380, height: 340 },
    { name: 'lasagna',            left: 30 + c4*2, top: t4 + r4,       width: 380, height: 340 },
    // Row 3
    { name: 'med-pork-chops',     left: 30,        top: t4 + r4*2,     width: 380, height: 340 },
    { name: 'chicken-parmigiana', left: 30 + c4,   top: t4 + r4*2,     width: 380, height: 340 },
    { name: 'pasta-mama-mia',     left: 30 + c4*2, top: t4 + r4*2,     width: 380, height: 340 },
    // Row 4
    { name: 'baywest-salmon',     left: 30,        top: t4 + r4*3,     width: 380, height: 340 },
    { name: 'desserts-2',         left: 30 + c4,   top: t4 + r4*3,     width: 380, height: 340 },
    { name: 'chicken-souvlaki',   left: 30 + c4*2, top: t4 + r4*3,     width: 380, height: 340 },
  ]);

  console.log('\nDone!');
})();
