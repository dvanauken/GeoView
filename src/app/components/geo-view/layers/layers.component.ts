// src/app/components/geo-view/layers/layers.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { Feature, FeatureCollection, GeoJsonObject } from 'geojson';

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
  private geoData: FeatureCollection | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.dataService.geoData$.subscribe((geoData: FeatureCollection | null) => {
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
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      layer.opacity = inputElement.valueAsNumber;
      this.updateLayer(layer);
    }
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
        if (feature.id?.toString() === layer.id) {
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

      const updatedGeoData: FeatureCollection = {
        type: 'FeatureCollection',
        features: updatedFeatures
      };

      this.dataService.updateGeoData(updatedGeoData);
    }
  }

  private updateLayerOrder(): void {
    if (this.geoData) {
      const orderedFeatures = this.layers.map(layer =>
        this.geoData!.features.find(f => f.id?.toString() === layer.id)
      ).filter((feature): feature is Feature => !!feature); // Ensures filtering out undefined

      const updatedGeoData: FeatureCollection = {
        type: 'FeatureCollection',
        features: orderedFeatures
      };

      this.dataService.updateGeoData(updatedGeoData);
    }
  }

//   private updateLayersFromGeoData(geoData: FeatureCollection): void {
//     this.layers = geoData.features.map(feature => ({
//       id: feature.id?.toString() || '',
//       name: feature.properties?.name || 'Unnamed Layer',
//       type: 'geojson',
//       visible: feature.properties?.visible !== false,
//       opacity: feature.properties?.opacity || 1
//     }));
//   }

private updateLayersFromGeoData(geoData: FeatureCollection): void {
  // Clear previous layers
  this.layers = [];

  // Add a single layer for the entire GeoJSON collection
  const layer: Layer = {
    id: 'main-layer',  // You can assign a unique id for the layer
    name: geoData.features[0]?.properties?.name || 'Unnamed Layer',
    type: 'geojson',
    visible: true,
    opacity: 1
  };

  // Push the single layer to the layers array
  this.layers.push(layer);
}


}
