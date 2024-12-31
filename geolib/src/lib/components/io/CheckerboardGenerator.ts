import { createCanvas, Canvas } from "canvas";
import * as fs from "fs";

class CheckerboardGenerator {
  /**
   * Generates a checkerboard image and saves it to a uniquely named file.
   * @param size - The width and height of the image in pixels.
   * @param squares - The number of squares along one axis.
   */
  static generate(size: number = 256, squares: number = 8): void {
    const canvas: Canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");

    const squareSize = size / squares;

    for (let i = 0; i < squares; i++) {
      for (let j = 0; j < squares; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillStyle = "black";
        } else {
          ctx.fillStyle = "white";
        }

        const x = i * squareSize;
        const y = j * squareSize;
        ctx.fillRect(x, y, squareSize, squareSize);
      }
    }

    // Create a unique filename with timestamp
    const timestamp = this.getTimestamp();
    const filename = `checkerboard.${timestamp}.png`;

    // Save the generated checkerboard to a file
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(filename, buffer);
    console.log(`Checkerboard image saved to ${filename}`);
  }

  /**
   * Generates a timestamp string in the format: YYYYMMDD_HHMMSS
   * @returns A unique timestamp string.
   */
  private static getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }
}

// Handle command-line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  const size = parseInt(args[0], 10) || 256; // Default size: 256
  const squares = parseInt(args[1], 10) || 8; // Default squares: 8

  CheckerboardGenerator.generate(size, squares);
}
