import {
  GeoJSON,
  Feature,
  FeatureCollection,
  Geometry,
  GeometryCollection,
  Point,
  MultiPoint,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon
} from 'geojson';

export class GeoJSONModel {
  private geoJSON: GeoJSON;

  constructor(data: GeoJSON) {
    this.geoJSON = data;
  }

  get type(): string {
    return this.geoJSON.type;
  }

  get features(): Feature[] {
    if (this.isFeatureCollection()) {
      return (this.geoJSON as FeatureCollection).features;
    } else if (this.isFeature()) {
      return [this.geoJSON as Feature];
    }
    return [];
  }

  get geometry(): Geometry | GeometryCollection | null {
    if (this.isGeometry()) {
      return this.geoJSON as Geometry;
    } else if (this.isFeature()) {
      return (this.geoJSON as Feature).geometry;
    }
    return null;
  }

  isFeatureCollection(): boolean {
    return this.geoJSON.type === 'FeatureCollection';
  }

  isFeature(): boolean {
    return this.geoJSON.type === 'Feature';
  }

  isGeometry(): boolean {
    return ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection'].includes(this.geoJSON.type);
  }

  toFeatureCollection(): FeatureCollection {
    if (this.isFeatureCollection()) {
      return this.geoJSON as FeatureCollection;
    } else if (this.isFeature()) {
      return {
        type: 'FeatureCollection',
        features: [this.geoJSON as Feature]
      };
    } else if (this.isGeometry()) {
      return {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: this.geoJSON as Geometry,
          properties: {}
        }]
      };
    }
    throw new Error('Invalid GeoJSON structure');
  }

  addFeature(feature: Feature): void {
    if (this.isFeatureCollection()) {
      (this.geoJSON as FeatureCollection).features.push(feature);
    } else if (this.isFeature() || this.isGeometry()) {
      this.geoJSON = this.toFeatureCollection();
      (this.geoJSON as FeatureCollection).features.push(feature);
    }
  }

  removeFeature(id: string | number): void {
    if (this.isFeatureCollection()) {
      const features = (this.geoJSON as FeatureCollection).features;
      const index = features.findIndex(f => f.id === id);
      if (index !== -1) {
        features.splice(index, 1);
      }
    }
  }

  getFeatureById(id: string | number): Feature | undefined {
    return this.features.find(f => f.id === id);
  }

  getBounds(): [number, number, number, number] | null {
    const allCoords = this.getAllCoordinates();
    if (allCoords.length === 0) return null;

    const xs = allCoords.map(c => c[0]);
    const ys = allCoords.map(c => c[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }

  private getAllCoordinates(): number[][] {
    let coords: number[][] = [];
    if (this.isFeatureCollection()) {
      coords = (this.geoJSON as FeatureCollection).features.flatMap(f => this.getGeometryCoordinates(f.geometry));
    } else if (this.isFeature()) {
      coords = this.getGeometryCoordinates((this.geoJSON as Feature).geometry);
    } else if (this.isGeometry()) {
      coords = this.getGeometryCoordinates(this.geoJSON as Geometry);
    }
    return coords;
  }

  private getGeometryCoordinates(geometry: Geometry | null): number[][] {
    if (!geometry) return [];

    switch (geometry.type) {
      case 'Point':
        return [geometry.coordinates];
      case 'MultiPoint':
      case 'LineString':
        return geometry.coordinates;
      case 'MultiLineString':
      case 'Polygon':
        return geometry.coordinates.flat();
      case 'MultiPolygon':
        return geometry.coordinates.flat(2);
      case 'GeometryCollection':
        return geometry.geometries.flatMap(g => this.getGeometryCoordinates(g));
      default:
        return [];
    }
  }

  toGeoJSON(): GeoJSON {
    return JSON.parse(JSON.stringify(this.geoJSON));
  }
}
