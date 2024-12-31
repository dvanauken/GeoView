import { DecodedPNG } from './PNG';

type GeoPoint = { geo: [number, number]; pixel: [number, number] };

class OrthoRectify {
  private image: DecodedPNG;
  private registrationPoints: GeoPoint[] = [];

  constructor(image: DecodedPNG) {
    this.image = image;
  }

  /**
   * Add a geographic registration point with corresponding pixel location.
   * @param geo - Geographic coordinates [latitude, longitude].
   * @param pixel - Pixel coordinates [x, y].
   */
  addRegistrationPoint(geo: [number, number], pixel: [number, number]) {
    this.registrationPoints.push({ geo, pixel });
  }

  /**
   * Perform orthorectification and return a new image.
   * @returns A new orthorectified image.
   */
  process(): DecodedPNG {
    const { width, height, pixels } = this.image;
    const outputPixels = new Uint8ClampedArray(pixels.length);

    // For simplicity, assume the output image has the same dimensions
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Map (x, y) in the output to geographic coordinates
        const geo = this.pixelToGeo([x, y]);

        // Find the original pixel using geographic coordinates
        const srcPixel = this.geoToPixel(geo);

        // Interpolate pixel value from original image
        const value = this.interpolate(srcPixel, pixels, width, height);
        const index = (y * width + x) * 4; // RGBA

        // Assign interpolated value to output image
        outputPixels[index] = value[0]; // R
        outputPixels[index + 1] = value[1]; // G
        outputPixels[index + 2] = value[2]; // B
        outputPixels[index + 3] = value[3]; // A
      }
    }

    return { width, height, pixels: outputPixels };
  }

  /**
   * Convert a pixel coordinate to geographic coordinates.
   */
  private pixelToGeo(pixel: [number, number]): [number, number] {
    // For now, implement a simple interpolation using registration points.
    // (This can be extended to more complex interpolation like thin plate spline.)
    const [x, y] = pixel;
    const lat = y; // Simplified placeholder
    const lon = x; // Simplified placeholder
    return [lat, lon];
  }

  /**
   * Convert geographic coordinates to the original pixel location.
   */
  private geoToPixel(geo: [number, number]): [number, number] {
    const [lat, lon] = geo;
    const x = lon; // Simplified placeholder
    const y = lat; // Simplified placeholder
    return [x, y];
  }

  /**
   * Interpolate pixel value at a fractional coordinate.
   */
  private interpolate(
    coord: [number, number],
    pixels: Uint8ClampedArray,
    width: number,
    height: number
  ): [number, number, number, number] {
    const [fx, fy] = coord;
    const x = Math.floor(fx);
    const y = Math.floor(fy);
    const dx = fx - x;
    const dy = fy - y;

    const getPixel = (px: number, py: number): [number, number, number, number] => {
      if (px < 0 || py < 0 || px >= width || py >= height) return [0, 0, 0, 0]; // Out of bounds
      const index = (py * width + px) * 4; // RGBA
      return [
        pixels[index],     // R
        pixels[index + 1], // G
        pixels[index + 2], // B
        pixels[index + 3], // A
      ];
    };

    // Perform bilinear interpolation
    const topLeft = getPixel(x, y);
    const topRight = getPixel(x + 1, y);
    const bottomLeft = getPixel(x, y + 1);
    const bottomRight = getPixel(x + 1, y + 1);

    const interpolateChannel = (tl: number, tr: number, bl: number, br: number) =>
      (1 - dx) * (1 - dy) * tl +
      dx * (1 - dy) * tr +
      (1 - dx) * dy * bl +
      dx * dy * br;

    return [
      interpolateChannel(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]), // R
      interpolateChannel(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]), // G
      interpolateChannel(topLeft[2], topRight[2], bottomLeft[2], bottomRight[2]), // B
      interpolateChannel(topLeft[3], topRight[3], bottomLeft[3], bottomRight[3]), // A
    ];
  }
}

export default OrthoRectify;
