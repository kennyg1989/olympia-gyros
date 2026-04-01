const sharp = require('sharp');
const path = require('path');

const outDir = path.join(__dirname, 'assets', 'dishes-enhanced');

// These specific images have text too close to the food — need aggressive top-biased crop
const problemCrops = [
  'falafel-bowl.jpg',
  'shrimp-bowl.jpg',
  'chicken-souvlaki.jpg',
  'baywest-salmon.jpg',
  'gyro-melt.jpg',
  'chicken-bowl.jpg',
  'steak-bowl.jpg',
  'shawarma-bowl.jpg',
  'med-chop-steak.jpg',
  'greek-salad-gyro.jpg',
  'shrimp-scampi.jpg',
  'chicken-alfredo.jpg',
  'chicken-sicilian.jpg',
  'shawarma-platter.jpg',
  'med-pork-chops.jpg',
];

async function fixCrop(filename) {
  const inPath = path.join(__dirname, 'assets', 'dishes', filename);
  const outPath = path.join(outDir, filename);

  const meta = await sharp(inPath).metadata();

  // Take top 50% of height, center horizontally — this avoids bottom text entirely
  const cropH = Math.round(meta.height * 0.50);
  const cropW = Math.min(meta.width, cropH); // square-ish
  const left = Math.round((meta.width - cropW) / 2);
  const top = Math.round(meta.height * 0.05); // start just below top edge

  try {
    await sharp(inPath)
      .extract({
        left: Math.max(0, left),
        top,
        width: Math.min(cropW, meta.width - Math.max(0, left)),
        height: Math.min(cropH, meta.height - top)
      })
      .resize(500, 500, { fit: 'cover' })
      .modulate({ brightness: 1.05, saturation: 1.25 })
      .sharpen({ sigma: 1 })
      .gamma(1.1)
      .jpeg({ quality: 90 })
      .toFile(outPath);
    console.log(`  ✓ ${filename}`);
  } catch (e) {
    console.log(`  ✗ ${filename}: ${e.message}`);
  }
}

(async () => {
  console.log(`Fixing ${problemCrops.length} problem crops...`);
  for (const f of problemCrops) {
    await fixCrop(f);
  }
  console.log('Done!');
})();
