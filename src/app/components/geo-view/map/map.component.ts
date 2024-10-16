import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import { FeatureCollection } from 'geojson';
import { HttpClient } from '@angular/common/http';

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
  private geoData: FeatureCollection | null = null;
  private resizeObserver: ResizeObserver;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<FeatureCollection>('assets/110m/countries.geojson').subscribe(geoJson => {
      this.geoData = geoJson;
      this.initMap();
    });
  }

  ngAfterViewInit(): void {
    this.resizeMap(); // Initial resize

    // Use ResizeObserver to detect size changes in the parent container
    this.resizeObserver = new ResizeObserver(() => {
      console.log('Map container resized.');
      this.resizeMap(); // Adjust the map size on container resize
    });

    // Observe the parent container element
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect(); // Clean up observer on destroy
    }
  }

  public resizeMap(): void {
    if (this.mapContainer && this.geoData) {
      const width = this.mapContainer.nativeElement.offsetWidth;
      const height = this.mapContainer.nativeElement.offsetHeight;

      console.log(`Resizing map to ${width}x${height}`);

      this.svg.attr('width', width).attr('height', height);
      this.projection.fitSize([width, height], this.geoData);
      this.svg.selectAll('path')
              .data(this.geoData.features)
              .attr('d', this.path);
    }
  }

  private initMap(): void {
    this.svg = d3.select(this.mapContainer.nativeElement).append('svg')
                 .attr('width', this.mapContainer.nativeElement.offsetWidth)
                 .attr('height', this.mapContainer.nativeElement.offsetHeight);

    this.projection = d3Geo.geoMercator();
    this.path = d3Geo.geoPath().projection(this.projection);

    this.projection.fitSize(
      [this.mapContainer.nativeElement.offsetWidth, this.mapContainer.nativeElement.offsetHeight],
      this.geoData
    );

    this.svg.append('g').selectAll('path')
        .data(this.geoData.features)
        .enter().append('path')
        .attr('d', this.path)
        .attr('class', 'country');
  }
}
