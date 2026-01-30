#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const celebDir = path.join(__dirname, '..', 'images', 'celebrities');

async function convertAllImages() {
  console.log('🔄 Converting all images to WebP...\n');

  const categories = ['kpop', 'actors', 'athletes', 'artists', 'business', 'politicians', 'directors'];
  let converted = 0;

  for (const category of categories) {
    const categoryDir = path.join(celebDir, category);

    if (!fs.existsSync(categoryDir)) continue;

    const files = fs.readdirSync(categoryDir);

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();

      // Skip if already webp
      if (ext === '.webp') continue;

      // Only convert image files
      if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) continue;

      const inputPath = path.join(categoryDir, file);
      const baseName = path.basename(file, ext);
      const outputPath = path.join(categoryDir, baseName + '.webp');

      try {
        await sharp(inputPath)
          .resize(440, 440, {
            fit: 'cover',
            position: 'attention'
          })
          .webp({ quality: 80 })
          .toFile(outputPath);

        const stats = fs.statSync(outputPath);
        const sizeMB = (stats.size / 1024).toFixed(1);

        console.log(`✅ ${category}/${baseName}.webp (${sizeMB} KB)`);

        // Delete original
        fs.unlinkSync(inputPath);

        converted++;
      } catch (error) {
        console.error(`❌ Failed: ${file} - ${error.message}`);
      }
    }
  }

  console.log(`\n🎉 Converted ${converted} images to WebP!`);
}

convertAllImages();
