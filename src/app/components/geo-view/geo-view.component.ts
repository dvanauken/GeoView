// src/app/components/geo-view/geo-view.component.ts
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MapComponent } from './map/map.component';
import { TableComponent } from './table/table.component';
import { SliderComponent } from './slider/slider.component';
import { LayersComponent } from './layers/layers.component';
import { DataService } from '../../services/data.service';
import { GeoModel } from '../../models/geo-model';
import { CriteriaModel } from '../../models/criteria.model';
import { ModelListener } from '../../interfaces/model-listener';
import { SelectionListener } from '../../interfaces/selection-listener';
import { FilterListener } from '../../interfaces/filter-listener';
import { Feature, FeatureCollection } from 'geojson'; // Import correct types

@Component({
  selector: 'app-geo-view',
  templateUrl: './geo-view.component.html',
  styleUrls: ['./geo-view.component.scss']
})
export class GeoViewComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges, ModelListener, SelectionListener, FilterListener {
  @ViewChild(MapComponent) mapComponent!: MapComponent;
  @ViewChild(TableComponent) tableComponent!: TableComponent;
  @ViewChild(SliderComponent) sliderComponent!: SliderComponent;
  @ViewChild(LayersComponent) layersComponent!: LayersComponent;

  @Input() geoData: FeatureCollection | null = null; // Use FeatureCollection from geojson

  model: GeoModel | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    // Initialization logic if needed
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['geoData'] && this.geoData) {
      console.log('GeoView received data:', this.geoData);
      this.updateModel();
    }
  }

  ngAfterViewInit(): void {
    this.setupChildInteractions();
  }

  ngOnDestroy(): void {
    // Cleanup any subscriptions or resources
  }

  private updateModel(): void {
    if (this.geoData) {
      // Directly use FeatureCollection from GeoJSON
      this.model = new GeoModel(this.geoData);
      this.onModelChange(this.model);
    }
  }

  onModelChange(model: GeoModel): void {
    this.model = model;
    if (this.mapComponent) {
      this.mapComponent.onModelChange(model);
    }
    if (this.tableComponent) {
      this.tableComponent.onModelChange(model);
    }
    // Update other components as needed
  }

  onFeatureUpdate(featureId: string, properties: { [key: string]: any }): void {
    if (this.model) {
      const feature = this.model.getFeatureById(featureId);
      if (feature) {
        Object.assign(feature.properties, properties);
        this.mapComponent?.onFeatureUpdate(featureId, properties);
        this.tableComponent?.onFeatureUpdate(featureId, properties);
      }
    }
  }

  onSelect(feature: Feature): void {
    this.mapComponent?.onSelect(feature);
    this.tableComponent?.onSelect(feature);
  }

  onDeselect(feature: Feature): void {
    this.mapComponent?.onDeselect(feature);
    this.tableComponent?.onDeselect(feature);
  }

  onClearSelection(): void {
    this.mapComponent?.onClearSelection();
    this.tableComponent?.onClearSelection();
  }

  onFilter(criteria: CriteriaModel): void {
    this.mapComponent?.onFilter(criteria);
    // this.tableComponent?.onFilter(criteria); // Uncomment when table filtering is implemented
  }

  onClearFilter(): void {
    this.mapComponent?.onClearFilter();
    // this.tableComponent?.onClearFilter(); // Uncomment when table filtering is implemented
  }

  onSliderMove(position: number): void {
    const totalWidth = 800; // Assuming 800px width
    const mapWidth = position;
    const tableWidth = totalWidth - position;

    this.mapComponent?.resize(mapWidth, 400);
    this.tableComponent?.resize(tableWidth, 400);
  }

  private setupChildInteractions(): void {
    // Setup any necessary interactions or event subscriptions between child components
  }
}
