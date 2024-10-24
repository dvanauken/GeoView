import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import { Feature, FeatureCollection, GeometryObject } from 'geojson';
import { DataModel } from '../../models/data-model';
import { Subscription } from 'rxjs';
import { ProjectionType } from '../../enums/projection-type.enum';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer: ElementRef;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private gSphere: d3.Selection<SVGGElement, unknown, null, undefined>;
  private gCountries: d3.Selection<SVGGElement, unknown, null, undefined>;
  private gRoutes: d3.Selection<SVGGElement, unknown, null, undefined>;
  private projection: d3.GeoProjection;
  private path: d3.GeoPath;
  private resizeObserver: ResizeObserver;
  private subscription: Subscription;
  private zoom: d3.ZoomBehavior<Element, unknown>;
  private projectionType: ProjectionType = ProjectionType.Orthographic;

  constructor() {}

  ngOnInit(): void {
    console.log('MapComponent ngOnInit called.');
    this.initMap();
    this.subscription = DataModel.getInstance().getSelectedFeatures().subscribe(features => {
      console.log('MapComponent received updated features:', features);
      this.updateMapSelection(features);
    });
  }

  ngAfterViewInit(): void {
    console.log('MapComponent ngAfterViewInit called. Ready for interaction.');
    this.resizeObserver = new ResizeObserver(() => this.resizeMap());
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.subscription.unsubscribe();
  }

  private initMap(): void {
    this.setupSVG();
    this.setProjection(this.projectionType);

    // Draw the spherical background
    this.path = d3.geoPath().projection(this.projection); // Define the path generator with the set projection
    this.gSphere.append("path")
      .datum({ type: "Sphere" })
      .attr("class", "sphere")
      .attr("d", this.path)
      .style('fill', '#f5f5f5 ') // Optional: Add fill style for the sphere background
      .style('stroke', '#000'); // Optional: Add stroke style for the boundary of the sphere

    this.applyZoom();
    this.addLayers();
    this.resizeMap();
  }

  private setupSVG(): void {
    const width = this.mapContainer.nativeElement.offsetWidth * 0.95;
    const height = this.mapContainer.nativeElement.offsetHeight * 0.95;

    this.svg = d3.select(this.mapContainer.nativeElement).append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Separate groups for different layers
    this.gSphere = this.svg.append('g').attr('class', 'sphere-layer');
    this.gCountries = this.svg.append('g').attr('class', 'countries-layer');
    this.gRoutes = this.svg.append('g').attr('class', 'routes-layer');
  }

  private setProjection(type: ProjectionType): void {
    const width = this.mapContainer.nativeElement.offsetWidth * 0.95;
    const height = this.mapContainer.nativeElement.offsetHeight * 0.95;
    const translate: [number, number] = [width / 2, height / 2];

    const projection = d3['geoOrthographic']()
      .translate(translate)
      .center([-75, -30])
      .rotate([75, -10, 0]);

    if ('parallels' in projection) {
      (projection as d3.GeoConicProjection).parallels([30.5, 45.5]);
    }

    this.projection = projection;
    this.path = d3.geoPath().projection(this.projection);
  }

  private applyZoom(): void {
    this.svg.call(
      d3.zoom()
        .scaleExtent([1, 50])
        .on('zoom', (event) => {
          this.gSphere.attr('transform', event.transform);
          this.gCountries.attr('transform', event.transform);
          this.gRoutes.attr('transform', event.transform);
          this.svg.selectAll('path').attr('vector-effect', 'non-scaling-stroke'); // Ensure stroke width is constant
        })
    );
  }

  private addLayers(): void {
    const layerNames = DataModel.getInstance().getLayerNames();
    layerNames.forEach(layerName => {
      const layer = DataModel.getInstance().getLayer(layerName);
      if (layer && layer.features) {
        if (layerName === 'countries') {
          // Add geography features
          console.log(`Adding countries layer with ${layer.features.length} features.`);
          this.gCountries.selectAll('path')
            .data(layer.features, (d: any) => d.id)
            .enter().append('path')
            .attr("class", d => `${d.geometry.type.toLowerCase()} country`)
            .attr('d', this.path)
            .style('fill', '#cccccc'); // Optional: Add some styling for geography
        } else if (layerName === 'routes') {
          // Add route features
          console.log(`Adding routes layer with ${layer.features.length} features.`);
          this.gRoutes.selectAll('path')
            .data(layer.features, (d: any) => d.id)
            .enter().append('path')
            .attr("class", d => `${d.geometry.type.toLowerCase()} route`)
            .attr('d', this.path)
            .style('stroke', '#ff0000') // Optional: Add styling for routes
            .style('stroke-width', 0.5)
            .style('fill', 'none')
            .on('click', (event, feature) => {
              console.log('Clicked feature ID:', feature.id);
              this.selectFeature(event, feature);
            })
            .style('cursor', 'pointer');
        }
      }
    });
  }

  public resizeMap(): void {
    if (this.mapContainer && this.svg) {
      const containerWidth = this.mapContainer.nativeElement.offsetWidth;
      const containerHeight = this.mapContainer.nativeElement.offsetHeight;
      const width = containerWidth * 0.95;
      const height = containerHeight * 0.95;

      this.svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);
      this.projection.fitSize([width, height], { type: 'FeatureCollection', features: DataModel.getInstance().getAllFeatures() });
      this.svg.selectAll('path').attr('d', this.path);
    }
  }

  private selectFeature(event: MouseEvent, feature: Feature): void {
    if (feature.id) {
      DataModel.getInstance().setSelectedFeatures([feature]);
      console.log('Selected feature set in DataModel:', feature.id);
    } else {
      console.error('Feature ID is undefined, cannot select');
    }
  }

  private updateMapSelection(features: Feature[] | null): void {
    console.log('Map features updated:', features);
    this.gRoutes.selectAll('.selected').classed('selected', false); // Deselect previous selected routes
    if (features) {
      features.forEach(feature => {
        this.gRoutes.selectAll('path')
          .filter((d: Feature) => d.id === feature.id)
          .classed('selected', true);
      });
    }
  }
}
