import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import { FeatureCollection, Feature } from 'geojson';
import { throttle } from 'lodash';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  @Input() geoData: FeatureCollection | null = null;

  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private projection!: d3.GeoProjection;
  private path!: d3.GeoPath;
  private zoom!: d3.ZoomBehavior<Element, unknown>;
  private g!: d3.Selection<SVGGElement, unknown, null, undefined>;

  private width = 800;
  private height = 600;
  private throttledResize: () => void;
  private resizeObserver: ResizeObserver;

  public currentWidth: string = '50.00%';

  constructor(public elementRef: ElementRef) {
    this.throttledResize = throttle(() => {
      const width = this.elementRef.nativeElement.offsetWidth;
      const height = this.elementRef.nativeElement.offsetHeight;
      console.log('Throttled resize event triggered. Width:', width, 'Height:', height);
      this.resizeSVG(width, height);
    }, 200);

    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        this.resizeSVG(width, height);
      }
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initMap();
    const initialWidth = this.elementRef.nativeElement.offsetWidth;
    const initialHeight = this.elementRef.nativeElement.offsetHeight;
    this.resizeSVG(initialWidth, initialHeight);
    window.addEventListener('resize', this.throttledResize);
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.throttledResize);
    this.resizeObserver.disconnect();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['geoData'] && !changes['geoData'].firstChange) {
      this.renderGeoJSON(this.geoData);
    }
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

      this.currentWidth = `${(width / window.innerWidth * 100).toFixed(2)}%`;

      this.projection.translate([this.width / 2, this.height / 2]);
      this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);

      if (this.geoData) {
        this.renderGeoJSON(this.geoData);
      }
    }
  }

  private renderGeoJSON(geoData: FeatureCollection | null): void {
    if (!geoData) return;

    this.g.selectAll<SVGPathElement, any>('path').remove();

    const paths = this.g.selectAll<SVGPathElement, any>('path')
      .data(geoData.features, (d: any) => d.id || d.properties?.name || Math.random());

    paths.enter()
      .append('path')
      .attr('d', (d) => this.path(d as any) || '')
      .attr('class', (d: any) => this.getFeatureClass(d))
      .merge(paths as d3.Selection<SVGPathElement, any, SVGGElement, unknown>)
      .attr('data-feature-id', (d: any) => d.id || '');

    paths.exit().remove();
  }

  private getFeatureClass(feature: any): string {
    switch (feature.geometry.type) {
      case 'Polygon':
      case 'MultiPolygon':
        return 'polygon';
      case 'LineString':
        return 'line-route';
      default:
        return '';
    }
  }

  public highlightFeature(feature: Feature): void {
    this.g.selectAll('path')
      .attr('fill', (d: any) => d === feature ? '#ff7f00' : '#ccc');
  }
}
