import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import { GeoModel } from '../../../models/geo-model';
import { CriteriaModel } from '../../../models/criteria.model';
import { ModelListener } from '../../../interfaces/model-listener';
import { SelectionListener } from '../../../interfaces/selection-listener';
import { FilterListener } from '../../../interfaces/filter-listener';
import { Feature } from 'geojson';
import { throttle } from 'lodash';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy, ModelListener {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private projection!: d3.GeoProjection;
  private path!: d3.GeoPath;
  private zoom!: d3.ZoomBehavior<Element, unknown>;
  private g!: d3.Selection<SVGGElement, unknown, null, undefined>;

  private width = 800;
  private height = 600;
  private currentModel: GeoModel | null = null;
  private throttledResize: () => void;

  constructor(public elementRef: ElementRef) {
    // Initialize the throttled resize function
    this.throttledResize = throttle(() => {
      const width = this.elementRef.nativeElement.offsetWidth;
      const height = this.elementRef.nativeElement.offsetHeight;
      console.log('Throttled resize event triggered. Width:', width, 'Height:', height);
      this.resizeSVG(width, height);
    }, 200);
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initMap();

    // Call resize initially to ensure the map starts with the correct size:
    const initialWidth = this.elementRef.nativeElement.offsetWidth;
    const initialHeight = this.elementRef.nativeElement.offsetHeight;
    this.resizeSVG(initialWidth, initialHeight);

    // Add resize event listener
    window.addEventListener('resize', this.throttledResize);
  }

  ngOnDestroy(): void {
    // Remove resize event listener
    window.removeEventListener('resize', this.throttledResize);
  }

  private initMap(): void {
    this.svg = d3.select(this.mapContainer.nativeElement)
      .append('svg')
      .style('width', '100%')
      .style('height', '100%');

    this.projection = d3Geo.geoMercator()
      .scale(150)
      .translate([this.width / 2, this.height / 2]);

    this.path = d3Geo.geoPath().projection(this.projection);

    this.zoom = d3.zoom()
      .scaleExtent([1, 20])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);

    this.g = this.svg.append('g');
  }

  private resizeSVG(width: number, height: number): void {
    if (this.width !== width || this.height !== height) {
      this.width = width;
      this.height = height;

      this.projection.translate([this.width / 2, this.height / 2]);
      this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);

      // Re-render GeoJSON if needed for responsive resizing
      if (this.currentModel) {
        this.renderGeoJSON(this.currentModel);
      }
    }
  }

  onModelChange(model: GeoModel): void {
    this.currentModel = model;
    this.renderGeoJSON(model);
  }

  onSelect(feature: Feature): void {
    console.log('Feature selected:', feature);
    this.highlightFeature(feature);
  }

  onDeselect(feature: Feature): void {
    console.log('Feature deselected:', feature);
  }

  onClearSelection(): void {}

  onFilter(criteria: CriteriaModel): void {
    this.applyFilter(criteria);
  }

  onClearFilter(): void {}

  private renderGeoJSON(geoData: GeoModel): void {
    // Clear previous paths to avoid duplication
    this.g.selectAll<SVGPathElement, any>('path').remove();

    // Bind the GeoJSON features to the path elements
    const paths = this.g.selectAll<SVGPathElement, any>('path')
      .data(geoData.data.features, (d: any) => d.id || d.properties?.name || Math.random());

    // Append new paths for each feature
    paths.enter()
      .append('path')
      .attr('d', (d) => this.path(d as any) || '')  // Generate the path using D3's geoPath
      .attr('class', (d: any) => this.getFeatureClass(d))  // Assign CSS class based on feature type
      .merge(paths as d3.Selection<SVGPathElement, any, SVGGElement, unknown>)  // Ensure the types match
      .attr('data-feature-id', (d: any) => d.id || '');  // Optional: Add data attribute for debugging

    // Remove any paths that no longer have data bound to them
    paths.exit().remove();
  }

  private getFeatureClass(feature: any): string {
    switch (feature.geometry.type) {
      case 'Polygon':
      case 'MultiPolygon':
        return 'polygon';  // Class for countries or regions
      case 'LineString':
        return 'line-route';  // Class for route lines
      default:
        return '';  // No class for unsupported types
    }
  }

  private highlightFeature(feature: Feature): void {
    this.g.selectAll('path')
      .attr('fill', (d: Feature) => d === feature ? '#ff7f00' : '#ccc');
  }

  private applyFilter(criteria: CriteriaModel): void {
    console.log('Applying filter:', criteria);
  }
}
