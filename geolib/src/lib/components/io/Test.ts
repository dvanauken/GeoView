import PNG from './PNG';
import OrthoRectify from './OrthoRectify';

// Load the PNG
const png = PNG.Read('path/to/image.png');

// Create the OrthoRectify instance
const ortho = new OrthoRectify(png);

// Add registration points (geo-coordinates mapped to pixel positions)
ortho.addRegistrationPoint([30, -90], [100, 200]); // Example: geo (30, -90) maps to pixel (100, 200)
ortho.addRegistrationPoint([35, -95], [300, 400]);

// Process the image
const result = ortho.process();

// Render the result in a canvas (same as the earlier example)
const canvas = document.createElement('canvas');
canvas.width = result.width;
canvas.height = result.height;

const ctx = canvas.getContext('2d');
if (ctx) {
  const imageData = new ImageData(result.pixels, result.width, result.height);
  ctx.putImageData(imageData, 0, 0);
}

document.body.appendChild(canvas);