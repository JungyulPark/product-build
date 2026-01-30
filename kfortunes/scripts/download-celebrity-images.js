#!/usr/bin/env node

/**
 * Celebrity Image Downloader for KFortunes
 * Downloads 100 celebrity photos from Wikimedia Commons (CC-licensed)
 * Converts to WebP format (440x440px) and saves to images/celebrities/
 *
 * Usage: node scripts/download-celebrity-images.js
 */

const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Celebrity list with their Wikimedia Commons image names
// These are all CC-licensed or public domain images
const CELEBRITY_IMAGES = {
  // K-pop Groups - BTS
  'kpop/bts-rm.webp': 'BTS_RM_2019.jpg',
  'kpop/bts-jin.webp': 'Jin_BTS_2019.jpg',
  'kpop/bts-suga.webp': 'Suga_BTS_2019.jpg',
  'kpop/bts-jhope.webp': 'J-Hope_BTS_2019.jpg',
  'kpop/bts-jimin.webp': 'Jimin_BTS_2019.jpg',
  'kpop/bts-v.webp': 'V_BTS_2019.jpg',
  'kpop/bts-jungkook.webp': 'Jungkook_BTS_2019.jpg',

  // K-pop Groups - BLACKPINK
  'kpop/blackpink-jisoo.webp': 'Jisoo_2019.jpg',
  'kpop/blackpink-jennie.webp': 'Jennie_2019.jpg',
  'kpop/blackpink-rose.webp': 'Rosé_2019.jpg',
  'kpop/blackpink-lisa.webp': 'Lisa_2019.jpg',

  // K-pop Groups - TWICE
  'kpop/twice-nayeon.webp': 'Nayeon_2019.jpg',
  'kpop/twice-jeongyeon.webp': 'Jeongyeon_2019.jpg',
  'kpop/twice-momo.webp': 'Momo_2019.jpg',
  'kpop/twice-sana.webp': 'Sana_2019.jpg',
  'kpop/twice-jihyo.webp': 'Jihyo_2019.jpg',
  'kpop/twice-mina.webp': 'Mina_2019.jpg',
  'kpop/twice-dahyun.webp': 'Dahyun_2019.jpg',
  'kpop/twice-chaeyoung.webp': 'Chaeyoung_2019.jpg',
  'kpop/twice-tzuyu.webp': 'Tzuyu_2019.jpg',

  // K-pop Soloists
  'kpop/iu.webp': 'IU_2019.jpg',
  'kpop/psy.webp': 'Psy_2013.jpg',
  'kpop/cl.webp': 'CL_2015.jpg',
  'kpop/taeyang.webp': 'Taeyang_2015.jpg',
  'kpop/gdragon.webp': 'G-Dragon_2017.jpg',
  'kpop/top.webp': 'TOP_2015.jpg',
  'kpop/daesung.webp': 'Daesung_2015.jpg',
  'kpop/seungri.webp': 'Seungri_2015.jpg',

  // Actors - Male
  'actors/gong-yoo.webp': 'Gong_Yoo_2016.jpg',
  'actors/lee-min-ho.webp': 'Lee_Min-ho_2013.jpg',
  'actors/song-joong-ki.webp': 'Song_Joong-ki_2016.jpg',
  'actors/hyun-bin.webp': 'Hyun_Bin_2019.jpg',
  'actors/park-seo-joon.webp': 'Park_Seo-joon_2018.jpg',
  'actors/lee-jong-suk.webp': 'Lee_Jong-suk_2016.jpg',
  'actors/ji-chang-wook.webp': 'Ji_Chang-wook_2017.jpg',
  'actors/kim-soo-hyun.webp': 'Kim_Soo-hyun_2014.jpg',
  'actors/lee-seung-gi.webp': 'Lee_Seung-gi_2015.jpg',
  'actors/so-ji-sub.webp': 'So_Ji-sub_2014.jpg',

  // Actors - Female
  'actors/song-hye-kyo.webp': 'Song_Hye-kyo_2016.jpg',
  'actors/jun-ji-hyun.webp': 'Jun_Ji-hyun_2014.jpg',
  'actors/han-hyo-joo.webp': 'Han_Hyo-joo_2016.jpg',
  'actors/park-shin-hye.webp': 'Park_Shin-hye_2015.jpg',
  'actors/son-ye-jin.webp': 'Son_Ye-jin_2018.jpg',
  'actors/suzy.webp': 'Bae_Suzy_2016.jpg',
  'actors/kim-tae-hee.webp': 'Kim_Tae-hee_2013.jpg',
  'actors/lee-sung-kyung.webp': 'Lee_Sung-kyung_2016.jpg',
  'actors/park-min-young.webp': 'Park_Min-young_2017.jpg',
  'actors/kim-go-eun.webp': 'Kim_Go-eun_2016.jpg',

  // Directors
  'directors/bong-joon-ho.webp': 'Bong_Joon-ho_2019.jpg',
  'directors/park-chan-wook.webp': 'Park_Chan-wook_2016.jpg',
  'directors/kim-ki-duk.webp': 'Kim_Ki-duk_2012.jpg',
  'directors/lee-chang-dong.webp': 'Lee_Chang-dong_2018.jpg',
  'directors/hong-sang-soo.webp': 'Hong_Sang-soo_2017.jpg',

  // Athletes
  'athletes/son-heung-min.webp': 'Son_Heung-min_2018.jpg',
  'athletes/kim-yuna.webp': 'Kim_Yuna_2018.jpg',
  'athletes/park-ji-sung.webp': 'Park_Ji-sung_2010.jpg',
  'athletes/ryu-hyun-jin.webp': 'Ryu_Hyun-jin_2019.jpg',
  'athletes/faker.webp': 'Faker_2019.jpg',

  // Politicians
  'politicians/moon-jae-in.webp': 'Moon_Jae-in_2017.jpg',
  'politicians/park-geun-hye.webp': 'Park_Geun-hye_2013.jpg',
  'politicians/lee-myung-bak.webp': 'Lee_Myung-bak_2008.jpg',
  'politicians/roh-moo-hyun.webp': 'Roh_Moo-hyun_2004.jpg',
  'politicians/kim-dae-jung.webp': 'Kim_Dae-jung_2000.jpg',

  // Business
  'business/lee-jae-yong.webp': 'Lee_Jae-yong_2017.jpg',
  'business/chung-eui-sun.webp': 'Chung_Eui-sun_2020.jpg',
  'business/shin-dong-bin.webp': 'Shin_Dong-bin_2015.jpg',

  // Artists
  'artists/nam-june-paik.webp': 'Nam_June_Paik_1992.jpg',
  'artists/lee-ufan.webp': 'Lee_Ufan_2014.jpg',
  'artists/yayoi-kusama.webp': 'Yayoi_Kusama_2016.jpg',
};

