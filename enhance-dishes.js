const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inDir = path.join(__dirname, 'assets', 'dishes');
const outDir = path.join(__dirname, 'assets', 'dishes-enhanced');
fs.mkdirSync(outDir, { recursive: true });

async function enhance(filename) {
  const inPath = path.join(inDir, filename);
  const outPath = path.join(outDir, filename);

  try {
    // Get metadata
    const meta = await sharp(inPath).metadata();

    // Crop center 70% to remove text labels and teal edges
    const cropSize = Math.round(Math.min(meta.width, meta.height) * 0.7);
    const left = Math.round((meta.width - cropSize) / 2);
    const top = Math.round((meta.height - cropSize) / 2) - Math.round(cropSize * 0.05); // shift up slightly to favor food over labels

    await sharp(inPath)
      .extract({
        left: Math.max(0, left),
        top: Math.max(0, top),
        width: Math.min(cropSize, meta.width - left),
        height: Math.min(cropSize, meta.height - Math.max(0, top))
      })
      .resize(500, 500, { fit: 'cover' })
      // Warm it up: boost saturation, slight contrast
      .modulate({
        brightness: 1.05,
        saturation: 1.3,
      })
      .sharpen({ sigma: 1.2 })
      .gamma(1.1) // slight warmth
      .jpeg({ quality: 90 })
      .toFile(outPath);

    console.log(`  ✓ ${filename}`);
  } catch (e) {
    console.log(`  ✗ ${filename}: ${e.message}`);
  }
}

(async () => {
  const files = fs.readdirSync(inDir).filter(f => f.endsWith('.jpg'));
  console.log(`Enhancing ${files.length} dish photos...`);

  for (const file of files) {
    await enhance(file);
  }

  console.log('\nDone! Enhanced photos in assets/dishes-enhanced/');
})();
