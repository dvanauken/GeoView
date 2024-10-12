import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import { MapComponent } from './map/map.component';
import { TableComponent } from './table/table.component';
import { SliderComponent } from './slider/slider.component';
import { LayersComponent } from './layers/layers.component';
import { GeoModel } from '../../models/geo-model';
import { CriteriaModel } from '../../models/criteria.model';
import { ModelListener } from '../../interfaces/model-listener';
import { SelectionListener } from '../../interfaces/selection-listener';
import { FilterListener } from '../../interfaces/filter-listener';
import { Feature, FeatureCollection } from 'geojson';

@Component({
  selector: 'app-geo-view',
  templateUrl: './geo-view.component.html',
  styleUrls: ['./geo-view.component.scss'],
})
export class GeoViewComponent
  implements
    OnInit,
    AfterViewInit,
    OnDestroy,
    OnChanges,
    ModelListener,
    SelectionListener,
    FilterListener
{
  @ViewChild(MapComponent) mapComponent!: MapComponent;
  @ViewChild(TableComponent) tableComponent!: TableComponent;
  @ViewChild(SliderComponent) sliderComponent!: SliderComponent;
  @ViewChild(LayersComponent) layersComponent!: LayersComponent;

  @Input() geoData: FeatureCollection | null = null;

  model: GeoModel | null = null;

  mapWidth: number = 50;
  tableWidth: number = 50;

  private isUpdating = false;

  constructor(
    private elRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Initialization logic if needed
  }

  ngAfterViewInit(): void {
    this.onSliderMove(50);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['geoData'] && this.geoData) {
      this.updateModel();
    }
  }

  ngOnDestroy(): void {
    // Cleanup any subscriptions or resources
  }

  private updateModel(): void {
    if (this.geoData) {
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

  onSliderMove(position: number) {
    if (this.isUpdating) return;
    this.isUpdating = true;

    this.mapWidth = position;
    this.tableWidth = 100 - position;

    this.changeDetectorRef.detectChanges();

    if (this.mapComponent) {
      this.mapComponent.resize(this.mapWidth, this.elRef.nativeElement.offsetHeight);
    }
    if (this.tableComponent) {
      this.tableComponent.resize(this.tableWidth, this.elRef.nativeElement.offsetHeight);
    }

    this.isUpdating = false;
  }
}
