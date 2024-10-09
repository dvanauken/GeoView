// src/app/components/geo-view/layers/layers.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { GeoJSONModel } from '../../../models/geo-json.model';
import { Feature } from 'geojson';

interface Layer {
  id: string;
  name: string;
  type: 'geojson' | 'raster' | 'vector';
  visible: boolean;
  opacity: number;
}

@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.scss']
})
export class LayersComponent implements OnInit, OnDestroy {
  layers: Layer[] = [];
  private subscription: Subscription = new Subscription();
  private geoData: GeoJSONModel | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.dataService.geoData$.subscribe(geoData => {
        if (geoData) {
          this.geoData = geoData;
          this.updateLayersFromGeoData(geoData);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleLayerVisibility(layer: Layer): void {
    layer.visible = !layer.visible;
    this.updateLayer(layer);
  }

  updateLayerOpacity(layer: Layer, event: Event): void {
    const opacity = (event.target as HTMLInputElement).valueAsNumber;
    layer.opacity = opacity;
    this.updateLayer(layer);
  }

  moveLayerUp(index: number): void {
    if (index > 0) {
      [this.layers[index - 1], this.layers[index]] = [this.layers[index], this.layers[index - 1]];
      this.updateLayerOrder();
    }
  }

  moveLayerDown(index: number): void {
    if (index < this.layers.length - 1) {
      [this.layers[index], this.layers[index + 1]] = [this.layers[index + 1], this.layers[index]];
      this.updateLayerOrder();
    }
  }

  private updateLayer(layer: Layer): void {
    if (this.geoData) {
      const updatedFeatures = this.geoData.features.map(feature => {
        if (feature.id === layer.id) {
          return {
            ...feature,
            properties: {
              ...feature.properties,
              visible: layer.visible,
              opacity: layer.opacity
            }
          };
        }
        return feature;
      });

      const updatedGeoData = new GeoJSONModel({
        type: 'FeatureCollection',
        features: updatedFeatures
      });

      this.dataService.updateGeoData(updatedGeoData);
    }
  }

  private updateLayerOrder(): void {
    if (this.geoData) {
      const orderedFeatures = this.layers.map(layer =>
        this.geoData!.features.find(f => f.id === layer.id)!
      );

      const updatedGeoData = new GeoJSONModel({
        type: 'FeatureCollection',
        features: orderedFeatures
      });

      this.dataService.updateGeoData(updatedGeoData);
    }
  }

  private updateLayersFromGeoData(geoData: GeoJSONModel): void {
    this.layers = geoData.features.map(feature => ({
      id: feature.id?.toString() || '',
      name: feature.properties?.name || 'Unnamed Layer',
      type: 'geojson',
      visible: feature.properties?.visible !== false,
      opacity: feature.properties?.opacity || 1
    }));
  }
}
