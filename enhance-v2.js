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
    const meta = await sharp(inPath).metadata();

    // Crop center 55% — much tighter to really cut out all text/labels
    const cropRatio = 0.55;
    const cropSize = Math.round(Math.min(meta.width, meta.height) * cropRatio);
    const left = Math.round((meta.width - cropSize) / 2);
    // Shift up 10% of crop size to favor food over bottom text labels
    const top = Math.max(0, Math.round((meta.height - cropSize) / 2) - Math.round(cropSize * 0.12));

    await sharp(inPath)
      .extract({
        left: Math.max(0, left),
        top: Math.max(0, top),
        width: Math.min(cropSize, meta.width - Math.max(0, left)),
        height: Math.min(cropSize, meta.height - Math.max(0, top))
      })
      .resize(500, 500, { fit: 'cover' })
      .modulate({
        brightness: 1.05,
        saturation: 1.25,
      })
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
  const files = fs.readdirSync(inDir).filter(f => f.endsWith('.jpg'));
  console.log(`Re-enhancing ${files.length} dish photos (tighter crop)...`);
  for (const file of files) {
    await enhance(file);
  }
  console.log('\nDone!');
})();