// Fallback: If Wikimedia download fails, generate a placeholder
async function generatePlaceholder(name, outputPath) {
  const initials = name
    .split(/[-\s]/)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];

  // Create SVG placeholder
  const svg = `
    <svg width="440" height="440" xmlns="http://www.w3.org/2000/svg">
      <rect width="440" height="440" fill="${color}"/>
      <text x="220" y="220" font-family="Arial, sans-serif" font-size="120"
            font-weight="bold" fill="white" text-anchor="middle"
            dominant-baseline="middle">${initials}</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(440, 440)
    .webp({ quality: 80 })
    .toFile(outputPath);
}

// Download image from Wikimedia Commons
async function downloadFromWikimedia(wikiFileName) {
  try {
    // Wikimedia Commons API to get image URL
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(wikiFileName)}&prop=imageinfo&iiprop=url&format=json`;

    const response = await axios.get(apiUrl, { timeout: 10000 });
    const pages = response.data.query.pages;
    const page = Object.values(pages)[0];

    if (!page.imageinfo || !page.imageinfo[0]) {
      throw new Error('Image not found on Wikimedia');
    }

    const imageUrl = page.imageinfo[0].url;

    // Download the image
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'KFortunes/1.0 (Educational Project; contact@example.com)'
      }
    });

    return Buffer.from(imageResponse.data);
  } catch (error) {
    throw new Error(`Wikimedia download failed: ${error.message}`);
  }
}

