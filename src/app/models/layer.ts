// Importing the GeoJSON Feature type
import { Feature } from 'geojson';

export class Layer {
  public name: string;
  private features: Feature[]; // An array of GeoJSON Features

  constructor(name: string, features: Feature[] = []) {
    this.name = name;
    this.features = features;
  }

  // Method to get all features
  getFeatures(): Feature[] {
    return this.features;
  }

  // Method to add a feature
  addFeature(feature: Feature): void {
    this.features.push(feature);
  }

  // Method to find a feature by ID
  findFeatureById(id: string | number): Feature | undefined {
    return this.features.find(feature => feature.id === id);
  }

  // Method to remove a feature by ID
  removeFeatureById(id: string | number): void {
    this.features = this.features.filter(feature => feature.id !== id);
  }

  getProperty(index: number): { [key: string]: any } | undefined {
    const feature = this.features[index];
    return feature ? feature.properties : undefined;
  }

  // Method to get properties of all features
  getProperties(): { [key: string]: any }[] {
    return this.features
      .map(feature => feature.properties)
      .filter(properties => properties !== undefined);
  }

  // Custom toString() method for the Layer class
  toString(): string {
    if (this.features.length === 0) {
      return `Layer Name: ${this.name}, Number of Features: 0 (No feature data available)`;
    }

    // Extract property names from the first feature
    const propertyNames = this.features[0].properties
      ? Object.keys(this.features[0].properties)
      : [];

    return `Layer Name: ${this.name}, Number of Features: ${this.features.length}, Property Names: ${propertyNames.join(', ')}`;
  }
}
