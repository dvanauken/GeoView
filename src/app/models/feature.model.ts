// src/app/models/feature.model.ts
import { Feature, Geometry, GeoJsonProperties } from 'geojson';

export class FeatureModel implements Feature {
  private feature: Feature;

  constructor(feature: Feature) {
    this.feature = feature;
  }

  get id(): string | number | undefined {
    return this.feature.id;
  }

  get type(): "Feature" {
    return "Feature";
  }

  get geometry(): Geometry {
    return this.feature.geometry;
  }

  get properties(): GeoJsonProperties {
    return this.feature.properties || {};
  }

  getProperty(key: string): any {
    return this.properties[key];
  }

  setProperty(key: string, value: any): void {
    if (!this.feature.properties) {
      this.feature.properties = {};
    }
    this.feature.properties[key] = value;
  }

  toGeoJSON(): Feature {
    return { ...this.feature };
  }

  getCentroid(): [number, number] | null {
    switch (this.geometry.type) {
      case 'Point':
        return this.geometry.coordinates as [number, number];
      case 'MultiPoint':
      case 'LineString':
        return this.calculateCentroid(this.geometry.coordinates);
      case 'MultiLineString':
      case 'Polygon':
        return this.calculateCentroid(this.geometry.coordinates.flat());
      case 'MultiPolygon':
        return this.calculateCentroid(this.geometry.coordinates.flat(2));
      default:
        return null;
    }
  }

  getBounds(): [number, number, number, number] | null {
    switch (this.geometry.type) {
      case 'Point':
        const [x, y] = this.geometry.coordinates;
        return [x, y, x, y];
      case 'MultiPoint':
      case 'LineString':
        return this.calculateBounds(this.geometry.coordinates);
      case 'MultiLineString':
      case 'Polygon':
        return this.calculateBounds(this.geometry.coordinates.flat());
      case 'MultiPolygon':
        return this.calculateBounds(this.geometry.coordinates.flat(2));
      default:
        return null;
    }
  }

  private calculateCentroid(coords: number[][]): [number, number] {
    const sumX = coords.reduce((sum, coord) => sum + coord[0], 0);
    const sumY = coords.reduce((sum, coord) => sum + coord[1], 0);
    return [sumX / coords.length, sumY / coords.length];
  }

  private calculateBounds(coords: number[][]): [number, number, number, number] {
    const xs = coords.map(c => c[0]);
    const ys = coords.map(c => c[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }
}
