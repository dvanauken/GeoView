import { Feature, FeatureCollection, Geometry } from 'geojson';

export class GeoModel {
  private featureCollection: FeatureCollection;

  constructor(data: FeatureCollection) {
    this.featureCollection = data;
  }

  get data(): FeatureCollection {
    return this.featureCollection;
  }

  get features(): Feature[] {
    return this.featureCollection.features;
  }

  getFeatureById(id: string | number): Feature | undefined {
    return this.features.find(feature => feature.id === id);
  }

  getFeaturesByProperty(key: string, value: any): Feature[] {
    return this.features.filter(feature => feature.properties && feature.properties[key] === value);
  }

  addFeature(feature: Feature): void {
    this.featureCollection.features.push(feature);
  }

  removeFeature(id: string | number): void {
    const index = this.features.findIndex(feature => feature.id === id);
    if (index !== -1) {
      this.featureCollection.features.splice(index, 1);
    }
  }

  updateFeature(id: string | number, updatedFeature: Partial<Feature>): void {
    const feature = this.getFeatureById(id);
    if (feature) {
      Object.assign(feature, updatedFeature);
    }
  }

  getPropertyKeys(): string[] {
    const allKeys = this.features.flatMap(feature => Object.keys(feature.properties || {}));
    return [...new Set(allKeys)]; // Remove duplicates
  }

  getBounds(): [number, number, number, number] | null {
    if (this.features.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    this.features.forEach(feature => {
      const bounds = this.getGeometryBounds(feature.geometry);
      if (bounds) {
        minX = Math.min(minX, bounds[0]);
        minY = Math.min(minY, bounds[1]);
        maxX = Math.max(maxX, bounds[2]);
        maxY = Math.max(maxY, bounds[3]);
      }
    });

    return [minX, minY, maxX, maxY];
  }

  private getGeometryBounds(geometry: Geometry): [number, number, number, number] | null {
    switch (geometry.type) {
      case 'Point':
        const [x, y] = geometry.coordinates;
        return [x, y, x, y];
      case 'LineString':
      case 'MultiPoint':
        return this.getCoordinatesBounds(geometry.coordinates);
      case 'Polygon':
      case 'MultiLineString':
        return this.getCoordinatesBounds(geometry.coordinates.flat());
      case 'MultiPolygon':
        return this.getCoordinatesBounds(geometry.coordinates.flat(2));
      default:
        return null;
    }
  }

  private getCoordinatesBounds(coords: number[][]): [number, number, number, number] {
    const xs = coords.map(c => c[0]);
    const ys = coords.map(c => c[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }
}
