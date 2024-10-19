import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import { FeatureCollection } from 'geojson';
import { HttpClient } from '@angular/common/http';
import { DataModel } from '../../models/data-model';  // Import DataModel for loading features

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

  // ngOnInit(): void {
  //   this.http.get<FeatureCollection>('assets/110m/countries.geojson').subscribe(geoJson => {
  //     this.geoData = geoJson;
  //     this.initMap();
  //   });
  // }

  ngOnInit(): void {
    // Wrap the features from DataModel in a FeatureCollection
    this.geoData = {
      type: 'FeatureCollection',
      features: DataModel.getInstance().getFeatures()
    };

    // Initialize the map with the loaded data
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

  public resizeMap(): void {
    if (this.mapContainer && this.geoData) {
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
        .fitSize([width, height], this.geoData)
        .translate([width / 2, height / 2]);

      this.svg.selectAll('path')
        .attr('d', this.path);
    }
  }

  private initMap(): void {
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
      .fitSize([width, height], this.geoData)
      .translate([width / 2, height / 2]);

    this.path = d3Geo.geoPath().projection(this.projection);

    this.svg.append('g').selectAll('path')
      .data(this.geoData.features)
      .enter().append('path')
      .attr('d', this.path)
      .attr('class', 'country')
      .style('stroke', '#333')
      .style('stroke-width', '0.5px')
      .style('fill', '#d1e7f1');

    this.resizeMap(); // Ensure initial sizing is correct
  }
}
