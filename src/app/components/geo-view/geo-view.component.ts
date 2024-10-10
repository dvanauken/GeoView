// src/app/components/geo-view/geo-view.component.ts
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
} from '@angular/core';
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
  //@ViewChild(SliderComponent) sliderComponent!: SliderComponent;
  @ViewChild(SliderComponent, { static: false }) slider!: ElementRef; // Access slider element
  @ViewChild(LayersComponent) layersComponent!: LayersComponent;

  @Input() geoData: FeatureCollection | null = null; // Use FeatureCollection from geojson

  model: GeoModel | null = null;

  mapWidth: number = 50; // Initial width of the map as 50%
  tableWidth: number = 50; // Initial width of the table as 50%

  isDragging = false;

  constructor(
    private dataService: DataService,
    private elRef: ElementRef,
  ) {}

  ngOnInit() {
    // Initialization logic if needed
  }

  ngAfterViewInit(): void {
    const slider = this.elRef.nativeElement.querySelector('#slider');
    const mainContent = this.elRef.nativeElement.querySelector('.main-content');

    slider.addEventListener('mousedown', (e: MouseEvent) => {
      this.isDragging = true;
      document.addEventListener('mousemove', this.onDrag.bind(this));
      document.addEventListener('mouseup', this.stopDrag.bind(this));
    });
  }

  onDrag(event: MouseEvent): void {
    if (!this.isDragging) return;

    const mainContent = this.elRef.nativeElement.querySelector('.main-content');
    const mainContentRect = mainContent.getBoundingClientRect();

    // Get new width for app-map based on slider position
    const offsetX = event.clientX - mainContentRect.left;
    const mapWidthPercentage = (offsetX / mainContentRect.width) * 100;
    const tableWidthPercentage = 100 - mapWidthPercentage;

    // Update map and table widths
    this.elRef.nativeElement.querySelector('app-map').style.width =
      `${mapWidthPercentage}%`;
    this.elRef.nativeElement.querySelector('app-table').style.width =
      `${tableWidthPercentage}%`;
  }

  stopDrag(): void {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onDrag.bind(this));
    document.removeEventListener('mouseup', this.stopDrag.bind(this));
  }

  //   ngAfterViewInit(): void {
  //     // Listen to slider position changes
  //     this.sliderComponent.positionChange.subscribe((position: number) => {
  //       this.adjustLayout(position);
  //     });
  //   }

  //   adjustLayout(sliderPosition: number): void {
  //     // Calculate the width for app-map and app-table based on slider position
  //     this.mapWidth = sliderPosition;
  //     this.tableWidth = 100 - sliderPosition;
  //
  //     // Apply new widths dynamically (if using inline styles)
  //     this.mapComponent.elementRef.nativeElement.style.width = `${this.mapWidth}%`;
  //     this.tableComponent.elementRef.nativeElement.style.width = `${this.tableWidth}%`;
  //   }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['geoData'] && this.geoData) {
      console.log('GeoView received data:', this.geoData);
      this.updateModel();
    }
  }

  //ngAfterViewInit(): void {
  //  this.setupChildInteractions();
  //}

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
    const mapWidth = position;
    const currentHeight = this.elRef.nativeElement.offsetHeight; // Keep the current height
    this.mapComponent.resize(mapWidth, currentHeight); // Call the resize method on MapComponent
  }

  private setupChildInteractions(): void {
    // Setup any necessary interactions or event subscriptions between child components
  }
}
