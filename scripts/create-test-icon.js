const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
  'icon.png': 1024,
  'icon-20.png': 20,
  'icon-20@2x.png': 40,
  'icon-20@3x.png': 60,
  'icon-29.png': 29,
  'icon-29@2x.png': 58,
  'icon-29@3x.png': 87,
  'icon-40.png': 40,
  'icon-40@2x.png': 80,
  'icon-40@3x.png': 120,
  'icon-60@2x.png': 120,
  'icon-60@3x.png': 180,
  'icon-76.png': 76,
  'icon-76@2x.png': 152,
  'icon-83.5@2x.png': 167,
  'icon-1024.png': 1024
};

async function createTestIcon() {
  const size = 1024;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#50E3C2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="50%" y="50%" font-family="Arial" font-size="120" fill="white" text-anchor="middle" dominant-baseline="middle">
        SF
      </text>
    </svg>
  `;

  const outputDir = path.resolve(__dirname, '../assets/icon/ios');
  console.log('Output directory:', outputDir);

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    console.log('Creating output directory:', outputDir);
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate the base icon in memory
  const baseIcon = await sharp(Buffer.from(svg)).png().toBuffer();

  // Generate all sizes
  for (const [filename, size] of Object.entries(sizes)) {
    const outputPath = path.join(outputDir, filename);
    console.log(`Generating ${filename} (${size}x${size}) -> ${outputPath}`);
    await sharp(baseIcon)
      .resize(size, size)
      .toFile(outputPath);
    console.log(`✓ Generated ${filename}`);
  }

  console.log('All icons generated successfully!');
}

createTestIcon().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 