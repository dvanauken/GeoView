import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import { Feature, FeatureCollection } from 'geojson';
import { DataModel } from '../../models/data-model';  // Ensure correct import path

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer: ElementRef;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private projection: d3.GeoProjection;
  private path: d3.GeoPath;
  private resizeObserver: ResizeObserver;

  constructor() {}

  ngOnInit(): void {
    this.initMap();
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      console.log('Map container resized.');
      this.resizeMap();
    });
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private initMap(): void {
    const layerNames = DataModel.getInstance().getLayers();
    const containerWidth = this.mapContainer.nativeElement.offsetWidth;
    const containerHeight = this.mapContainer.nativeElement.offsetHeight;
    const width = containerWidth * 0.8;
    const height = containerHeight * 0.8;

    this.svg = d3.select(this.mapContainer.nativeElement).append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    this.projection = d3Geo.geoMercator()
      .translate([width / 2, height / 2]);

    this.path = d3Geo.geoPath().projection(this.projection);

    layerNames.forEach(name => {
      const layer = DataModel.getInstance().getLayer(name);
      if (layer && layer.features) {
        this.addLayerToMap(layer.features);
      }
    });

    this.resizeMap(); // Ensure initial sizing is correct
  }

  private addLayerToMap(features: Feature[]): void {
    this.svg.append('g').selectAll('path')
      .data(features)
      .enter().append('path')
      .attr('d', this.path)
      .attr('class', 'country')
      .style('stroke', '#333')
      .style('stroke-width', '0.5px')
      .style('fill', '#d1e7f1');
  }

  public resizeMap(): void {
    if (this.mapContainer && this.svg) {
      const containerWidth = this.mapContainer.nativeElement.offsetWidth;
      const containerHeight = this.mapContainer.nativeElement.offsetHeight;
      const width = containerWidth * 0.8;
      const height = containerHeight * 0.8;

      console.log(`Resizing map to ${width}x${height}`);

      this.svg
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);

      this.projection
        .fitSize([width, height], { type: 'FeatureCollection', features: this.getAllFeatures() });

      this.svg.selectAll('path')
        .attr('d', this.path); // Reapply projection and path after resizing
    }
  }

  private getAllFeatures(): Feature[] {
    const allFeatures = [];
    const layerNames = DataModel.getInstance().getLayers();
    layerNames.forEach(name => {
      const layer = DataModel.getInstance().getLayer(name);
      if (layer && layer.features) {
        allFeatures.push(...layer.features);
      }
    });
    return allFeatures;
  }
}
