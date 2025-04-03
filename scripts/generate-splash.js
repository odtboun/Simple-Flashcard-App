const sharp = require('sharp');
const path = require('path');

// Create a 1242x2436 image (iPhone X resolution)
const width = 1242;
const height = 2436;

// Create a new image with a white background
sharp({
  create: {
    width,
    height,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  }
})
  .composite([
    {
      input: Buffer.from(
        `<svg>
          <text
            x="50%"
            y="50%"
            font-family="Arial"
            font-size="48"
            fill="#000000"
            text-anchor="middle"
            dominant-baseline="middle"
          >Simple Flashcard</text>
        </svg>`
      ),
      top: 0,
      left: 0,
    }
  ])
  .png()
  .toFile(path.join(__dirname, '../assets/ios/splash.png'))
  .then(() => console.log('Splash screen generated successfully!'))
  .catch(err => console.error('Error generating splash screen:', err)); 