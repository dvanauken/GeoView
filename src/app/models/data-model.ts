import {Layer} from "./layer-model";

export class DataModel {
  private static instance: DataModel;
  private layersMap: Map<string, Layer> = new Map();
  private selectedLayerName: string | null = null;  // Property to hold the selected layer name


  private constructor() {}

  public static getInstance(): DataModel {
    if (!DataModel.instance) {
      DataModel.instance = new DataModel();
    }
    return DataModel.instance;
  }

  public addLayer(name: string, layer: Layer): void {
    this.layersMap.set(name, layer);
  }

  public getLayer(name: string): Layer | undefined {
    return this.layersMap.get(name);
  }

  public getLayers(): string[] {
    return Array.from(this.layersMap.keys());
  }

  public getSelectedLayer(): Layer | undefined {
    if (this.selectedLayerName) {
      return this.layersMap.get(this.selectedLayerName);
    }
    return undefined;
  }

  public setSelectedLayer(layerName: string): void {
    this.selectedLayerName = layerName;
  }
}