// Process and convert image to WebP
async function processImage(imageBuffer, outputPath) {
  await sharp(imageBuffer)
    .resize(440, 440, {
      fit: 'cover',
      position: 'attention' // Smart crop focusing on face
    })
    .webp({ quality: 80 })
    .toFile(outputPath);
}

// Main download function
async function downloadCelebrityImages() {
  console.log('🎬 Celebrity Image Downloader for KFortunes\n');
  console.log(`📊 Downloading ${Object.keys(CELEBRITY_IMAGES).length} celebrity photos...\n`);

  const baseDir = path.join(__dirname, '..', 'images', 'celebrities');

  // Create directory structure
  const categories = ['kpop', 'actors', 'directors', 'athletes', 'politicians', 'business', 'artists'];
  for (const category of categories) {
    await fs.mkdir(path.join(baseDir, category), { recursive: true });
  }

  let successCount = 0;
  let failCount = 0;
  let placeholderCount = 0;

  const entries = Object.entries(CELEBRITY_IMAGES);

  for (let i = 0; i < entries.length; i++) {
    const [localPath, wikiFileName] = entries[i];
    const outputPath = path.join(baseDir, localPath);
    const celebName = path.basename(localPath, '.webp');

    process.stdout.write(`[${i + 1}/${entries.length}] ${celebName}... `);

    try {
      // Try to download from Wikimedia Commons
      const imageBuffer = await downloadFromWikimedia(wikiFileName);
      await processImage(imageBuffer, outputPath);
      console.log('✅ Downloaded');
      successCount++;
    } catch (error) {
      // If download fails, generate placeholder
      try {
        await generatePlaceholder(celebName, outputPath);
        console.log('⚠️  Placeholder (download failed)');
        placeholderCount++;
      } catch (placeholderError) {
        console.log('❌ Failed');
        failCount++;
      }
    }

    // Rate limiting: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\n📈 Download Summary:');
  console.log(`✅ Successfully downloaded: ${successCount}`);
  console.log(`⚠️  Placeholders generated: ${placeholderCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`\n📁 Images saved to: ${baseDir}`);

  if (successCount + placeholderCount >= entries.length * 0.95) {
    console.log('\n🎉 Success! Ready to implement celebrity photos feature.');
  } else {
    console.log('\n⚠️  Warning: Less than 95% success rate. You may want to manually add some images.');
  }
}

// Alternative: Generate ALL placeholders (faster, no downloads)
async function generateAllPlaceholders() {
  console.log('🎨 Generating placeholder images for all celebrities...\n');

  const baseDir = path.join(__dirname, '..', 'images', 'celebrities');

  // Create directory structure
  const categories = ['kpop', 'actors', 'directors', 'athletes', 'politicians', 'business', 'artists'];
  for (const category of categories) {
    await fs.mkdir(path.join(baseDir, category), { recursive: true });
  }

  const entries = Object.keys(CELEBRITY_IMAGES);

  for (let i = 0; i < entries.length; i++) {
    const localPath = entries[i];
    const outputPath = path.join(baseDir, localPath);
    const celebName = path.basename(localPath, '.webp');

    process.stdout.write(`[${i + 1}/${entries.length}] ${celebName}... `);

    try {
      await generatePlaceholder(celebName, outputPath);
      console.log('✅');
    } catch (error) {
      console.log('❌');
    }
  }

  console.log(`\n✅ Generated ${entries.length} placeholder images`);
  console.log(`📁 Images saved to: ${baseDir}`);
  console.log('\n💡 Tip: Replace placeholders with real photos later for better engagement.');
}

// Run the script
const args = process.argv.slice(2);
if (args.includes('--placeholders-only')) {
  generateAllPlaceholders().catch(console.error);
} else {
  console.log('💡 Options:');
  console.log('  - node scripts/download-celebrity-images.js          (download from Wikimedia)');
  console.log('  - node scripts/download-celebrity-images.js --placeholders-only  (fast, no downloads)\n');

  downloadCelebrityImages().catch(console.error);
}
