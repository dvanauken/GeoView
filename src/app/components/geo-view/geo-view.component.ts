import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MapComponent } from './map/map.component';
import { TableComponent } from './table/table.component';
import { SliderComponent } from './slider/slider.component';
import { LayersComponent } from './layers/layers.component';
import { DataService } from '../../services/data.service';
import { GeoModel } from '../../models/geo-model';
import { FeatureModel } from '../../models/feature.model';
import { CriteriaModel } from '../../models/criteria.model';
import { ModelListener } from '../../interfaces/model-listener';
import { SelectionListener } from '../../interfaces/selection-listener';
import { FilterListener } from '../../interfaces/filter-listener';

@Component({
  selector: 'app-geo-view',
  templateUrl: './geo-view.component.html',
  styleUrls: ['./geo-view.component.scss']
})
export class GeoViewComponent implements OnInit, AfterViewInit, OnDestroy, ModelListener, SelectionListener, FilterListener {
  @ViewChild(MapComponent) mapComponent!: MapComponent;
  @ViewChild(TableComponent) tableComponent!: TableComponent;
  @ViewChild(SliderComponent) sliderComponent!: SliderComponent;
  @ViewChild(LayersComponent) layersComponent!: LayersComponent;

  model: GeoModel | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    // Initialize component
    this.loadInitialData();
  }

  ngAfterViewInit(): void {
    // Setup any necessary interactions between child components
    this.setupChildInteractions();
  }

  ngOnDestroy(): void {
    // Cleanup any subscriptions or resources
  }

  onModelChange(model: GeoModel): void {
//     this.model = model;
//     // Update child components as necessary
//     this.mapComponent.onModelChange(model);
//     this.tableComponent.onModelChange(model);
  }

  //onModelChange(model: GeoJSONModel): void {};

  onFeatureUpdate(featureId: string, properties: { [key: string]: any }): void {};


  onSelect(feature: FeatureModel): void {
    // Handle feature selection
    this.mapComponent.onSelect(feature);
    this.tableComponent.onSelect(feature);
  }

  onDeselect(feature: FeatureModel): void {};

  onClearSelection(): void {};

  onFilter(criteria: CriteriaModel): void {
    //this.mapComponent.onFilter(criteria);
    //this.tableComponent.onFilter(criteria);
  }

  onClearFilter(): void{
  }

  onSliderMove(position: number): void {
    // Adjust the size of map and table based on slider position
    const totalWidth = 100; // Assuming 100% width
    const mapWidth = position;
    const tableWidth = totalWidth - position;

    this.mapComponent.resize(mapWidth, 100);
    this.tableComponent.resize(tableWidth, 100);
  }

  private loadInitialData(): void {
//     this.dataService.getInitialData().subscribe(
//       (data: GeoModel) => {
//         this.onModelChange(data);
//       },
//       (error) => {
//         console.error('Error loading initial data:', error);
//       }
//     );
  }

  private setupChildInteractions(): void {
    // Setup any necessary interactions or event subscriptions between child components
  }
}
