const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create a 1024x1024 canvas
const canvas = createCanvas(1024, 1024);
const ctx = canvas.getContext('2d');

// Fill background
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, 1024, 1024);

// Add text
ctx.fillStyle = '#FFFFFF';
ctx.font = 'bold 200px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('SF', 512, 512);

// Save the image
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, '../assets/ios/icon.png'), buffer);

console.log('Icon generated successfully!'); 