import { BehaviorSubject } from 'rxjs';
import { Layer } from "./layer-model";
import { Feature } from 'geojson';

export class DataModel {
  private static instance: DataModel;
  private airports: Map<string, { lon: number; lat: number }> = new Map();
  private layersMap: Map<string, Layer> = new Map();
  private selectedLayerName: string | null = null;  // Property to hold the selected layer name
  private selectedFeatures: BehaviorSubject<Feature[] | null> = new BehaviorSubject(null);

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

  public getLayerNames(): string[] {
    return Array.from(this.layersMap.keys());
  }

  public getLayers(): Layer[] {
    return Array.from(this.layersMap.values());
  }

  public getSelectedLayer(): Layer | undefined {
    if (this.selectedLayerName) {
      return this.layersMap.get(this.selectedLayerName);
    }
    return undefined;
  }

  public setSelectedLayer(layerName: string): void {
    this.selectedLayerName = layerName;
    const selectedLayer = this.layersMap.get(layerName);
    if (selectedLayer && selectedLayer.features) {
      console.log(`Setting selected layer: ${layerName} with ${selectedLayer.features.length} features`);
      this.setSelectedFeatures(selectedLayer.features);
    } else {
      this.setSelectedFeatures([]); // Clear features if the layer is undefined or has no features
    }
  }

  // This method updates the selection and notifies all subscribers
  public setSelectedFeatures(features: Feature[]): void {
    console.log('DataModel.setSelectedFeatures called with features:', features);
    this.selectedFeatures.next(features);
  }

  // Components subscribe to this method to get updates
  public getSelectedFeatures(): BehaviorSubject<Feature[]> {
    return this.selectedFeatures;
  }

  public getAllFeatures(): Feature[] {
    const allFeatures = [];
    const layers = DataModel.getInstance().getLayers();
    layers.forEach(layer => {
      if (layer && layer.features) {
        allFeatures.push(...layer.features);
      }
    });
    return allFeatures;
  }



  // Method to load airport data dynamically
  public loadAirports(airports: { code: string; lon: number; lat: number }[]): void {
    airports.forEach(airport => {
      this.airports.set(airport.code, { lon: airport.lon, lat: airport.lat });
    });
  }

  public getAirportDetails(airportCode: string): { lon: number; lat: number } | undefined {
    return this.airports.get(airportCode);
  }





}
