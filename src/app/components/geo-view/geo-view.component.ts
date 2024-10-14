import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Input, OnChanges, SimpleChanges, ElementRef, ChangeDetectorRef } from '@angular/core';
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
import { throttle } from 'lodash';

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
    OnChanges {

  @ViewChild(MapComponent) mapComponent!: MapComponent;
  @ViewChild(TableComponent) tableComponent!: TableComponent;
  @ViewChild(LayersComponent) layersComponent!: LayersComponent;

  @Input() geoData: FeatureCollection | null = null;

  model: GeoModel | null = null;

  mapWidth: number = 50;
  tableWidth: number = 50;

  private startX: number = 0;
  private startMapWidth: number = 50;

  private isUpdating = false;
  private isDragging = false;

  constructor(
    private elRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Initialization logic if needed
  }

  ngAfterViewInit() {
    const slider = this.elRef.nativeElement.querySelector('#slider');
    const container = this.elRef.nativeElement.querySelector('.main-content');

    const resize = (e: MouseEvent) => {
      if (!this.isDragging) return;

      const dx = e.clientX - this.startX;
      const containerWidth = container.offsetWidth;
      let newMapWidth = (this.startMapWidth + dx / containerWidth * 100);
      newMapWidth = Math.max(0, Math.min(100, newMapWidth));

      this.onSliderMove(newMapWidth);
    };

    const mouseUp = () => {
      this.isDragging = false;
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', mouseUp);
    };

    slider?.addEventListener('mousedown', (e: MouseEvent) => {
      this.isDragging = true;
      this.startX = e.clientX;
      this.startMapWidth = this.mapWidth;
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', mouseUp);
      e.preventDefault();
    });

    // Set initial slider position
    this.onSliderMove(50);
    this.cdr.detectChanges();
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

  onSliderMove(position: number): void {
    this.mapWidth = Math.max(0, Math.min(100, position));
    this.tableWidth = 100 - this.mapWidth;

    const mapElement = this.elRef.nativeElement.querySelector('.map-container');
    const tableElement = this.elRef.nativeElement.querySelector('.table-container');
    const slider = this.elRef.nativeElement.querySelector('#slider');

    if (mapElement && tableElement && slider) {
      mapElement.style.flexBasis = `${this.mapWidth}%`;
      tableElement.style.flexBasis = `${this.tableWidth}%`;
      slider.style.left = `${this.mapWidth}%`;
    }

    this.cdr.detectChanges();
  }


  onModelChange(model: GeoModel): void {
//     this.model = model;
//     if (this.mapComponent) {
//       this.mapComponent.onModelChange(model);
//     }
//     if (this.tableComponent) {
//       this.tableComponent.onModelChange(model);
//     }
  }
}
