#!/usr/bin/env node

/**
 * Celebrity Image Converter
 * JPG/PNG → WebP (440x440, optimized)
 *
 * Usage:
 * node scripts/convert-to-webp.js input.jpg kpop/bts-jungkook.webp
 */

const sharp = require('sharp');
const path = require('path');

async function convertImage(inputPath, outputName) {
  try {
    const outputPath = path.join(__dirname, '..', 'images', 'celebrities', outputName);

    console.log(`Converting ${inputPath}...`);

    await sharp(inputPath)
      .resize(440, 440, {
        fit: 'cover',
        position: 'attention' // Smart crop - focuses on faces
      })
      .webp({
        quality: 80,
        effort: 6 // Higher = better compression
      })
      .toFile(outputPath);

    const stats = require('fs').statSync(outputPath);
    const sizeMB = (stats.size / 1024).toFixed(1);

    console.log(`✅ Success: ${outputPath}`);
    console.log(`   Size: ${sizeMB} KB`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// CLI
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
Usage:
  node scripts/convert-to-webp.js <input> <output>

Examples:
  node scripts/convert-to-webp.js downloaded.jpg kpop/bts-jungkook.webp
  node scripts/convert-to-webp.js iu.png kpop/iu.webp
  node scripts/convert-to-webp.js son.jpg athletes/son-heung-min.webp

Output will be saved to:
  images/celebrities/<output>
  `);
  process.exit(1);
}

const [inputPath, outputName] = args;
convertImage(inputPath, outputName);
