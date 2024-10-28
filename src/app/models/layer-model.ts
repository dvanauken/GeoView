export class Layer {
  features: any[];

  constructor(features: any[]) {
    this.features = features;
  }

  // Method to get the features
  getFeatures(): any[] {
    return this.features;
  }
}
