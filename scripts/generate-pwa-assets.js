import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICON_SIZES = [144, 192, 384, 512];
const SPLASH_SIZES = [
  { width: 1242, height: 2688 }, // iPhone XS Max, 11 Pro Max
  { width: 1125, height: 2436 }, // iPhone X, XS, 11 Pro
  { width: 1242, height: 2208 }, // iPhone 6+, 6s+, 7+, 8+
  { width: 750, height: 1334 },  // iPhone 6, 6s, 7, 8
  { width: 640, height: 1136 }   // iPhone 5, 5s, SE
];

async function generateIcons() {
  const sourceImage = path.join(__dirname, '../assets/ojastack.png');
  const outputDir = path.join(__dirname, '../public/icons');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const size of ICON_SIZES) {
    await sharp(sourceImage)
      .resize(size, size)
      .toFile(path.join(outputDir, `icon-${size}.png`));
    console.log(`Generated ${size}x${size} icon`);
  }
}

async function generateSplashScreens() {
  const sourceImage = path.join(__dirname, '../assets/ojastack.png');
  const outputDir = path.join(__dirname, '../public/splash');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const size of SPLASH_SIZES) {
    await sharp(sourceImage)
      .resize(size.width, size.height, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(path.join(outputDir, `splash-${size.width}x${size.height}.png`));
    console.log(`Generated ${size.width}x${size.height} splash screen`);
  }
}

async function main() {
  try {
    await generateIcons();
    await generateSplashScreens();
    console.log('All PWA assets generated successfully!');
  } catch (error) {
    console.error('Error generating PWA assets:', error);
    process.exit(1);
  }
}

main(); 