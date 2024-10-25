import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import { Feature, FeatureCollection, GeometryObject } from 'geojson';
import { DataModel } from '../../models/data-model';
import { Subscription } from 'rxjs';
import { ProjectionType } from '../../enums/projection-type.enum';
import { MatTableDataSource } from '@angular/material/table';

interface StatisticsElement {
  airportCode: string;
  count: number;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer: ElementRef;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private gSphere: d3.Selection<SVGGElement, unknown, null, undefined>;
  private gGraticule: d3.Selection<SVGGElement, unknown, null, undefined>;
  private gCountries: d3.Selection<SVGGElement, unknown, null, undefined>;
  private gRoutes: d3.Selection<SVGGElement, unknown, null, undefined>;
  private gAirports: d3.Selection<SVGGElement, unknown, null, undefined>;
  private projection: d3.GeoProjection;
  private path: d3.GeoPath;
  private resizeObserver: ResizeObserver;
  private subscription: Subscription;
  private zoom: d3.ZoomBehavior<Element, unknown>;
  private projectionType: ProjectionType = ProjectionType.Orthographic;
  statisticsData: StatisticsElement[] = [];

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
    if (this.subscription) this.subscription.unsubscribe();
  }

  private setupSVG(): void {
    console.log('Setting up SVG elements.');
    const width = this.mapContainer.nativeElement.offsetWidth * 0.95;
    const height = this.mapContainer.nativeElement.offsetHeight * 0.95;

    // Clear any existing SVG
    d3.select(this.mapContainer.nativeElement).selectAll('svg').remove();

    this.svg = d3.select(this.mapContainer.nativeElement).append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create groups in correct order (bottom to top)
    this.gSphere = this.svg.append('g').attr('class', 'sphere-layer');
    this.gGraticule = this.svg.append('g').attr('class', 'graticule-layer');
    this.gCountries = this.svg.append('g').attr('class', 'countries-layer');
    this.gRoutes = this.svg.append('g').attr('class', 'routes-layer');
    this.gAirports = this.svg.append('g').attr('class', 'airports-layer');
  }

  private initMap(): void {
    console.log('Initializing map.');
    this.setupSVG();
    this.setProjection(this.projectionType);

    // Draw the background sphere first
    this.path = d3.geoPath().projection(this.projection);

    // Add the base sphere with subtle color
    this.gSphere.append("path")
      .datum({type: "Sphere"})
      .attr("class", "sphere-background")
      .attr("d", this.path)
      .style("fill", "#f8f9fa")
      .style("stroke", "#ddd")
      .style("stroke-width", "0.5px");

    // Add graticule
    const graticule = d3.geoGraticule();
    this.gGraticule.append("path")
      .datum(graticule)
      .attr("class", "graticule")
      .attr("d", this.path)
      .style("fill", "none")
      .style("stroke", "#eee")
      .style("stroke-width", "0.3px");

    // Now add other layers
    this.addLayers();
    this.applyZoom();
    this.addAirports();
    this.resizeMap();
  }

  private setProjection(type: ProjectionType): void {
    console.log('Setting projection:', type);
    const width = this.mapContainer.nativeElement.offsetWidth * 0.95;
    const height = this.mapContainer.nativeElement.offsetHeight * 0.95;

    this.projection = d3.geoOrthographic()
      .scale(Math.min(width, height) / 2.5)
      .translate([width / 2, height / 2])
      .center([0, 0])
      .rotate([75, -10, 0])
      .clipAngle(90);

    this.path = d3.geoPath().projection(this.projection);
  }

  private applyZoom(): void {
    console.log('Applying zoom behavior to the map.');
    this.zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        this.gSphere.attr('transform', event.transform);
        this.gGraticule.attr('transform', event.transform);
        this.gCountries.attr('transform', event.transform);
        this.gRoutes.attr('transform', event.transform);
        this.gAirports.attr('transform', event.transform);
        this.svg.selectAll('path').attr('vector-effect', 'non-scaling-stroke');
        this.updateAirportPositions();
      });

    this.svg.call(this.zoom);

    // Add rotation handling
    let dragStartRotate: [number, number] = [0, 0];
    let dragStartMouse: [number, number] = [0, 0];

    this.svg.call(
      d3.drag()
        .on('start', (event) => {
          dragStartRotate = [this.projection.rotate()[0], this.projection.rotate()[1]];
          dragStartMouse = [event.x, event.y];
        })
        .on('drag', (event) => {
          const scale = 0.25;
          const rotate = [
            dragStartRotate[0] + (event.x - dragStartMouse[0]) * scale,
            dragStartRotate[1] + (dragStartMouse[1] - event.y) * scale
          ];

          this.projection.rotate([rotate[0], rotate[1], 0]);

          // Update all paths and positions
          this.gSphere.selectAll('path').attr('d', this.path);
          this.gGraticule.selectAll('path').attr('d', this.path);
          this.gCountries.selectAll('path').attr('d', this.path);
          this.gRoutes.selectAll('path').attr('d', this.path);
          this.updateAirportPositions();
        })
    );
  }

  private addLayers(): void {
    console.log('Adding layers to the map.');
    const layerNames = DataModel.getInstance().getLayerNames();

    layerNames.forEach(layerName => {
      console.log(`Processing layer: ${layerName}`);
      const layer = DataModel.getInstance().getLayer(layerName);
      if (layer && layer.features) {
        if (layerName === 'countries') {
          console.log(`Adding countries layer with ${layer.features.length} features.`);
          this.gCountries.selectAll('path')
            .data(layer.features)
            .enter().append('path')
            .attr("class", d => `${d.geometry.type.toLowerCase()} country`)
            .attr('d', this.path)
            .style('fill', '#cccccc')
            .style('stroke', '#666666')
            .style('stroke-width', '0.5px');
        } else if (layerName === 'routes') {
          console.log(`Adding routes layer with ${layer.features.length} features.`);
          this.gRoutes.selectAll('path')
            .data(layer.features)
            .enter().append('path')
            .attr("class", d => `${d.geometry.type.toLowerCase()} route`)
            .attr('d', this.path)
            .style('stroke', '#ff0000')
            .style('stroke-width', '1px')
            .style('fill', 'none')
            .style('opacity', '0.6')
            .on('click', (event, feature) => this.selectFeature(event, feature))
            .style('cursor', 'pointer');
        }
      }
    });
  }

  private addAirports(): void {
    const layerNames = DataModel.getInstance().getLayerNames();
    const uniqueAirports = new Set<string>();
    const routeFeatures = new Set<Feature>();

    // Collect all route features and airport codes
    layerNames.forEach(layerName => {
      const layer = DataModel.getInstance().getLayer(layerName);
      if (layer && layer.features && layerName === 'routes') {
        layer.features.forEach((feature: any) => {
          if (feature.properties && feature.properties.Base && feature.properties.Ref) {
            uniqueAirports.add(feature.properties.Base);
            uniqueAirports.add(feature.properties.Ref);
            routeFeatures.add(feature);
          }
        });
      }
    });

    // Create airport circles and labels
    uniqueAirports.forEach((airportCode: string) => {
      const airport = DataModel.getInstance().getAirportDetails(airportCode);
      if (airport) {
        const lon = Number(airport.lon);
        const lat = Number(airport.lat);

        if (!isNaN(lon) && !isNaN(lat)) {
          const coords: [number, number] = [lon, lat];
          if (d3.geoDistance(coords, [-this.projection.rotate()[0], -this.projection.rotate()[1]] as [number, number]) < Math.PI / 2) {
            const projectedCoords = this.projection(coords as [number, number]);

            if (projectedCoords && !isNaN(projectedCoords[0]) && !isNaN(projectedCoords[1])) {
              // Add airport circle
              this.gAirports.append('circle')
                .attr('class', 'airport-circle')
                .attr('cx', projectedCoords[0])
                .attr('cy', projectedCoords[1])
                .attr('r', 3)
                .style('fill', 'blue')
                .style('stroke', 'white')
                .style('stroke-width', '1px')
                .attr('data-airport', airportCode);

              // Add airport label
              this.gAirports.append('text')
                .attr('class', 'airport-label')
                .attr('x', projectedCoords[0] + 7)
                .attr('y', projectedCoords[1] + 3)
                .text(airportCode)
                .style('font-size', '10px')
                .style('fill', 'black')
                .style('font-weight', 'bold')
                .style('paint-order', 'stroke')
                .style('stroke', 'white')
                .style('stroke-width', '2px')
                .attr('data-airport', airportCode);
            }
          }
        }
      }
    });
  }

  private updateAirportPositions(): void {
    this.gAirports.selectAll('.airport-circle, .airport-label').each((d: any, i, nodes) => {
      const element = d3.select(nodes[i]);
      const airportCode = element.attr('data-airport');
      const airport = DataModel.getInstance().getAirportDetails(airportCode);

      if (airport) {
        const coords: [number, number] = [Number(airport.lon), Number(airport.lat)];
        const visible = d3.geoDistance(coords, [-this.projection.rotate()[0], -this.projection.rotate()[1]] as [number, number]) < Math.PI / 2;

        if (visible) {
          const projectedCoords = this.projection(coords as [number, number]);

          if (projectedCoords && !isNaN(projectedCoords[0]) && !isNaN(projectedCoords[1])) {
            if (element.classed('airport-circle')) {
              element
                .attr('cx', projectedCoords[0])
                .attr('cy', projectedCoords[1])
                .style('display', 'block');
            } else {
              element
                .attr('x', projectedCoords[0] + 7)
                .attr('y', projectedCoords[1] + 3)
                .style('display', 'block');
            }
          }
        } else {
          element.style('display', 'none');
        }
      }
    });
  }

  public resizeMap(): void {
    console.log('Resizing map.');
    if (this.mapContainer && this.svg) {
      const width = this.mapContainer.nativeElement.offsetWidth * 0.95;
      const height = this.mapContainer.nativeElement.offsetHeight * 0.95;

      this.svg
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);

      this.projection
        .scale(Math.min(width, height) / 2.5)
        .translate([width / 2, height / 2]);

      // Update all paths and positions
      this.gSphere.selectAll('path').attr('d', this.path);
      this.gGraticule.selectAll('path').attr('d', this.path);
      this.gCountries.selectAll('path').attr('d', this.path);
      this.gRoutes.selectAll('path').attr('d', this.path);
      this.updateAirportPositions();
    }
  }

  private selectFeature(event: MouseEvent, feature: Feature): void {
    console.log('Selecting feature:', feature);
    if (feature.id) {
      DataModel.getInstance().setSelectedFeatures([feature]);
      console.log('Selected feature set in DataModel:', feature.id);
    } else {
      console.error('Feature ID is undefined, cannot select');
    }
  }

  private updateMapSelection(features: Feature[] | null): void {
    console.log('Updating map selection with features:', features);
    this.gRoutes.selectAll('.selected').classed('selected', false);
    if (features) {
      features.forEach(feature => {
        console.log('Selecting route feature on map:', feature.id);
        this.gRoutes.selectAll('path')
          .filter((d: any) => d.id === feature.id)
          .classed('selected', true)
          .raise();
      });
    }
  }
}
