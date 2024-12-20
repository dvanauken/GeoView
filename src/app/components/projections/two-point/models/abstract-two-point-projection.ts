import { Point } from "./point.interface";

// models/abstract-two-point-projection.ts
export abstract class AbstractTwoPointProjection {
  protected point1: Point;
  protected point2: Point;

  constructor(initialPoint1: Point, initialPoint2: Point) {
      this.point1 = this.validatePoint(initialPoint1);
      this.point2 = this.validatePoint(initialPoint2);
  }

  protected validatePoint(point: Point): Point {
      if (point.latitude < -90 || point.latitude > 90) {
          throw new Error('Latitude must be between -90 and 90 degrees');
      }
      if (point.longitude < -180 || point.longitude > 180) {
          throw new Error('Longitude must be between -180 and 180 degrees');
      }
      return {
          latitude: Number(point.latitude.toFixed(3)),
          longitude: Number(point.longitude.toFixed(3))
      };
  }

  getPoint1(): Point {
      return { ...this.point1 };
  }

  getPoint2(): Point {
      return { ...this.point2 };
  }

  setPoint1(point: Point): void {
      this.point1 = this.validatePoint(point);
  }

  setPoint2(point: Point): void {
      this.point2 = this.validatePoint(point);
  }

  // Abstract methods that must be implemented by concrete classes
  abstract project(coordinates: Point): [number, number];
  abstract unproject(point: [number, number]): Point;
  abstract getProjection(): any;

  
  // Common geometric calculations
  protected calculateDistance(p1: Point, p2: Point): number {
      const R = 6371; // Earth's radius in kilometers
      const lat1 = this.toRadians(p1.latitude);
      const lat2 = this.toRadians(p2.latitude);
      const dLat = this.toRadians(p2.latitude - p1.latitude);
      const dLon = this.toRadians(p2.longitude - p1.longitude);

      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
  }

  protected calculateBearing(p1: Point, p2: Point): number {
      const lat1 = this.toRadians(p1.latitude);
      const lat2 = this.toRadians(p2.latitude);
      const dLon = this.toRadians(p2.longitude - p1.longitude);

      const y = Math.sin(dLon) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
      
      return (this.toDegrees(Math.atan2(y, x)) + 360) % 360;
  }

  private toRadians(degrees: number): number {
      return degrees * Math.PI / 180;
  }

  private toDegrees(radians: number): number {
      return radians * 180 / Math.PI;
  }
}