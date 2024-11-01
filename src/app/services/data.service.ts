import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Layer } from '../models/layer';
import { AirportData } from '../interfaces/airport-data.interface';
import { Feature } from 'geojson';



@Injectable({
  providedIn: 'root'
})
export class DataService {
  private airports: Map<string, AirportData> = new Map(); // Stores airport data by code
  private layersMap: Map<string, Layer> = new Map();
  private selectedLayerName: string | null = null;
  private selectedFeatures: BehaviorSubject<Feature[] | null> = new BehaviorSubject([]);

  // Layer Getters and Setters
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
    if (selectedLayer && selectedLayer.getFeatures()) {
      console.log(`Setting selected layer: ${layerName} with ${selectedLayer.getFeatures().length} features`);
      this.setSelectedFeatures(selectedLayer.getFeatures());
    } else {
      this.setSelectedFeatures([]); // Clear features if the layer is undefined or has no features
    }
  }

  public setSelectedFeatures(features: Feature[]): void {
    console.log('DataService.setSelectedFeatures called with features:', features);
    this.selectedFeatures.next(features);
  }

  public getSelectedFeatures(): BehaviorSubject<Feature[]> {
    return this.selectedFeatures;
  }

  // Airport Getters and Setters
  public getAirports(): AirportData[] {
    return Array.from(this.airports.values());
  }

  public setAirports(airports: AirportData[]): void {
    this.airports.clear();
    airports.forEach(airport => {
      this.airports.set(airport.code, airport);
    });
    console.log('Airports data set in DataService');
  }

  public getAirport(code: string): AirportData | undefined {
    return this.airports.get(code);
  }

  public setAirport(airport: AirportData): void {
    if (airport && airport.code) {
      this.airports.set(airport.code, airport);
      console.log(`Airport data updated for ${airport.code} in DataService`);
    } else {
      console.error('Invalid airport data provided');
    }
  }
}
