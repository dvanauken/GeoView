export class DataModel {
  private static instance: DataModel;
  private features: any[] = [];  // Array to store GeoJSON features

  // Private constructor to enforce the singleton pattern
  private constructor() {}

  // Get the singleton instance of the DataModel
  public static getInstance(): DataModel {
    if (!DataModel.instance) {
      DataModel.instance = new DataModel();
    }
    return DataModel.instance;
  }

  // Add features to the model (usually called after the data is loaded)
  public addFeatures(features: any[]): void {
    this.features = features;
  }

  // Retrieve the stored features
  public getFeatures(): any[] {
    return this.features;
  }
}
