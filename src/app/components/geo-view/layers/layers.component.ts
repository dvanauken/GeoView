import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FeatureCollection, Feature } from 'geojson'; // Correct types
import { DataService } from '../../../services/data.service';

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
  styleUrls: ['./layers.component.scss'],
})
export class LayersComponent implements OnInit, OnDestroy, OnChanges {
  @Input() geoData: FeatureCollection | null = null; // Use this as input from parent

  layers: Layer[] = []; // Define layers

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    // Initialization logic if necessary
  }

  ngOnDestroy(): void {
    // Cleanup any subscriptions or resources if necessary
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['geoData'] && this.geoData) {
      this.updateLayersFromGeoData(this.geoData);
    }
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
      [this.layers[index - 1], this.layers[index]] = [
        this.layers[index],
        this.layers[index - 1],
      ];
      this.updateLayerOrder();
    }
  }

  moveLayerDown(index: number): void {
    if (index < this.layers.length - 1) {
      [this.layers[index], this.layers[index + 1]] = [
        this.layers[index + 1],
        this.layers[index],
      ];
      this.updateLayerOrder();
    }
  }

  private updateLayer(layer: Layer): void {
    if (this.geoData) {
      const updatedFeatures = this.geoData.features.map((feature) => {
        if (feature.id?.toString() === layer.id) {
          return {
            ...feature,
            properties: {
              ...feature.properties,
              visible: layer.visible,
              opacity: layer.opacity,
            },
          };
        }
        return feature;
      });

      const updatedGeoData: FeatureCollection = {
        type: 'FeatureCollection',
        features: updatedFeatures,
      };

      this.dataService.updateGeoData(updatedGeoData); // Update via service
    }
  }

  private updateLayerOrder(): void {
    if (this.geoData) {
      const orderedFeatures = this.layers
        .map((layer) =>
          this.geoData!.features.find((f) => f.id?.toString() === layer.id),
        )
        .filter((feature): feature is Feature => !!feature); // Ensures filtering out undefined

      const updatedGeoData: FeatureCollection = {
        type: 'FeatureCollection',
        features: orderedFeatures,
      };

      this.dataService.updateGeoData(updatedGeoData);
    }
  }

  /**
   * Group features into logical layers.
   * For example, group all "Polygon" features into one layer,
   * or group based on properties like feature type or another field.
   */
  private updateLayersFromGeoData(geoData: FeatureCollection): void {
    // Clear previous layers
    this.layers = [];

    // Example grouping logic: Group features by their "type" (Polygon, Point, etc.)
    const groupedLayers: { [key: string]: Feature[] } = {};

    geoData.features.forEach((feature) => {
      const layerType = feature.geometry.type; // Example: group by geometry type (Point, LineString, etc.)

      // Initialize the layer group if it doesn't exist
      if (!groupedLayers[layerType]) {
        groupedLayers[layerType] = [];
      }

      // Add the feature to the appropriate layer group
      groupedLayers[layerType].push(feature);
    });

    // Create a layer for each group
    Object.keys(groupedLayers).forEach((layerType, index) => {
      this.layers.push({
        id: `layer-${index}`,
        name: `${layerType} Layer`, // Naming the layer by geometry type
        type: 'geojson',
        visible: true,
        opacity: 1,
      });
    });
  }
}
