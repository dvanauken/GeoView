import * as fs from 'fs';
import * as zlib from 'zlib';

class PNG {
  static readonly PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  static Read(filePath: string): DecodedPNG {
    const fileBuffer = fs.readFileSync(filePath);

    // Validate signature
    if (!fileBuffer.subarray(0, 8).equals(PNG.PNG_SIGNATURE)) {
      throw new Error('Invalid PNG file: Incorrect signature');
    }

    const chunks: PNGChunk[] = [];
    let offset = 8;

    // Parse chunks
    let width = 0, height = 0, bitDepth = 0, colorType = 0, pixelData: Buffer | null = null;
    while (offset < fileBuffer.length) {
      const length = fileBuffer.readUInt32BE(offset);
      offset += 4;

      const chunkType = fileBuffer.toString('ascii', offset, offset + 4);
      offset += 4;

      const chunkData = fileBuffer.subarray(offset, offset + length);
      offset += length;

      const crc = fileBuffer.readUInt32BE(offset);
      offset += 4;

      chunks.push({ length, type: chunkType, data: chunkData, crc });

      // Process specific chunks
      if (chunkType === 'IHDR') {
        width = chunkData.readUInt32BE(0);
        height = chunkData.readUInt32BE(4);
        bitDepth = chunkData[8];
        colorType = chunkData[9];
      } else if (chunkType === 'IDAT') {
        pixelData = pixelData ? Buffer.concat([pixelData, chunkData]) : chunkData;
      } else if (chunkType === 'IEND') {
        break;
      }
    }

    if (!pixelData) {
      throw new Error('No pixel data found in PNG file');
    }

    // Decompress pixel data
    const decompressedData = zlib.inflateSync(pixelData);

    // Reconstruct pixel data (simple implementation for demonstration purposes)
    const pixels = PNG.reconstructPixels(decompressedData, width, height, bitDepth, colorType);

    return { width, height, pixels };
  }

  private static reconstructPixels(data: Buffer, width: number, height: number, bitDepth: number, colorType: number): Uint8ClampedArray {
    const bytesPerPixel = 3; // Assuming truecolor (RGB)
    const pixels = new Uint8ClampedArray(width * height * bytesPerPixel);

    let dataOffset = 0;
    for (let y = 0; y < height; y++) {
      const filterType = data[dataOffset++]; // First byte is filter type
      const scanline = data.subarray(dataOffset, dataOffset + width * bytesPerPixel);
      dataOffset += width * bytesPerPixel;

      for (let x = 0; x < width * bytesPerPixel; x++) {
        pixels[y * width * bytesPerPixel + x] = scanline[x]; // Copy pixels directly
      }
    }

    return pixels;
  }
}

// Interfaces
interface PNGChunk {
  length: number;
  type: string;
  data: Buffer;
  crc: number;
}

export interface DecodedPNG {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
}

export default PNG;




// import PNG from './io/PNG';

// const result = PNG.Read('path/to/your/image.png');
// const { width, height, pixels } = result;

// // Render in a canvas
// const canvas = document.createElement('canvas');
// canvas.width = width;
// canvas.height = height;

// const ctx = canvas.getContext('2d');
// if (ctx) {
//   const imageData = new ImageData(pixels, width, height);
//   ctx.putImageData(imageData, 0, 0);
// }

// document.body.appendChild(canvas);
